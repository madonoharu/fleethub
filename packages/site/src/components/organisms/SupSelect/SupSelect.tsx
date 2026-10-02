import { FleetKey, FLEET_KEYS, uppercase } from "@fh/utils";
import { useTranslation } from "next-i18next/pages";
import React from "react";

import { cn } from "../../../styles/cn";
import { Select } from "../../molecules";

const OPTIONS = [undefined, ...FLEET_KEYS];

interface Props {
  label?: React.ReactNode;
  value: FleetKey | undefined;
  onChange: (value: FleetKey | undefined) => void;
}

const SupSelect: React.FCX<Props> = ({ className, label, value, onChange }) => {
  const { t } = useTranslation("common");

  const getOptionLabel = (key: FleetKey | undefined) => {
    return key ? uppercase(key) : t("None");
  };

  return (
    <Select
      className={cn("w-[96px]", className)}
      label={label}
      options={OPTIONS}
      value={value}
      onChange={onChange}
      getOptionLabel={getOptionLabel}
    />
  );
};

export default SupSelect;
