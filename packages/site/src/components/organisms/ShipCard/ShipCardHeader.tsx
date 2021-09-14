import styled from "@emotion/styled";
import { Ship } from "@fh/core";
import { Typography } from "@mui/material";
import React from "react";
import { useTranslation } from "react-i18next";
import { useModal } from "../../../hooks";

import { ShipEntity } from "../../../store";
import {
  EditButton,
  ClearButton,
  InfoButton,
  StarButton,
  UpdateButton,
} from "../../molecules";
import ShipDetails from "../ShipDetails";
import LevelButton from "./LevelButton";

type Props = {
  ship: Ship;
  onUpdate?: (changes: Partial<ShipEntity>) => void;
  onEditClick?: () => void;
  onDetailClick?: () => void;
  onReselect?: () => void;
  onRemove?: () => void;
};

const ShipHeader: React.FCX<Props> = ({
  className,
  ship,
  onUpdate,
  onEditClick,
  onDetailClick,
  onReselect,
  onRemove,
}) => {
  const DetailModal = useModal();

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

      <EditButton
        title={t("common:EditMiscStats")}
        size="tiny"
        onClick={onEditClick}
      />
      <InfoButton
        title={t("common:Details")}
        size="tiny"
        onClick={DetailModal.show}
      />
      <UpdateButton
        title={t("common:Change")}
        size="tiny"
        onClick={onReselect}
      />
      <ClearButton title={t("common:Remove")} size="tiny" onClick={onRemove} />

      <DetailModal full>
        <ShipDetails ship={ship} />
      </DetailModal>
    </div>
  );
};

export default styled(ShipHeader)`
  display: flex;
  align-items: center;
`;
