import { MutableRefObject, PointerEvent, useCallback, useEffect, useRef } from "react";

function reset(ref: MutableRefObject<number | undefined>): void {
  window.clearTimeout(ref.current);
  ref.current = undefined;
}

interface Options {
  onPress: () => void;
  onFinish: () => void;
}

export function useLongPress({ onPress, onFinish }: Options) {
  const ref = useRef<number | undefined>(undefined);
  const pointer = useRef<number | undefined>(undefined);

  useEffect(
    () => () => {
      reset(ref);
      pointer.current = undefined;
    },
    [],
  );

  const start = useCallback(
    (event: PointerEvent<HTMLButtonElement>) => {
      if (event.button !== 0 || event.currentTarget.disabled || pointer.current !== undefined) {
        return;
      }
      pointer.current = event.pointerId;
      onPress();

      const fn = () => {
        onPress();
        ref.current = window.setTimeout(fn, 50);
      };
      ref.current = window.setTimeout(fn, 400);
    },
    [onPress],
  );

  const cancel = useCallback(
    (event: PointerEvent<HTMLButtonElement>) => {
      if (pointer.current === undefined || pointer.current !== event.pointerId) return;
      pointer.current = undefined;
      reset(ref);
      onFinish();
    },
    [onFinish],
  );

  return {
    // Touch also dispatches compatibility mouse events. Handle each physical
    // press through one event family so a tap cannot apply two steps.
    onPointerDown: start,
    onPointerUp: cancel,
    onPointerLeave: cancel,
    onPointerCancel: cancel,
    onLostPointerCapture: cancel,
  };
}
