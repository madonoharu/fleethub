/** @jsxImportSource @emotion/react */
import styled from "@emotion/styled";
import { round } from "@fh/utils";
import { AntiAirCutinDef } from "fleethub-core";
import { useTranslation } from "next-i18next";
import React, { useMemo } from "react";

import { useFhCore } from "../../../hooks";
import { Select } from "../../molecules";

type Props = {
  value: number | null;
  onChange?: (value: number | null) => void;
  visibleIds?: number[];
};

const AntiAirCutinSelect: React.FCX<Props> = ({
  value,
  onChange,
  visibleIds,
}) => {
  const { masterData } = useFhCore();
  const data = masterData.config.anti_air_cutin;

  const options = useMemo(() => [null, ...data], [data]);
  const current = data.find((def) => def.id === value) || null;

  const itemFilter =
    visibleIds &&
    ((def: AntiAirCutinDef | null) =>
      def === null || visibleIds.includes(def.id));

  return (
    <Select
      variant="outlined"
      label="対空CI"
      options={options}
      value={current}
      onChange={(def) => {
        onChange?.(def?.id || null);
      }}
      getOptionLabel={(def) => {
        return def
          ? `${def.id}種 (x${def.multiplier || "?"}+${
              def.minimum_bonus || "?"
            })`
          : "None";
      }}
      itemFilter={itemFilter}
    />
  );
};

export default AntiAirCutinSelect;
