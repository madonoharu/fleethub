import styled from "@emotion/styled";
import type { Comp } from "fleethub-core";
import React, { useMemo } from "react";

import { useShipName } from "../../../hooks";
import { Select } from "../../molecules";

import { listCompShips } from "./compShips";

const NONE = "";

interface LabelProps {
  order: number;
  shipId: number;
}

const ShipNameLabel: React.FC<LabelProps> = ({ order, shipId }) => {
  // 同じ艦を複数積むことがあるので、名前だけでは区別できない。
  return <>{`#${order} ${useShipName(shipId)}`}</>;
};

interface Props {
  label: string;
  noneLabel: string;
  comp: Comp;
  /** 一覧から除く艦（＝いま解析している攻撃艦）の eid */
  excludeId?: string | undefined;
  value: string | undefined;
  onChange: (id: string | undefined) => void;
}

/** 同一編成内の艦を1隻選ぶセレクタ。 */
const CompShipNameSelect: React.FCX<Props> = ({
  className,
  label,
  noneLabel,
  comp,
  excludeId,
  value,
  onChange,
}) => {
  // 除外は選択肢からだけ。番号は編成全体で振らないと欠番でずれる。
  const ships = useMemo(
    () => listCompShips(comp).filter((ship) => ship.id !== excludeId),
    [comp, excludeId],
  );

  const options = useMemo(
    () => [NONE, ...ships.map((ship) => ship.id)],
    [ships],
  );
  const current = value && options.includes(value) ? value : NONE;

  return (
    <Select
      className={className}
      label={label}
      options={options}
      value={current}
      onChange={(id) => onChange(id === NONE ? undefined : id)}
      getOptionLabel={(id) => {
        if (id === NONE) return noneLabel;
        const ship = ships.find((v) => v.id === id);
        return ship ? (
          <ShipNameLabel order={ship.order} shipId={ship.ship_id} />
        ) : (
          id
        );
      }}
    />
  );
};

/**
 * 艦名の長さで幅が変わると、選び直すたびに右にある操作が左右へ動く。
 * 幅は固定して、収まらない名前は末尾を省く。
 */
export default styled(CompShipNameSelect)`
  flex: none;
  width: 200px;

  .MuiSelect-select {
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
  }
`;
