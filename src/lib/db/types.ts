import { CellSchema, DatabasePersisterConfig, TablesSchema, ValuesSchema } from "tinybase";
import { notesSchema } from "./models/notes";

export type TableSchema = { [cellId: string]: CellSchema };

export const tablesSchema: TablesSchema = {
  notes: notesSchema,
};

export const valuesSchema: ValuesSchema = {
  opened: { type: "string", default: "" },
};

export const databasePersisterConfig: DatabasePersisterConfig  = {
  mode: 'tabular',
  tables: {
    save: { notes: 'notes'},
    load: { notes: 'notes'},
  },
  values: {
    load: true,
    save: true,
    tableName: 'session',
  }
}