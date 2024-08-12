import Image from "next/image";
import React from "react";

const AmmoIcon: React.FCX = (props) => (
  <Image {...props} width={20} height={20} src={"/icons/ammo.png"} alt="ammo" />
);

export default AmmoIcon;
