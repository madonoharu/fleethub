import { useAppDispatch, useAppSelector } from "../../../hooks";
import { GearCategoryFilter, gearSelectSlice } from "../../../store";

export const useGearListState = () => {
  const dispatch = useAppDispatch();
  const state = useAppSelector((root) => root.present.gearSelect);
  const { category, abyssal } = state;

  const setAbyssal = (abyssal: boolean) =>
    dispatch(gearSelectSlice.actions.update({ abyssal }));
  const setCategory = (category: GearCategoryFilter) =>
    dispatch(gearSelectSlice.actions.update({ category }));

  return {
    category,
    abyssal,
    setCategory,
    setAbyssal,
  };
};
