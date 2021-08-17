import styled from "@emotion/styled";
import { Ship } from "@fleethub/core";
import { Typography } from "@material-ui/core";
import React from "react";
import { useTranslation } from "react-i18next";

type ShipDetailScreenProps = {
  ship: Ship;
};

const ShipDetailScreen: React.FCX<ShipDetailScreenProps> = ({
  className,
  ship,
}) => {
  const { t } = useTranslation("common");

  return (
    <div className={className}>
      <Typography variant="subtitle1">{ship.name}</Typography>

      <Typography variant="subtitle2">昼戦</Typography>
      {ship.firepower}
    </div>
  );
};

export default styled(ShipDetailScreen)`
  width: 600px;
  min-height: 80vh;
`;
