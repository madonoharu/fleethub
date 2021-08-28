import styled from "@emotion/styled";
import { Ship } from "@fleethub/core";
import { Button, ButtonProps } from "@material-ui/core";
import AddIcon from "@material-ui/icons/Add";
import React from "react";
import { shallowEqual, useDispatch } from "react-redux";

import { ShipPosition, shipSelectSlice } from "../../../store";
import ShipCard from "../ShipCard";
import Swappable from "../Swappable";

const AddShipButton: React.FC<ButtonProps> = (props) => (
  <Button variant="outlined" {...props}>
    <AddIcon />
    艦娘
  </Button>
);

export type ShipBoxProps = {
  ship?: Ship;
  position?: ShipPosition;
};

const ShipBox: React.FCX<ShipBoxProps> = ({ className, ship, position }) => {
  const id = ship?.id || "";

  const dispatch = useDispatch();

  const handleShipChange = () => {
    dispatch(shipSelectSlice.actions.create({ position, id }));
  };

  const element = !ship ? (
    <AddShipButton onClick={handleShipChange} />
  ) : (
    <ShipCard ship={ship} />
  );

  return (
    <Swappable
      className={className}
      type="ship"
      item={{ id }}
      onSwap={(dragItem, dropItem) => console.log(dragItem, dropItem)}
      dragLayer={"a"}
    >
      {element}
    </Swappable>
  );
};

const Memoized = React.memo(
  ShipBox,
  ({ ship: prevShip, ...prevRest }, { ship: nextShip, ...nextRest }) =>
    prevShip?.xxh3 === nextShip?.xxh3 && shallowEqual(prevRest, nextRest)
);

const Styled = styled(Memoized)`
  height: ${24 * 8}px;

  > * {
    width: 100%;
    height: 100%;
  }
`;

export default Styled;
