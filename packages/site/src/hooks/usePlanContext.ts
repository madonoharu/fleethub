import { Org } from "@fh/core";
import { createContext } from "react";

const PlanContext = createContext<{ org: Org } | null>(null);
