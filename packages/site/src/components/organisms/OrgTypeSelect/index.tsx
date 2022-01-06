/** @jsxImportSource @emotion/react */
import { OrgType } from "fleethub-core";
import { useTranslation } from "next-i18next";
import React from "react";

import { Select, SelectInputProps } from "../../molecules";

const ORG_TYPES: OrgType[] = [
  "Single",
  "CarrierTaskForce",
  "SurfaceTaskForce",
  "TransportEscort",
  "EnemySingle",
  "EnemyCombined",
];

type OrgTypeSelectProps = {
  color?: SelectInputProps["color"];
  value: OrgType;
  onChange?: (value: OrgType) => void;
};

const OrgTypeSelect: React.FCX<OrgTypeSelectProps> = (props) => {
  const { t } = useTranslation("common");
  return <Select {...props} options={ORG_TYPES} getOptionLabel={t} />;
};

export default OrgTypeSelect;
