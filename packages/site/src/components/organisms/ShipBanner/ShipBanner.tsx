import BrokenImage from "@material-ui/icons/BrokenImage";
import Image from "next/image";
import React from "react";

import { useFhCoreContext } from "../../../hooks";
import { getCloudinaryUrl } from "../../../utils";

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
  const { master_data } = useFhCoreContext();
  const publicId = master_data.ship_banners[shipId] || "";

  const scale = SIZES[size];
  const width = scale * 32;
  const height = scale * 8;

  const url = getCloudinaryUrl({
    publicId,
    folder: "ships",
    width,
    height,
  });

  if (!url) {
    return <BrokenImage className={className} style={{ width, height }} />;
  }

  return (
    <div className={className} css={{ width, height }}>
      <Image layout="fixed" width={width} height={height} src={url} />
    </div>
  );
};

export default ShipBanner;
