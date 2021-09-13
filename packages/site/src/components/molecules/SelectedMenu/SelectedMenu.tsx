import styled from "@emotion/styled";
import { nonNullable } from "@fleethub/utils";
import { Button, ButtonProps, Menu, MenuItem, MenuList } from "@mui/material";
import ArrowDropDownIcon from "@mui/icons-material/ArrowDropDown";
import React from "react";

import {
  getDefaultOptionLabel,
  SelectComponent,
  SelectComponentProps,
} from "../Select";

const StyledButton = styled(Button)`
  .MuiButton-endIcon {
    margin-left: 0;
  }
`;

const Label = styled.span`
  margin-right: 4px;
`;

const StyledMenuItem = styled(MenuItem)`
  min-width: 80px;
  justify-content: center;
`;

type SelectedMenuProps = Omit<
  ButtonProps,
  keyof SelectComponentProps<unknown>
> & {
  label?: React.ReactNode;
};

const SelectedMenu: SelectComponent<SelectedMenuProps> = ({
  options,
  value,
  onChange,
  getOptionLabel = getDefaultOptionLabel,
  label,
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
      <StyledButton
        onClick={handleClick}
        endIcon={<ArrowDropDownIcon />}
        {...buttonProps}
      >
        {nonNullable(label) && <Label>{label}</Label>}
        {getOptionLabel(value)}
      </StyledButton>

      <Menu anchorEl={anchorEl} open={open} onClose={handleClose}>
        <MenuList dense>
          {options.map((option, index) => (
            <StyledMenuItem
              key={index}
              value={index}
              onClick={() => {
                onChange?.(option);
                handleClose();
              }}
            >
              {getOptionLabel(option)}
            </StyledMenuItem>
          ))}
        </MenuList>
      </Menu>
    </>
  );
};

export default SelectedMenu;
