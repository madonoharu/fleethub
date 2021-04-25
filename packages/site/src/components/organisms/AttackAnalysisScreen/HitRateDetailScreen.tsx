import { HitRateDetail } from "@fleethub/core";
import { Typography } from "@material-ui/core";
import React from "react";

import { toPercent } from "../../../utils";

type HitRateDetailScreenProps = {
  detail: HitRateDetail;
};

const HitRateDetailScreen: React.FC<HitRateDetailScreenProps> = ({
  detail,
}) => {
  return (
    <Typography component="div">
      <p>命中率 {toPercent(detail.hitRate)}</p>
      <p>通常命中率 {toPercent(detail.normalRate)}</p>
      <p>クリティカル率 {toPercent(detail.criticalRate)}</p>

      <p>命中項 {detail.accuracyTerm}</p>
      <p>回避項 {detail.evasionTerm}</p>
      <p>疲労補正 {detail.moraleModifier}</p>

      <p>クリティカル率係数 {detail.criticalRateMultiplier}</p>
      <p>クリティカル率ボーナス {detail.criticalRateBonus}</p>
    </Typography>
  );
};

export default HitRateDetailScreen;
