import { Stack, Paper } from "@mui/material";
import type { MasterData, NightAttackStyle, NightCutinDef } from "fleethub-core";
import { useTranslation } from "next-i18next/pages";
import React from "react";

import { useAppDispatch, useRootSelector } from "../../../hooks";
import { configSlice } from "../../../store";
import { Flexbox } from "../../atoms";
import { AttackTypeChip } from "../../molecules";
import ResettableInput from "../../organisms/ResettableInput";

interface NightCutinFormProps {
  def: NightCutinDef;
}

const KEYS = ["power_mod", "accuracy_mod", "type_factor"] as const;

const NightCutinForm: React.FC<NightCutinFormProps> = ({ def }) => {
  const { t } = useTranslation("common");
  const dispatch = useAppDispatch();

  const cutin = def.tag;
  const current = useRootSelector((root) => root.config.masterData?.night_cutin?.[cutin]);

  const attack: Pick<NightAttackStyle, "tag" | "cutin"> = {
    tag: "NightAttackStyle",
    cutin,
  };

  return (
    <div>
      <AttackTypeChip className="mb-4" attack={attack} />

      <Flexbox className="items-end gap-2">
        {KEYS.map((key) => (
          <ResettableInput
            key={key}
            label={t(key)}
            defaultValue={def[key]}
            value={current?.[key]}
            min={0}
            step={key === "type_factor" ? 1 : 0.1}
            onChange={(v) => {
              dispatch(
                configSlice.actions.updateNightCutin({
                  id: cutin,
                  changes: { [key]: v },
                }),
              );
            }}
          />
        ))}
      </Flexbox>
    </div>
  );
};

const NightCutinMenu: React.FC<{ data: MasterData }> = ({ data }) => {
  return (
    <Stack className="gap-2">
      {data.night_cutin.map((def) => (
        <Paper key={def.tag} className="p-2">
          <NightCutinForm def={def} />
        </Paper>
      ))}
    </Stack>
  );
};

export default NightCutinMenu;
