import { DependencyList, useEffect, useState } from "react";

type Result<T> =
  | { status: "loading" }
  | { status: "error" }
  | { status: "success"; data: T };

export const useFetch = <T>(fn: () => Promise<T>, deps?: DependencyList) => {
  const [result, setResult] = useState<Result<T>>({ status: "loading" });

  useEffect(() => {
    let unmounted = false;

    fn()
      .then((data) => !unmounted && setResult({ status: "success", data }))
      .catch((reason) => {
        if (unmounted) return;
        console.error(reason);
        setResult({ status: "error" });
      });

    return () => {
      unmounted = true;
      setResult({ status: "loading" });
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, deps);

  return result;
};
