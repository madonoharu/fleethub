import throttle from "es-toolkit/compat/throttle";
import type { CSSProperties } from "react";
import type { DragLayerMonitor } from "react-dnd";

export function createDragLayerStyle() {
  // DragLayer consumes the last computed style between frames; native throttle
  // returns void, while the compatibility API preserves that cached result.
  return throttle(
    (monitor: Pick<DragLayerMonitor, "getSourceClientOffset">): CSSProperties | undefined => {
      const offset = monitor.getSourceClientOffset();
      if (!offset) return;
      return { transform: `translate(${offset.x}px, ${offset.y}px)` };
    },
    50,
  );
}
