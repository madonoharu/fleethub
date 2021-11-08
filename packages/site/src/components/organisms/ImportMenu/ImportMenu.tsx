/** @jsxImportSource @emotion/react */
import styled from "@emotion/styled";
import { Typography } from "@mui/material";
import React from "react";
import { useAsyncCallback } from "react-async-hook";
import { useDispatch, useSelector } from "react-redux";

import { useFhCore, useSnackbar } from "../../../hooks";
import {
  appSlice,
  createPlan,
  importFile,
  parseUrl,
  selectAppState,
} from "../../../store";
import { createOrgStateByDeck, Deck } from "../../../utils";
import { Checkbox, Divider, Flexbox } from "../../atoms";
import { ImportButton, TextField } from "../../molecules";

const StyledDivider = styled(Divider)`
  margin-top: 8px;
`;

type Props = {
  onClose?: () => void;
};

const ImportMenu: React.FCX<Props> = ({ className, onClose }) => {
  const [deckStr, setDeckStr] = React.useState("");
  const [urlStr, setUrlStr] = React.useState("");
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
      const deck: Deck = JSON.parse(deckStr);
      const OrgState = createOrgStateByDeck(masterData, deck);

      dispatch(createPlan({ org: OrgState, to }));

      onClose?.();
    } catch (error) {
      console.error(error);
      Snackbar.show({ message: "失敗しました", severity: "error" });
    }
  };

  const asyncOnUrlImport = useAsyncCallback(
    async () => {
      const url = new URL(urlStr);
      const parsed = await parseUrl(masterData, url);

      if (parsed) {
        dispatch(importFile({ ...parsed, to }));
        onClose?.();
      } else {
        Snackbar.show({ message: "失敗しました", severity: "error" });
      }
    },
    {
      onError: () =>
        Snackbar.show({ message: "失敗しました", severity: "error" }),
    }
  );

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
      <Flexbox gap={1}>
        <TextField variant="outlined" value={urlStr} onChange={setUrlStr} />
        <ImportButton
          onClick={asyncOnUrlImport.execute}
          disabled={asyncOnUrlImport.loading}
        />
      </Flexbox>

      <Snackbar />
    </div>
  );
};

export default styled(ImportMenu)`
  padding: 8px;
`;
