import { useEffect, useRef } from "react";

export const useTimeout = <T>(cb: () => T, delay: number) => {
  const cbRef = useRef<typeof cb>();

  useEffect(() => {
    cbRef.current = cb;
  }, [cb]);

  useEffect(() => {
    if (!cbRef.current) return;
    const id = setTimeout(cbRef.current, delay);
    return () => clearTimeout(id);
  }, [delay]);
};
