/** @jsxImportSource @emotion/react */
import styled from "@emotion/styled";
import { Ship } from "fleethub-core";
import React from "react";

import { ShipEntity } from "../../../store";

import ShipStatLabel from "./ShipStatLabel";

const SHIP_STAT_KEYS = [
  "max_hp",
  "firepower",
  "armor",
  "torpedo",
  "evasion",
  "anti_air",
  "accuracy",
  "asw",
  "speed",
  "los",
  "range",
  "luck",
] as const;

export type ShipStatKey = typeof SHIP_STAT_KEYS[number];

type Props = {
  ship: Ship;
  onUpdate?: (state: Partial<ShipEntity>) => void;
};

const ShipStats: React.FCX<Props> = ({ className, ship, onUpdate }) => {
  return (
    <div className={className}>
      {SHIP_STAT_KEYS.map((key) => (
        <ShipStatLabel
          key={key}
          statKey={key}
          stat={ship[key]}
          naked={ship.get_naked_stat(key)}
          mod={ship.get_stat_mod(key)}
          ebonus={ship.get_ebonus(key)}
          onUpdate={onUpdate}
        />
      ))}
    </div>
  );
};

export default styled(ShipStats)`
  height: 100%;
  display: grid;
  grid-template-columns: 50% 50%;
  grid-template-rows: repeat(6, 1fr);
`;
