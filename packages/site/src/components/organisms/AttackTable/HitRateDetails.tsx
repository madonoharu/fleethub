import styled from "@emotion/styled";
import { HitRateParams, HitRate } from "fleethub-core";
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
      <LabeledValue label={t("hit_rate")} value={toPercent(hitRate?.total)} />
      <LabeledValue
        label={`${t("hit_rate")} ${t("Normal")}`}
        value={toPercent(hitRate?.normal)}
      />
      <LabeledValue
        label={`${t("hit_rate")} ${t("Critical")}`}
        value={toPercent(hitRate?.critical)}
      />
      <LabeledValue
        label={t("accuracy_term")}
        value={numstr(params?.accuracy_term) || "-"}
      />
      <LabeledValue
        label={t("evasion_term")}
        value={numstr(params?.evasion_term) || "-"}
      />
      <LabeledValue
        label={t("target_morale_mod")}
        value={numstr(params?.target_morale_mod) || "-"}
      />
      <LabeledValue
        label={t("hit_percentage_bonus")}
        value={`${numstr(params?.hit_percentage_bonus) || "-"}%`}
      />
      <LabeledValue
        label={t("critical_percentage_bonus")}
        value={`${numstr(params?.critical_percentage_bonus) || "-"}%`}
      />
      <LabeledValue
        label={t("critical_rate_constant")}
        value={numstr(params?.critical_rate_constant) || "-"}
      />
    </div>
  );
};

export default styled(HitRateDetails)``;
