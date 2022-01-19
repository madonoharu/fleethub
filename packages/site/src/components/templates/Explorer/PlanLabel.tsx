/** @jsxImportSource @emotion/react */
import styled from "@emotion/styled";
import { useTranslation } from "next-i18next";
import React from "react";

import { useFileActions, useFileCanDrop, useModal } from "../../../hooks";
import { PlanEntity } from "../../../store";
import { FileCopyButton, MoreVertButton, DeleteButton } from "../../molecules";
import { FileMenu } from "../../organisms";

import FileLabel from "./FileLabel";

type Props = {
  file: PlanEntity;
};

const PlanLabel: React.FCX<Props> = ({ className, file }) => {
  const { t } = useTranslation("common");
  const MenuModal = useModal();

  const actions = useFileActions(file.id);
  const { canDrop } = useFileCanDrop(file.id);

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
            <FileCopyButton
              size="tiny"
              title={t("Copy")}
              onClick={actions.copy}
            />
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

export default styled(PlanLabel)`
  position: relative;
`;
