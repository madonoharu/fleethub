import styled from "@emotion/styled";
import { Ship } from "@fleethub/core";
import { Button, Tooltip, Typography } from "@material-ui/core";
import React from "react";
import { useTranslation } from "react-i18next";

import { ShipEntity } from "../../../store";
import {
  ClearButton,
  EditButton,
  InfoButton,
  StarButton,
  UpdateButton,
} from "../../molecules";

const StyledButton = styled(Button)`
  height: 100%;
  justify-content: flex-start;
  width: 56px;
`;

type Props = {
  ship: Ship;
  onUpdate?: (changes: Partial<ShipEntity>) => void;
  onDetailClick?: () => void;
  onRemove?: () => void;
};

const ShipHeader: React.FCX<Props> = ({
  className,
  ship,
  onUpdate,
  onDetailClick,
  onRemove,
}) => {
  const { t } = useTranslation("ships");

  return (
    <div className={className}>
      <Tooltip title="ステータスを編集">
        <StyledButton>Lv{ship.level}</StyledButton>
      </Tooltip>

      <Typography css={{ marginRight: "auto" }} noWrap variant="body2">
        {t(ship.name)}
      </Typography>

      <EditButton title="ステータスを編集" size="tiny" />
      <InfoButton size="tiny" onClick={onDetailClick} />
      <StarButton title="艦娘プリセットに追加" size="tiny" />
      <UpdateButton title="艦娘を変更" size="tiny" />
      <ClearButton title="削除" size="tiny" onClick={onRemove} />
    </div>
  );
};

export default styled(ShipHeader)`
  display: flex;
  align-items: center;
  height: 24px;
`;
