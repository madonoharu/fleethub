import { Stack } from "@mui/material";
import type { NodeState } from "fleethub-core";
import { useTranslation } from "next-i18next";
import React from "react";

import { Checkbox } from "../../atoms";
import { NumberInput } from "../../molecules";

interface Props {
  value: NodeState | undefined;
  onChange?: (value: NodeState) => void;
}

const NodeStateForm: React.FC<Props> = ({ value = {}, onChange }) => {
  const { t } = useTranslation("common");
  const handlePhaseChange = (phase: number) => {
    onChange?.({ ...value, phase });
  };

  const handleDebuffChange = (debuff: boolean) => {
    onChange?.({ ...value, debuff });
  };

  const handleDisableHistoricalModChange = (checked: boolean) => {
    onChange?.({ ...value, disable_historical_mod: !checked });
  };

  return (
    <Stack flexDirection="row" gap={2}>
      <NumberInput
        sx={{ width: 64 }}
        label="Phase"
        value={value?.phase || 0}
        min={0}
        max={4}
        onChange={handlePhaseChange}
      />
      <Checkbox
        label={t("debuff")}
        checked={value?.debuff}
        onChange={handleDebuffChange}
      />
      <Checkbox
        label={t("historical_mod")}
        checked={!value?.disable_historical_mod}
        onChange={handleDisableHistoricalModChange}
      />
    </Stack>
  );
};

export default NodeStateForm;
