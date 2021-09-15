import BrokenImage from "@mui/icons-material/BrokenImage";
import Image from "next/image";
import React from "react";

import { useFhCore } from "../../../hooks";
import { cloudinaryLoader } from "../../../utils";

type Props = {
  shipId: number;
  size?: "small" | "medium" | "large";
};

const SIZES = {
  small: 3,
  medium: 4,
  large: 5,
};

const ShipBanner: React.FCX<Props> = ({
  className,
  shipId,
  size = "small",
}) => {
  const { masterData } = useFhCore();
  const publicId = masterData.ship_banners[shipId] || "";

  const scale = SIZES[size];
  const width = scale * 32;
  const height = scale * 8;

  if (!publicId) {
    return <BrokenImage className={className} style={{ width, height }} />;
  }

  return (
    <div className={className} css={{ width, height }}>
      <Image
        layout="fixed"
        loader={cloudinaryLoader}
        width={width}
        height={height}
        src={`ships/${publicId}.png`}
      />
    </div>
  );
};

export default ShipBanner;
