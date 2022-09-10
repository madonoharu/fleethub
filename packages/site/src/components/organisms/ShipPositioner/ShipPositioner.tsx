import { Stack } from "@mui/material";
import type { Org } from "fleethub-core";
import React from "react";

import { useAppDispatch } from "../../../hooks";
import { entitiesSlice } from "../../../store";
import { ArrowButtons } from "../../molecules";
import OrgShipList from "../OrgShipList";

type Direction = "Right" | "Left" | "Up" | "Down";

interface Props {
  org: Org;
  id: string | undefined;
  onShipClick: (id: string) => void;
}

const ShipPositioner: React.FC<Props> = ({ org, id, onShipClick }) => {
  const dispatch = useAppDispatch();
  const isEnemy = org.is_enemy();

  const handleMove = (direction: Direction) => {
    if (!id) {
      return;
    }

    let x = 0;
    let y = 0;

    if (direction === "Right") {
      x = isEnemy ? -1 : 1;
    } else if (direction === "Left") {
      x = isEnemy ? 1 : -1;
    } else if (direction === "Up") {
      y = -1;
    } else {
      y = 1;
    }

    const payload = org.create_move_ship_payload(id, x, y);

    if (!payload) {
      return;
    }

    dispatch(
      entitiesSlice.actions.swapShip({
        drag: {
          id,
          position: {
            tag: "fleets",
            id: payload.current[1],
            key: payload.current[2],
          },
        },
        drop: {
          id: payload.target[0] || undefined,
          position: {
            tag: "fleets",
            id: payload.target[1],
            key: payload.target[2],
          },
        },
      })
    );
  };

  return (
    <Stack
      direction="row"
      alignItems="flex-end"
      gap={1}
      onKeyDown={(event) => {
        if (event.key.startsWith("Arrow")) {
          handleMove(event.key.replace("Arrow", "") as Direction);
        }
        event.preventDefault();
      }}
    >
      <OrgShipList org={org} selectedShip={id} onShipClick={onShipClick} />

      <ArrowButtons
        color={org.is_enemy() ? "secondary" : "primary"}
        disabled={!id}
        onClick={handleMove}
      />
    </Stack>
  );
};

export default ShipPositioner;
