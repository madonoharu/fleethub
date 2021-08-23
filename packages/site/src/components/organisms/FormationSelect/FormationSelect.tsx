import styled from "@emotion/styled";
import { CombinedFormation, Formation, SingleFormation } from "@fleethub/core";
import React, { useEffect } from "react";
import { useTranslation } from "react-i18next";

import { Select, SelectInputProps } from "../../molecules";

const SINGLE_FORMATIONS: SingleFormation[] = [
  "LineAhead",
  "DoubleLine",
  "Diamond",
  "Echelon",
  "LineAbreast",
  "Vanguard",
];

const COMBINED_FLEET_FORMATIONS: CombinedFormation[] = [
  "Cruising1",
  "Cruising2",
  "Cruising3",
  "Cruising4",
];

type Props = SelectInputProps & {
  value: Formation;
  onChange: (formation: Formation) => void;
  combined?: boolean;
};

const FormationSelect: React.FC<Props> = ({
  value,
  onChange,
  combined,
  ...rest
}) => {
  const options: readonly Formation[] = combined
    ? SINGLE_FORMATIONS
    : COMBINED_FLEET_FORMATIONS;
  const { t } = useTranslation("common");

  useEffect(() => {
    if (options.includes(value)) return;
    onChange(combined ? "Cruising4" : "LineAhead");
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [combined]);

  if (!options.includes(value)) {
    value = combined ? "Cruising4" : "LineAhead";
  }

  return (
    <Select
      options={options}
      value={value}
      onChange={onChange}
      getOptionLabel={t}
      {...rest}
    />
  );
};

export default FormationSelect;
