import styled from "@emotion/styled";
import {
  DayCutinRateInfo,
  FleetDayCutinRateInfo,
  Org,
  OrgDayCutinRateInfo,
} from "@fleethub/core";
import { useTranslation } from "next-i18next";
import React from "react";

import { useFhCore } from "../../../hooks";
import { toPercent } from "../../../utils";
import { LabeledValue } from "../../atoms";
import AttackChip from "../AttackChip";
import ShipNameplate from "../ShipNameplate";
import Table from "../Table";

const LeftContainer = styled.div`
  > * {
    margin-top: 4px;
  }
  > :last-child {
    margin-bottom: 4px;
  }
`;

const RightContainer = styled(LeftContainer)`
  margin-left: 24px;
  line-height: 24px;
`;

const CutinRateCell: React.FCX<{ info: DayCutinRateInfo }> = ({
  className,
  info,
}) => {
  const total = info.total_cutin_rate;
  return (
    <div
      className={className}
      css={{ display: "flex", alignItems: "flex-end" }}
    >
      <LeftContainer>
        {info.rates.map(([cutin, rate], index) => (
          <LabeledValue
            key={index}
            label={<AttackChip type="Shelling" cutin={cutin} />}
            value={toPercent(rate)}
          />
        ))}
      </LeftContainer>
      <RightContainer>
        <LabeledValue label="観測項" value={info.observation_term} />
        <LabeledValue label="特殊攻撃率" value={toPercent(total)} />
      </RightContainer>
    </div>
  );
};

type FleetDayAttackRateTableProps = {
  label: string;
  info: FleetDayCutinRateInfo;
};

const FleetDayAttackRateTable: React.FC<FleetDayAttackRateTableProps> = ({
  label,
  info,
}) => {
  const { t } = useTranslation("common");
  return (
    <div>
      {label} 艦隊索敵補正: {info.fleet_los_mod ?? "不明"}
      {info.ships.length === 0 ? (
        "発動不可"
      ) : (
        <Table
          padding="none"
          data={info.ships}
          columns={[
            {
              label: t("Ship"),
              getValue: ({ ship_id }) => <ShipNameplate shipId={ship_id} />,
            },
            {
              label: t("AirSupremacy"),
              getValue: (shipInfo) => (
                <CutinRateCell info={shipInfo.air_supremacy} />
              ),
            },
            {
              label: t("AirSuperiority"),
              getValue: (shipInfo) => (
                <CutinRateCell info={shipInfo.air_superiority} />
              ),
            },
          ]}
        />
      )}
    </div>
  );
};

type Props = {
  org: Org;
};

const DayCutinRateTable: React.FCX<Props> = ({ className, org }) => {
  const { t } = useTranslation("common");
  const { core } = useFhCore();
  const data: OrgDayCutinRateInfo = core.analyze_day_cutin(org);

  return (
    <div className={className}>
      <FleetDayAttackRateTable label={t("Main")} info={data.main} />
      {org.is_combined() && (
        <FleetDayAttackRateTable label={t("Escort")} info={data.escort} />
      )}
    </div>
  );
};

export default styled(DayCutinRateTable)`
  > * {
    margin-bottom: 24px;
  }
`;
