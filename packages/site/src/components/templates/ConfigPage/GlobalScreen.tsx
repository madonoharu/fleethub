import { Alert, AlertTitle, Button, Stack } from "@mui/material";
import localforage from "localforage";
import { useTranslation } from "next-i18next";
import React from "react";

import { useModal } from "../../../hooks";
import { Divider } from "../../atoms";

import BackupScreen from "./BackupScreen";

function deleteAllData() {
  void localforage.clear().then(() => {
    location.reload();
  });
}

const GlobalScreen: React.FC = () => {
  const { t } = useTranslation("common");

  const Modal = useModal();

  return (
    <Stack gap={1}>
      <Divider label={t("Backup")} />
      <BackupScreen />

      <Divider label={t("DeleteAllData")} sx={{ mt: 5 }} />
      <Button
        variant="contained"
        color="error"
        sx={{ mr: "auto" }}
        onClick={Modal.show}
      >
        {t("DeleteAllData")}
      </Button>

      <Modal>
        <Alert severity="error" sx={{ mt: 2, mb: 1 }}>
          <AlertTitle> {t("DeleteAllData")}</AlertTitle>
          {t("AreYouSure")}
        </Alert>

        <Stack direction="row" justifyContent="flex-end" gap={1}>
          <Button color="primary" variant="contained" onClick={Modal.hide}>
            CANCEL
          </Button>
          <Button color="error" variant="contained" onClick={deleteAllData}>
            OK
          </Button>
        </Stack>
      </Modal>
    </Stack>
  );
};

export default GlobalScreen;
