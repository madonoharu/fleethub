import styled from "@emotion/styled";
import { round } from "@fh/utils";
import { useTranslation } from "next-i18next";
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

type CutinChanceCellProps = {
  rates: [number, number][];
};

const CutinChanceCell: React.FCX<CutinChanceCellProps> = ({
  className,
  rates,
}) => {
  return (
    <div className={className}>
      {rates.map(([id, rate]) => (
        <LabeledValue key={id} label={id} value={toPercent(rate)} />
      ))}
    </div>
  );
};

const Container = styled(Flexbox)`
  align-items: flex-end;
  margin-bottom: 8px;
  gap: 8px;

  > div:first-of-type {
    margin-right: auto;
  }
`;

const StyledChanceChart = styled(AntiAirCutinChanceChart)`
  margin: 0 auto;
`;

const StyledCutinChanceCell = styled(CutinChanceCell)`
  width: 80px;
  margin-left: auto;
`;

const StyledNumberInput = styled(NumberInput)`
  width: 120px;
`;

const AntiAirPanel: React.FCX = ({ className }) => {
  const { t } = useTranslation("common");
  const { comp, analyzer, state, bind } = useCompContext();

  const info = analyzer.analyze_anti_air(
    comp,
    state.formation,
    state.shipAntiAirResist,
    state.fleetAntiAirResist,
    state.anti_air_cutin || undefined
  );

  return (
    <div className={className}>
      <Container>
        <LabeledValue
          label={t("fleet_adjusted_anti_air")}
          value={round(info.fleet_adjusted_anti_air, 4)}
        />

        <FormationSelect
          variant="outlined"
          label={t("Formation.name")}
          combined={comp.is_combined()}
          value={state.formation}
          onChange={bind("formation")}
        />

        <AntiAirCutinSelect
          value={state.anti_air_cutin}
          onChange={bind("anti_air_cutin")}
          visibleIds={info.anti_air_cutin_chance.map(([id]) => id)}
        />

        <StyledNumberInput
          variant="outlined"
          label="加重対空補正"
          step={0.1}
          min={0}
          max={1}
          value={state.shipAntiAirResist}
          onChange={bind("shipAntiAirResist")}
        />
        <StyledNumberInput
          variant="outlined"
          label="艦隊対空補正"
          step={0.1}
          min={0}
          max={1}
          value={state.fleetAntiAirResist}
          onChange={bind("fleetAntiAirResist")}
        />
      </Container>

      <Table
        padding="none"
        data={info.ships}
        columns={[
          {
            label: t("Ship"),
            getValue: (datum) => <ShipNameplate shipId={datum.ship_id} />,
          },
          {
            label: t("adjusted_anti_air"),
            align: "right",
            getValue: (datum) => datum.adjusted_anti_air,
          },
          {
            label: t("proportional_shotdown_rate"),
            align: "right",
            getValue: (datum) =>
              datum.proportional_shotdown_rate?.toFixed(4) ?? "?",
          },
          {
            label: t("fixed_shotdown_number"),
            align: "right",
            getValue: (datum) => datum.fixed_shotdown_number ?? "?",
          },
          {
            label: t("guaranteed"),
            align: "right",
            getValue: (datum) => datum.guaranteed,
          },
          {
            label: t("anti_air_cutin_chance"),
            align: "right",
            getValue: (datum) => (
              <StyledCutinChanceCell rates={datum.anti_air_cutin_chance} />
            ),
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
        label="対空CI艦隊発動率"
        chance={info.anti_air_cutin_chance}
      />
    </div>
  );
};

export default AntiAirPanel;
