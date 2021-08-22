import styled from "@emotion/styled";
import { Button, Link } from "@material-ui/core";
import LinkIcon from "@material-ui/icons/Link";
import OpenInNewIcon from "@material-ui/icons/OpenInNew";
import React from "react";

import { useAsyncOnPublish, useOrg } from "../../../hooks";
import { PlanFileEntity } from "../../../store";
import { createDeck, openDeckbuilder, openKctools } from "../../../utils";
import { Divider, KctoolsIcon } from "../../atoms";
import { CopyTextButton, TextField } from "../../molecules";

const StyledDivider = styled(Divider)`
  margin-top: 8px;
`;

const StyledButton = styled(Button)`
  width: 100%;
  justify-content: flex-start;
`;

type Props = {
  file: PlanFileEntity;
};

const PlanMenu: React.FCX<Props> = ({ className, file }) => {
  const { asyncOnPublish, Snackbar } = useAsyncOnPublish(file.id);
  const url = asyncOnPublish.result;

  const { org } = useOrg(file.org);
  const deck = createDeck(org);
  const predeck = JSON.stringify(deck);

  return (
    <div className={className}>
      <StyledDivider label="Share" />

      <StyledButton
        startIcon={<LinkIcon />}
        onClick={asyncOnPublish.execute}
        disabled={asyncOnPublish.loading}
      >
        共有URLをクリップボードにコピー
      </StyledButton>

      {url && (
        <Link href={url} noWrap>
          {url}
        </Link>
      )}

      <StyledButton
        startIcon={<KctoolsIcon />}
        onClick={() => openKctools(org)}
      >
        制空権シミュレーターで開く
      </StyledButton>

      <StyledButton
        startIcon={<OpenInNewIcon />}
        onClick={() => openDeckbuilder(org)}
      >
        デッキビルダーで開く
      </StyledButton>

      <TextField
        label="デッキビルダー形式"
        value={predeck}
        fullWidth
        margin="normal"
        InputProps={{ endAdornment: <CopyTextButton value={predeck} /> }}
      />

      <Snackbar />
    </div>
  );
};

export default PlanMenu;
