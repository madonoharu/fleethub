import { nanoid } from "@reduxjs/toolkit";
import { FilterFunction, GroupByFunction, UndoableOptions } from "redux-undo";

const undoableState: { ignore: boolean; group?: string } = {
  ignore: false,
};

export const ignoreUndoable = (cb: () => void) => {
  undoableState.ignore = true;
  cb();
  undoableState.ignore = false;
};

export const batchUndoable = (cb: () => void, group = nanoid()) => {
  undoableState.group = group;
  cb();
  undoableState.group = undefined;
};

export const batchGroupBy: GroupByFunction = () => undoableState.group;

const actionTypeFilter: FilterFunction = (action) =>
  typeof action.type === "string" && action.type.startsWith("entities");

const filter: FilterFunction = (...args) =>
  !undoableState.ignore && actionTypeFilter(...args);

const undoableOptions: UndoableOptions = {
  filter,
  groupBy: batchGroupBy,
  limit: 10,
  neverSkipReducer: true,
};

export default undoableOptions;
