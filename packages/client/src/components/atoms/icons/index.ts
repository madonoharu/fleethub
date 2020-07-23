import styled from "styled-components"

import MuiFolderIcon from "@material-ui/icons/Folder"
import DescriptionIcon from "@material-ui/icons/Description"

export const PlanIcon = styled(DescriptionIcon)`
  color: ${({ theme }) => theme.colors.planFile};
`

export const FolderIcon = styled(MuiFolderIcon)`
  color: ${({ theme }) => theme.colors.folder};
`

export { default as TwitterIcon } from "./TwitterIcon"
