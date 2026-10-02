import React from "react";

import { cn } from "../../../styles/cn";
import ShipBanner from "../ShipBanner";

type ShipBannerGroupProps = {
  main?: number[] | Uint16Array;
  escort?: number[] | Uint16Array;
};

const ShipBannerGroup: React.FCX<ShipBannerGroupProps> = ({ className, main, escort }) => {
  return (
    <div className={cn("overflow-hidden whitespace-nowrap [&>div:first-of-type]:mb-1", className)}>
      {main?.length ? (
        <div className="flex gap-1">
          {Array.from(main).map((id, index) => (
            <ShipBanner key={`main-${index}`} shipId={id} />
          ))}
        </div>
      ) : null}
      {escort?.length ? (
        <div className="flex gap-1">
          {Array.from(escort).map((id, index) => (
            <ShipBanner key={`escort-${index}`} shipId={id} />
          ))}
        </div>
      ) : null}
    </div>
  );
};

export default ShipBannerGroup;
