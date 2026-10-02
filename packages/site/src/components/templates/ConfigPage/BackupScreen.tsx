import { isUnknownRecord, download } from "@fh/utils";
import DownloadIcon from "@mui/icons-material/Download";
import RestorePageIcon from "@mui/icons-material/RestorePage";
import { Alert, AlertTitle, Button, Stack } from "@mui/material";
import { useTranslation } from "next-i18next/pages";
import React, { useRef, useState } from "react";
import { REHYDRATE, FLUSH } from "redux-persist";

import { useAppDispatch, useSnackbar } from "../../../hooks";
import { persistConfig } from "../../../store";
import { InvalidBackupError, parseBackupData } from "../../../store/backup";
import { Dialog } from "../../organisms";

const BackupScreen: React.FC = () => {
  const { t } = useTranslation("common");
  const dispatch = useAppDispatch();

  const ref = useRef<HTMLInputElement>(null);
  const [file, setFile] = useState<File>();
  const Snackbar = useSnackbar();

  const filename = `${new Date().toISOString()}.json`;

  const handleDownload = () => {
    const results: Promise<unknown>[] = [];
    dispatch({
      type: FLUSH,
      result: (flushResult: Promise<unknown>) => {
        results.push(flushResult);
      },
    });

    Promise.all(results)
      .then((array) => {
        const data = array[0];
        // Keep export available even when existing data needs to be repaired.
        if (!isUnknownRecord(data) || !("_persist" in data)) {
          throw new Error("flushResult is unknown");
        }
        download(data, filename);
      })
      .catch((error) => {
        console.error(error);
        Snackbar.show({
          severity: "error",
          message: String(error),
        });
      });
  };

  const handleFileRemove = () => {
    setFile(undefined);
  };

  const handleRestore = () => {
    file
      ?.text()
      .then((text) => JSON.parse(text) as unknown)
      .then(parseBackupData)
      .then((payload) => {
        dispatch({ type: REHYDRATE, key: persistConfig.key, payload });
        handleFileRemove();
        Snackbar.show({ severity: "success", message: "success" });
      })
      .catch((error) => {
        const invalidInput = error instanceof InvalidBackupError || error instanceof SyntaxError;
        if (!invalidInput) console.error(error);
        if (invalidInput) handleFileRemove();
        Snackbar.show({
          severity: "error",
          message: invalidInput ? "データが適合しません" : String(error),
        });
      });
  };

  const handleFileChange: React.ChangeEventHandler<HTMLInputElement> = (event) => {
    const file = event.currentTarget.files?.item(0) || undefined;
    setFile(file);
  };

  const handleRestoreClick = () => {
    const node = ref.current;
    if (node) {
      node.value = "";
      node.click();
    }
  };

  return (
    <Stack direction="row" className="gap-2">
      <Button
        variant="contained"
        color="primary"
        startIcon={<DownloadIcon />}
        onClick={handleDownload}
      >
        {t("Download")}
      </Button>
      <Button
        variant="contained"
        color="primary"
        startIcon={<RestorePageIcon />}
        onClick={handleRestoreClick}
      >
        {t("Restore")}
      </Button>

      <input
        ref={ref}
        className="hidden"
        type="file"
        accept="application/json"
        onChange={handleFileChange}
      />

      <Snackbar />

      {file && (
        <Dialog open={true} onClose={handleFileRemove}>
          <Stack className="m-2 gap-2">
            <Alert severity="warning" icon={<RestorePageIcon />}>
              <AlertTitle>{t("Restore")}</AlertTitle>
              {file.name}
            </Alert>
            <Stack direction="row" className="justify-end gap-2">
              <Button color="secondary" variant="contained" onClick={handleFileRemove}>
                CANCEL
              </Button>

              <Button color="primary" variant="contained" onClick={handleRestore}>
                OK
              </Button>
            </Stack>
          </Stack>
        </Dialog>
      )}
    </Stack>
  );
};

export default BackupScreen;
