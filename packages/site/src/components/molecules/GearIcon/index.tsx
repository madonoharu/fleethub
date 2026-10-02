import { cn } from "../../../styles/cn";
import Image from "next/image";
import React from "react";

import { cloudinaryLoader } from "../../../utils";

interface Props {
  className?: string;
  iconId: number;
}

const GearIcon = React.forwardRef<HTMLDivElement, Props>((props, ref) => {
  const { iconId, className, ...rest } = props;
  if (!iconId) return null;

  const width = 24;
  const height = 24;

  return (
    <div ref={ref} className={cn("size-6", className)} {...rest}>
      <Image
        loader={cloudinaryLoader}
        width={width}
        height={height}
        src={`gear_icons/${iconId}.png`}
        alt={`${iconId}`}
      />
    </div>
  );
});

export default GearIcon;
