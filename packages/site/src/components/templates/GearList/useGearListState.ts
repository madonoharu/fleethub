import { nonNullable } from "@fh/utils";
import { useMemo } from "react";
import { useSelector, useDispatch } from "react-redux";

import { useFhCore } from "../../../hooks";
import { GearCategoryFilter, gearSelectSlice } from "../../../store";

export const useGearListState = () => {
  const { masterData, core } = useFhCore();
  const dispatch = useDispatch();
  const state = useSelector((root) => root.present.gearSelect);
  const { category, abyssal } = state;

  const setAbyssal = (abyssal: boolean) =>
    dispatch(gearSelectSlice.actions.update({ abyssal }));
  const setCategory = (category: GearCategoryFilter) =>
    dispatch(gearSelectSlice.actions.update({ category }));

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
    category,
    abyssal,
    setCategory,
    setAbyssal,
  };
};
