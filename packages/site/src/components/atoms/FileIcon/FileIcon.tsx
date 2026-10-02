import { colors } from "../../../styles/colors";
import DescriptionIcon from "@mui/icons-material/Description";
import MuiFolderIcon from "@mui/icons-material/Folder";
import { SvgIconProps } from "@mui/material";
import React from "react";

import { FileType } from "../../../store";

interface Props extends Omit<SvgIconProps, "color"> {
  type: FileType;
  color?: string | undefined;
}

const FileIcon = React.forwardRef<SVGSVGElement, Props>((props, ref) => {
  const { type, color, style, ...other } = props;
  const rest = {
    ...other,
    style: {
      color: color || (type === "folder" ? colors.folder : colors.planFile),
      ...style,
    },
  };

  return type === "folder" ? (
    <MuiFolderIcon ref={ref} {...rest} />
  ) : (
    <DescriptionIcon ref={ref} {...rest} />
  );
});

export default FileIcon;
