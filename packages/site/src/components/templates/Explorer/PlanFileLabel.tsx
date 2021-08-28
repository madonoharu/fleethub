import styled from "@emotion/styled";
import { useTranslation } from "next-i18next";
import React from "react";

import { useFile, useModal } from "../../../hooks";
import { PlanFileEntity } from "../../../store";
import { CopyButton, MoreVertButton, DeleteButton } from "../../molecules";
import { FileMenu } from "../../organisms";
import FileLabel from "./FileLabel";

type Props = {
  file: PlanFileEntity;
};

const PlanFileLabel: React.FCX<Props> = ({ className, file }) => {
  const { actions, canDrop } = useFile(file.id);
  const { t } = useTranslation("common");
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
            <CopyButton size="tiny" title={t("Copy")} onClick={actions.copy} />
            <DeleteButton
              size="tiny"
              title={t("Remove")}
              onClick={actions.remove}
            />
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

export default styled(PlanFileLabel)`
  position: relative;
`;
