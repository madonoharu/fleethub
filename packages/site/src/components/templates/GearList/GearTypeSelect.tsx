import styled from "@emotion/styled";
import React from "react";

import { useFhCore } from "../../../hooks";
import { Select } from "../../molecules";
import { GearNameplate } from "../../organisms";

type Props = {
  value: number;
  options: number[];
  onChange: (value: number) => void;
};

const GearTypeSelect: React.FCX<Props> = (props) => {
  const { core } = useFhCore();

  const getTypeLabel = (typeId: number) => {
    if (!typeId) return "カテゴリー";
    const name = core.find_gear_gear_type_name(typeId);

    return <GearNameplate size="small" iconId={1} name={name} />;
  };

  return <Select getOptionLabel={getTypeLabel} {...props} />;
};

export default styled(GearTypeSelect)`
  width: 140px;
  height: 36px;
`;
