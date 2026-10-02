import { Typography, Tooltip } from "@mui/material";
import type { AttackReport } from "fleethub-core";
import { useTranslation } from "next-i18next/pages";
import React from "react";

import { numstr } from "../../../utils";
import { InfoButton } from "../../molecules";
import AttackPowerDetails from "../AttackTable/AttackPowerDetails";
import { cn } from "../../../styles";

const AttackPowerValue = ({ className, ...props }: React.ComponentProps<typeof Typography>) => (
  <Typography {...props} className={cn("flex justify-between w-13.5", className)} />
);

interface Props {
  report: AttackReport<unknown>;
}

const AttackPowerCell: React.FCX<Props> = ({ className, report }) => {
  const { t } = useTranslation("common");

  const { attack_power } = report;
  const valueClassName = attack_power?.is_capped ? "text-secondary-light" : undefined;
  return (
    <div className={className}>
      <div>
        <Tooltip title={t("Normal")}>
          <AttackPowerValue>
            <span>N</span>
            <Typography className={valueClassName} align="right" component="span">
              {numstr(attack_power?.normal, 1)}
            </Typography>
          </AttackPowerValue>
        </Tooltip>

        <Tooltip title={t("Critical")}>
          <AttackPowerValue>
            <span>C</span>
            <Typography className={valueClassName} align="right" component="span">
              {numstr(attack_power?.critical, 1)}
            </Typography>
          </AttackPowerValue>
        </Tooltip>
      </div>
      <InfoButton
        className="[grid-column:2] [grid-row:1_/_span_2]"
        title={
          <AttackPowerDetails power={report.attack_power} params={report.attack_power_params} />
        }
      />
    </div>
  );
};

export default ({ className, ...props }: React.ComponentProps<typeof AttackPowerCell>) => (
  <AttackPowerCell {...props} className={cn("flex items-center gap-2", className)} />
);
