import { cn } from "../../../styles/cn";
import { nonNullable } from "@fh/utils";
import ArrowDropDownIcon from "@mui/icons-material/ArrowDropDown";
import { Button, ButtonProps, Menu, MenuItem, MenuList } from "@mui/material";
import React from "react";

import { getDefaultOptionLabel, SelectComponent, SelectComponentProps } from "../Select";

type SelectedMenuProps = Omit<ButtonProps, keyof SelectComponentProps<unknown>> & {
  label?: React.ReactNode;
};

const SelectedMenu: SelectComponent<SelectedMenuProps> = ({
  options,
  value,
  onChange,
  getOptionLabel = getDefaultOptionLabel,
  label,
  className,
  ...buttonProps
}) => {
  const [anchorEl, setAnchorEl] = React.useState<null | HTMLElement>(null);
  const open = Boolean(anchorEl);
  const handleClick = (event: React.MouseEvent<HTMLElement>) => {
    setAnchorEl(event.currentTarget);
  };
  const handleClose = () => {
    setAnchorEl(null);
  };

  return (
    <>
      <Button
        onClick={handleClick}
        endIcon={<ArrowDropDownIcon />}
        {...buttonProps}
        className={cn("[&_.MuiButton-endIcon]:ml-0", className)}
      >
        {nonNullable(label) && <span className="mr-1">{label}</span>}
        {getOptionLabel(value)}
      </Button>

      <Menu anchorEl={anchorEl} open={open} onClose={handleClose}>
        <MenuList dense>
          {options.map((option, index) => (
            <MenuItem
              className="min-w-20 justify-center"
              key={index}
              value={index}
              onClick={() => {
                onChange?.(option);
                handleClose();
              }}
            >
              {getOptionLabel(option)}
            </MenuItem>
          ))}
        </MenuList>
      </Menu>
    </>
  );
};

export default SelectedMenu;
