import Image from "next/image";
import React from "react";

import fuel from "../../../images/icons/fuel.png";

const FuelIcon: React.FCX = (props) => (
  <Image {...props} width={20} height={20} src={fuel} alt="fuel" unoptimized />
);

export default FuelIcon;
