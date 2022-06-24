import { isUnknownRecord, download } from "@fh/utils";
import DownloadIcon from "@mui/icons-material/Download";
import RestorePageIcon from "@mui/icons-material/RestorePage";
import { Alert, AlertTitle, Button, Stack } from "@mui/material";
import { useTranslation } from "next-i18next";
import React, { useRef, useState } from "react";
import { RehydrateAction, REHYDRATE, FLUSH } from "redux-persist";

import { useAppDispatch, useSnackbar } from "../../../hooks";
import { persistConfig } from "../../../store";
import { Dialog } from "../../organisms";

interface BackupData {
  _persist: object;
}

function isBackupData(data: unknown): data is BackupData {
  return isUnknownRecord(data) && "_persist" in data;
}

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
        if (isBackupData(data)) {
          download(data, filename);
        } else {
          throw new Error("flushResult is unknown");
        }
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
      .then((data) => {
        if (isBackupData(data)) {
          const action: RehydrateAction = {
            type: REHYDRATE,
            key: persistConfig.key,
            payload: data,
          };

          dispatch(action);
          handleFileRemove();
          Snackbar.show({
            severity: "success",
            message: "success",
          });
        } else {
          throw Error("データが適合しません");
        }
      })
      .catch((error) => {
        console.error(error);
        Snackbar.show({
          severity: "error",
          message: String(error),
        });
      });
  };

  const handleFileChange: React.ChangeEventHandler<HTMLInputElement> = (
    event
  ) => {
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
    <Stack direction="row" gap={1}>
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
        css={{ display: "none" }}
        type="file"
        accept="application/json"
        onChange={handleFileChange}
      />

      <Snackbar />

      {file && (
        <Dialog open={true} onClose={handleFileRemove}>
          <Stack m={1} gap={1}>
            <Alert severity="warning" icon={<RestorePageIcon />}>
              <AlertTitle>{t("Restore")}</AlertTitle>
              {file.name}
            </Alert>
            <Stack direction="row" justifyContent="flex-end" gap={1}>
              <Button
                color="secondary"
                variant="contained"
                onClick={handleFileRemove}
              >
                CANCEL
              </Button>

              <Button
                color="primary"
                variant="contained"
                onClick={handleRestore}
              >
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
