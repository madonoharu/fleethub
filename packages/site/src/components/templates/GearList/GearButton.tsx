/** @jsxImportSource @emotion/react */
import { css } from "@emotion/react";
import styled from "@emotion/styled";
import { Button } from "@mui/material";
import { EquipmentBonuses } from "equipment-bonus";
import { Gear } from "fleethub-core";
import React from "react";

import { GearNameplate, GearTooltip } from "../../organisms";

type Props = {
  gear: Gear;
  onClick?: () => void;
  ebonuses?: EquipmentBonuses;
};

const GearButton: React.FCX<Props> = ({
  className,
  gear,
  onClick,
  ebonuses,
}) => {
  return (
    <GearTooltip
      gear={gear}
      ebonuses={ebonuses}
      enterDelay={300}
      enterNextDelay={300}
    >
      <Button className={className} onClick={onClick}>
        <GearNameplate name={gear.name} iconId={gear.icon_id} />
      </Button>
    </GearTooltip>
  );
};

const hasBonus = (bonuses?: EquipmentBonuses) =>
  bonuses && Object.values(bonuses).some((value) => value !== 0);

export default styled(GearButton)(
  ({ theme, ebonuses }) => css`
    justify-content: flex-start;
    height: 36px;
    ${hasBonus(ebonuses) &&
    css`
      box-sizing: border-box;
      border: 1px solid ${theme.colors.bonus};
    `}
  `
);
