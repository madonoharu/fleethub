import { css } from "@emotion/react";
import styled from "@emotion/styled";
import { Org, OrgType } from "@fleethub/core";
import { Typography } from "@mui/material";
import { useTranslation } from "next-i18next";
import React from "react";

import { Flexbox, PlanIcon } from "../../atoms";
import { NumberInput, Select, StatIcon, TextField } from "../../molecules";
import { ElosLabel } from "../../organisms";
import PlanAction, { PlanActionProps } from "./PlanAction";

const ORG_TYPES: OrgType[] = [
  "Single",
  "CarrierTaskForce",
  "SurfaceTaskForce",
  "TransportEscort",
  "EnemySingle",
  "EnemyCombined",
];

const LevelInput = styled(NumberInput)`
  input {
    width: 26px;
  }
`;

type PlanScreenHeaderProps = PlanActionProps & {
  org: Org;
  onNameChange?: (value: string) => void;
  onHqLevelChange?: (value: number) => void;
  onOrgTypeChange?: (org_type: OrgType) => void;
};

const PlanScreenHeader: React.FCX<PlanScreenHeaderProps> = ({
  className,
  org,
  file,
  actions,
  onNameChange,
  onHqLevelChange,
  onOrgTypeChange,
}) => {
  const { t } = useTranslation("common");

  const antiSingleFp = `${org.fighter_power(false, false) || "?"}`;
  const antiCombinedFp = `${org.fighter_power(true, false) || "?"}`;
  const fpText = org.is_combined()
    ? `連合 ${antiCombinedFp} 第一 ${antiSingleFp}`
    : antiSingleFp;

  return (
    <div className={className}>
      <Flexbox gap={1}>
        <TextField
          placeholder="name"
          startLabel={<PlanIcon />}
          value={file.name}
          onChange={onNameChange}
        />
        <LevelInput
          startLabel={t("HQAdmiralLv")}
          value={org.hq_level}
          min={1}
          max={120}
          onChange={onHqLevelChange}
        />

        <Select<OrgType>
          options={ORG_TYPES}
          onChange={onOrgTypeChange}
          value={org.org_type}
          getOptionLabel={t}
        />

        <PlanAction file={file} org={org} actions={actions} />
      </Flexbox>

      <Flexbox gap={1} mt={1}>
        <Typography variant="body2" mr={1}>
          制空 {fpText}
        </Typography>
        {[1, 2, 3, 4].map((factor) => (
          <ElosLabel key={factor} factor={factor} elos={org.elos(factor)} />
        ))}
      </Flexbox>
    </div>
  );
};

export default PlanScreenHeader;
