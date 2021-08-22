import styled from "@emotion/styled";
import { Button, Link } from "@material-ui/core";
import LinkIcon from "@material-ui/icons/Link";
import React from "react";

import { useAsyncOnPublish } from "../../../hooks";
import { FolderEntity } from "../../../store";
import { Divider } from "../../atoms";

const StyledDivider = styled(Divider)`
  margin-top: 8px;
`;

const StyledButton = styled(Button)`
  justify-content: flex-start;
`;

type Props = {
  file: FolderEntity;
  onClose?: () => void;
};

const FolderMenu: React.FCX<Props> = ({ className, file }) => {
  const { asyncOnPublish, Snackbar } = useAsyncOnPublish(file.id);

  const url = asyncOnPublish.result;

  return (
    <div className={className}>
      <StyledDivider label="Share" />

      <StyledButton
        fullWidth
        startIcon={<LinkIcon />}
        onClick={asyncOnPublish.execute}
        disabled={asyncOnPublish.loading}
      >
        共有URLをクリップボードにコピーする
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
