/** @jsxImportSource @emotion/react */
import styled from "@emotion/styled";
import { Formation, OrgAntiAirInfo } from "fleethub-core";
import { useTranslation } from "next-i18next";
import React from "react";

import { useFhCore } from "../../../hooks";
import { toPercent } from "../../../utils";
import { Flexbox, LabeledValue } from "../../atoms";
import { NumberInput } from "../../molecules";
import FormationSelect from "../FormationSelect";
import ShipNameplate from "../ShipNameplate";
import Table from "../Table";
import AntiAirCutinChanceChart from "./AntiAirCutinChanceChart";
import { FleetInfoPanelProps } from "./FleetInfoPanel";

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

const AntiAirPanel: React.FC<FleetInfoPanelProps> = ({ org, fleetKey }) => {
  const { t } = useTranslation("common");
  const { core } = useFhCore();
  const [adjustedAntiAirResist, setAdjustedAntiAirResist] = React.useState(1);
  const [fleetAntiAirResist, setFleetAntiAirResist] = React.useState(1);
  const [formation, setFormation] = React.useState<Formation>(
    org.default_formation()
  );

  const info = core.analyze_anti_air(
    org,
    fleetKey,
    formation,
    adjustedAntiAirResist,
    fleetAntiAirResist
  ) as OrgAntiAirInfo;

  return (
    <div>
      <Container>
        <LabeledValue label="艦隊対空" value={info.fleet_anti_air.toFixed(4)} />

        <FormationSelect
          variant="outlined"
          label={t("Formation")}
          combined={org.is_combined()}
          value={formation}
          onChange={setFormation}
        />

        {/* <Select
          css={{ width: 120 }}
          variant="outlined"
          label="対空CI"
          {...ciSelectState}
          getOptionLabel={(ci) => ci?.name || "無し"}
        /> */}
        <StyledNumberInput
          variant="outlined"
          label="加重対空補正"
          step={0.1}
          min={0}
          max={1}
          value={adjustedAntiAirResist}
          onChange={setAdjustedAntiAirResist}
        />
        <StyledNumberInput
          variant="outlined"
          label="艦隊対空補正"
          step={0.1}
          min={0}
          max={1}
          value={fleetAntiAirResist}
          onChange={setFleetAntiAirResist}
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
            label: "加重対空",
            align: "right",
            getValue: (datum) => datum.adjusted_anti_air,
          },
          {
            label: "割合撃墜",
            align: "right",
            getValue: (datum) =>
              datum.proportional_shotdown_rate?.toFixed(4) ?? "?",
          },
          {
            label: "固定撃墜",
            align: "right",
            getValue: (datum) => datum.fixed_shotdown_number ?? "?",
          },
          {
            label: "最低保証",
            align: "right",
            getValue: (datum) => datum.minimum_bonus,
          },
          {
            label: "対空CI個艦発動率",
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
