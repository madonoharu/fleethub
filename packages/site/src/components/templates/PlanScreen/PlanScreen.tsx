import { Container } from "@material-ui/core";
import React from "react";

import { OrgContext, PlanContext, useFile, useOrg } from "../../../hooks";
import { PlanAnalysisPanel } from "../../organisms";
import PlanScreenHeader from "./PlanScreenHeader";
import PlanTabs from "./PlanTabs";

type PlanScreenProps = {
  id: string;
};

const PlanScreen: React.FCX<PlanScreenProps> = ({ id }) => {
  const { file, actions: fileActions } = useFile(id);
  const { org, actions: orgActions } = useOrg(
    file?.type === "plan" ? file.org : ""
  );

  if (!org || file?.type !== "plan") return null;

  return (
    <Container>
      <PlanContext.Provider value={file}>
        <OrgContext.Provider value={org}>
          <PlanScreenHeader
            org={org}
            file={file}
            actions={fileActions}
            onNameChange={fileActions.setName}
            onHqLevelChange={orgActions.setHqLevel}
            onOrgTypeChange={(org_type) => orgActions.update({ org_type })}
          />

          <PlanTabs org={org} file={file} />

          <PlanAnalysisPanel css={{ marginTop: 8 }} org={org} />
        </OrgContext.Provider>
      </PlanContext.Provider>
    </Container>
  );
};

export default React.memo(PlanScreen);
