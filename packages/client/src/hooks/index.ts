import { useState, useRef, useEffect, useDebugValue } from "react"

export const useSelect = <T>(options: readonly T[], defaultOption: T = options[0]) => {
  const [value, onChange] = useState(defaultOption)

  useEffect(() => {
    if (!options.includes(value)) {
      onChange(defaultOption)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [options, onChange])

  useEffect(() => onChange(defaultOption), [defaultOption])

  return { options, value, onChange }
}

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
export * from "./useSwap"

export * from "./useFhSystem"
export * from "./useCachedFhFactory"

export * from "./usePlan"
