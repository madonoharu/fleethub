import Image from "next/image";
import React from "react";

import { getCloudinaryUrl } from "../../../utils";

type Props = {
  iconId: number;
};

const GearIcon: React.FCX<Props> = ({ className, iconId }) => {
  if (!iconId) return null;

  const width = 24;
  const height = 24;

  const url = getCloudinaryUrl({
    publicId: iconId,
    folder: "gear_icons",
    width,
    height,
  });

  return (
    <div className={className} css={{ width, height }}>
      <Image layout="fixed" width={width} height={height} src={url} />
    </div>
  );
};

export default GearIcon;
