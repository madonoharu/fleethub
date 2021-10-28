/** @jsxImportSource @emotion/react */
import Image from "next/image";
import React from "react";

import { cloudinaryLoader } from "../../../utils";

type Props = {
  iconId: number;
};

const GearIcon: React.FCX<Props> = ({ className, iconId }) => {
  if (!iconId) return null;

  const width = 24;
  const height = 24;

  return (
    <div className={className} css={{ width, height }}>
      <Image
        layout="fixed"
        loader={cloudinaryLoader}
        width={width}
        height={height}
        src={`gear_icons/${iconId}.png`}
      />
    </div>
  );
};

export default GearIcon;
