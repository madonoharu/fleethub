import styled from "@emotion/styled";
import {
  Ship,
  SpecialEnemyType,
  AttackPower,
  Engagement,
} from "@fleethub/core";
import { Typography } from "@material-ui/core";
import React from "react";
import { useTranslation } from "react-i18next";
import { useFhCore } from "../../../hooks";
import { LabeledValue } from "../../atoms";
import { Select } from "../../molecules";
import Table from "../Table";

const SPECIAL_ENEMY_TYPES: SpecialEnemyType[] = [
  "None",
  "Pillbox",
  "IsolatedIsland",
  "HarbourSummerPrincess",
  "SupplyDepot",
  "SoftSkinned",
  "PtImp",
  "BattleshipSummerPrincess",
  "HeavyCruiserSummerPrincess",
];

type ShipDetailScreenProps = {
  ship: Ship;
};

const ShipDetailScreen: React.FCX<ShipDetailScreenProps> = ({
  className,
  ship,
}) => {
  const { t } = useTranslation("common");
  const { core } = useFhCore();
  const data: [Engagement, AttackPower][] = core.test(ship);

  return (
    <div className={className}>
      <Typography variant="subtitle1">{ship.name}</Typography>
      <Select label="敵種別" options={SPECIAL_ENEMY_TYPES} value="None" />
      <Typography variant="subtitle2">砲撃戦</Typography>
      <Table
        style={{ width: 240 }}
        padding="none"
        data={data}
        columns={[
          { label: "交戦形態", getValue: (datum): string => t("Echelon") },
          {
            label: "攻撃力",
            getValue: (datum) => {
              const color = datum[1].is_capped ? "secondary" : undefined;
              return <Typography color={color}>{datum[1].normal}</Typography>;
            },
            align: "right",
          },
          {
            label: "クリ",
            getValue: (datum) => {
              const color = datum[1].is_capped ? "secondary" : undefined;
              return <Typography color={color}>{datum[1].critical}</Typography>;
            },
            align: "right",
          },
        ]}
      />
    </div>
  );
};

export default styled(ShipDetailScreen)`
  width: 600px;
  min-height: 80vh;
`;
