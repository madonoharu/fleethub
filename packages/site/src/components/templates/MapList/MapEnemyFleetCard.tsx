import { EnemyFleetState } from "@fleethub/core";
import { MapEnemyFleet } from "@fleethub/data";
import { Button, Paper } from "@material-ui/core";
import React from "react";

import { EnemyFleetContent } from "../../../components";
import { useFhSystem } from "../../../hooks";

const getFormationName = (form: number) => {
  const dict: Record<number, string | undefined> = {
    [1]: "単縦陣",
    [2]: "複縦陣",
    [3]: "輪形陣",
    [4]: "梯形陣",
    [5]: "単横陣",
    [6]: "警戒陣",
    [11]: "第一警戒航行序列",
    [12]: "第二警戒航行序列",
    [13]: "第三警戒航行序列",
    [14]: "第四警戒航行序列",
  };

  return dict[form] || "不明";
};

const FormationButton: React.FC<{
  formation: number;
  onClick?: () => void;
}> = ({ formation, onClick }) => {
  const name = getFormationName(formation);
  return <Button onClick={onClick}>{name}</Button>;
};

type Props = {
  mapEnemyFleet: MapEnemyFleet;
  visibleAlbFp?: boolean;
  onSelect?: (enemy: EnemyFleetState) => void;
};

const MapEnemyFleetCard: React.FCX<Props> = ({
  className,
  mapEnemyFleet,
  visibleAlbFp,
  onSelect,
}) => {
  const { mapEnemyFleetToState, createEnemyFleet } = useFhSystem();
  const state = mapEnemyFleetToState(mapEnemyFleet);
  const fleet = createEnemyFleet(state);

  return (
    <Paper className={className}>
      <EnemyFleetContent enemy={fleet} visibleAlbFp={visibleAlbFp} />
      {mapEnemyFleet.formations.map((formation) => (
        <FormationButton
          key={formation}
          formation={formation}
          onClick={() => onSelect?.(state)}
        />
      ))}
    </Paper>
  );
};

export default MapEnemyFleetCard;
