import { Stack, Paper, Typography } from "@mui/material";
import { AntiAirCutinDef, MasterData } from "fleethub-core";
import { useTranslation } from "next-i18next";
import React from "react";

import { useAppDispatch, useAppSelector } from "../../../hooks";
import { configSlice } from "../../../store";
import { Flexbox } from "../../atoms";
import ResettableInput from "../../organisms/ResettableInput";

const KEYS = ["multiplier", "guaranteed", "type_factor"] as const;

interface AntiAirCutinFormProps {
  def: AntiAirCutinDef;
}

const AntiAirCutinForm: React.FC<AntiAirCutinFormProps> = ({ def }) => {
  const id = def.id;

  const { t } = useTranslation("common");
  const dispatch = useAppDispatch();
  const current = useAppSelector(
    (root) => root.present.config.masterData?.anti_air_cutin?.[id]
  );

  return (
    <Paper sx={{ p: 1 }}>
      <Typography variant="subtitle2" mb={1}>
        {id}
      </Typography>
      <Flexbox gap={1}>
        {KEYS.map((key) => (
          <ResettableInput
            key={key}
            label={t(key)}
            defaultValue={def[key]}
            value={current?.[key]}
            min={0}
            step={key === "multiplier" ? 0.1 : 1.0}
            onChange={(v) => {
              dispatch(
                configSlice.actions.updateAntiAirCutin({
                  id,
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

const AntiAirCutinMenu: React.FC<{ data: MasterData }> = ({ data }) => {
  return (
    <Stack gap={1}>
      {data.anti_air_cutin.map((def) => (
        <AntiAirCutinForm key={def.id} def={def} />
      ))}
    </Stack>
  );
};

export default AntiAirCutinMenu;
