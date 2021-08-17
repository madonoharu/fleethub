import styled from "@emotion/styled";
import { Ship } from "@fleethub/core";
import { Typography } from "@material-ui/core";
import React from "react";
import { useTranslation } from "react-i18next";
import { useModal } from "../../../hooks";

import { ShipEntity } from "../../../store";
import {
  ClearButton,
  InfoButton,
  StarButton,
  UpdateButton,
} from "../../molecules";
import ShipDetailScreen from "../ShipDetailScreen";
import LevelButton from "./LevelButton";

type Props = {
  ship: Ship;
  onUpdate?: (changes: Partial<ShipEntity>) => void;
  onDetailClick?: () => void;
  onReselect?: () => void;
  onRemove?: () => void;
};

const ShipHeader: React.FCX<Props> = ({
  className,
  ship,
  onUpdate,
  onDetailClick,
  onReselect,
  onRemove,
}) => {
  const DetailModal = useModal();
  const { t } = useTranslation("ships");

  return (
    <div className={className}>
      <LevelButton
        value={ship.level}
        onChange={(level) => onUpdate?.({ level })}
      />

      <Typography css={{ marginRight: "auto" }} noWrap variant="body2">
        {t(`${ship.ship_id}`, ship.name)}
      </Typography>

      <InfoButton title="詳細" size="tiny" onClick={DetailModal.show} />
      <StarButton title="艦娘プリセットに追加" size="tiny" />
      <UpdateButton title="艦娘を変更" size="tiny" onClick={onReselect} />
      <ClearButton title="削除" size="tiny" onClick={onRemove} />

      <DetailModal>
        <ShipDetailScreen ship={ship} />
      </DetailModal>
    </div>
  );
};

export default styled(ShipHeader)`
  display: flex;
  align-items: center;
  height: 24px;
`;
