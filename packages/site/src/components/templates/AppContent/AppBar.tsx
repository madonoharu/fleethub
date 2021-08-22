import styled from "@emotion/styled";
import { AppBar as MuiAppBar, Button, Link, Tooltip } from "@material-ui/core";
import GitHubIcon from "@material-ui/icons/GitHub";
import MenuIcon from "@material-ui/icons/Menu";
import RedoIcon from "@material-ui/icons/Redo";
import UndoIcon from "@material-ui/icons/Undo";
import React, { useMemo } from "react";
import { useTranslation } from "react-i18next";
import { useDispatch, useSelector } from "react-redux";
import { ActionCreators } from "redux-undo";

import { useModal } from "../../../hooks";
import { ImportButton, withIconButton } from "../../molecules";
import { ImportMenu } from "../../organisms";
import GearList from "../GearList";
import MapList from "../MapList";
import LanguageSelect from "./LanguageSelect";

const UndoButton = withIconButton(UndoIcon);
const RedoButton = withIconButton(RedoIcon);

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

  const { canUndo, canRedo, undo, redo } = useUndo();

  const ImprotMenuModal = useModal();
  const ShipListModal = useModal();
  const GearListModal = useModal();
  const MapListModal = useModal();

  const handleExplorerOpen = () => {
    onExplorerOpen();
  };

  return (
    <MuiAppBar className={className} position="sticky">
      <Button
        onClick={handleExplorerOpen}
        startIcon={<MenuIcon color={explorerOpen ? "primary" : "action"} />}
      >
        編成一覧
      </Button>

      <ImportButton
        size="small"
        title="デッキビルダー形式などから編成を読み込む"
        onClick={ImprotMenuModal.show}
      />
      <UndoButton
        size="small"
        title="操作を戻す"
        disabled={!canUndo}
        onClick={undo}
      />
      <RedoButton
        size="small"
        title="操作を進める"
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

        <Button onClick={ShipListModal.show}>{t("艦娘")}</Button>
        <Button onClick={GearListModal.show}>{t("装備")}</Button>
        <Button onClick={MapListModal.show}>{t("海域")}</Button>
        <LanguageSelect />

        <ImprotMenuModal>
          <ImportMenu onClose={ImprotMenuModal.hide} />
        </ImprotMenuModal>

        <GearListModal full>
          <GearList />
        </GearListModal>

        <MapListModal full>
          <MapList />
        </MapListModal>
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
