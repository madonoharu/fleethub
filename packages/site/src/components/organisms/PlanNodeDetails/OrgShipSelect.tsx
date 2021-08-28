import { css } from "@emotion/react";
import styled from "@emotion/styled";
import { Org, Role } from "@fleethub/core";
import { ShipKey } from "@fleethub/utils";
import { Button } from "@material-ui/core";
import AddIcon from "@material-ui/icons/Add";
import React from "react";
import { useDispatch } from "react-redux";

import { shipSelectSlice } from "../../../store";
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

  const renderShips = (role: Role) =>
    (org.sortie_ship_keys(role) as string[] | null)?.map((key) => {
      const ship = org.get_ship(role, key);

      if (!ship) {
        const handleClick = () => {
          const position = {
            fleet: org.get_fleet_id_by_role(role),
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
    <Flexbox className={className} style={style}>
      <Column>{renderShips("Main")}</Column>
      <Column>{renderShips("Escort")}</Column>
    </Flexbox>
  );
};

export default styled(OrgShipSelect)(
  ({ enemy }) =>
    enemy &&
    css`
      flex-direction: row-reverse;
    `
);
