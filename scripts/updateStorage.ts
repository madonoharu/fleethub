import "dotenv/config";

import { updateData } from "@fh/admin/src";

updateData().catch((err) => console.error(err));
