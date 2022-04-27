import { MutableRefObject, useCallback, useEffect, useRef } from "react";

function reset(ref: MutableRefObject<number | undefined>): void {
  window.clearTimeout(ref.current);
  ref.current = undefined;
}

interface Options {
  onPress: () => void;
  onFinish: () => void;
}

export function useLongPress({ onPress, onFinish }: Options) {
  const ref = useRef<number>();

  useEffect(
    () => () => {
      reset(ref);
    },
    []
  );

  const start = useCallback(() => {
    onPress();

    const fn = () => {
      onPress();
      ref.current = window.setTimeout(fn, 50);
    };
    ref.current = window.setTimeout(fn, 400);
  }, [onPress]);

  const cancel = useCallback(() => {
    if (ref.current) {
      reset(ref);
      onFinish();
    }
  }, [onFinish]);

  return {
    onMouseDown: start,
    onMouseUp: cancel,
    onMouseLeave: cancel,
    onTouchStart: start,
    onTouchEnd: cancel,
  };
}
