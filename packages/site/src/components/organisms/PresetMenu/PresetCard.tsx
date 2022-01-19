/** @jsxImportSource @emotion/react */
import { GEAR_KEYS } from "@fh/utils";
import { Stack, Typography, Paper } from "@mui/material";
import React from "react";
import { useDispatch } from "react-redux";

import { useFhCore } from "../../../hooks";
import { presetsSlice, Preset } from "../../../store";
import { Flexbox } from "../../atoms";
import { DeleteButton, TextField } from "../../molecules";
import { GearBox } from "../../organisms";

type PresetCardProps = {
  preset: Preset;
};

const PresetCard: React.FCX<PresetCardProps> = ({ preset }) => {
  const dispatch = useDispatch();
  const { core } = useFhCore();

  const { id } = preset;

  const handleNameChange = (name: string) => {
    dispatch(presetsSlice.actions.update({ id, changes: { name } }));
  };

  const handleRemove = () => {
    dispatch(presetsSlice.actions.remove(id));
  };

  return (
    <Paper sx={{ p: 1, width: "100%", height: "auto" }}>
      <Flexbox>
        <TextField
          label="Name"
          value={preset.name || ""}
          onChange={handleNameChange}
        />
        <DeleteButton sx={{ ml: "auto" }} size="small" onClick={handleRemove} />
      </Flexbox>

      <Stack>
        {GEAR_KEYS.map((key) => {
          const gearState = preset[key];
          const gear = gearState && core.create_gear(gearState);

          return (
            <Flexbox key={key}>
              <Typography width={16}>{key.replace("g", "")}</Typography>
              <GearBox
                position={{
                  tag: "presets",
                  id,
                  key,
                }}
                gear={gear}
              />
            </Flexbox>
          );
        })}
      </Stack>
    </Paper>
  );
};

export default PresetCard;
