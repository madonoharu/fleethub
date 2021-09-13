import styled from "@emotion/styled";
import { HitRateParams, HitRate } from "@fleethub/core";
import { useTranslation } from "next-i18next";
import React from "react";
import { numstr, toPercent } from "../../../utils";
import { LabeledValue } from "../../atoms";

type HitRateDetailsProps = {
  hitRate: HitRate | null;
  params: HitRateParams | null;
};

const HitRateDetails: React.FCX<HitRateDetailsProps> = ({
  className,
  hitRate,
  params,
}) => {
  const { t } = useTranslation("common");
  return (
    <div className={className}>
      <LabeledValue label={t("HitRate")} value={toPercent(hitRate?.total)} />
      <LabeledValue
        label={t("HitRateNormal")}
        value={toPercent(hitRate?.normal)}
      />
      <LabeledValue
        label={t("HitRateCritical")}
        value={toPercent(hitRate?.critical)}
      />
      <LabeledValue
        label={t("AccuracyTerm")}
        value={numstr(params?.accuracy_term) || "-"}
      />
      <LabeledValue
        label={t("EvasionTerm")}
        value={numstr(params?.evasion_term) || "-"}
      />
      <LabeledValue
        label={t("MoraleMod")}
        value={numstr(params?.morale_mod) || "-"}
      />
      <LabeledValue
        label={t("HitPercentageBonus")}
        value={`${numstr(params?.hit_percentage_bonus) || "-"}%`}
      />
      <LabeledValue
        label={t("CriticalPercentageBonus")}
        value={`${numstr(params?.critical_percentage_bonus) || "-"}%`}
      />
      <LabeledValue
        label={t("CriticalRateConstant")}
        value={numstr(params?.critical_rate_constant) || "-"}
      />
    </div>
  );
};

export default styled(HitRateDetails)``;
