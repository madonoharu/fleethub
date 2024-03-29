import styled from "@emotion/styled";
import AnalyticsIcon from "@mui/icons-material/Analytics";
import { Stack, Typography } from "@mui/material";
import { Ship } from "fleethub-core";
import React from "react";
import { useTranslation } from "react-i18next";

import { useShipName } from "../../../hooks";
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
  visibleDetails?: boolean;
  visibleUpdate?: boolean;
  visibleRemove?: boolean;
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
  visibleDetails = true,
  visibleUpdate = true,
  visibleRemove = true,
  onUpdate,
  onEditClick,
  onDetailClick,
  onReselect,
  onPreset,
  onRemove,
}) => {
  const { t } = useTranslation("common");

  const displayName = useShipName(ship.ship_id, ship.is_abyssal());

  return (
    <div className={className}>
      <LevelButton
        value={ship.level}
        onChange={(level) => onUpdate?.({ level })}
      />

      <Typography marginLeft="4px" marginRight="auto" noWrap variant="body2">
        {displayName}
      </Typography>

      <AnalyticsButton
        title={
          <Stack>
            <LabeledValue
              label={t("day_gunfit_accuracy")}
              value={numstr(ship.gunfit_accuracy(false))}
            />
            <LabeledValue
              label={t("night_gunfit_accuracy")}
              value={numstr(ship.gunfit_accuracy(true))}
            />
            <LabeledValue
              label={t("basic_accuracy_term")}
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
              label={t("torpedo_accuracy")}
              value={numstr(ship.innate_torpedo_accuracy)}
            />
          </Stack>
        }
        size="tiny"
      />
      {!readonly && (
        <EditButton
          size="tiny"
          title={t("EditMiscStats")}
          onClick={onEditClick}
        />
      )}
      {!readonly && visibleDetails && (
        <InfoButton size="tiny" title={t("Details")} onClick={onDetailClick} />
      )}
      {!readonly && visibleUpdate && (
        <UpdateButton size="tiny" title={t("Change")} onClick={onReselect} />
      )}
      {!readonly && (
        <BusinessCenterButton
          size="tiny"
          title={t("Presets")}
          onClick={onPreset}
        />
      )}
      {!readonly && visibleRemove && (
        <ClearButton size="tiny" title={t("Remove")} onClick={onRemove} />
      )}
    </div>
  );
};

export default styled(ShipHeader)`
  display: flex;
  align-items: center;
`;
