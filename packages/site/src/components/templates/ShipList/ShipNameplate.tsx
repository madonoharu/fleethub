import styled from "@emotion/styled";
import React from "react";

import { Flexbox, Text } from "../../atoms";
import { ShipBanner } from "../../molecules";

type Props = {
  className?: string;
  shipId: number;
  banner?: string;
  name: string;
};

const ShipNameplate = React.forwardRef<HTMLDivElement, Props>((props, ref) => {
  const { className, shipId, banner, name } = props;
  return (
    <Flexbox ref={ref} className={className}>
      <ShipBanner publicId={banner} />
      <div>
        {shipId > 1500 && <Text>ID:{shipId}</Text>}
        <Text noWrap>{name}</Text>
      </div>
    </Flexbox>
  );
});

export default styled(ShipNameplate)`
  text-align: start;
  width: 100%;
  ${ShipBanner} {
    width: 96px;
    margin-right: 8px;
    flex-shrink: 0;
  }
`;
