/** @jsxImportSource @emotion/react */
import styled from "@emotion/styled";
import { Typography } from "@mui/material";
import { Ship } from "fleethub-core";
import React from "react";
import { useTranslation } from "react-i18next";

import { ShipEntity } from "../../../store";
import {
  EditButton,
  ClearButton,
  InfoButton,
  UpdateButton,
  BusinessCenterButton,
} from "../../molecules";
import LevelButton from "./LevelButton";

type ShipHeaderProps = {
  ship: Ship;
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
  disableDetails,
  onUpdate,
  onEditClick,
  onDetailClick,
  onReselect,
  onPreset,
  onRemove,
}) => {
  const { t } = useTranslation(["ships", "common"]);
  const { ship_id, name } = ship;

  return (
    <div className={className}>
      <LevelButton
        value={ship.level}
        onChange={(level) => onUpdate?.({ level })}
      />

      <Typography css={{ marginRight: "auto" }} noWrap variant="body2">
        {t(`ships:${ship_id}`, name)}
      </Typography>

      <EditButton
        title={t("common:EditMiscStats")}
        size="tiny"
        onClick={onEditClick}
      />
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
      <BusinessCenterButton
        title={t("common:Presets")}
        size="tiny"
        onClick={onPreset}
      />
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
