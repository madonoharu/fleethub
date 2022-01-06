/** @jsxImportSource @emotion/react */
import styled from "@emotion/styled";
import FolderIcon from "@mui/icons-material/Folder";
import FolderOpenIcon from "@mui/icons-material/FolderOpen";
import GitHubIcon from "@mui/icons-material/GitHub";
import HomeIcon from "@mui/icons-material/Home";
import RedoIcon from "@mui/icons-material/Redo";
import UndoIcon from "@mui/icons-material/Undo";
import { AppBar as MuiAppBar, Button, Link, Tooltip } from "@mui/material";
import React, { useMemo } from "react";
import { useTranslation } from "react-i18next";
import { useDispatch, useSelector } from "react-redux";
import { ActionCreators } from "redux-undo";

import { useModal } from "../../../hooks";
import {
  shipSelectSlice,
  gearSelectSlice,
  mapSelectSlice,
  appSlice,
} from "../../../store";
import { ImportButton, withIconButton } from "../../molecules";
import { ImportMenu } from "../../organisms";

import LanguageSelect from "./LanguageSelect";

const UndoButton = withIconButton(UndoIcon);
const RedoButton = withIconButton(RedoIcon);
const HomeButton = withIconButton(HomeIcon);
const FolderOpenButton = withIconButton(FolderOpenIcon);
const FolderButton = withIconButton(FolderIcon);

const useUndo = () => {
  const dispatch = useDispatch();

  const canUndo = useSelector((state) => state.past.length > 0);
  const canRedo = useSelector((state) => state.future.length > 0);

  const actions = useMemo(
    () => ({
      undo: () => dispatch(ActionCreators.undo()),
      redo: () => dispatch(ActionCreators.redo()),
    }),
    [dispatch]
  );

  return { canUndo, canRedo, ...actions };
};

type Props = {
  explorerOpen?: boolean;
  onExplorerOpen: () => void;
};

const AppBar: React.FCX<Props> = ({
  explorerOpen,
  onExplorerOpen,
  className,
}) => {
  const { t } = useTranslation();

  const dispatch = useDispatch();

  const { canUndo, canRedo, undo, redo } = useUndo();

  const ImprotMenuModal = useModal();

  const handleHomeClick = () => {
    dispatch(appSlice.actions.openFile(""));
  };

  const handleShipSelectOpen = () => {
    dispatch(shipSelectSlice.actions.show());
  };

  const handleGearSelectOpen = () => {
    dispatch(gearSelectSlice.actions.show());
  };

  const handleMapSelectOpen = () => {
    dispatch(mapSelectSlice.actions.show());
  };

  const handleExplorerOpen = () => {
    onExplorerOpen();
  };

  return (
    <MuiAppBar className={className} position="sticky">
      {explorerOpen ? (
        <FolderOpenButton
          size="small"
          title="List"
          onClick={handleExplorerOpen}
        />
      ) : (
        <FolderButton size="small" title="List" onClick={handleExplorerOpen} />
      )}

      <HomeButton size="small" title="Home" onClick={handleHomeClick} />
      <ImportButton
        size="small"
        title="デッキビルダー形式などから編成を読み込む"
        onClick={ImprotMenuModal.show}
      />
      <UndoButton
        size="small"
        title={t("Undo")}
        disabled={!canUndo}
        onClick={undo}
      />
      <RedoButton
        size="small"
        title={t("Redo")}
        disabled={!canRedo}
        onClick={redo}
      />

      <div css={{ marginLeft: "auto" }}>
        <Tooltip title="GitHub repository">
          <Button
            startIcon={<GitHubIcon />}
            component={Link}
            href="https://github.com/MadonoHaru/fleethub"
            color="inherit"
          >
            作戦室 v{process.env.VERSION}
          </Button>
        </Tooltip>

        <Button onClick={handleShipSelectOpen}>{t("Ship")}</Button>
        <Button onClick={handleGearSelectOpen}>{t("Equipment")}</Button>
        <Button onClick={handleMapSelectOpen}>{t("Maps")}</Button>
        <LanguageSelect />

        <ImprotMenuModal>
          <ImportMenu onClose={ImprotMenuModal.hide} />
        </ImprotMenuModal>
      </div>
    </MuiAppBar>
  );
};

export default styled(AppBar)`
  height: 40px;
  display: flex;
  align-items: center;
  flex-direction: row;

  .MuiButton-root {
    height: 40px;
  }
`;
