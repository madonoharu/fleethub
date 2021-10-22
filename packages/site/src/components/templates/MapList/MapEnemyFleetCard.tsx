import styled from "@emotion/styled";
import { MapEnemyFleet, nonNullable } from "@fh/utils";
import { Button, Paper } from "@mui/material";
import { Formation } from "fleethub-core";
import { useTranslation } from "next-i18next";
import React from "react";

import { Flexbox } from "../../atoms";
import { ShipBannerGroup } from "../../organisms";
import EnemyFighterPower from "./EnemyFighterPower";

const FORMATION_MAP: Record<number, Formation | undefined> = {
  [1]: "LineAhead",
  [2]: "DoubleLine",
  [3]: "Diamond",
  [4]: "Echelon",
  [5]: "LineAbreast",
  [6]: "Vanguard",
  [11]: "Cruising1",
  [12]: "Cruising2",
  [13]: "Cruising3",
  [14]: "Cruising4",
};

const toFormation = (id: number) => FORMATION_MAP[id];

type MapEnemyFleetCardProps = {
  enemy: MapEnemyFleet;
  lbas?: boolean;
  onSelect?: (enemy: MapEnemyFleet, formation: Formation) => void;
};

const MapEnemyFleetCard: React.FCX<MapEnemyFleetCardProps> = ({
  className,
  enemy,
  lbas,
  onSelect,
}) => {
  const { t } = useTranslation("common");

  return (
    <Paper className={className}>
      <div>
        <EnemyFighterPower label={t("FighterPower")} fp={enemy.fp} />
        {lbas ? <EnemyFighterPower label="基地戦" fp={enemy.lbasFp} /> : null}

        <ShipBannerGroup main={enemy.main} escort={enemy.escort} />
      </div>

      <Flexbox gap={1}>
        {enemy.formations
          .map(toFormation)
          .filter(nonNullable)
          .map((formation) => (
            <Button
              key={formation}
              size="small"
              variant="outlined"
              onClick={() => onSelect?.(enemy, formation)}
            >
              {t(formation)}
            </Button>
          ))}
      </Flexbox>
    </Paper>
  );
};

export default styled(MapEnemyFleetCard)`
  padding: 8px;
`;
