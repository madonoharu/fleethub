import { copy } from "@fh/utils";
import Assignment from "@mui/icons-material/Assignment";
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
    copy(value)
      .then(() => {
        Snackbar.show({ message: "Success" });
      })
      .catch((error) => {
        Snackbar.show({ message: String(error), severity: "error" });
      });
  };

  return (
    <>
      <AssignmentButton
        size="medium"
        title={t("CopyToClipboard")}
        onClick={handleClick}
      />
      <Snackbar />
    </>
  );
};

export default CopyTextButton;
