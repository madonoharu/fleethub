import { TypedUseSelectorHook, useDispatch, useSelector } from "react-redux";

import type { AppDispatch, RootState, RootStateWithHistory } from "../store";

export const useAppDispatch: () => AppDispatch = useDispatch;
export const useAppSelector: TypedUseSelectorHook<RootStateWithHistory> =
  useSelector;

export const useRootSelector: TypedUseSelectorHook<RootState> = (
  selector,
  equalityFn
) => useAppSelector((state) => selector(state.present), equalityFn);
