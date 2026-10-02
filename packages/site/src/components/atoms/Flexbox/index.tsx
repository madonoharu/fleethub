import React from "react";

import { cn } from "../../../styles/cn";

const Flexbox = React.forwardRef<HTMLDivElement, React.ComponentPropsWithoutRef<"div">>(
  ({ className, ...props }, ref) => (
    <div
      ref={ref}
      {...props}
      className={cn("flex items-center [:where(&)>*]:min-w-0", className)}
    />
  ),
);

export default Flexbox;
