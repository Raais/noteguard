//import sqlite3, {Database} from 'sqlite3';
import sqlite3InitModule, { Database, Sqlite3Static } from "@sqlite.org/sqlite-wasm"; // https://github.com/sqlite/sqlite-wasm

import {
  createSqliteWasmPersister,
  SqliteWasmPersister,
} from "tinybase/debug/persisters/persister-sqlite-wasm";

import { createStore, Store } from "tinybase";
import { error, log } from "../utils";
import { initTables, initValues } from "./seed";
import { databasePersisterConfig, tablesSchema, valuesSchema } from "./types";

import { encryptBlob } from 'kiss-crypto';
import dayjs from "dayjs";

export const createNewStore = (): Store => {
  log("New store created.");
  return createStore()
    .setValuesSchema(valuesSchema)
    .setTablesSchema(tablesSchema)
  ;
  // data init done in persister auto load
};

export const bootstrapSqlite3Instance = async (): Promise<Sqlite3Static> => {
  const sqlite3 = await sqlite3InitModule({
    print: log,
    printErr: error,
  });
  if (sqlite3) {
    log("Loaded SQLite3 version", sqlite3.version.libVersion);
  }
  return sqlite3;
};

export const bootstrapPersisterSqlite3 = async (
  sqlite3: Sqlite3Static,
  store: Store,
  arrayBuffer?: ArrayBuffer,
): Promise<SqliteWasmPersister> => {
  let db;
  if (arrayBuffer) {
    db = await deserializeSqlite(arrayBuffer, sqlite3);
    log("Deserialized SQLite3 database from file");
  } else {
    db = new sqlite3.oo1.DB(":memory:", "c");
    log("Created new SQLite3 database");
  }

  const sqlite3Persister = createSqliteWasmPersister(
    store,
    sqlite3,
    db,
    databasePersisterConfig,
  );
  log("Sqlite3 persister created");

  if (arrayBuffer) {
    await sqlite3Persister.startAutoLoad(initTables, initValues);
    await sqlite3Persister.startAutoSave();
  } else {
    await store.setTables(initTables);
    await store.setValues(initValues);
    await sqlite3Persister.startAutoSave();
  }
  return sqlite3Persister;
};

export const deserializeSqlite = async (
  buffer: ArrayBuffer,
  sqlite3Instance: Sqlite3Static
): Promise<Database> => {
  const db = new sqlite3Instance.oo1.DB();
  const p = sqlite3Instance.wasm.allocFromTypedArray(buffer);
  /* https://sqlite.org/wasm/doc/trunk/api-c-style.md#sqlite3_deserialize */
  db.onclose = {
    after: function () {
      sqlite3Instance.wasm.dealloc(p);
    },
  };
  let deserialize_flags = sqlite3Instance.capi.SQLITE_DESERIALIZE_FREEONCLOSE;
  deserialize_flags |= sqlite3Instance.capi.SQLITE_DESERIALIZE_RESIZEABLE;
  const rc = sqlite3Instance.capi.sqlite3_deserialize(
    db,
    "main",
    p,
    buffer.byteLength,
    buffer.byteLength,
    deserialize_flags
  );
  return db.checkRc(rc);
};

export const exportDb = async (
  persister: SqliteWasmPersister,
  sqlite3: Sqlite3Static,
  key: string,
  logout: ()=>void
) => {
  await persister.save();
  const byteArray = sqlite3.capi.sqlite3_js_db_export(persister.getDb());
  const encryptedBlob = await encryptBlob({ key, plainblob: byteArray });

  const blob = new Blob([encryptedBlob.buffer], {
    type: "application/octet-stream",
  });

  const a = document.createElement("a");
  document.body.appendChild(a);
  a.href = URL.createObjectURL(blob);
  a.download = `${dayjs().format('DDMMM_HHmm-ss')}.box`;
  a.addEventListener("click", function () {
    setTimeout(function () {
      window.URL.revokeObjectURL(a.href);
      a.remove();
      logout();
    }, 500);
  });
  a.click();
};

export const useSqlite3 = async (
  sqlite3Persister: SqliteWasmPersister | null,
  setSqlite3Persister: React.Dispatch<
    React.SetStateAction<SqliteWasmPersister | null>
  >,
  sqlite3Instance: Sqlite3Static | null,
  setSqlite3Instance: React.Dispatch<
    React.SetStateAction<Sqlite3Static | null>
  >,
  store: Store,
  arrayBuffer?: ArrayBuffer,
): Promise<{ persister: SqliteWasmPersister; sqlite3: Sqlite3Static }> => {
  if (sqlite3Persister !== null) await sqlite3Persister.destroy();

  let persister: SqliteWasmPersister | null = null;
  let sqlite3: Sqlite3Static | null = sqlite3Instance;
  if (!sqlite3) {
    sqlite3 = await bootstrapSqlite3Instance();
    setSqlite3Instance(sqlite3);
  }
  persister = await bootstrapPersisterSqlite3(
    sqlite3,
    store,
    arrayBuffer,
  );
  if (persister) {
    setSqlite3Persister(persister);
  }
  return { persister, sqlite3 };
};

export const _clearData = async (store: Store) => {
  store.delTables();
  store.delValues();
  log("Store cleared");
};
