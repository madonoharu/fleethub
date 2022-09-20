import type { ActionReport, AttackReport } from "fleethub-core";
import { useTranslation } from "next-i18next";
import React from "react";

import { toPercent } from "../../../utils";
import { Flexbox } from "../../atoms";
import { InfoButton } from "../../molecules";
import AttackStyleChip from "../AttackStyleChip";
import HitRateDetails from "../AttackTable/HitRateDetails";
import ProcRateCell from "../AttackTable/ProcRateCell";
import Table, { ColumnProps } from "../Table";

import AttackPowerCell from "./AttackPowerCell";
import DamageCell from "./DamageCell";

type ItemType = AttackReport<unknown>;

type AttackReportType = Partial<ActionReport<unknown>> &
  Pick<ActionReport<unknown>, "data">;

type DamageTableProps = {
  report: AttackReportType;
};

const DamageTable: React.FCX<DamageTableProps> = ({ className, report }) => {
  const { t } = useTranslation("common");
  const data = Object.values(report.data);
  data.sort((a, b) => (b.proc_rate || 0) - (a.proc_rate || 0));

  const columns: ColumnProps<ItemType>[] = [
    {
      label: t("Type"),
      getValue: (item) => (
        <AttackStyleChip attack={item.style} css={{ width: "100%" }} />
      ),
    },

    {
      label: t("ProcRate"),
      getValue: (item) => <ProcRateCell sx={{ ml: 1 }} item={item} />,
    },
    {
      label: t("AttackPower"),
      getValue: (item) => <AttackPowerCell report={item} />,
    },
    {
      label: t("Damage"),
      getValue: (item) => {
        return <DamageCell stats={item} />;
      },
    },
    {
      label: `${t("hit_rate")} (${t("CriticalAbbr")})`,
      getValue: (item) => (
        <Flexbox gap={1}>
          <span>{toPercent(item.hit_rate?.total)}</span>
          <span>({toPercent(item.hit_rate?.critical)})</span>
          <InfoButton
            size="tiny"
            title={
              <HitRateDetails
                hitRate={item.hit_rate}
                params={item.hit_rate_params}
              />
            }
          />
        </Flexbox>
      ),
    },
  ];

  return (
    <Table className={className} data={data} padding="none" columns={columns} />
  );
};

export default DamageTable;
