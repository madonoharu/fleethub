import { HealthState } from "@fleethub/core";
import { NumberRecord, randint } from "@fleethub/utils";
import { colors } from "@material-ui/core";
import React from "react";
import { Bar, ComposedChart, Legend, XAxis, YAxis } from "recharts";

import { toPercent } from "../../../utils";

type AttackResultState = HealthState | "Miss";

const getColor = (state: AttackResultState) =>
  ({
    Miss: colors.grey["300"],
    Normal: colors.green["500"],
    Shouha: colors.yellow["500"],
    Chuuha: colors.deepOrange["500"],
    Taiha: colors.red["500"],
    Sunk: colors.blue["500"],
  }[state]);

type AttackResultChartProps = {
  attackResultStates: NumberRecord<AttackResultState>;
};

const order: AttackResultState[] = [
  "Miss",
  "Normal",
  "Shouha",
  "Chuuha",
  "Taiha",
  "Sunk",
];

const AttackResultChart: React.FCX<AttackResultChartProps> = ({
  attackResultStates,
}) => {
  const states = attackResultStates.filter((rate) => rate > 0);

  const keys = states
    .keys()
    .sort((a, b) => order.indexOf(a) - order.indexOf(b));
  const rec: Partial<Record<AttackResultState, number>> = states.toObject();

  const data = [rec];

  const width = 600;
  const height = 64;

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
          formatter={(key: HealthState) =>
            `${key} ${toPercent(rec[key] || 0, 3)}`
          }
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

export default AttackResultChart;
