import { AntiAirCutin, RateMap } from "@fleethub/core";
import { colors } from "@material-ui/core";
import React from "react";
import { Cell, Label, Pie, PieChart } from "recharts";

import { toPercent } from "../../../utils";

const cutinColors = [
  colors.blue,
  colors.green,
  colors.yellow,
  colors.orange,
  colors.pink,
  colors.purple,
].map((color) => color[300]);
const getColor = (index: number): string =>
  cutinColors[index % cutinColors.length];

type Props = {
  label?: string;
  rateMap: RateMap<AntiAirCutin>;
};

const AntiAirCutinChanceChart: React.FCX<Props> = ({
  className,
  label,
  rateMap,
}) => {
  const width = 360;
  const height = 240;
  const cx = width / 2;
  const cy = height / 2;

  const data = rateMap.toArray().map(([ci, rate], index) => ({
    name: ci.name,
    rate,
    color: getColor(index),
  }));
  data.push({
    name: "不発",
    rate: rateMap.complement,
    color: colors.grey[300],
  });

  const renderLabel = (datum: typeof data[number]): any =>
    `${datum.name}: ${toPercent(datum.rate)}`;

  return (
    <PieChart className={className} width={width} height={height}>
      <Pie
        data={data}
        cx={cx}
        cy={cy}
        label={renderLabel}
        innerRadius={60}
        outerRadius={70}
        dataKey="rate"
        animationBegin={0}
        animationDuration={600}
        animationEasing="ease-out"
        paddingAngle={4}
      >
        {data.map((datum, index) => (
          <Cell key={index} fill={datum.color} />
        ))}
        {label && (
          <Label
            value={label}
            dy={-10}
            fontSize="0.75rem"
            fill="white"
            position="center"
          />
        )}
        <Label
          value={`合計 ${toPercent(rateMap.total)}`}
          dy={10}
          fill="white"
          position="center"
        />
      </Pie>
    </PieChart>
  );
};

export default AntiAirCutinChanceChart;
