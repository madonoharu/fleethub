import React from "react"
import styled from "@emotion/styled"

import { Tooltip } from "@material-ui/core"
import SearchIcon from "@material-ui/icons/Search"
import HelpIcon from "@material-ui/icons/HelpOutline"

import { TextField, TextFieldProps } from "../../molecules"
import { Flexbox } from "../../atoms"

const StyledHelpIcon = styled(HelpIcon)`
  margin-left: 8px;
`

type SearchInputProps = TextFieldProps & {
  hint?: React.ReactNode
}

const SearchInput = React.forwardRef<HTMLInputElement, SearchInputProps>(({ hint, ...rest }, ref) => {
  return (
    <Flexbox>
      <TextField startLabel={<SearchIcon />} {...rest} ref={ref} />
      {hint && (
        <Tooltip title={hint}>
          <StyledHelpIcon />
        </Tooltip>
      )}
    </Flexbox>
  )
})

export default SearchInput
