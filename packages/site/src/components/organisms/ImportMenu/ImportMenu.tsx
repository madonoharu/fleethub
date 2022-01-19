/** @jsxImportSource @emotion/react */
import styled from "@emotion/styled";
import { Typography } from "@mui/material";
import { MasterData } from "fleethub-core";
import React, { useRef } from "react";
import { useAsyncCallback } from "react-async-hook";
import { useDispatch, useSelector } from "react-redux";

import { useFhCore, useSnackbar } from "../../../hooks";
import {
  appSlice,
  parseDeckStr,
  parseUrl,
  entitiesSlice,
  selectAppState,
  PublicFile,
} from "../../../store";
import { Checkbox, Divider, Flexbox } from "../../atoms";
import { ImportButton, TextField } from "../../molecules";

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
      <TextField ref={ref} variant="outlined" />
      <ImportButton
        onClick={asyncParse.execute}
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

  const importToTemp = useSelector(
    (state) => selectAppState(state).importToTemp
  );
  const dispatch = useDispatch();

  const handleImportToTempChange = (value: boolean) => {
    dispatch(appSlice.actions.setImportToTemp(value));
  };

  const to = importToTemp ? "temp" : undefined;

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
        <TextField variant="outlined" value={deckStr} onChange={setDeckStr} />
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

      <Snackbar />
    </div>
  );
};

export default styled(ImportMenu)`
  padding: 8px;
`;
