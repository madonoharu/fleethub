import { Button } from "@mui/material";
import type { Gear, EBonuses } from "fleethub-core";
import React from "react";

import { cn } from "../../../styles/cn";
import { GearNameplate, GearTooltip } from "../../organisms";

type Props = {
  gear: Gear;
  onClick?: () => void;
  ebonuses?: EBonuses;
};

const GearButton: React.FCX<Props> = ({ className, gear, onClick, ebonuses }) => {
  return (
    <GearTooltip gear={gear} ebonuses={ebonuses} enterDelay={300} enterNextDelay={300}>
      <Button
        className={cn(
          "h-9 justify-start",
          hasBonus(ebonuses) && "box-border border border-solid border-bonus",
          className,
        )}
        onClick={onClick}
      >
        <GearNameplate name={gear.name} iconId={gear.icon_id} />
      </Button>
    </GearTooltip>
  );
};

function hasBonus(bonuses?: EBonuses): boolean {
  return Boolean(bonuses && Object.values(bonuses).some((value) => value !== 0));
}

export default GearButton;
