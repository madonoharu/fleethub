import "dotenv/config";
import { updateImages } from "./data";

updateImages().catch((err) => console.log(err));
