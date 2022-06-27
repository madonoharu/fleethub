import { styled, Link, Typography, Stack } from "@mui/material";
import { useTranslation } from "next-i18next";
import dynamic from "next/dynamic";
import React, { useRef } from "react";
import { useAsyncCallback } from "react-async-hook";

import {
  useAppDispatch,
  useFhCore,
  useSnackbar,
  useRootSelector,
} from "../../../hooks";
import {
  appSlice,
  parseDeckStr,
  parseUrl,
  entitiesSlice,
  PublicFile,
} from "../../../store";
import { Checkbox, Divider, Flexbox } from "../../atoms";
import { ImportButton, TextField } from "../../molecules";

const KcsScript = dynamic(() => import("./KcsScript"));

const StyledDivider = styled(Divider)`
  margin-top: 8px;
`;

interface ImportFormProps {
  onSuccess: (file: PublicFile) => void;
  onError: (error: Error) => void;
}

const ImportForm: React.FCX<ImportFormProps> = ({ onSuccess, onError }) => {
  const { masterData } = useFhCore();
  const ref = useRef<HTMLInputElement>(null);

  const asyncParse = useAsyncCallback(
    async () => {
      const str = ref.current?.value || "";

      if (str.startsWith("{")) {
        const parsed = parseDeckStr(masterData, str);
        return parsed;
      } else {
        const data = await parseUrl(masterData, new URL(str));

        if (!data) {
          throw new Error("data is undefined");
        }

        return data;
      }
    },
    {
      onSuccess,
      onError,
    }
  );

  return (
    <Flexbox gap={1}>
      <TextField ref={ref} fullWidth />
      <ImportButton
        onClick={() => {
          void asyncParse.execute();
        }}
        disabled={asyncParse.loading}
      />
    </Flexbox>
  );
};

interface Props {
  onClose?: () => void;
}

const ImportMenu: React.FCX<Props> = ({ className, onClose }) => {
  const { t } = useTranslation("common");
  const outputToTemp = useRootSelector((root) => root.app.outputToTemp);
  const dispatch = useAppDispatch();

  const Snackbar = useSnackbar();

  const handleOutputToTempChange = (value: boolean) => {
    dispatch(appSlice.actions.setOutputToTemp(value));
  };

  const handleImport = (data: PublicFile) => {
    const to = outputToTemp ? "temp" : "root";
    dispatch(entitiesSlice.actions.import({ ...data, to }));
    onClose?.();
  };

  return (
    <Stack className={className} gap={1}>
      <Typography variant="subtitle1">{t("ImportComps")}</Typography>

      <Checkbox
        label={t("OutputToTemp")}
        checked={outputToTemp}
        onChange={handleOutputToTempChange}
      />

      <ImportForm onSuccess={handleImport} onError={Snackbar.error} />

      <Typography variant="subtitle2">{t("SupportedFormats")}</Typography>
      <ul>
        {[
          t("DeckBuilderFormat"),
          "jervis.vercel.app?p=...",
          "jervis.page.link/...",
          "jervis.vercel.app?predeck=...",
          "deckbuilder.html?predeck=...",
        ].map((format, index) => (
          <Typography variant="body2" component="li" key={index}>
            {format}
          </Typography>
        ))}
      </ul>

      <StyledDivider label="編成を直接読み込むJavaScriptコード" />
      <Typography variant="body2">
        <Link href="https://noro6.github.io/kc-web/#/manager">
          制空権シミュレータの艦娘管理
        </Link>
        での反映と同じ手順で編成を直接読み込めます
      </Typography>
      <KcsScript />

      <Snackbar />
    </Stack>
  );
};

export default styled(ImportMenu)`
  padding: 8px;
  width: 320px;
`;
