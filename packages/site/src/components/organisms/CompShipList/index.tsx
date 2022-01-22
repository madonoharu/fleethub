import { ShipKey, SHIP_KEYS } from "@fh/utils";
import { Typography } from "@mui/material";
import { styled, css } from "@mui/system";
import clsx from "clsx";
import { Comp, FleetType, FleetMeta, ShipMeta } from "fleethub-core";
import { useTranslation } from "next-i18next";
import React from "react";
import { useDispatch } from "react-redux";

import { entitiesSlice, ShipPosition, SwapShipPayload } from "../../../store";

import CompShipButton from "./CompShipButton";

type CompShipListProps = {
  comp: Comp;
  selectedShip?: string;
  onShipSelect: (id: string) => void;
};

const CompShipList: React.FCX<CompShipListProps> = ({
  className,
  comp,
  selectedShip,
  onShipSelect,
}) => {
  const { t } = useTranslation("common");
  const dispatch = useDispatch();

  const isEnemy = comp.is_enemy();
  const color = isEnemy ? "secondary" : "primary";
  const meta = comp.meta();

  const handleShipSelect: React.MouseEventHandler<HTMLButtonElement> = (
    event
  ) => {
    onShipSelect(event.currentTarget.value);
  };

  const handleSwap = (payload: SwapShipPayload) => {
    dispatch(entitiesSlice.actions.swapShip(payload));
  };

  const renderShip = (
    ft: FleetType,
    fleetMeta: FleetMeta,
    key: ShipKey,
    ship: ShipMeta | null
  ) => {
    const className = clsx(ft, key);
    const position: ShipPosition = {
      tag: "fleets",
      id: fleetMeta.id,
      key: key,
    };
    const selected = ship?.id == selectedShip;

    return (
      <CompShipButton
        key={className}
        className={className}
        position={position}
        meta={ship}
        color={color}
        selected={selected}
        onSelect={handleShipSelect}
        onSwap={handleSwap}
      />
    );
  };

  const renderFleet = (ft: FleetType) => {
    const fleetMeta = meta.fleets?.[ft];

    if (!fleetMeta) {
      return null;
    }

    return (
      <>
        <Typography key={ft} className={ft} variant="subtitle2">
          {t(ft)}
        </Typography>
        {fleetMeta.ships.map(([key, ship]) =>
          renderShip(ft, fleetMeta, key as ShipKey, ship)
        )}
      </>
    );
  };

  return (
    <div className={className}>
      {renderFleet("Main")}
      {renderFleet("Escort")}
      {renderFleet("RouteSup")}
    </div>
  );
};

export default styled(CompShipList)(({ comp }) => {
  const isEnemy = comp.is_enemy();

  return css`
    display: grid;
    grid-auto-columns: 128px;
    grid-auto-rows: 32px;
    gap: 4px;

    .Main {
      grid-column: ${isEnemy ? 2 : 1};
    }
    .Escort {
      grid-column: ${isEnemy ? 1 : 2};
    }
    .RouteSup {
      grid-column: 3;
    }

    > h6 {
      grid-row: 1;
    }

    ${SHIP_KEYS.map(
      (key, i) => css`
        .${key} {
          grid-row: ${i + 2};
        }
      `
    )}
  `;
});
