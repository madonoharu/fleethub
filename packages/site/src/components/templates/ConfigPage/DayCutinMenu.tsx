import { Stack, Paper } from "@mui/material";
import type { DayCutinDef, MasterData, ShellingStyle } from "fleethub-core";
import { useTranslation } from "next-i18next";
import React from "react";

import { useAppDispatch, useRootSelector } from "../../../hooks";
import { configSlice } from "../../../store";
import { Flexbox } from "../../atoms";
import { AttackTypeChip } from "../../molecules";
import ResettableInput from "../../organisms/ResettableInput";

const KEYS = ["power_mod", "accuracy_mod", "type_factor"] as const;

interface DayCutinFormProps {
  def: DayCutinDef;
}

const DayCutinForm: React.FC<DayCutinFormProps> = ({ def }) => {
  const cutin = def.tag;
  const { t } = useTranslation("common");
  const dispatch = useAppDispatch();
  const current = useRootSelector(
    (root) => root.config.masterData?.day_cutin?.[cutin]
  );

  const attack: Pick<ShellingStyle, "tag" | "cutin"> = {
    tag: "ShellingStyle",
    cutin,
  };

  return (
    <Paper sx={{ p: 1 }}>
      <AttackTypeChip sx={{ mb: 2 }} attack={attack} />

      <Flexbox gap={1}>
        {KEYS.map((key) => (
          <ResettableInput
            key={key}
            label={t(key)}
            defaultValue={def[key]}
            value={current?.[key]}
            min={0}
            step={key === "type_factor" ? 1.0 : 0.1}
            onChange={(v) => {
              dispatch(
                configSlice.actions.updateDayCutin({
                  id: cutin,
                  changes: { [key]: v },
                })
              );
            }}
          />
        ))}
      </Flexbox>
    </Paper>
  );
};

const DayCutinMenu: React.FC<{ data: MasterData }> = ({ data }) => {
  return (
    <Stack gap={1}>
      {data.day_cutin.map((def) => (
        <DayCutinForm key={def.tag} def={def} />
      ))}
    </Stack>
  );
};

export default DayCutinMenu;
