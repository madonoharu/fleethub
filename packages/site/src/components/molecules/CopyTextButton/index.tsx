import Assignment from "@mui/icons-material/Assignment";
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
    if (result) Snackbar.show({ message: "Success" });
    else Snackbar.show({ message: "Error", severity: "error" });
  };

  return (
    <>
      <AssignmentButton title={t("CopyToClipboard")} onClick={handleClick} />
      <Snackbar />
    </>
  );
};

export default CopyTextButton;
