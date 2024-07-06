import { useEffect, useState } from "react";
import { Route, Routes, useNavigate } from "react-router-dom";
import {
  Provider as StoreProvider,
  useCreateQueries,
  useCreateStore,
} from "tinybase/debug/ui-react";
import { _clearData, createNewStore, useSqlite3 } from "./lib/db/DB";

import { Sqlite3Static } from "@sqlite.org/sqlite-wasm";
import { SqliteWasmPersister } from "tinybase/persisters/persister-sqlite-wasm";
import AuthContext from "./auth/AuthContext";
import Authenticate from "./auth/Authenticate";
import Home from "./Home";
import { appQueries } from "./lib/db/queries/queries";
import { PersisterProvider } from "./lib/PersisterContext";

const App = () => {
  const [sqlite3Persister, setSqlite3Persister] =
    useState<SqliteWasmPersister | null>(null);
  const [sqlite3Instance, setSqlite3Instance] = useState<Sqlite3Static | null>(
    null
  );

  const store = useCreateStore(() => {
    const store = createNewStore();
    useSqlite3(
      sqlite3Persister,
      setSqlite3Persister,
      sqlite3Instance,
      setSqlite3Instance,
      store
    );
    return store;
  });

  const queries = useCreateQueries(store, appQueries);

  const [hexKey, setHexKey] = useState<string | null>(null);
  const [keyName, setKeyName] = useState<string | null>(null);

  useEffect(() => {
    // @ts-ignore
    if (typeof window !== undefined) window._appPrivateKey = hexKey;
  }, [hexKey]);

  const navigate = useNavigate();

  const logout = () => {
    setHexKey(null);
    setKeyName(null);
    _clearData(store);
    useSqlite3(
      sqlite3Persister,
      setSqlite3Persister,
      sqlite3Instance,
      setSqlite3Instance,
      store
    );
    navigate("/noteguard/auth");
  };

  useEffect(() => {
    if (!hexKey || !keyName) {
      navigate("/noteguard/auth");
    }
  }, [hexKey, keyName, navigate]);

  if (!store || !queries) {
    return <div>Loading...</div>;
  }

  return (
    <StoreProvider store={store} queries={queries}>
      <PersisterProvider
        value={{
          sqlite3Persister,
          sqlite3Instance,
          setSqlite3Persister,
          setSqlite3Instance,
        }}
      >
        <AuthContext.Provider
          value={{ hexKey, setHexKey, keyName, setKeyName, logout }}
        >
          <Routes>
            <Route path="/noteguard/auth" element={<Authenticate />} />

            <Route path="/noteguard/auth/flow" element={<Home />} />
            <Route path="/noteguard" element={<Home />} />
          </Routes>
        </AuthContext.Provider>
      </PersisterProvider>
    </StoreProvider>
  );
};

export default App;
