import { BattleFleet } from "@fleethub/core";
import { Button, Container, Paper, Typography } from "@material-ui/core";
import React from "react";

import { Flexbox, ShipBanner } from "../../../components";
import FighterPowerStats from "./FighterPowerStats";

type Props = {
  enemy: BattleFleet;
  visibleAlbFp?: boolean;
};

const EnemyFleetContent: React.FCX<Props> = ({
  className,
  enemy,
  visibleAlbFp,
}) => {
  const fp = enemy.calcFighterPower();
  const antiLbFp = visibleAlbFp && enemy.calcFighterPower(true);

  return (
    <div className={className}>
      <Flexbox>
        <FighterPowerStats label="制空" value={fp} />
        {antiLbFp ? (
          <FighterPowerStats label="基地戦" value={antiLbFp} />
        ) : null}
      </Flexbox>

      <div>
        {enemy.main.ships.map((ship, index) => (
          <ShipBanner key={index} publicId={ship.banner} />
        ))}
      </div>
      <div>
        {enemy.escort?.ships.map((ship, index) => (
          <ShipBanner key={index} publicId={ship.banner} />
        ))}
      </div>
    </div>
  );
};

export default EnemyFleetContent;
