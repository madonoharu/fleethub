/** @jsxImportSource @emotion/react */
import {
  ListItemIcon,
  ListItemText,
  MenuItem,
  MenuItemProps as MuiMenuItemProps,
  MenuList as MuiMenuList,
  MenuListProps as MuiMenuListProps,
} from "@mui/material";
import React from "react";

export type MenuItemProps = Omit<MuiMenuItemProps, "button"> & {
  icon: React.ReactNode;
  text: React.ReactNode;
};

type Props = MuiMenuListProps & {
  list: MenuItemProps[];
};

const MenuList: React.FC<Props> = ({ list, ...menuProps }) => {
  return (
    <MuiMenuList {...menuProps}>
      {list.map(({ icon, text, ...rest }, index) => (
        <MenuItem key={index} {...rest}>
          {icon && <ListItemIcon>{icon}</ListItemIcon>}
          <ListItemText primary={text} />
        </MenuItem>
      ))}
    </MuiMenuList>
  );
};

export default MenuList;
