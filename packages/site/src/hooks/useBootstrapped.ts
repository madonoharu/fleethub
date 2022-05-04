import { createContext, useContext } from "react";

export const BootstrappedContext = createContext(false);

export function useBootstrapped(): boolean {
  return useContext(BootstrappedContext);
}
