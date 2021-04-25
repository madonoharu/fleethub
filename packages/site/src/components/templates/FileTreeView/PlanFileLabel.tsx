import styled from "@emotion/styled";
import React from "react";

import { useFile, useModal } from "../../../hooks";
import { PlanFileEntity } from "../../../store";
import { CopyButton, MoreVertButton, RemoveButton } from "../../molecules";
import { FileMenu } from "../../organisms";
import FileLabel from "./FileLabel";

type Props = {
  file: PlanFileEntity;
};

const PlanFileLabel: React.FCX<Props> = ({ className, file }) => {
  const { actions, canDrop } = useFile(file.id);
  const MenuModal = useModal();

  return (
    <>
      <FileLabel
        className={className}
        file={file}
        text={file.name}
        onClick={actions.open}
        canDrop={canDrop}
        onDrop={actions.drop}
        action={
          <>
            <CopyButton size="tiny" title="コピー" onClick={actions.copy} />
            <RemoveButton size="tiny" title="削除" onClick={actions.remove} />
            <MoreVertButton
              size="tiny"
              title="メニュー"
              onClick={MenuModal.show}
            />
          </>
        }
      />

      <MenuModal>
        <FileMenu id={file.id} onClose={MenuModal.hide} />
      </MenuModal>
    </>
  );
};

export default styled(PlanFileLabel)``;
