import styled from "@emotion/styled";
import { Link, Typography } from "@mui/material";
import { MasterData } from "fleethub-core";
import dynamic from "next/dynamic";
import React, { useRef } from "react";
import { useAsyncCallback } from "react-async-hook";

import {
  useAppDispatch,
  useAppSelector,
  useFhCore,
  useSnackbar,
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

type UrlFormProps = {
  masterData: MasterData;
  onSuccess: (file: PublicFile) => void;
  onError: () => void;
};

const UrlForm: React.FCX<UrlFormProps> = ({
  masterData,
  onSuccess,
  onError,
}) => {
  const ref = useRef<HTMLInputElement>(null);

  const asyncParse = useAsyncCallback(
    async () => {
      const str = ref.current?.value || "";
      const data = await parseUrl(masterData, new URL(str));

      if (!data) {
        throw new Error("data is undefined");
      }

      return data;
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

type Props = {
  onClose?: () => void;
};

const ImportMenu: React.FCX<Props> = ({ className, onClose }) => {
  const [deckStr, setDeckStr] = React.useState("");
  const { masterData } = useFhCore();

  const Snackbar = useSnackbar();

  const importToTemp = useAppSelector((root) => root.present.app.importToTemp);
  const dispatch = useAppDispatch();

  const handleImportToTempChange = (value: boolean) => {
    dispatch(appSlice.actions.setImportToTemp(value));
  };

  const to = importToTemp ? "temp" : "root";

  const handleDeckImport = () => {
    try {
      const parsed = parseDeckStr(masterData, deckStr);
      dispatch(entitiesSlice.actions.import({ ...parsed, to }));

      onClose?.();
    } catch (error) {
      console.error(error);
      Snackbar.show({ message: "失敗しました", severity: "error" });
    }
  };

  return (
    <div className={className}>
      <Flexbox>
        <Typography variant="subtitle1">編成を読み込む</Typography>
      </Flexbox>

      <Checkbox
        label="一時領域で開く"
        checked={importToTemp}
        onChange={handleImportToTempChange}
      />

      <StyledDivider label="デッキビルダー形式から" />
      <Flexbox gap={1}>
        <TextField fullWidth value={deckStr} onChange={setDeckStr} />
        <ImportButton onClick={handleDeckImport} />
      </Flexbox>

      <StyledDivider label="共有URLから" />
      <UrlForm
        masterData={masterData}
        onSuccess={(file) => {
          dispatch(entitiesSlice.actions.import({ ...file, to }));
          onClose?.();
        }}
        onError={() => {
          Snackbar.show({ message: "失敗しました", severity: "error" });
        }}
      />

      <StyledDivider label="編成を直接読み込むJavaScriptコード" />
      <Typography variant="body2" mb={1}>
        <Link href="https://noro6.github.io/kc-web/#/manager">
          制空権シミュレータの艦娘管理
        </Link>
        での反映と同じ手順で編成を直接読み込めます
      </Typography>
      <KcsScript />

      <Snackbar />
    </div>
  );
};

export default styled(ImportMenu)`
  padding: 8px;
  width: 320px;
`;
