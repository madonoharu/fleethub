import LinkIcon from "@mui/icons-material/Link";
import { Button, Link } from "@mui/material";
import { useTranslation } from "next-i18next/pages";
import React from "react";

import { useAsyncOnPublish } from "../../../hooks";
import { FolderEntity } from "../../../store";
import { Divider } from "../../atoms";
import { cn } from "../../../styles";

const StyledDivider = ({ className, ...props }: React.ComponentProps<typeof Divider>) => (
  <Divider {...props} className={cn("mt-2", className)} />
);

const StyledButton = ({ className, ...props }: React.ComponentProps<typeof Button>) => (
  <Button {...props} className={cn("justify-start", className)} />
);

type Props = {
  file: FolderEntity;
  onClose?: () => void;
};

const FolderMenu: React.FCX<Props> = ({ className, file }) => {
  const { t } = useTranslation("common");
  const { asyncOnPublish, onUrlCopy, Snackbar } = useAsyncOnPublish(file.id);

  const url = asyncOnPublish.result;

  return (
    <div className={className}>
      <StyledDivider label="Share" />

      <StyledButton
        fullWidth
        startIcon={<LinkIcon />}
        onClick={onUrlCopy}
        disabled={asyncOnPublish.loading}
      >
        {t("CopySharedLinkToClipboard")}
      </StyledButton>
      {url && (
        <Link href={url} noWrap>
          {url}
        </Link>
      )}

      <Snackbar />
    </div>
  );
};

export default FolderMenu;
