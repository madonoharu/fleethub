import { Formation } from "@fleethub/core";
import { MapEnemyFleet } from "@fleethub/utils";
import { Button, Paper } from "@material-ui/core";
import { useTranslation } from "next-i18next";
import React from "react";

import EnemyFleetContent from "../../organisms/EnemyFleetContent";

const getFormation = (id: number) => {
  const dict: Record<number, Formation | undefined> = {
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

  return dict[id] || "Unknown";
};

const FormationButton: React.FC<{
  formation: number;
  onClick?: () => void;
}> = ({ formation, onClick }) => {
  const { t } = useTranslation("common");

  const name = getFormation(formation);

  return <Button onClick={onClick}>{t(name)}</Button>;
};

type Props = {
  enemy: MapEnemyFleet;
  lbas?: boolean;
  onSelect?: (enemy: MapEnemyFleet) => void;
};

const MapEnemyFleetCard: React.FCX<Props> = ({
  className,
  enemy,
  lbas,
  onSelect,
}) => {
  return (
    <Paper className={className}>
      <EnemyFleetContent enemy={enemy} lbas={lbas} />
      {enemy.formations.map((formation) => (
        <FormationButton
          key={formation}
          formation={formation}
          onClick={() => onSelect?.(enemy)}
        />
      ))}
    </Paper>
  );
};

export default MapEnemyFleetCard;
