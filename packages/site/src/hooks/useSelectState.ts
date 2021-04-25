import { useEffect, useState } from "react";

export const useSelectState = <T>(
  options: readonly T[],
  defaultOption: T = options[0]
) => {
  const [value, onChange] = useState(defaultOption);

  useEffect(() => {
    if (options.includes(value)) return;
    onChange(defaultOption);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [options, onChange]);

  return { options, value, onChange };
};
