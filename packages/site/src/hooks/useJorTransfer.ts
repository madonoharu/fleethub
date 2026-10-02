import { useCallback, useEffect, useRef } from "react";

import type { JorData } from "../store/migrateFromJor";

/** Keep a single transfer pending until the expected site sends valid data. */
export function useJorTransfer(
  onTransfer: (data: JorData) => void,
  onError: (error: unknown) => void,
) {
  const cleanup = useRef<(() => void) | undefined>(undefined);
  useEffect(() => () => cleanup.current?.(), []);

  return useCallback(() => {
    cleanup.current?.();
    const onMessage = (event: MessageEvent<unknown>) => {
      if (event.origin !== "https://kcjervis.github.io") return;
      try {
        const data = event.data;
        if (
          typeof data !== "object" ||
          data === null ||
          !("operations" in data) ||
          !Array.isArray(data.operations)
        ) {
          throw new Error("データが適合しません");
        }
        onTransfer(data as JorData);
        cleanup.current?.();
      } catch (error) {
        onError(error);
      }
    };
    window.addEventListener("message", onMessage);
    cleanup.current = () => window.removeEventListener("message", onMessage);
    window.open("https://kcjervis.github.io/jervis/#/transfer");
  }, [onTransfer, onError]);
}
