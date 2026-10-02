import { round } from "@fh/utils";
import { CompAntiAirAnalysis } from "fleethub-core";
import { useTranslation } from "next-i18next/pages";
import React from "react";

import { useCompContext } from "../../../hooks";
import { toPercent } from "../../../utils";
import { Flexbox, LabeledValue } from "../../atoms";
import { NumberInput } from "../../molecules";
import FormationSelect from "../FormationSelect";
import ShipNameplate from "../ShipNameplate";
import Table from "../Table";

import AntiAirCutinChanceChart from "./AntiAirCutinChanceChart";
import AntiAirCutinSelect from "./AntiAirCutinSelect";
import { cn } from "../../../styles";

interface CutinChanceCellProps {
  rates: [number, number][];
}

const CutinChanceCell: React.FCX<CutinChanceCellProps> = ({ className, rates }) => {
  return (
    <div className={className}>
      {rates.map(([id, rate]) => (
        <LabeledValue key={id} label={id} value={toPercent(rate)} />
      ))}
    </div>
  );
};

const Container = ({ className, ...props }: React.ComponentProps<typeof Flexbox>) => (
  <Flexbox
    {...props}
    className={cn("items-end mb-2 gap-2 [&_>_div:first-of-type]:mr-auto", className)}
  />
);

const StyledChanceChart = ({
  className,
  ...props
}: React.ComponentProps<typeof AntiAirCutinChanceChart>) => (
  <AntiAirCutinChanceChart {...props} className={cn("m-[0_auto]", className)} />
);

const StyledCutinChanceCell = ({
  className,
  ...props
}: React.ComponentProps<typeof CutinChanceCell>) => (
  <CutinChanceCell {...props} className={cn("w-20 ml-auto", className)} />
);

const StyledNumberInput = ({ className, ...props }: React.ComponentProps<typeof NumberInput>) => (
  <NumberInput {...props} className={cn("w-30", className)} />
);

interface Props {
  analysis: CompAntiAirAnalysis;
}

const AntiAirAnalysisScreen: React.FCX<Props> = ({ className, analysis }) => {
  const { t } = useTranslation("common");
  const { comp, config, bind } = useCompContext();

  return (
    <div className={className}>
      <Container>
        <LabeledValue
          label={t("fleet_adjusted_anti_air")}
          value={round(analysis.fleet_adjusted_anti_air, 4)}
        />

        <FormationSelect
          variant="outlined"
          label={t("Formation.name")}
          combined={comp.is_combined()}
          value={config.formation}
          onChange={bind("formation")}
        />

        <AntiAirCutinSelect
          value={config.anti_air_cutin}
          onChange={bind("anti_air_cutin")}
          visibleIds={analysis.anti_air_cutin_chance.map(([id]) => id)}
        />

        <StyledNumberInput
          variant="outlined"
          label={t("ship_anti_air_resist")}
          step={0.1}
          min={0}
          max={1}
          value={config.ship_anti_air_resist}
          onChange={bind("ship_anti_air_resist")}
        />
        <StyledNumberInput
          variant="outlined"
          label={t("fleet_anti_air_resist")}
          step={0.1}
          min={0}
          max={1}
          value={config.fleet_anti_air_resist}
          onChange={bind("fleet_anti_air_resist")}
        />
      </Container>

      <Table
        className="w-fit m-auto"
        data={analysis.ships}

        columns={[
          {
            label: t("Ship"),
            getValue: (ship) => (
              <ShipNameplate shipId={ship.ship_id} fleetType={ship.role} index={ship.index} />
            ),
          },
          {
            label: t("adjusted_anti_air"),
            align: "right",
            getValue: (ship) => ship.adjusted_anti_air,
          },
          {
            label: t("proportional_shotdown_rate"),
            align: "right",
            getValue: (ship) => ship.proportional_shotdown_rate?.toFixed(4) ?? "?",
          },
          {
            label: t("fixed_shotdown_number"),
            align: "right",
            getValue: (ship) => ship.fixed_shotdown_number ?? "?",
          },
          {
            label: t("guaranteed"),
            align: "right",
            getValue: (ship) => ship.guaranteed,
          },
          {
            label: t("anti_air_cutin_chance"),
            align: "right",
            getValue: (ship) => <StyledCutinChanceCell rates={ship.anti_air_cutin_chance} />,
          },
          {
            label: t("AntiAirPropellantBarrage"),
            align: "right",
            getValue: ({ anti_air_propellant_barrage_chance: rate }) => {
              if (rate === null) return "?";
              if (rate === 0) return "-";
              return toPercent(rate);
            },
          },
        ]}
      />
      <StyledChanceChart
        label={t("anti_air_cutin_chance")}
        chance={analysis.anti_air_cutin_chance}
      />
    </div>
  );
};

export default AntiAirAnalysisScreen;
