import { Engagement } from "fleethub-core";
import React from "react";
import { useTranslation } from "react-i18next";

import { Select, SelectInputProps } from "../../molecules";

const ENGAGEMENTS: Engagement[] = ["Parallel", "HeadOn", "GreenT", "RedT"];

type Props = SelectInputProps & {
  value: Engagement;
  onChange?: (engagement: Engagement) => void;
};

const EngagementSelect: React.FC<Props> = ({ value, onChange, ...rest }) => {
  const { t } = useTranslation("common", { keyPrefix: "Engagement" });

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

export default EngagementSelect;
