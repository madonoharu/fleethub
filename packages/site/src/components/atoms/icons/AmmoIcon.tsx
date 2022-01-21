import Image from "next/image";
import React from "react";

const AmmoIcon: React.FCX = (props) => (
  <Image
    {...props}
    layout="fixed"
    width={20}
    height={20}
    src={"/icons/ammo.png"}
  />
);

export default AmmoIcon;
