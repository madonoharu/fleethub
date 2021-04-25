import styled from "@emotion/styled";
import { Ship } from "@fleethub/core";
import { Button, ButtonProps } from "@material-ui/core";
import AddIcon from "@material-ui/icons/Add";
import { EntityId } from "@reduxjs/toolkit";
import React from "react";

import { useModal, useShip } from "../../../hooks";
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
  id?: EntityId;
  onShipChange?: (ship: Ship) => void;
};

const ShipBox: React.FCX<ShipBoxProps> = React.memo(
  ({ className, id, onShipChange }) => {
    const { ship, entity, actions } = useShip(id || "");

    const Modal = useModal();

    const handleShipChange = () => {
      Modal.show();
    };

    const element =
      !ship || !entity ? (
        <AddShipButton onClick={handleShipChange} />
      ) : (
        <ShipCard
          ship={ship}
          entity={entity}
          onRemove={actions.remove}
          onGearChange={actions.setGear}
        />
      );

    return (
      <>
        <Swappable
          className={className}
          type="ship"
          state={id}
          setState={(s) => console.log(s)}
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
  }
);

const Styled = styled(ShipBox)`
  height: ${24 * 7 + 16}px;

  > * {
    width: 100%;
    height: 100%;
  }
`;

export default Styled;
