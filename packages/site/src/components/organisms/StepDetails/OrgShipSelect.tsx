/** @jsxImportSource @emotion/react */
import { css } from "@emotion/react";
import styled from "@emotion/styled";
import { ShipKey } from "@fh/utils";
import AddIcon from "@mui/icons-material/Add";
import { Button } from "@mui/material";
import { Org, Role } from "fleethub-core";
import React from "react";
import { useDispatch } from "react-redux";

import { ShipPosition, shipSelectSlice } from "../../../store";
import { Flexbox } from "../../atoms";
import ShipBanner from "../ShipBanner";

const Column = styled.div`
  width: 128px;
  display: flex;
  flex-direction: column;
`;

type OrgShipSelectProps = {
  org: Org;
  enemy?: boolean | undefined;
  value?: string | undefined;
  onSelect?: (id: string) => void;
};

const OrgShipSelect: React.FCX<OrgShipSelectProps> = ({
  className,
  enemy,
  style,
  org,
  value,
  onSelect,
}) => {
  const dispatch = useDispatch();

  const color = enemy ? "secondary" : "primary";
  const isCombined = org.is_combined();

  const renderShips = (role: Role) =>
    org.sortie_ship_keys(role)?.map((key) => {
      const ship = org.get_ship(role, key);

      if (!ship) {
        const handleClick = () => {
          const position: ShipPosition = {
            tag: "fleet",
            id: org.get_fleet_id_by_role(role),
            key: key as ShipKey,
          };

          dispatch(shipSelectSlice.actions.create({ position }));
        };

        return (
          <Button
            key={key}
            variant="outlined"
            color={color}
            onClick={handleClick}
          >
            <AddIcon />
          </Button>
        );
      }

      const selected = ship.id == value;

      return (
        <Button
          key={key}
          variant={selected ? "contained" : "outlined"}
          color={color}
          onClick={() => onSelect?.(ship.id)}
        >
          <ShipBanner shipId={ship.ship_id} />
        </Button>
      );
    });

  return (
    <Flexbox className={className} style={style} alignItems="flex-start">
      <Column>{renderShips("Main")}</Column>
      {isCombined && <Column>{renderShips("Escort")}</Column>}
    </Flexbox>
  );
};

export default styled(OrgShipSelect)(({ enemy }) => [
  css`
    min-height: ${36 * 6}px;
  `,
  enemy &&
    css`
      flex-direction: row-reverse;
      justify-content: flex-end;
    `,
]);
