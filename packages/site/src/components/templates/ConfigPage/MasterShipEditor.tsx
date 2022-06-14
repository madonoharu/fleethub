import { Stack, Typography } from "@mui/material";
import { MasterShip, SlotSizeVec, StatInterval } from "fleethub-core";
import { useTranslation } from "next-i18next";
import React from "react";

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

interface StatFormProps {
  statKey: "range" | "torpedo_accuracy" | "basic_evasion_term";
  ship: MasterShip;
  config: MasterShipOverrides;
  onChange: (value: number | null) => void;
}

const StatForm: React.FC<StatFormProps> = ({
  statKey,
  ship,
  config,
  onChange,
}) => {
  const { t } = useTranslation("common");

  return (
    <div>
      <Flexbox gap={1}>
        {statKey === "range" && <StatIcon icon={statKey} />}
        <Typography variant="subtitle2">{t(statKey)}</Typography>
      </Flexbox>
      <ResettableInput
        defaultValue={ship[statKey]}
        value={config[statKey]}
        min={0}
        max={10000}
        onChange={onChange}
      />
    </div>
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
    return root.present.config.masterData?.ships?.[shipId] || initialConfig;
  });

  const ship = data?.ships.find((ship) => ship.ship_id === shipId);

  if (!ship) {
    return null;
  }

  const handleChange =
    (key: StatFormProps["statKey"]) => (value: number | null) => {
      dispatch(
        configSlice.actions.updateMasterShip({
          id: shipId,
          changes: {
            [key]: value,
          },
        })
      );
    };

  const handleStatIntervalChange =
    (key: typeof STAT_INTERVAL_KEYS[number]) => (stat: StatInterval) => {
      dispatch(
        configSlice.actions.updateMasterShip({
          id: shipId,
          changes: {
            [key]: stat,
          },
        })
      );
    };

  const handleSlotSizeChange = (slots: SlotSizeVec) => {
    dispatch(
      configSlice.actions.updateMasterShip({
        id: shipId,
        changes: { slots },
      })
    );
  };

  return (
    <Stack className={className} gap={1}>
      <ShipNameplate shipId={ship.ship_id} />

      {STAT_INTERVAL_KEYS.map((key) => (
        <StatIntervalForm
          key={key}
          statKey={key}
          ship={ship}
          config={config}
          onChange={handleStatIntervalChange(key)}
        />
      ))}
      <StatForm
        statKey="range"
        ship={ship}
        config={config}
        onChange={handleChange("range")}
      />
      <StatForm
        statKey="torpedo_accuracy"
        ship={ship}
        config={config}
        onChange={handleChange("torpedo_accuracy")}
      />
      <StatForm
        statKey="basic_evasion_term"
        ship={ship}
        config={config}
        onChange={handleChange("basic_evasion_term")}
      />
      <SlotSizeVecForm
        ship={ship}
        config={config}
        onChange={handleSlotSizeChange}
      />
    </Stack>
  );
};

export default MasterShipEditor;
