import { GearFilterGroup } from "@fh/core";
import { nonNullable } from "@fh/utils";
import { useState, useMemo } from "react";

import { useFhCore } from "../../../hooks";

export type Group = GearFilterGroup | "All";

export const useGearListState = () => {
  const { masterData, core } = useFhCore();

  const [group, setGroup] = useState<Group>("All");
  const [abyssal, setAbyssal] = useState(false);

  const gears = useMemo(
    () =>
      masterData.gears
        .map((mg) => core.create_gear({ gear_id: mg.gear_id }))
        .filter(nonNullable),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    []
  );

  return {
    gears,
    group,
    abyssal,
    setGroup,
    setAbyssal,
  };
};
