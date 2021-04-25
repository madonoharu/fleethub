import {
  ListItemIcon,
  ListItemText,
  MenuItem,
  MenuItemProps as MuiMenuItemProps,
  MenuList as MuiMenuList,
  MenuListProps as MuiMenuListProps,
} from "@material-ui/core";
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
        <MenuItem key={index} button {...rest}>
          {icon && <ListItemIcon>{icon}</ListItemIcon>}
          <ListItemText primary={text} />
        </MenuItem>
      ))}
    </MuiMenuList>
  );
};

export default MenuList;
