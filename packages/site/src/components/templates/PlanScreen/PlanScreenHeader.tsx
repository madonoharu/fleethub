import styled from "@emotion/styled";
import { Org, OrgType } from "fleethub-core";
import { useTranslation } from "next-i18next";
import React from "react";

import { Flexbox, PlanIcon } from "../../atoms";
import { NumberInput, TextField } from "../../molecules";
import { OrgTypeSelect } from "../../organisms";

import PlanAction, { PlanActionProps } from "./PlanAction";

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
  isTemp,
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
          startLabel={t("HQAdmiralLv")}
          value={org.hq_level}
          min={1}
          max={120}
          onChange={onHqLevelChange}
        />
        <OrgTypeSelect onChange={onOrgTypeChange} value={org.org_type} />
        <PlanAction file={file} org={org} isTemp={isTemp} actions={actions} />
      </Flexbox>
    </div>
  );
};

export default PlanScreenHeader;
