import { useTheme } from "@emotion/react";
import { Stack } from "@mui/material";
import { LegendOrdinal, LegendItem, LegendLabel } from "@visx/legend";
import { scaleOrdinal } from "@visx/scale";
import { DamageState, Histogram } from "fleethub-core";
import { useTranslation } from "next-i18next";
import React from "react";

import { toPercent } from "../../../utils";

const domain: DamageState[] = ["Normal", "Shouha", "Chuuha", "Taiha", "Sunk"];

type Props = {
  data: Histogram<DamageState, number>;
};

const DamageStateDensityBarChart: React.FCX<Props> = ({ className, data }) => {
  const legendSize = 15;
  const height = 12;
  const theme = useTheme();
  const { t } = useTranslation("common");

  const ordinalColorScale = scaleOrdinal({
    domain,
    range: domain.map((key) => theme.colors[`Damage${key}` as const]),
  });

  let total = 0;

  return (
    <div className={className}>
      <svg width={"100%"} height={height}>
        {domain.map((key) => {
          const rate = data[key];
          if (!rate) return null;

          const x = toPercent(total);
          total += rate;

          return (
            <rect
              key={key}
              x={x}
              width={toPercent(rate)}
              height={height}
              fill={ordinalColorScale(key)}
            />
          );
        })}
      </svg>

      <LegendOrdinal scale={ordinalColorScale}>
        {(labels) => (
          <Stack flexDirection="row" flexWrap="wrap" fontSize="0.875rem">
            {labels.map((label) => {
              const rate = data[label.datum];
              if (!rate) return null;

              return (
                <LegendItem key={label.datum} margin="0 5px">
                  <svg width={legendSize} height={legendSize}>
                    <circle
                      fill={label.value}
                      r={legendSize / 2}
                      cx={legendSize / 2}
                      cy={legendSize / 2}
                    />
                  </svg>

                  <LegendLabel align="left" margin="0 0 0 4px">
                    {`${t(`DamageState.${label.datum}`)} ${toPercent(rate)}`}
                  </LegendLabel>
                </LegendItem>
              );
            })}
          </Stack>
        )}
      </LegendOrdinal>
    </div>
  );
};

export default DamageStateDensityBarChart;
