import Image from "next/image";
import React from "react";

import ammo from "../../../images/icons/ammo.png";

const AmmoIcon: React.FCX = (props) => (
  <Image {...props} width={20} height={20} src={ammo} alt="ammo" unoptimized />
);

export default AmmoIcon;
