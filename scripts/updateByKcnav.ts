import "dotenv/config";

import { updateByKcnav } from "@fh/admin/src";
import fs from "fs-extra";

class Cache extends Map<string, unknown> {
  constructor() {
    if (fs.existsSync(".tmp/kcnav")) {
      const json = fs.readJSONSync(".tmp/kcnav") as object;
      super(Object.entries(json));
    } else {
      super();
    }
  }

  flush() {
    fs.outputJSONSync(".tmp/kcnav", Object.fromEntries(this));
  }
}

const CURRENT_EVENT_ID: number | null = 57;

async function main() {
  const cache = new Cache();
  await updateByKcnav(CURRENT_EVENT_ID, cache);
  cache.flush();
}

main().catch((err) => console.log(err));
