/** @jsxImportSource @emotion/react */
import styled from "@emotion/styled";
import { useTranslation } from "next-i18next";
import React from "react";

import { Select } from "../../molecules";
import { GearNameplate } from "../../organisms";

type Props = {
  value: number;
  options: number[];
  onChange: (value: number) => void;
};

const GearTypeSelect: React.FCX<Props> = (props) => {
  const { t } = useTranslation("gear_types");

  const getTypeLabel = (typeId: number) => {
    if (!typeId) return "カテゴリー";
    const name = t(typeId);

    return <GearNameplate iconId={1} name={name} />;
  };

  return <Select getOptionLabel={getTypeLabel} {...props} />;
};

export default styled(GearTypeSelect)`
  width: 140px;
  height: 36px;
`;
