import type { AttackReport } from "fleethub-core";
import React from "react";

import { toPercent } from "../../../utils";
import { cn } from "../../../styles";

interface Props {
  item: AttackReport<unknown>;
}

const ProcRateCell: React.FCX<Props> = ({ className, item }) => {
  const rate = item.proc_rate;
  const hits = item.hits;

  const n1 = Math.floor(hits);
  const n2 = n1 + 1;
  const r1 = n2 - hits;
  const r2 = 1 - r1;

  return (
    <div className={className}>
      <span>{n1}</span>
      <span>{toPercent(rate && rate * r1)}</span>
      {r2 > 0 && (
        <>
          <span>{n2}</span>
          <span>{toPercent(rate && rate * r2)}</span>
        </>
      )}
    </div>
  );
};

export default ({ className, ...props }: React.ComponentProps<typeof ProcRateCell>) => (
  <ProcRateCell
    {...props}
    className={cn("w-16 grid [grid-template-columns:auto_1fr] text-right", className)}
  />
);
