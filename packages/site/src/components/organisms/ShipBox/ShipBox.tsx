/** @jsxImportSource @emotion/react */
import styled from "@emotion/styled";
import AddIcon from "@mui/icons-material/Add";
import { Button } from "@mui/material";
import { Ship } from "fleethub-core";
import { useTranslation } from "next-i18next";
import React from "react";
import { shallowEqual, useDispatch } from "react-redux";

import { useOrgContext } from "../../../hooks";
import {
  ShipPosition,
  shipSelectSlice,
  entitiesSlice,
  SwapShipPayload,
} from "../../../store";
import ShipCard from "../ShipCard";
import Swappable from "../Swappable";

export type ShipBoxProps = {
  ship?: Ship;
  position?: ShipPosition;
};

const ShipBox: React.FCX<ShipBoxProps> = ({ className, ship, position }) => {
  const { t } = useTranslation("common");

  const dispatch = useDispatch();
  const org = useOrgContext();

  const id = ship?.id || "";

  const handleAdd = () => {
    if (id || (position?.tag === "fleets" && position.id)) {
      dispatch(
        shipSelectSlice.actions.create({
          position,
          id,
        })
      );
    }
  };

  const handleSwap = (payload: SwapShipPayload) => {
    dispatch(entitiesSlice.actions.swapShip(payload));
  };

  const element = !ship ? (
    <Button variant="outlined" startIcon={<AddIcon />} onClick={handleAdd}>
      {t("Ship")}
    </Button>
  ) : (
    <ShipCard ship={ship} org={org} />
  );

  if (!position) {
    return <div className={className}>{element}</div>;
  }

  return (
    <Swappable
      className={className}
      type="ship"
      item={{ id, position }}
      onSwap={handleSwap}
      canDrag={ship && ship.id !== ""}
      dragLayer={<div />}
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
