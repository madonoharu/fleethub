import { Alert, AlertTitle, Button, Stack } from "@mui/material";
import localforage from "localforage";
import { useTranslation } from "next-i18next/pages";
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
    <Stack className="gap-2">
      <Divider label={t("Backup")} />
      <BackupScreen />

      <Divider label={t("DeleteAllData")} className="mt-10" />
      <Button variant="contained" color="error" className="mr-auto" onClick={Modal.show}>
        {t("DeleteAllData")}
      </Button>

      <Modal>
        <Alert severity="error" className="mt-4 mb-2">
          <AlertTitle> {t("DeleteAllData")}</AlertTitle>
          {t("AreYouSure")}
        </Alert>

        <Stack direction="row" className="justify-end gap-2">
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
