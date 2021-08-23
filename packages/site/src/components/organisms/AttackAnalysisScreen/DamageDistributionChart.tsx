import { DamageState } from "@fleethub/core";
import { colors } from "@material-ui/core";
import React from "react";
import { Bar, ComposedChart, Legend, XAxis, YAxis } from "recharts";

import { toPercent } from "../../../utils";

const getColor = (state: DamageState) =>
  ({
    Normal: colors.green["500"],
    Shouha: colors.yellow["500"],
    Chuuha: colors.deepOrange["500"],
    Taiha: colors.red["500"],
    Sunk: colors.blue["500"],
  }[state]);

type DamageDistributionChartProps = {
  damage: Damage;
};

const DamageDistributionChart: React.FCX<DamageDistributionChartProps> = ({
  damage,
}) => {
  const analysis = damage.analyze();
  const damagedStates = analysis.damagedStates.filter((rate) => rate > 0);

  const order: DamageState[] = ["Normal", "Shouha", "Chuuha", "Taiha", "Sunk"];
  const keys = damagedStates
    .keys()
    .sort((a, b) => order.indexOf(a) - order.indexOf(b));
  const rec: Partial<Record<DamageState, number>> = damagedStates.toObject();

  const data = [rec];

  const width = 600;
  const height = 40;

  return (
    <>
      <ComposedChart
        layout="vertical"
        data={data}
        width={width}
        height={height}
      >
        <XAxis type="number" hide={true} />
        <YAxis type="category" hide={true} />
        <Legend
          formatter={(key: DamageState) => `${key} ${toPercent(rec[key] || 0)}`}
        />
        {keys.map((key) => (
          <Bar
            key={key}
            dataKey={key}
            stackId="a"
            barSize={10}
            fill={getColor(key)}
          />
        ))}
      </ComposedChart>
    </>
  );
};

export default DamageDistributionChart;
