import styled from "@emotion/styled";
import { Ship, WarfareContext, ShellingAttackAnalysis } from "@fleethub/core";
import { Button, Paper } from "@material-ui/core";
import { nanoid } from "@reduxjs/toolkit";
import React, { useState } from "react";
import { useTranslation } from "react-i18next";
import { useDispatch } from "react-redux";
import { useImmer } from "use-immer";
import { useFhCore, useModal, useShip } from "../../../hooks";
import { createShip, shipSelectSlice } from "../../../store";
import { Flexbox } from "../../atoms";
import ShipCard from "../ShipCard";
import AttackTabele from "./AttackTabele";

const EnemyListItem: React.FCX<{
  ship1: Ship;
  id: string;
  context: WarfareContext;
}> = ({ id, context, ship1 }) => {
  const ship2 = useShip(id);
  const { core } = useFhCore();

  if (!ship2) return null;

  const data: ShellingAttackAnalysis = core.analyze_shelling(
    context,
    ship1,
    ship2
  );

  return (
    <Flexbox
      gap={1}
      css={{
        "> *": {
          width: "100%",
        },
      }}
    >
      <ShipCard ship={ship2} />
      <Paper
        css={{
          minHeight: 24 * 8,
          padding: 8,
        }}
      >
        <AttackTabele data={data} />
      </Paper>
    </Flexbox>
  );
};

type ShipDetailsEnemyListProps = {
  ship: Ship;
  context: WarfareContext;
};

const ShipDetailsEnemyList: React.FCX<ShipDetailsEnemyListProps> = ({
  className,
  ship,
  context,
}) => {
  const dispatch = useDispatch();
  const [enemies, updateEnemies] = useImmer<string[]>([]);

  const handleEnemySelect = () => {
    const id = nanoid();

    // todo!
    dispatch(shipSelectSlice.actions.create({ id }));

    updateEnemies((state) => {
      state.push(id);
    });
  };

  return (
    <div className={className}>
      <Button variant="contained" color="primary" onClick={handleEnemySelect}>
        敵を追加して攻撃力を計算する
      </Button>
      {enemies.map((id) => (
        <EnemyListItem key={id} id={id} context={context} ship1={ship} />
      ))}
    </div>
  );
};

export default ShipDetailsEnemyList;
