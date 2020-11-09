import { css } from "@emotion/react"
import styled from "@emotion/styled"

import MuiFolderIcon from "@material-ui/icons/Folder"
import DescriptionIcon from "@material-ui/icons/Description"

export const PlanIcon = styled(DescriptionIcon)(
  ({ theme }) => css`
    color: ${theme.colors.planFile};
  `
)

export const FolderIcon = styled(MuiFolderIcon)(
  ({ theme }) => css`
    color: ${theme.colors.folder};
  `
)

export { default as TwitterIcon } from "./TwitterIcon"
export { default as KctoolsIcon } from "./KctoolsIcon"
export { default as GithubIcon } from "./GithubIcon"
