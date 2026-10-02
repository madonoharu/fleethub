import { ShipKey, SHIP_KEYS } from "@fh/utils";
import { Typography } from "@mui/material";

import { Comp, FleetType, FleetMeta, ShipMeta } from "fleethub-core";
import { useTranslation } from "next-i18next/pages";
import React from "react";

import { useAppDispatch } from "../../../hooks";
import { entitiesSlice, ShipPosition, SwapShipPayload } from "../../../store";

import CompShipButton from "./CompShipButton";
import { cn } from "../../../styles";

type CompShipListProps = {
  comp: Comp;
  selectedShip?: string;
  onShipClick: (id: string) => void;
};

const CompShipList: React.FCX<CompShipListProps> = ({
  className,
  comp,
  selectedShip,
  onShipClick,
}) => {
  const { t } = useTranslation("common");
  const dispatch = useAppDispatch();

  const isEnemy = comp.is_enemy();
  const color = isEnemy ? "secondary" : "primary";
  const meta = comp.meta();

  const handleShipSelect: React.MouseEventHandler<HTMLButtonElement> = (event) => {
    onShipClick(event.currentTarget.value);
  };

  const handleSwap = (payload: SwapShipPayload) => {
    dispatch(entitiesSlice.actions.swapShip(payload));
  };

  const renderShip = (ft: FleetType, fleetMeta: FleetMeta, key: ShipKey, ship: ShipMeta | null) => {
    const className = `${ft} ${key}`;
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
        style={{ gridRow: SHIP_KEYS.indexOf(key) + 2 }}
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
          {t(`FleetType.${ft}`)}
        </Typography>
        {fleetMeta.ships.map(([key, ship]) => renderShip(ft, fleetMeta, key as ShipKey, ship))}
      </>
    );
  };

  return (
    <div
      className={cn(
        "grid auto-cols-[128px] auto-rows-8 grid-rows-[repeat(8,32px)] gap-1 [&_.RouteSup]:col-start-3 [&>h6]:row-start-1",
        isEnemy
          ? "[&_.Main]:col-start-2 [&_.Escort]:col-start-1"
          : "[&_.Main]:col-start-1 [&_.Escort]:col-start-2",
        className,
      )}
    >
      {renderFleet("Main")}
      {renderFleet("Escort")}
      {renderFleet("RouteSup")}
    </div>
  );
};

export default CompShipList;
