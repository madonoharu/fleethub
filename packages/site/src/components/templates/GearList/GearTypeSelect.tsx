import { useTranslation } from "next-i18next/pages";
import React from "react";

import { cn } from "../../../styles/cn";
import { Select } from "../../molecules";
import { GearNameplate } from "../../organisms";

type Props = {
  value: number;
  options: number[];
  onChange: (value: number) => void;
};

const GearTypeSelect: React.FCX<Props> = ({ className, ...props }) => {
  const { t } = useTranslation("gear_types");

  const getTypeLabel = (typeId: number) => {
    if (!typeId) return "カテゴリー";
    const name = t(typeId);

    return <GearNameplate iconId={1} name={name} />;
  };

  return (
    <Select className={cn("h-9 w-[140px]", className)} getOptionLabel={getTypeLabel} {...props} />
  );
};

export default GearTypeSelect;
