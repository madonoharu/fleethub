import "dotenv/config";

import child_process from "child_process";
import { outputJsonSync } from "fs-extra";

import storage from "./data/storage";

storage
  .readMasterData()
  .then((md) => {
    outputJsonSync("packages/utils/master_data.json", md);
    child_process.execSync("prettier --write packages/utils/master_data.json");
  })
  .catch((err) => console.error(err));
