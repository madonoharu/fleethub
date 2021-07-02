import styled from "@emotion/styled";
import { Ship } from "@fleethub/core";
import { Button, ButtonProps } from "@material-ui/core";
import AddIcon from "@material-ui/icons/Add";
import React from "react";
import { shallowEqual } from "react-redux";

import { useModal, useShipActions } from "../../../hooks";
import ShipList from "../../templates/ShipList";
import Swappable from "../Swappable";
import ShipCard from "./ShipCard";

const AddShipButton: React.FC<ButtonProps> = (props) => (
  <Button variant="outlined" {...props}>
    <AddIcon />
    艦娘
  </Button>
);

export type ShipBoxProps = {
  ship?: Ship;
  onShipChange?: (ship: Ship) => void;
};

const ShipBox: React.FCX<ShipBoxProps> = ({
  className,
  ship,
  onShipChange,
}) => {
  const id = ship?.id || "";

  const actions = useShipActions(id);

  const Modal = useModal();

  const handleShipChange = () => {
    Modal.show();
  };

  const element = !ship ? (
    <AddShipButton onClick={handleShipChange} />
  ) : (
    <ShipCard ship={ship} onUpdate={actions.update} onRemove={actions.remove} />
  );

  return (
    <>
      <Swappable
        className={className}
        type="ship"
        item={{ id }}
        onSwap={(dragItem, dropItem) => console.log(dragItem, dropItem)}
        dragLayer={"a"}
      >
        {element}
      </Swappable>
      <Modal full>
        <ShipList
          onSelect={(ship) => {
            onShipChange?.(ship);
            Modal.hide();
          }}
        />
      </Modal>
    </>
  );
};

const Memoized = React.memo(
  ShipBox,
  ({ ship: prevShip, ...prevRest }, { ship: nextShip, ...nextRest }) =>
    prevShip?.xxh3 === nextShip?.xxh3 && shallowEqual(prevRest, nextRest)
);

const Styled = styled(Memoized)`
  height: ${24 * 7 + 16}px;

  > * {
    width: 100%;
    height: 100%;
  }
`;

export default Styled;
