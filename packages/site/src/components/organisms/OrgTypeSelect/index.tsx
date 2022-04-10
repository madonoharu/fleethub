import { OrgType, Side } from "fleethub-core";
import { useTranslation } from "next-i18next";
import React from "react";

import { Select, SelectInputProps } from "../../molecules";

const PLAYER_OPTIONS: OrgType[] = [
  "Single",
  "CarrierTaskForce",
  "SurfaceTaskForce",
  "TransportEscort",
];

const ENEMY_OPTIONS: OrgType[] = ["EnemySingle", "EnemyCombined"];

const OPTIONS: OrgType[] = [...PLAYER_OPTIONS, ...ENEMY_OPTIONS];

type OrgTypeSelectProps = {
  color?: SelectInputProps["color"];
  side?: Side;
  value: OrgType;
  onChange?: (value: OrgType) => void;
};

const OrgTypeSelect: React.FCX<OrgTypeSelectProps> = ({ side, ...rest }) => {
  const { t } = useTranslation("common", { keyPrefix: "OrgType" });

  const itemFilter = (item: OrgType) => {
    if (side === "Player") {
      return PLAYER_OPTIONS.includes(item);
    } else if (side === "Enemy") {
      const isEnemy = item.startsWith("Enemy");
      return isEnemy;
    } else {
      return true;
    }
  };

  return (
    <Select
      {...rest}
      options={OPTIONS}
      getOptionLabel={t}
      itemFilter={itemFilter}
    />
  );
};

export default OrgTypeSelect;
