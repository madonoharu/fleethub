import { FLEET_KEYS, ShipKey, SHIP_KEYS, uniq } from "@fh/utils";
import { Typography } from "@mui/material";
import { Org, FleetKey } from "fleethub-core";
import { useTranslation } from "next-i18next/pages";
import React from "react";

import { cn } from "../../../styles/cn";
import { useAppDispatch } from "../../../hooks";
import { entitiesSlice, ShipPosition, SwapShipPayload } from "../../../store";

import OrgShipButton from "./OrgShipButton";

interface Props {
  org: Org;
  selectedShip: string | undefined;
  onShipClick?: (id: string) => void;
  visibleAll?: boolean;
  visibleRouteSup?: boolean;
}

const OrgShipList: React.FCX<Props> = ({
  className,
  org,
  selectedShip,
  onShipClick,
  visibleAll,
  visibleRouteSup,
}) => {
  const dispatch = useAppDispatch();
  const { t } = useTranslation("common");
  const isEnemy = org.is_enemy();
  const isCombined = org.is_combined();
  const fleetKeys = isEnemy ? FLEET_KEYS.concat().reverse() : FLEET_KEYS;

  const supKey = org.route_sup;
  const color = isEnemy ? "secondary" : "primary";

  let keys: readonly FleetKey[] = isCombined ? ["f1", "f2"] : ["f1"];

  if (!isEnemy) {
    if (visibleAll) {
      keys = FLEET_KEYS;
    } else if (visibleRouteSup && supKey) {
      keys = uniq([...keys, supKey]);
    }
  }

  const handleClick = (event: React.MouseEvent<HTMLButtonElement>) => {
    onShipClick?.(event.currentTarget.value);
  };

  const handleSwap = (payload: SwapShipPayload) => {
    dispatch(entitiesSlice.actions.swapShip(payload));
  };

  const renderShip = (fleetKey: FleetKey, shipKey: ShipKey) => {
    const className = `${fleetKey} ${shipKey}`;

    const fleetId = org.get_fleet_id(fleetKey);
    const eid = org.get_ship_eid(fleetKey, shipKey);
    const mid = org.get_ship_mid(fleetKey, shipKey);

    const position: ShipPosition = {
      tag: "fleets",
      id: fleetId,
      key: shipKey,
    };

    const selected = eid == selectedShip;

    return (
      <OrgShipButton
        key={className}
        className={className}
        style={{
          gridColumn: fleetKeys.indexOf(fleetKey) + 1,
          gridRow: SHIP_KEYS.indexOf(shipKey) + 2,
        }}
        id={eid}
        shipId={mid}
        position={position}
        color={color}
        selected={selected}
        onClick={handleClick}
        onSwap={handleSwap}
      />
    );
  };

  return (
    <div className={cn("grid auto-cols-[120px] gap-1", className)}>
      {keys.map((key) => {
        const ft = org.get_fleet_type(key);
        return (
          <Typography
            key={key}
            className={cn("row-start-1", key)}
            style={{ gridColumn: fleetKeys.indexOf(key) + 1 }}
            variant="subtitle2"
          >
            {ft ? t(`FleetType.${ft}`) : key.toUpperCase()}
          </Typography>
        );
      })}

      {keys.flatMap((fleetKey) =>
        org.ship_keys(fleetKey).map((shipKey) => renderShip(fleetKey, shipKey as ShipKey)),
      )}
    </div>
  );
};

export default OrgShipList;
