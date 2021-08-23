import styled from "@emotion/styled";
import React from "react";

import ShipBanner from "../ShipBanner";

const ShipList = styled.div`
  display: flex;
  gap: 4px;
`;

type ShipBannerGroupProps = {
  main?: number[] | Uint16Array;
  escort?: number[] | Uint16Array;
};

const ShipBannerGroup: React.FCX<ShipBannerGroupProps> = ({
  className,
  main,
  escort,
}) => {
  return (
    <div className={className}>
      {main?.length ? (
        <ShipList>
          {Array.from(main).map((id, index) => (
            <ShipBanner key={`main-${index}`} shipId={id} />
          ))}
        </ShipList>
      ) : null}
      {escort?.length ? (
        <ShipList>
          {Array.from(escort).map((id, index) => (
            <ShipBanner key={`escort-${index}`} shipId={id} />
          ))}
        </ShipList>
      ) : null}
    </div>
  );
};

export default styled(ShipBannerGroup)`
  overflow: hidden;
  white-space: nowrap;

  > div:first-of-type {
    margin-bottom: 4px;
  }
`;
