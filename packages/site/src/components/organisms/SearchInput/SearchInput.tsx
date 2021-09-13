import styled from "@emotion/styled";
import HelpIcon from "@mui/icons-material/HelpOutline";
import SearchIcon from "@mui/icons-material/Search";
import { Tooltip } from "@mui/material";
import React from "react";

import { Flexbox } from "../../atoms";
import { TextField, TextFieldProps } from "../../molecules";

const StyledHelpIcon = styled(HelpIcon)`
  margin-left: 8px;
`;

type SearchInputProps = TextFieldProps & {
  hint?: React.ReactNode;
};

const SearchInput = React.forwardRef<HTMLInputElement, SearchInputProps>(
  ({ hint, ...rest }, ref) => {
    return (
      <Flexbox>
        <TextField startLabel={<SearchIcon />} {...rest} ref={ref} />
        {hint && (
          <Tooltip title={hint}>
            <StyledHelpIcon />
          </Tooltip>
        )}
      </Flexbox>
    );
  }
);

export default SearchInput;
