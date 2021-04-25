import styled from "@emotion/styled";
import { Ship } from "@fleethub/core";
import { Typography } from "@material-ui/core";
import React from "react";

import { Divider } from "../../atoms";

type Props = {
  searchValue: string;
  ships: Ship[];
  renderShip: (ship: Ship) => React.ReactNode;
};

const ShipSearchResult: React.FC<Props> = ({
  searchValue,
  ships,
  renderShip,
}) => {
  const text = (
    <Typography>
      &quot;{searchValue}&quot;の検索結果{" "}
      {ships.length === 0 && "見つかりませんでした"}
    </Typography>
  );
  return (
    <div>
      {text}
      {ships.map(renderShip)}
    </div>
  );
};

export default ShipSearchResult;
