/* eslint-disable @typescript-eslint/no-empty-interface */
import { Action } from "@reduxjs/toolkit"
import { ThunkAction } from "redux-thunk"

import { StoreState, AppDispatch } from "./store"
import { Theme } from "./theme"

declare module "react" {
  type FCX<P = {}> = FC<P & { className?: string }>
}

declare module "react-redux" {
  interface DefaultRootState extends StoreState {}
  export function useDispatch(): AppDispatch
}

declare module "@reduxjs/toolkit" {
  export type AppThunk = ThunkAction<void, StoreState, unknown, Action<string>>
}

declare module "styled-components" {
  interface DefaultTheme extends Theme {}
}
