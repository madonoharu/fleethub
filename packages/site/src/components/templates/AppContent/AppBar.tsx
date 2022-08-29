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
import { ActionCreators } from "redux-undo";

import {
  useAppDispatch,
  useAppSelector,
  useRootSelector,
  useModal,
} from "../../../hooks";
import {
  shipSelectSlice,
  gearSelectSlice,
  mapSelectSlice,
  appSlice,
} from "../../../store";
import { ImportButton, SettingsButton, withIconButton } from "../../molecules";
import { ImportMenu } from "../../organisms";

import LanguageSelect from "./LanguageSelect";

const UndoButton = withIconButton(UndoIcon);
const RedoButton = withIconButton(RedoIcon);
const HomeButton = withIconButton(HomeIcon);
const FolderOpenButton = withIconButton(FolderOpenIcon);
const FolderButton = withIconButton(FolderIcon);

const useUndo = () => {
  const dispatch = useAppDispatch();
  const canUndo = useAppSelector((history) => history.past.length > 0);
  const canRedo = useAppSelector((history) => history.future.length > 0);

  const actions = useMemo(
    () => ({
      undo: () => dispatch(ActionCreators.undo()),
      redo: () => dispatch(ActionCreators.redo()),
    }),
    [dispatch]
  );

  return { canUndo, canRedo, ...actions };
};

const AppBar: React.FCX = ({ className }) => {
  const { t } = useTranslation();

  const dispatch = useAppDispatch();
  const explorerOpen = useRootSelector((root) => root.app.explorerOpen);

  const { canUndo, canRedo, undo, redo } = useUndo();

  const ImportMenuModal = useModal();

  const toggleExplorerOpen = () => {
    dispatch(appSlice.actions.toggleExplorerOpen());
  };

  const handleHomeClick = () => {
    dispatch(appSlice.actions.openHome());
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

  return (
    <MuiAppBar className={className} position="sticky">
      {explorerOpen ? (
        <FolderOpenButton
          size="small"
          title="List"
          onClick={toggleExplorerOpen}
        />
      ) : (
        <FolderButton size="small" title="List" onClick={toggleExplorerOpen} />
      )}

      <HomeButton size="small" title="Home" onClick={handleHomeClick} />
      <ImportButton
        size="small"
        title={t("ImportComps")}
        onClick={ImportMenuModal.show}
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
      <SettingsButton
        size="small"
        title={t("Settings")}
        onClick={() => {
          dispatch(appSlice.actions.openConfig());
        }}
      />

      <div css={{ marginLeft: "auto" }}>
        <Tooltip title="GitHub repository">
          <Button
            startIcon={<GitHubIcon />}
            component={Link}
            href="https://github.com/MadonoHaru/fleethub"
            color="inherit"
          >
            v{process.env.SITE_VERSION}
          </Button>
        </Tooltip>

        <Button onClick={handleShipSelectOpen}>{t("Ship")}</Button>
        <Button onClick={handleGearSelectOpen}>{t("Equipment")}</Button>
        <Button onClick={handleMapSelectOpen}>{t("Maps")}</Button>
        <LanguageSelect />

        <ImportMenuModal>
          <ImportMenu onClose={ImportMenuModal.hide} />
        </ImportMenuModal>
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
