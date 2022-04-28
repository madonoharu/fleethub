import styled from "@emotion/styled";
import AnalyticsIcon from "@mui/icons-material/Analytics";
import { Stack, Typography } from "@mui/material";
import { Ship } from "fleethub-core";
import React from "react";
import { useTranslation } from "react-i18next";

import { ShipEntity } from "../../../store";
import { numstr } from "../../../utils";
import { LabeledValue } from "../../atoms";
import {
  EditButton,
  ClearButton,
  InfoButton,
  UpdateButton,
  BusinessCenterButton,
  withIconButton,
} from "../../molecules";

import LevelButton from "./LevelButton";

const AnalyticsButton = withIconButton(AnalyticsIcon);

type ShipHeaderProps = {
  ship: Ship;
  readonly?: boolean;
  disableDetails?: boolean;
  onUpdate?: (changes: Partial<ShipEntity>) => void;
  onEditClick?: () => void;
  onDetailClick?: () => void;
  onReselect?: () => void;
  onPreset?: () => void;
  onRemove?: () => void;
};

const ShipHeader: React.FCX<ShipHeaderProps> = ({
  className,
  ship,
  readonly,
  disableDetails,
  onUpdate,
  onEditClick,
  onDetailClick,
  onReselect,
  onPreset,
  onRemove,
}) => {
  const { t, i18n } = useTranslation(["ships", "common"]);
  const { ship_id, name } = ship;

  if (readonly) {
    disableDetails = true;
  }

  let displayName: string;
  if (i18n.resolvedLanguage === "ja") {
    displayName = name;
  } else {
    displayName = t(`ships:${ship_id}`, name);
  }

  return (
    <div className={className}>
      <LevelButton
        value={ship.level}
        onChange={(level) => onUpdate?.({ level })}
      />

      <Typography marginRight="auto" noWrap variant="body2">
        {displayName}
      </Typography>

      <AnalyticsButton
        title={
          <Stack>
            <LabeledValue
              label="昼戦フィット補正"
              value={numstr(ship.fit_gun_bonus(false))}
            />
            <LabeledValue
              label="夜戦フィット補正"
              value={numstr(ship.fit_gun_bonus(true))}
            />
            <LabeledValue
              label="基礎命中項"
              value={numstr(ship.basic_accuracy_term(), 2)}
            />
            <LabeledValue
              label="単縦回避項"
              value={numstr(ship.evasion_term(1, 0, 1))}
            />
            <LabeledValue
              label="艦隊索敵因子"
              value={numstr(ship.fleet_los_factor())}
            />
            <LabeledValue
              label={t("common:torpedo_accuracy")}
              value={numstr(ship.torpedo_accuracy_mod)}
            />
          </Stack>
        }
        size="tiny"
      />
      {!readonly && (
        <EditButton
          title={t("common:EditMiscStats")}
          size="tiny"
          onClick={onEditClick}
        />
      )}
      {!disableDetails && (
        <InfoButton
          title={t("common:Details")}
          size="tiny"
          onClick={onDetailClick}
        />
      )}
      {!disableDetails && (
        <UpdateButton
          title={t("common:Change")}
          size="tiny"
          onClick={onReselect}
        />
      )}
      {!readonly && (
        <BusinessCenterButton
          title={t("common:Presets")}
          size="tiny"
          onClick={onPreset}
        />
      )}
      {!disableDetails && (
        <ClearButton
          title={t("common:Remove")}
          size="tiny"
          onClick={onRemove}
        />
      )}
    </div>
  );
};

export default styled(ShipHeader)`
  display: flex;
  align-items: center;
`;
