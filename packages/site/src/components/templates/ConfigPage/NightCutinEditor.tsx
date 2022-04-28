import { Divider, Stack, Typography } from "@mui/material";
import { NightCutinDef } from "fleethub-core";
import { Draft } from "immer";
import set from "lodash/set";
import { useTranslation } from "next-i18next";
import React, { useMemo, useState } from "react";

import { useAppDispatch, useAppSelector, useMasterData } from "../../../hooks";
import { configSlice } from "../../../store";

import NightCutinForm from "./NightCutinForm";

const NightCutinEditor: React.FC = () => {
  const { data } = useMasterData();
  const dispatch = useAppDispatch();
  const overrides = useAppSelector(
    (root) => root.present.config.overrides?.night_cutin
  );

  if (!data) {
    return null;
  }

  return (
    <Stack gap={2} divider={<Divider />}>
      {data.night_cutin.map((def) => (
        <NightCutinForm
          key={def.tag}
          source={def}
          overrides={overrides?.[def.tag] || {}}
          onChange={(value) => {
            dispatch(
              configSlice.actions.setNightCutinOverrides({
                id: def.tag,
                overrides: value,
              })
            );
          }}
        />
      ))}
    </Stack>
  );
};

export default NightCutinEditor;
