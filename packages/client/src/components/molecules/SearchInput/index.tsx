import React from "react"

import { Input, InputProps } from "@material-ui/core"
import SearchIcon from "@material-ui/icons/Search"

const SearchInput: React.FCX<InputProps> = (props) => {
  return <Input endAdornment={<SearchIcon />} {...props} />
}

export default SearchInput
