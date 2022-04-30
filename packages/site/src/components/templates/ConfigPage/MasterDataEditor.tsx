import { Button, Typography } from "@mui/material";
import { GearState, MasterData } from "fleethub-core";
import { produce, current } from "immer";
import merge from "lodash/merge";
import mergeWith from "lodash/mergeWith";
import { useTranslation } from "next-i18next";
import React, { useMemo } from "react";

import { useAppSelector, useMasterData, useModal } from "../../../hooks";
import { MasterDataOverrides } from "../../../store";

import NightCutinEditor from "./NightCutinEditor";

function customizer(v0: unknown, v1: unknown): unknown {
  return v1 === null ? v0 : undefined;
}

function mergeMasterData(source: MasterData, overrides: MasterDataOverrides) {
  const next = produce(source, (draft) => {
    draft.ships.forEach((ship) => {
      const shipOverrides = overrides.ships?.[ship.ship_id];

      if (shipOverrides) {
        mergeWith(ship, shipOverrides, customizer);
      }
    });

    draft.night_cutin.forEach((ci) => {
      const ciOverrides = overrides.night_cutin?.[ci.tag];

      if (ciOverrides) {
        mergeWith(ci, ciOverrides, customizer);
      }
    });
  });

  return next;
}

const MasterDataEditor: React.FC = () => {
  const { t } = useTranslation("common");
  const NightCutinModal = useModal();

  return (
    <div>
      <Button
        variant="contained"
        color="primary"
        onClick={NightCutinModal.show}
      >
        {t("NightCutin.name")}
      </Button>

      <NightCutinModal full>
        <NightCutinEditor />
      </NightCutinModal>
    </div>
  );
};

export default MasterDataEditor;
