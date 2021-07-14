import "dotenv/config";

import { updateData } from "./data";

updateData().catch((err) => console.error(err));
