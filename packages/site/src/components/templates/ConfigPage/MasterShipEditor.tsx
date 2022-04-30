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
import { StatIcon } from "../../molecules";
import { ShipNameplate } from "../../organisms";
import ResettableInput from "../../organisms/ResettableInput";

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
  const handleChange = (v: number | null) => {
    updater((draft) => {
      if (v === null) {
        delete draft[statKey];
      } else {
        draft[statKey] = v;
      }
    });
  };

  return (
    <>
      <Flexbox gap={1}>
        <StatIcon icon={statKey} />
        <Typography variant="subtitle2">{t(statKey)}</Typography>
      </Flexbox>
      <ResettableInput
        defaultValue={ship[statKey] ?? null}
        value={config[statKey] ?? null}
        onChange={handleChange}
      />
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
        configSlice.actions.setMasterShipOverrides({
          id: shipId,
          overrides: next,
        })
      );
    } else {
      dispatch(
        configSlice.actions.setMasterShipOverrides({
          id: shipId,
          overrides: arg,
        })
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
