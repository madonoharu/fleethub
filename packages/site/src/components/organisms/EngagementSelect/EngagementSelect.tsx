import { Engagement } from "@fh/core";
import React from "react";
import { useTranslation } from "react-i18next";

import { Select, SelectInputProps } from "../../molecules";

const ENGAGEMENTS: Engagement[] = ["Parallel", "HeadOn", "GreenT", "RedT"];

type Props = SelectInputProps & {
  value: Engagement;
  onChange?: (engagement: Engagement) => void;
};

const FormationSelect: React.FC<Props> = ({ value, onChange, ...rest }) => {
  const { t } = useTranslation("common");

  return (
    <Select
      options={ENGAGEMENTS}
      value={value}
      onChange={onChange}
      getOptionLabel={t}
      {...rest}
    />
  );
};

export default FormationSelect;
