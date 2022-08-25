import Image from "next/image";
import React from "react";

import { cloudinaryLoader } from "../../../utils";

interface Props {
  className?: string;
  iconId: number;
}

const GearIcon = React.forwardRef<HTMLDivElement, Props>((props, ref) => {
  const { iconId, ...rest } = props;
  if (!iconId) return null;

  const width = 24;
  const height = 24;

  return (
    <div ref={ref} css={{ width, height }} {...rest}>
      <Image
        layout="fixed"
        loader={cloudinaryLoader}
        width={width}
        height={height}
        src={`gear_icons/${iconId}.png`}
      />
    </div>
  );
});

export default GearIcon;
