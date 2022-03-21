import { css } from "@emotion/react";
import styled from "@emotion/styled";
import { Container, Paper, Alert } from "@mui/material";
import { useTranslation } from "next-i18next";
import React from "react";

import { OrgContext, PlanContext, useFile, useOrg } from "../../../hooks";
import { TextField } from "../../molecules";

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
  const { t } = useTranslation("common");
  const { file, actions: fileActions, isTemp } = useFile(id);
  const { org, actions: orgActions } = useOrg(
    file?.type === "plan" ? file.org : ""
  );

  if (file?.type !== "plan") {
    return null;
  }

  if (!org) {
    return (
      <Alert variant="outlined" severity="error">
        編成データが不正です
      </Alert>
    );
  }

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
          />
          <PlanTabs org={org} file={file} />

          <Paper sx={{ p: 1, mt: 1 }}>
            <TextField
              label={t("Description")}
              fullWidth
              value={file.description}
              onChange={fileActions.setDescription}
              multiline
            />
          </Paper>
        </OrgContext.Provider>
      </PlanContext.Provider>
    </StyledContainer>
  );
};

export default React.memo(PlanScreen);
