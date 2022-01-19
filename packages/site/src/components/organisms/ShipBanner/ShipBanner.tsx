/** @jsxImportSource @emotion/react */
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
  const { className, shipId, size = "small" } = props;

  const { data } = useGcs<Dict<string, string>>("data/ship_banners.json");

  const publicId = data?.[shipId] || "";

  const scale = SIZES[size];
  const width = scale * 32;
  const height = scale * 8;

  let inner: React.ReactNode;

  if (publicId) {
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
    inner = <BrokenImage className={className} />;
  }

  return (
    <div
      ref={ref}
      className={className}
      css={{ width, height, textAlign: "center" }}
    >
      {inner}
    </div>
  );
});

export default ShipBanner;
