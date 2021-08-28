import { nanoid } from "@reduxjs/toolkit";
import { FilterFunction, GroupByFunction, UndoableOptions } from "redux-undo";

const groupSet = new Set<string>();

const undoableState: { ignore: boolean; group?: string } = {
  ignore: false,
};

export const batchGroupBy = {
  start: (id: string) => {
    groupSet.add(id);
    return id;
  },
  end: (id: string) => {
    groupSet.delete(id);
  },
};

export const ignoreUndoable = (cb: () => void) => {
  undoableState.ignore = true;
  cb();
  undoableState.ignore = false;
};

export const batchUndoable = (cb: () => void, group = nanoid()) => {
  batchGroupBy.start(group);
  cb();
  batchGroupBy.end(group);
};

const groupBy: GroupByFunction = () =>
  groupSet.keys().next().value as string | undefined;

const actionTypeFilter: FilterFunction = (action) =>
  typeof action.type === "string" && action.type.startsWith("entities");

const filter: FilterFunction = (...args) =>
  !undoableState.ignore && actionTypeFilter(...args);

const undoableOptions: UndoableOptions = {
  filter,
  groupBy,
  limit: 10,
  neverSkipReducer: true,
};

export default undoableOptions;
