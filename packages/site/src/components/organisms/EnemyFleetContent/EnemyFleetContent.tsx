import { MapEnemyFleet } from "@fleethub/utils";
import React from "react";

import { Flexbox } from "../../atoms";
import ShipBanner from "../ShipBanner";
import FighterPowerStats from "./FighterPowerStats";
type Props = {
  enemy: MapEnemyFleet;
  lbas?: boolean;
};

const EnemyFleetContent: React.FCX<Props> = ({ className, enemy, lbas }) => {
  return (
    <div className={className}>
      <Flexbox>
        <FighterPowerStats label="制空" fp={enemy.fp} />
        {lbas ? <FighterPowerStats label="基地戦" fp={enemy.lbasFp} /> : null}
      </Flexbox>

      <div>
        {enemy.main.map((shipId, index) => (
          <ShipBanner key={index} shipId={shipId} />
        ))}
      </div>
      <div>
        {enemy.escort?.map((shipId, index) => (
          <ShipBanner key={index} shipId={shipId} />
        ))}
      </div>
    </div>
  );
};

export default EnemyFleetContent;
