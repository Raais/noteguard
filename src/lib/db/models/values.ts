import { Store } from "tinybase";

export const cmd_setOpened = (
  store: Store,
  opened: string,
) => {
  store.transaction(() => {
    store.setValue("opened", opened);
  });
}