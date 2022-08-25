import { floor } from "@fh/utils";
import { Divider, Stack } from "@mui/material";
import { Comp, Fleet } from "fleethub-core";
import React from "react";

import { toPercent } from "../../../utils";
import { LabeledValue } from "../../atoms";

const displayWithFloor = (
  v: number | null | undefined,
  fractionDigits = 3
): string => {
  if (v === null || v === undefined) return "";
  if (Number.isInteger(v)) return v.toString();
  return floor(v, fractionDigits).toString();
};

interface Props {
  fleet: Fleet;
  comp: Comp;
}

const MiscScreen: React.FC<Props> = ({ fleet, comp }) => {
  const tp = comp.transport_point();

  return (
    <Stack width="fit-content" ml={5} divider={<Divider />}>
      <LabeledValue variant="body1" label="TP(S勝利)" value={tp} />
      <LabeledValue
        variant="body1"
        label="TP(A勝利)"
        value={Math.floor(tp * 0.7)}
      />
      <LabeledValue
        variant="body1"
        label="航空索敵スコア"
        value={displayWithFloor(fleet.aviation_detection_score(), 2) || "?"}
      />
      <LabeledValue
        variant="body1"
        label="遠征ボーナス"
        value={toPercent(fleet.expedition_bonus())}
      />
      <LabeledValue
        variant="body1"
        label="合計レベル"
        value={fleet.sum_ship_stat_by("level")}
      />
      <LabeledValue
        variant="body1"
        label="合計火力"
        value={fleet.sum_ship_stat_by("firepower")}
      />
      <LabeledValue
        variant="body1"
        label="合計対空"
        value={fleet.sum_ship_stat_by("anti_air")}
      />
      <LabeledValue
        variant="body1"
        label="合計対潜"
        value={fleet.sum_ship_stat_by("asw")}
      />
      <LabeledValue
        variant="body1"
        label="合計索敵"
        value={fleet.sum_ship_stat_by("los")}
      />
    </Stack>
  );
};

export default MiscScreen;
