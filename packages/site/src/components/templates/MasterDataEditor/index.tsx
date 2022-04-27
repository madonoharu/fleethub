import { Typography } from "@mui/material";
import { GearState, MasterData } from "fleethub-core";
import { produce, current } from "immer";
import merge from "lodash/merge";
import mergeWith from "lodash/mergeWith";
import set from "lodash/set";
import React, { useMemo, useState } from "react";

import { useAppSelector, useMasterData } from "../../../hooks";
import { MasterDataOverrides } from "../../../store";

import NightCutinEditor from "./NightCutinEditor";

function mergeMasterData(source: MasterData, overrides: MasterDataOverrides) {
  const next = produce(source, (draft) => {
    draft.ships.forEach((ship) => {
      const shipOverrides = overrides.ships?.[ship.ship_id];

      if (shipOverrides) {
        mergeWith(ship, shipOverrides, (v0: unknown, v1: unknown) =>
          v1 === null ? v0 : undefined
        );
      }
    });
  });

  return next;
}

const MasterDataEditor: React.FC = () => {
  const { overrides } = useAppSelector((root) => root.present.config);
  const { data } = useMasterData();

  const merged = useMemo(() => {
    if (overrides && data) {
      return mergeMasterData(data, overrides);
    }
    return data;
  }, [data, overrides]);

  if (!data) {
    return null;
  }

  return (
    <div>
      {data.config.night_cutin.map((def) => (
        <NightCutinEditor key={def.tag} def={def} />
      ))}
    </div>
  );
};

export default MasterDataEditor;
