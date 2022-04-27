import { Typography } from "@mui/material";
import { MasterShip } from "fleethub-core";
import { produce } from "immer";
import { useTranslation } from "next-i18next";
import React from "react";
import { Updater } from "use-immer";

import { useAppDispatch, useAppSelector, useMasterData } from "../../../hooks";
import {
  configSlice,
  MasterShipOverrides,
  STAT_INTERVAL_KEYS,
} from "../../../store";
import { Flexbox } from "../../atoms";
import { NumberInput, RestartAltButton, StatIcon } from "../../molecules";
import { ShipNameplate } from "../../organisms";

import SlotSizeVecForm from "./SlotSizeVecForm";
import StatIntervalForm from "./StatIntervalForm";

interface RangeFormProps {
  ship: MasterShip;
  config: MasterShipOverrides;
  updater: Updater<MasterShipOverrides>;
}

const RangeForm: React.FC<RangeFormProps> = ({ ship, config, updater }) => {
  const { t } = useTranslation("common");
  const statKey = "range";
  const handleChange = (v: number) => {
    updater((draft) => {
      draft[statKey] = v;
    });
  };

  const handleReset = () => {
    updater((draft) => {
      delete draft[statKey];
    });
  };

  return (
    <>
      <Flexbox gap={1}>
        <StatIcon icon={statKey} />
        <Typography variant="subtitle2">{t(statKey)}</Typography>
      </Flexbox>
      <Flexbox gap={1}>
        <NumberInput
          sx={{ width: 88 }}
          value={config[statKey] ?? ship[statKey] ?? null}
          onChange={handleChange}
        />
        <RestartAltButton onClick={handleReset} />
      </Flexbox>
    </>
  );
};

interface MasterShipEditorProps {
  shipId: number;
}

const initialConfig: MasterShipOverrides = {};

const MasterShipEditor: React.FCX<MasterShipEditorProps> = ({
  className,
  shipId,
}) => {
  const { data } = useMasterData();

  const dispatch = useAppDispatch();
  const config = useAppSelector((root) => {
    return root.present.config.overrides?.ships?.[shipId] || initialConfig;
  });

  const ship = data?.ships.find((ship) => ship.ship_id === shipId);

  if (!ship) {
    return null;
  }

  const updater: Updater<MasterShipOverrides> = (arg) => {
    if (typeof arg === "function") {
      const next = produce(config, arg);

      dispatch(
        configSlice.actions.setMasterShipOverrides({ shipId, overrides: next })
      );
    } else {
      dispatch(
        configSlice.actions.setMasterShipOverrides({ shipId, overrides: arg })
      );
    }
  };

  return (
    <div className={className} css={{ padding: 8 }}>
      <ShipNameplate shipId={ship.ship_id} />

      {STAT_INTERVAL_KEYS.map((key) => (
        <StatIntervalForm
          key={key}
          statKey={key}
          ship={ship}
          config={config}
          updater={updater}
        />
      ))}
      <RangeForm ship={ship} config={config} updater={updater} />
      <SlotSizeVecForm ship={ship} config={config} updater={updater} />
    </div>
  );
};

export default MasterShipEditor;
