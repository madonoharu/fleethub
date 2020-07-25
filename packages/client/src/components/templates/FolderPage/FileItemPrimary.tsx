import React from "react"
import styled from "styled-components"

import { Typography } from "@material-ui/core"

import { FileEntity } from "../../../store"
import { Flexbox } from "../../atoms"

type Props = {
  file: FileEntity
}

const FileItemPrimary: React.FCX<Props> = ({ className, file }) => {
  return (
    <Flexbox className={className}>
      <Typography variant="subtitle1">{file.name}</Typography>
      <Typography variant="caption">{file.description}</Typography>
    </Flexbox>
  )
}

export default styled(FileItemPrimary)`
  align-items: baseline;

  h6 {
    width: 160px;
    flex-shrink: 0;
  }

  span {
    font-size: 0.75rem;
    color: ${(props) => props.theme.palette.text.secondary};
  }

  > * {
    overflow: hidden;
    white-space: nowrap;
    text-overflow: ellipsis;
  }
`
