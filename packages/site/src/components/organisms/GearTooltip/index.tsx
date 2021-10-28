/** @jsxImportSource @emotion/react */
import { Tooltip, TooltipProps, Typography } from "@mui/material";
import { EquipmentBonuses } from "equipment-bonus";
import { Gear } from "fleethub-core";
import { useTranslation } from "next-i18next";
import React from "react";

import GearNameplate from "../GearNameplate";
import GearStatList from "./GearStatList";

type ContentProps = {
  gear: Gear;
  ebonuses?: EquipmentBonuses | undefined;
};

const Content: React.FC<ContentProps> = ({ gear, ebonuses }) => {
  const { t } = useTranslation("gear_types");
  return (
    <div>
      <Typography variant="caption">
        ID {gear.gear_id} {t(gear.gear_type_id)}
      </Typography>
      <GearNameplate wrap iconId={gear.icon_id} name={gear.name} />
      <GearStatList gear={gear} ebonuses={ebonuses} />
    </div>
  );
};

type Props = ContentProps & Omit<TooltipProps, "title">;

const GearTooltip: React.FC<Props> = ({ gear, ebonuses, ...rest }) => (
  <Tooltip title={<Content gear={gear} ebonuses={ebonuses} />} {...rest} />
);

export default GearTooltip;
