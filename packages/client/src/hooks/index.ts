import { useRef, useEffect, useDebugValue } from "react"

export const useRenderCount = () => {
  const renderCountRef = useRef(0)

  useDebugValue(`このコンポーネントは${renderCountRef.current}回再描画されました`)

  useEffect(() => {
    renderCountRef.current++
  })
}

export * from "./useTimeout"
export * from "./useFetch"
export * from "./useModal"
export * from "./usePopover"
export * from "./useSnackbar"
export * from "./useSelectState"
export * from "./useDrag"
export * from "./useDrop"
export * from "./useSwap"
export * from "./useDragLayerRef"
export * from "./useAsyncOnPublish"
export * from "./useFile"

export * from "./useFhSim"
export * from "./useShip"
