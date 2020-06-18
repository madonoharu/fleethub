import React from "react"

export const useRenderCount = () => {
  const renderCountRef = React.useRef(0)

  React.useDebugValue(`このコンポーネントは${renderCountRef.current}回再描画されました`)

  React.useEffect(() => {
    renderCountRef.current++
  })
}

export * from "./useModal"
export * from "./usePopover"
export * from "./handlers"
export * from "./useSwap"

export * from "./useFhSystem"
export * from "./useCachedFhFactory"

export * from "./usePlan"

export * from "./useGearSelectContext"
export * from "./useShipSelectContext"
