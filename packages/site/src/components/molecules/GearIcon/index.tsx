import styled from "@emotion/styled";
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

  return <img className={className} width={width} height={height} src={url} />;
};

export default styled(GearIcon)``;
