import LinkIcon from "@mui/icons-material/Link";
import OpenInNewIcon from "@mui/icons-material/OpenInNew";
import { Button, Link } from "@mui/material";
import { useTranslation } from "next-i18next/pages";
import React from "react";

import { useAsyncOnPublish, useOrg } from "../../../hooks";
import { PlanEntity } from "../../../store";
import { createDeck, openDeckbuilder, openKctools } from "../../../utils";
import { Divider, KctoolsIcon } from "../../atoms";
import { CopyTextButton, TextField } from "../../molecules";
import { cn } from "../../../styles";

const StyledDivider = ({ className, ...props }: React.ComponentProps<typeof Divider>) => (
  <Divider {...props} className={cn("mt-2", className)} />
);

const StyledButton = ({ className, ...props }: React.ComponentProps<typeof Button>) => (
  <Button {...props} className={cn("w-full justify-start", className)} />
);

type Props = {
  file: PlanEntity;
};

const PlanMenu: React.FCX<Props> = ({ className, file }) => {
  const { t } = useTranslation("common");
  const { asyncOnPublish, onUrlCopy, Snackbar } = useAsyncOnPublish(file.id);
  const url = asyncOnPublish.result;

  const { org } = useOrg(file.org);
  const deck = createDeck(org);
  const predeck = JSON.stringify(deck);

  return (
    <div className={className}>
      <StyledDivider label="Share" />

      <StyledButton startIcon={<LinkIcon />} onClick={onUrlCopy} disabled={asyncOnPublish.loading}>
        {t("CopySharedLinkToClipboard")}
      </StyledButton>

      {url && (
        <Link href={url} noWrap>
          {url}
        </Link>
      )}

      <StyledButton startIcon={<KctoolsIcon />} onClick={() => openKctools(org)}>
        制空権シミュレータで開く
      </StyledButton>

      <StyledButton startIcon={<OpenInNewIcon />} onClick={() => openDeckbuilder(org)}>
        デッキビルダーで開く
      </StyledButton>

      <TextField
        label="デッキビルダー形式"
        value={predeck}
        fullWidth
        margin="normal"
        slotProps={{
          input: { endAdornment: <CopyTextButton value={predeck} /> },
        }}
      />

      <Snackbar />
    </div>
  );
};

export default PlanMenu;
