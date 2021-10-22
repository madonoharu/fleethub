import { Org } from "fleethub-core";
import { createContext } from "react";

const PlanContext = createContext<{ org: Org } | null>(null);
