import styled from "@emotion/styled";
import { Org, OrgType } from "@fleethub/core";
import { useTranslation } from "next-i18next";
import React from "react";

import { Flexbox, PlanIcon } from "../../atoms";
import { NumberInput, Select, TextField } from "../../molecules";
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
          startLabel="司令部Lv"
          value={org.hq_level}
          min={1}
          max={120}
          onChange={onHqLevelChange}
        />

        <Select<OrgType>
          options={ORG_TYPES}
          onChange={onOrgTypeChange}
          value={org.org_type as OrgType}
          getOptionLabel={t}
        />

        <PlanAction file={file} org={org} actions={actions} />
      </Flexbox>
    </div>
  );
};

export default PlanScreenHeader;
