import {
  EqualityFn,
  NoInfer,
  TypedUseSelectorHook,
  useDispatch,
  useSelector,
} from "react-redux";

import type { AppDispatch, RootState, RootStateWithHistory } from "../store";

export const useAppDispatch: () => AppDispatch = useDispatch;
export const useAppSelector: TypedUseSelectorHook<RootStateWithHistory> =
  useSelector;

export const useRootSelector = <Selected = unknown>(
  selector: (state: RootState) => Selected,
  equalityFn?: EqualityFn<NoInfer<Selected>>,
) => useAppSelector((state) => selector(state.present), equalityFn);
