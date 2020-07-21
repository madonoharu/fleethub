/* eslint-disable @typescript-eslint/no-empty-interface */
import { RootState, AppDispatch } from "./store"
import { Theme } from "./styles"

declare module "react" {
  type FCX<P = {}> = FC<P & { className?: string }>
}

declare module "react-redux" {
  interface DefaultRootState extends RootState {}
  export function useDispatch(): AppDispatch
}

declare module "@reduxjs/toolkit" {
  export type AppThunk = import("./store").AppThunk
  export type AppStore = import("./store").AppStore
}

declare module "styled-components" {
  interface DefaultTheme extends Theme {}
}
