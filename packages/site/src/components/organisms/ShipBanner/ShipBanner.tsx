import { Dict } from "@fh/utils";
import BrokenImage from "@mui/icons-material/BrokenImage";
import Image from "next/image";
import React from "react";

import { useGcs } from "../../../hooks";
import { cloudinaryLoader } from "../../../utils";

type Props = {
  className?: string;
  shipId: number;
  size?: "small" | "medium" | "large";
};

const SIZES = {
  small: 3,
  medium: 4,
  large: 5,
};

const ShipBanner = React.forwardRef<HTMLDivElement, Props>((props, ref) => {
  const { shipId, size = "small", ...rest } = props;
  const { data } = useGcs<Dict<string, string>>("data/ship_banners.json");

  const publicId = data?.[shipId] || "";

  const scale = SIZES[size];
  const width = scale * 32;
  const height = scale * 8;

  let inner: React.ReactNode;

  if (!data) {
    inner = null;
  } else if (publicId) {
    inner = (
      <Image
        layout="fixed"
        loader={cloudinaryLoader}
        width={width}
        height={height}
        src={`ships/${publicId}.png`}
        priority={true}
      />
    );
  } else {
    inner = <BrokenImage />;
  }

  return (
    <div css={{ width, height, textAlign: "center" }} ref={ref} {...rest}>
      {inner}
    </div>
  );
});

export default ShipBanner;
