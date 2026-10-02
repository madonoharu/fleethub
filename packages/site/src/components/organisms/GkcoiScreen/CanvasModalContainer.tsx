import React, { useState } from "react";
import { cn } from "../../../styles";

const CanvasModalContainer: React.FCX<{ children: React.ReactNode }> = ({
  className,
  children,
}) => {
  const [zoom, setZoom] = useState(true);

  const handleToggle = () => setZoom((value) => !value);

  return (
    <div
      className={cn(
        zoom ? "[&_canvas]:cursor-zoom-out" : "[&_canvas]:w-full [&_canvas]:cursor-zoom-in",
        className,
      )}
      onClick={handleToggle}
    >
      {children}
    </div>
  );
};

export default CanvasModalContainer;
