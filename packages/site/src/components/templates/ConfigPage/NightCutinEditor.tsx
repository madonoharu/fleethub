import { Divider, Stack, Typography } from "@mui/material";
import { Draft } from "immer";
import React, { useEffect, useMemo, useState } from "react";

import { useAppDispatch, useAppSelector, useMasterData } from "../../../hooks";
import {
  configSlice,
  MasterDataOverrides,
  NightCutinOverrides,
} from "../../../store";

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
        />
      ))}
    </Stack>
  );
};

export default NightCutinEditor;
