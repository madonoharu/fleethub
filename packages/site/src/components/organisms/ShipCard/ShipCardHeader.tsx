/** @jsxImportSource @emotion/react */
import styled from "@emotion/styled";
import BusinessCenterIcon from "@mui/icons-material/BusinessCenter";
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
  withIconButton,
} from "../../molecules";
import LevelButton from "./LevelButton";

const BusinessCenterButton = withIconButton(BusinessCenterIcon);

type ShipHeaderProps = {
  ship: Ship;
  disableHeaderAction?: boolean;
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
  disableHeaderAction,
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

      {!disableHeaderAction && (
        <>
          <EditButton
            title={t("common:EditMiscStats")}
            size="tiny"
            onClick={onEditClick}
          />
          <InfoButton
            title={t("common:Details")}
            size="tiny"
            onClick={onDetailClick}
          />
          <UpdateButton
            title={t("common:Change")}
            size="tiny"
            onClick={onReselect}
          />
          <BusinessCenterButton
            title={t("common:Preset")}
            size="tiny"
            onClick={onPreset}
          />
          <ClearButton
            title={t("common:Remove")}
            size="tiny"
            onClick={onRemove}
          />
        </>
      )}
    </div>
  );
};

export default styled(ShipHeader)`
  display: flex;
  align-items: center;
`;
