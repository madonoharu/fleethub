/** @jsxImportSource @emotion/react */
import Image from "next/image";
import React from "react";

const FuelIcon: React.FCX = (props) => (
  <Image
    {...props}
    layout="fixed"
    width={20}
    height={20}
    src={"/icons/fuel.png"}
  />
);

export default FuelIcon;
