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

export { default as DamageStateIcon } from "./DamageStateIcon";
export { default as MoraleStateIcon } from "./MoraleStateIcon";
export { default as KctoolsIcon } from "./KctoolsIcon";
export { default as FuelIcon } from "./FuelIcon";
export { default as AmmoIcon } from "./AmmoIcon";
