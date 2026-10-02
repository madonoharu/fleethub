import { MapEnemyComp, MapNode, nonNullable } from "@fh/utils";
import { Button, Paper, Stack } from "@mui/material";
import { Formation } from "fleethub-core";
import { useTranslation } from "next-i18next/pages";
import React from "react";

import { cn } from "../../../styles/cn";
import { useFhCore, useModal } from "../../../hooks";
import { Flexbox } from "../../atoms";
import { InfoButton, NodeLabel } from "../../molecules";
import { EnemyCompScreen, ShipBanner, ShipTooltip } from "../../organisms";

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

type EnemyCompListItem = {
  enemy: MapEnemyComp;
  lbas?: boolean;
  disableFormationClick: boolean;
  onSelect?: (enemy: MapEnemyComp, formation: Formation) => void;
};

const EnemyCompListItem: React.FCX<EnemyCompListItem> = ({
  className,
  enemy,
  lbas,
  disableFormationClick,
  onSelect,
}) => {
  const { t } = useTranslation("common");

  const { allShips } = useFhCore();
  const Modal = useModal();

  const renderShipBanner = (id: number, index: number) => {
    const ship = allShips.find((ship) => ship.ship_id === id);

    if (!ship) {
      return <ShipBanner shipId={id} />;
    }

    return (
      <ShipTooltip key={index} ship={ship}>
        <ShipBanner shipId={id} />
      </ShipTooltip>
    );
  };

  return (
    <Paper className={cn("p-2", className)}>
      <div className="grid grid-cols-[1fr_auto]">
        <EnemyFighterPower label={t("FighterPower")} fp={enemy.fp} />
        {lbas ? (
          <EnemyFighterPower className="col-start-1 row-start-2" label="基地戦" fp={enemy.lbasFp} />
        ) : null}
        <InfoButton
          size="medium"
          className="col-start-2 row-start-1 row-span-2"
          title={t("Details")}
          onClick={Modal.show}
        />
      </div>

      <Stack className="gap-1">
        <Stack direction="row" className="gap-1">
          {enemy.main.map(renderShipBanner)}
        </Stack>
        <Stack direction="row" className="gap-1">
          {enemy.escort?.map(renderShipBanner)}
        </Stack>
      </Stack>

      <Modal full>
        <EnemyCompScreen enemy={enemy} />
      </Modal>

      <Flexbox className="mt-2 gap-2">
        {enemy.formations
          .map(toFormation)
          .filter(nonNullable)
          .map((formation) => (
            <Button
              key={formation}
              size="small"
              disabled={disableFormationClick}
              color="primary"
              variant="contained"
              onClick={() => onSelect?.(enemy, formation)}
            >
              {t(`Formation.${formation}`)}
            </Button>
          ))}
      </Flexbox>
    </Paper>
  );
};

type EnemyCompListProps = {
  node: MapNode;
  difficulty?: number;
  disableFormationClick: boolean;
  onSelect?: (enemy: MapEnemyComp, formation: Formation) => void;
};

const EnemyCompList: React.FCX<EnemyCompListProps> = ({
  className,
  node,
  difficulty,
  disableFormationClick,
  onSelect,
}) => {
  return (
    <Stack className={cn("gap-2", className)}>
      <NodeLabel name={node.point} type={node.type} d={node.d} />
      {node.enemies
        ?.filter((enemy) => !difficulty || !enemy.diff || enemy.diff === difficulty)
        .map((enemy, index) => (
          <EnemyCompListItem
            key={index}
            enemy={enemy}
            lbas={node.d !== undefined}
            disableFormationClick={disableFormationClick}
            onSelect={onSelect}
          />
        ))}
    </Stack>
  );
};

export default EnemyCompList;
