import DescriptionIcon from "@mui/icons-material/Description";
import MuiFolderIcon from "@mui/icons-material/Folder";
import { styled, css, SvgIconProps } from "@mui/material";
import React from "react";

import { FileType } from "../../../store";

interface Props extends Omit<SvgIconProps, "color"> {
  type: FileType;
  color?: string | undefined;
}

const FileIcon = React.forwardRef<SVGSVGElement, Props>((props, ref) => {
  const { type, color: _color, ...rest } = props;

  return type === "folder" ? (
    <MuiFolderIcon ref={ref} {...rest} />
  ) : (
    <DescriptionIcon ref={ref} {...rest} />
  );
});

export default styled(FileIcon)(({ theme, type, color }) => {
  const defaultColor =
    type === "folder" ? theme.colors.folder : theme.colors.planFile;
  return css`
    color: ${color || defaultColor};
  `;
});
