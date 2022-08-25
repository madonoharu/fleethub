import type { Role } from "fleethub-core";
import React from "react";
import { useTranslation } from "react-i18next";

import { Select } from "../../molecules";

interface Props {
  color: "primary" | "secondary";
  value: Role;
  onChange: (value: Role) => void;
}

const ROLE_OPTIONS = ["Main", "Escort"] as const;

const RoleSelect: React.FC<Props> = (props) => {
  const { t } = useTranslation("common", { keyPrefix: "FleetType" });
  return <Select<Role> options={ROLE_OPTIONS} getOptionLabel={t} {...props} />;
};

export default RoleSelect;
