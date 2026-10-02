import { Container, Paper, Alert } from "@mui/material";
import { useTranslation } from "next-i18next/pages";
import React from "react";

import { OrgContext, PlanContext, useFile, useOrg } from "../../../hooks";
import { TextField } from "../../molecules";

import PlanScreenHeader from "./PlanScreenHeader";
import PlanTabs from "./PlanTabs";

type PlanScreenProps = {
  id: string;
};

const PlanScreen: React.FCX<PlanScreenProps> = ({ id }) => {
  const { t } = useTranslation("common");
  const { file, actions: fileActions, isTemp } = useFile(id);
  const { org, actions: orgActions } = useOrg(file?.type === "plan" ? file.org : "");

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
    <Container className="min-w-[900px]">
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

          <Paper className="p-2 mt-2">
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
    </Container>
  );
};

export default React.memo(PlanScreen);
