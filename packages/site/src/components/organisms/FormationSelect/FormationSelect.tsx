import styled from "@emotion/styled";
import {
  CombinedFleetFormations,
  Formation,
  SingleFleetFormations,
} from "@fleethub/core";
import React, { useEffect } from "react";
import { useTranslation } from "react-i18next";

import { Select, SelectInputProps } from "../../molecules";

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
    ? CombinedFleetFormations
    : SingleFleetFormations;
  const { t } = useTranslation("terms");

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
