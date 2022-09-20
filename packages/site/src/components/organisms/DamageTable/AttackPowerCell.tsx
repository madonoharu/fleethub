import { styled, Typography, Tooltip } from "@mui/material";
import type { AttackReport } from "fleethub-core";
import { useTranslation } from "next-i18next";
import React from "react";

import { numstr } from "../../../utils";
import { InfoButton } from "../../molecules";
import AttackPowerDetails from "../AttackTable/AttackPowerDetails";

const AttackPowerValue = styled(Typography)`
  display: flex;
  justify-content: space-between;
  width: 54px;
`;

interface Props {
  report: AttackReport<unknown>;
}

const AttackPowerCell: React.FCX<Props> = ({ className, report }) => {
  const { t } = useTranslation("common");

  const { attack_power } = report;
  const color = attack_power?.is_capped ? "secondary.light" : undefined;
  return (
    <div className={className}>
      <div>
        <Tooltip title={t("Normal")}>
          <AttackPowerValue>
            <span>N</span>
            <Typography color={color} align="right" component="span">
              {numstr(attack_power?.normal, 1)}
            </Typography>
          </AttackPowerValue>
        </Tooltip>

        <Tooltip title={t("Critical")}>
          <AttackPowerValue>
            <span>C</span>
            <Typography color={color} align="right" component="span">
              {numstr(attack_power?.critical, 1)}
            </Typography>
          </AttackPowerValue>
        </Tooltip>
      </div>
      <InfoButton
        sx={{ gridColumn: 2, gridRow: "1 / span 2" }}
        title={
          <AttackPowerDetails
            power={report.attack_power}
            params={report.attack_power_params}
          />
        }
      />
    </div>
  );
};

export default styled(AttackPowerCell)`
  display: flex;
  align-items: center;
  gap: 8px;
`;
