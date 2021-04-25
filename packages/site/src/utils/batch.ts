import { batch as batchedUpdate } from "react-redux";

import { batchUndoable } from "../store";

const batch = (cb: () => void, group?: string) => {
  batchedUpdate(() => batchUndoable(cb, group));
};

export default batch;
