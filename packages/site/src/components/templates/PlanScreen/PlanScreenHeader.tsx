import { Org, OrgType } from "fleethub-core";
import { useTranslation } from "next-i18next/pages";
import React from "react";

import { Flexbox, FileIcon } from "../../atoms";
import { NumberInput, TextField } from "../../molecules";
import { OrgTypeSelect } from "../../organisms";

import PlanAction, { PlanActionProps } from "./PlanAction";

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
      <Flexbox className="gap-2">
        <TextField
          placeholder="name"
          startLabel={<FileIcon type={file.type} color={file.color} />}
          value={file.name}
          onChange={onNameChange}
        />
        <NumberInput
          className="[&_input]:w-[26px]"
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
