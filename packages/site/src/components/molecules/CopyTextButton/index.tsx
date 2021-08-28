import Assignment from "@material-ui/icons/Assignment";
import copy from "copy-to-clipboard";
import { useTranslation } from "next-i18next";
import React from "react";

import { useSnackbar } from "../../../hooks";
import { withIconButton } from "../IconButtons";

const AssignmentButton = withIconButton(Assignment);

type Props = {
  value: string;
};

const CopyTextButton: React.FC<Props> = ({ value }) => {
  const Snackbar = useSnackbar();
  const { t } = useTranslation("common");

  const handleClick = () => {
    const result = copy(value);
    if (result) Snackbar.show({ message: "コピーしました" });
    else Snackbar.show({ message: "失敗しました", severity: "error" });
  };

  return (
    <>
      <AssignmentButton title={t("Copy")} onClick={handleClick} />
      <Snackbar />
    </>
  );
};

export default CopyTextButton;
