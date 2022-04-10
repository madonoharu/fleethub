import { useCallback, useEffect, useRef } from "react";

class Timer {
  private id?: number;

  reset(): this {
    window.clearTimeout(this.id);

    return this;
  }

  setTimeout(handler: () => void, timeout: number) {
    this.reset();
    this.id = window.setTimeout(handler, timeout);
  }

  setInterval(handler: () => void, timeout: number) {
    this.reset();
    this.id = window.setInterval(handler, timeout);
  }
}

const usePress = (onPress: () => void) => {
  const ref = useRef(new Timer());

  useEffect(
    () => () => {
      ref.current.reset();
    },
    []
  );

  const start = useCallback(() => {
    onPress();

    const timer = ref.current;
    timer.setTimeout(() => {
      timer.setInterval(onPress, 50);
    }, 400);
  }, [onPress]);

  const cancel = useCallback(() => {
    ref.current.reset();
  }, []);

  return {
    onMouseDown: start,
    onMouseUp: cancel,
    onMouseLeave: cancel,
  };
};

export default usePress;
