import React from "react"

const resetTimer = (timer: React.MutableRefObject<number | null>) => {
  if (!timer.current) return

  clearTimeout(timer.current)
  timer.current = null
}

const usePress = (onPress: () => void) => {
  const [isPressed, setIsPressed] = React.useState(false)
  const timer = React.useRef<number | null>(null)

  React.useEffect(() => {
    if (!isPressed) return

    resetTimer(timer)
    timer.current = window.setTimeout(onPress, 50)
  }, [isPressed, timer, onPress])

  const onMouseDown = React.useCallback(() => {
    onPress()
    timer.current = window.setTimeout(() => setIsPressed(true), 500)
  }, [onPress, timer, setIsPressed])

  const onMouseUp = React.useCallback(() => {
    resetTimer(timer)
    setIsPressed(false)
  }, [timer, setIsPressed])

  return {
    onMouseDown,
    onMouseUp,
    onMouseLeave: onMouseUp,
  }
}

export default usePress
