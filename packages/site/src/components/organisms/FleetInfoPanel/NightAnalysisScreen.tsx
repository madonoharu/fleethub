import { Typography, Stack, Tooltip } from "@mui/material";
import { CompNightAnalysis, NightCutinActionReport } from "fleethub-core";
import { useTranslation } from "next-i18next/pages";
import React from "react";

import { useCompContext } from "../../../hooks";
import { toPercent } from "../../../utils";
import { Flexbox } from "../../atoms";
import { InfoButton } from "../../molecules";
import AttackStyleChip from "../AttackStyleChip";
import AttackPowerDetails from "../AttackTable/AttackPowerDetails";
import NightFleetConditionsForm from "../NightFleetConditionsForm";
import ContactRankIcon from "../NightFleetConditionsForm/ContactRankIcon";
import ShipNameplate from "../ShipNameplate";
import Table from "../Table";

import FleetCutinAnalysisTable from "./FleetCutinAnalysisTable";
import { cn } from "../../../styles";

const GridContainer1 = ({ className, ...props }: React.ComponentProps<"div">) => (
  <div
    {...props}
    className={cn(
      "grid [grid-template-columns:auto_auto_48px] [justify-content:end] [align-content:start] gap-2",
      className,
    )}
  />
);

const GridContainer2 = ({ className, ...props }: React.ComponentProps<typeof GridContainer1>) => (
  <GridContainer1 {...props} className={cn("[grid-template-columns:auto_48px]", className)} />
);

const NightCutinActionReportCell: React.FC<{
  report: NightCutinActionReport;
}> = ({ report }) => {
  const { t } = useTranslation("common");

  if (!report.is_active) {
    return null;
  }

  const singleRate = report.data["SingleAttack"]?.proc_rate;
  const total = typeof singleRate === "number" ? 1 - singleRate : null;

  const entries = Object.entries(report.data);
  entries.sort((a, b) => (b[1].proc_rate ?? 0) - (a[1].proc_rate ?? 0));

  return (
    <Stack className="gap-4" direction="row">
      <GridContainer1>
        {entries.map(([key, attack]) => (
          <React.Fragment key={key}>
            <AttackStyleChip attack={attack.style} />
            <InfoButton
              title={
                <AttackPowerDetails
                  power={attack.attack_power}
                  params={attack.attack_power_params}
                />
              }
            />
            <Typography variant="inherit" align="right">
              {toPercent(attack.proc_rate)}
            </Typography>
          </React.Fragment>
        ))}
      </GridContainer1>
      <GridContainer2>
        <Typography component="span" variant="inherit" color="textSecondary">
          {t("cutin_term")}
        </Typography>
        <Typography component="span" variant="inherit" align="right">
          {report.cutin_term}
        </Typography>
        <Typography component="span" variant="inherit" color="textSecondary">
          {t("Total")}
        </Typography>
        <Typography component="span" variant="inherit" align="right">
          {toPercent(total)}
        </Typography>
      </GridContainer2>
    </Stack>
  );
};

interface Props {
  analysis: CompNightAnalysis;
}

const NightAnalysisScreen: React.FCX<Props> = ({ className, analysis }) => {
  const { comp, config, bind } = useCompContext();
  const { t } = useTranslation("common");

  const { night_cutin, fleet_cutin } = analysis;

  const attackerColor = comp.is_enemy() ? "secondary" : "primary";
  const targetColor = comp.is_enemy() ? "primary" : "secondary";

  return (
    <Stack className={cn("gap-2", className)}>
      <Flexbox className="gap-2">
        {([1, 2, 3] as const).map((n) => {
          const rate = night_cutin.night_contact_chance[`rank${n}`];

          if (n !== 1 && rate === 0) {
            return null;
          }

          const title = `${t("NightContact")} ${t(`ContactRank.Rank${n}`)}`;

          return (
            <Tooltip key={n} title={title}>
              <Typography className="flex items-center gap-2" variant="body2" component="div">
                <ContactRankIcon rank={`Rank${n}`} />
                <span>{toPercent(rate)}</span>
              </Typography>
            </Tooltip>
          );
        })}

        <Typography className="ml-10">攻撃側</Typography>
        <NightFleetConditionsForm
          value={config.left_night_fleet_conditions}
          onChange={bind("left_night_fleet_conditions")}
          color={attackerColor}
        />

        <Typography className="ml-10">相手側</Typography>
        <NightFleetConditionsForm
          value={config.right_night_fleet_conditions}
          onChange={bind("right_night_fleet_conditions")}
          color={targetColor}
        />
      </Flexbox>

      <Table
        className="mb-4"

        data={night_cutin.ships}
        columns={[
          {
            label: "艦娘",
            getValue: (ship) => <ShipNameplate shipId={ship.ship_id} index={ship.index} />,
            width: 160,
          },
          {
            label: "小破以上",
            getValue: (ship) => <NightCutinActionReportCell report={ship.normal} />,
          },
          {
            label: "中破",
            getValue: (ship) => <NightCutinActionReportCell report={ship.chuuha} />,
          },
        ]}
      />

      <FleetCutinAnalysisTable data={fleet_cutin} />
    </Stack>
  );
};

export default NightAnalysisScreen;
