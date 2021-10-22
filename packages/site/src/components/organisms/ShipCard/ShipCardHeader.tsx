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
} from "../../molecules";
import LevelButton from "./LevelButton";

type Props = {
  ship: Ship;
  disableHeaderAction?: boolean;
  onUpdate?: (changes: Partial<ShipEntity>) => void;
  onEditClick?: () => void;
  onDetailClick?: () => void;
  onReselect?: () => void;
  onRemove?: () => void;
};

const ShipHeader: React.FCX<Props> = ({
  className,
  ship,
  disableHeaderAction,
  onUpdate,
  onEditClick,
  onDetailClick,
  onReselect,
  onRemove,
}) => {
  const { t } = useTranslation(["ships", "common"]);

  return (
    <div className={className}>
      <LevelButton
        value={ship.level}
        onChange={(level) => onUpdate?.({ level })}
      />

      <Typography css={{ marginRight: "auto" }} noWrap variant="body2">
        {t(`ships:${ship.ship_id}`, ship.name)}
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
