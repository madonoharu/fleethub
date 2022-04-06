import { AirState } from "fleethub-core";
import { useTranslation } from "next-i18next";
import React from "react";

import { Select, SelectInputProps } from "../../molecules";

const AIR_STATES: AirState[] = [
  "AirSupremacy",
  "AirSuperiority",
  "AirParity",
  "AirDenial",
  "AirIncapability",
];
type Props = SelectInputProps & {
  value: AirState;
  onChange?: (airState: AirState) => void;
};

const AirStateSelect: React.FC<Props> = ({ value, onChange, ...rest }) => {
  const { t } = useTranslation("common", { keyPrefix: "AirState" });

  return (
    <Select
      options={AIR_STATES}
      value={value}
      onChange={onChange}
      getOptionLabel={t}
      {...rest}
    />
  );
};

export default AirStateSelect;
