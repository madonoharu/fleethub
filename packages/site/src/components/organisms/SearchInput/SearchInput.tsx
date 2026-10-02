import HelpIcon from "@mui/icons-material/HelpOutlined";
import SearchIcon from "@mui/icons-material/Search";
import { Tooltip } from "@mui/material";
import React from "react";

import { Flexbox } from "../../atoms";
import { TextField, TextFieldProps } from "../../molecules";

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
            <HelpIcon className="ml-2" />
          </Tooltip>
        )}
      </Flexbox>
    );
  },
);

export default SearchInput;
