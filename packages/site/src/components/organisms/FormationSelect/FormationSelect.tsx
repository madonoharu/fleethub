import { CombinedFormation, Formation, SingleFormation } from "fleethub-core";
import React from "react";
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

const COMBINED_FORMATIONS: CombinedFormation[] = [
  "Cruising1",
  "Cruising2",
  "Cruising3",
  "Cruising4",
];

const FORMATIONS = Array<Formation>().concat(
  SINGLE_FORMATIONS,
  COMBINED_FORMATIONS
);

const isSingleFormation = (f: Formation) =>
  (SINGLE_FORMATIONS as Formation[]).includes(f);
const isCombinedFormation = (f: Formation) =>
  (COMBINED_FORMATIONS as Formation[]).includes(f);

type Props = SelectInputProps & {
  value: Formation;
  onChange?: (formation: Formation) => void;
  combined?: boolean;
};

const FormationSelect: React.FC<Props> = ({
  value,
  onChange,
  combined,
  ...rest
}) => {
  const { t } = useTranslation("common", { keyPrefix: "Formation" });

  const itemFilter = combined ? isCombinedFormation : isSingleFormation;

  return (
    <Select
      options={FORMATIONS}
      value={value}
      onChange={onChange}
      getOptionLabel={t}
      itemFilter={itemFilter}
      {...rest}
    />
  );
};

export default FormationSelect;
