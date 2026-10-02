import React from "react";
import { cn } from "../../../styles/cn";

interface Props {
  icon?: React.ReactElement;
  right?: React.ReactElement | string | number;
  left?: React.ReactElement | string | number;
}

const StatChip: React.FCX<Props> = ({ className, icon, left, right }) => {
  return (
    <div
      className={cn(
        "grid grid-cols-[15px_1fr_1fr] gap-2 rounded border border-solid border-action-selected px-1 py-0",
        className,
      )}
    >
      <div className="flex items-center text-[15px]">{icon}</div>
      <div className="text-right">{left}</div>
      <div className="text-right">{right}</div>
    </div>
  );
};

export default StatChip;
