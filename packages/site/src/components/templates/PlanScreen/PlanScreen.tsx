/** @jsxImportSource @emotion/react */
import { css } from "@emotion/react";
import styled from "@emotion/styled";
import { Container } from "@mui/material";
import React from "react";

import { OrgContext, PlanContext, useFile, useOrg } from "../../../hooks";
import PlanScreenHeader from "./PlanScreenHeader";
import PlanTabs from "./PlanTabs";

const StyledContainer = styled(Container)(
  ({ theme }) =>
    css`
      min-width: ${theme.breakpoints.values.md}px;
    `
);

type PlanScreenProps = {
  id: string;
};

const PlanScreen: React.FCX<PlanScreenProps> = ({ id }) => {
  const { file, actions: fileActions, isTemp } = useFile(id);
  const { org, actions: orgActions } = useOrg(
    file?.type === "plan" ? file.org : ""
  );

  if (!org || file?.type !== "plan") return null;

  return (
    <StyledContainer>
      <PlanContext.Provider value={file}>
        <OrgContext.Provider value={org}>
          <PlanScreenHeader
            org={org}
            file={file}
            isTemp={isTemp}
            actions={fileActions}
            onNameChange={fileActions.setName}
            onHqLevelChange={orgActions.setHqLevel}
            onOrgTypeChange={(org_type) => orgActions.update({ org_type })}
            onRouteSupChange={(route_sup) => orgActions.update({ route_sup })}
          />

          <PlanTabs org={org} file={file} />
        </OrgContext.Provider>
      </PlanContext.Provider>
    </StyledContainer>
  );
};

export default React.memo(PlanScreen);
