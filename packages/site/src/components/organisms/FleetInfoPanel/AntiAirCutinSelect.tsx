import { Typography } from "@mui/material";
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
  const { t } = useTranslation("common");
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
      itemFilter={itemFilter}
      getOptionLabel={(def) => {
        if (!def) {
          return t("None");
        }

        return (
          <Typography
            width="100%"
            align="right"
            display="grid"
            gridTemplateColumns="1fr 1fr 30px"
            gap={1}
          >
            <span>{def.id}種</span>
            <span>x{def.multiplier || "?"}</span>
            <span>+{def.minimum_bonus || "?"}</span>
          </Typography>
        );
      }}
    />
  );
};

export default AntiAirCutinSelect;
