import { Ship } from "fleethub-core";
import React from "react";

import { cn } from "../../../styles/cn";
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

export type ShipStatKey = (typeof SHIP_STAT_KEYS)[number];

type Props = {
  ship: Ship;
  onUpdate?: (state: Partial<ShipEntity>) => void;
};

const ShipStats: React.FCX<Props> = ({ className, ship, onUpdate }) => {
  return (
    <div className={cn("grid h-full grid-cols-[50%_50%] grid-rows-[repeat(6,1fr)]", className)}>
      {SHIP_STAT_KEYS.map((key) => (
        <ShipStatLabel key={key} statKey={key} ship={ship} onUpdate={onUpdate} />
      ))}
    </div>
  );
};

export default ShipStats;
