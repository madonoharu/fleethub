import { css } from "@emotion/react";
import styled from "@emotion/styled";
import DescriptionIcon from "@material-ui/icons/Description";
import MuiFolderIcon from "@material-ui/icons/Folder";

export const PlanIcon = styled(DescriptionIcon)(
  ({ theme }) => css`
    color: ${theme.colors.planFile};
  `
);

export const FolderIcon = styled(MuiFolderIcon)(
  ({ theme }) => css`
    color: ${theme.colors.folder};
  `
);

export { default as KctoolsIcon } from "./KctoolsIcon";
