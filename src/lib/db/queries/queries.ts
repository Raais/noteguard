import {
  Store,
  createQueries
} from "tinybase";


export const appQueries = (store: Store) => {
  const queries = createQueries(store);

  queries.setQueryDefinition(
    "getNotes",
    "notes",
    ({ select, join, where, group, having }) => {
      void select, join, where, group, having;
      select((_, id) => id).as("id");
      select("content");
    }
  );

  return queries;
};
