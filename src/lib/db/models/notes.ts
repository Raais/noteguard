import dayjs from "dayjs";
import { Store } from "tinybase";
import { isObjEmpty } from "../../utils";
import { TableSchema } from "../types";

export const notesSchema: TableSchema = {
  content: { type: "string" },
};

export const cmd_addNote = (
  store: Store,
  content: string,
) => {
  if (!content) return;
  if (content.length < 1) return;

  const timestamp = dayjs().unix().toString();
  store.transaction(() => {
    store.setRow("notes", timestamp, {
      content: content,
    });
  });

  if (!isObjEmpty(store.getRow("notes", timestamp))) {
    store.transaction(() => {
      store.setValue("opened", timestamp);
    });
  }
}

export const cmd_editNote = (
  store: Store,
  id: string,
  content: string,
) => {
  if (isObjEmpty(store.getRow("notes", id))) return;
  if (!content) return;
  if (content.length < 1) return;

  store.transaction(() => {
    store.setCell("notes", id, "content", content);
  });
}

export const cmd_removeNote = (store: Store, id: string) => {
  if (isObjEmpty(store.getRow("notes", id))) return;
  
  store.transaction(() => {
    store.delRow("notes", id);
  });
}