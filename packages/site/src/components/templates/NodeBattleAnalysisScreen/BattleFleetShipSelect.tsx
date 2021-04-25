import { css } from "@emotion/react";
import styled from "@emotion/styled";
import { BattleFleet, Ship } from "@fleethub/core";
import { Button } from "@material-ui/core";
import React from "react";

import ShipNameplate from "../ShipList/ShipNameplate";

type ShipButtonProps = {
  selected?: boolean;
  ship: Ship;
  onClick: () => void;
};

const ShipButton: React.FCX<ShipButtonProps> = ({
  className,
  ship,
  onClick,
}) => {
  return (
    <Button className={className} variant="outlined" onClick={onClick}>
      <ShipNameplate
        shipId={ship.shipId}
        name={ship.name}
        banner={ship.banner}
      />
    </Button>
  );
};

const StyledShipButton = styled(ShipButton)(
  (props) => css`
    height: 40px;
    width: 216px;
    border-color: ${props.theme.palette.action.disabled};
    ${props.selected &&
    css`
      border-color: ${props.theme.palette.secondary.main};
    `}
  `
);

const Root = styled.div`
  display: flex;
`;

const Column = styled.div`
  display: flex;
  flex-direction: column;
  > * {
    margin-top: 4px;
  }
`;

type BattleFleetShipSelectProps = {
  fleet: BattleFleet;
  value: Ship;
  onChange: (ship: Ship) => void;
};

const BattleFleetShipSelect: React.FCX<BattleFleetShipSelectProps> = ({
  fleet,
  value,
  onChange,
}) => {
  const { side, main, escort } = fleet;

  const handleClick = (ship: Ship) => {
    onChange(ship);
  };

  const mainElement = (
    <Column key="main">
      {main.ships.map((ship, index) => (
        <StyledShipButton
          key={index}
          selected={value === ship}
          ship={ship}
          onClick={() => handleClick(ship)}
        />
      ))}
    </Column>
  );

  const escortElement = escort && (
    <Column key="escort">
      {escort.ships.map((ship, index) => (
        <StyledShipButton
          key={index}
          selected={value === ship}
          ship={ship}
          onClick={() => handleClick(ship)}
        />
      ))}
    </Column>
  );

  return (
    <Root>
      {side === "Enemy"
        ? [escortElement, mainElement]
        : [mainElement, escortElement]}
    </Root>
  );
};

export default BattleFleetShipSelect;
