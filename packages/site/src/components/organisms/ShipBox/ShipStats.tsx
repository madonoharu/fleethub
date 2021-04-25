import styled from "@emotion/styled";
import { Ship } from "@fleethub/core";
import React from "react";

import ShipStatLabel from "./ShipStatLabel";

const SHIP_STAT_KEYS = [
  "max_hp",
  "firepower",
  "armor",
  "torpedo",
  "evasion",
  "anti_air",
  "asw",
  "speed",
  "los",
  "range",
  "luck",
] as const;

export type ShipStatKey = typeof SHIP_STAT_KEYS[number];

type Props = {
  ship: Ship;
};

const ShipStats: React.FCX<Props> = ({ className, ship }) => {
  return (
    <div className={className}>
      {SHIP_STAT_KEYS.map((statKey) => (
        <ShipStatLabel key={statKey} statKey={statKey} stat={ship[statKey]} />
      ))}
    </div>
  );
};

export default styled(ShipStats)`
  display: grid;
  grid-template-columns: 50% 50%;

  button {
    height: 20px;
    padding: 0;
    justify-content: flex-start;
  }
`;
