import { cn } from "../../../styles/cn";
import React from "react";

type StarsLabelProps = {
  stars: number;
  disabled?: boolean;
};

const StarsLabel: React.FCX<StarsLabelProps> = ({ stars, disabled, className, ...rest }) => {
  return (
    <span
      {...rest}
      className={cn(
        "flex w-7 justify-start [&>*]:basis-full",
        disabled ? "text-action-disabled" : "text-stars",
        className,
      )}
    >
      <span>★</span>
      <span data-testid="value">{stars === 10 ? "M" : stars}</span>
    </span>
  );
};

export default StarsLabel;
