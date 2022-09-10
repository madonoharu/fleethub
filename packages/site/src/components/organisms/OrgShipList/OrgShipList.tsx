import { FLEET_KEYS, ShipKey, SHIP_KEYS, uniq } from "@fh/utils";
import { styled, css, Typography } from "@mui/material";
import { Org, FleetKey } from "fleethub-core";
import { useTranslation } from "next-i18next";
import React from "react";

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
    <div className={className}>
      {keys.map((key) => {
        const ft = org.get_fleet_type(key);
        return (
          <Typography key={key} className={key} variant="subtitle2">
            {ft ? t(`FleetType.${ft}`) : key.toUpperCase()}
          </Typography>
        );
      })}

      {keys.flatMap((fleetKey) =>
        org
          .ship_keys(fleetKey)
          .map((shipKey) => renderShip(fleetKey, shipKey as ShipKey))
      )}
    </div>
  );
};

export default styled(OrgShipList)(({ org }) => {
  const isEnemy = org.is_enemy();
  const fleetKeys = isEnemy ? FLEET_KEYS.concat().reverse() : FLEET_KEYS;

  return css`
    display: grid;
    grid-auto-columns: 120px;
    gap: 4px;

    ${fleetKeys.map(
      (key, i) =>
        css`
          .${key} {
            grid-column: ${i + 1};
          }
        `
    )}

    > h6 {
      grid-row: 1;
    }

    ${SHIP_KEYS.map(
      (key, i) =>
        css`
          .${key} {
            grid-row: ${i + 2};
          }
        `
    )}
  `;
});
