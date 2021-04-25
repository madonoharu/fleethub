import { css } from "@emotion/react";
import styled from "@emotion/styled";
import { Button } from "@material-ui/core";
import AddIcon from "@material-ui/icons/Add";
import React from "react";

type Props = {
  onClick?: () => void;
};

const AddGearButton: React.FCX<Props> = ({ className, onClick }) => {
  return (
    <Button className={className} onClick={onClick}>
      <AddIcon fontSize="small" />
    </Button>
  );
};

export default styled(AddGearButton)(
  ({ theme }) => css`
    height: 100%;
    width: 100%;
    padding: 0;
    color: ${theme.palette.action.disabled};
    transition: 250ms;

    :hover {
      color: ${theme.palette.action.active};
    }
  `
);
