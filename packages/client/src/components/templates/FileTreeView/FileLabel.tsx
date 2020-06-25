import React from "react"
import styled from "styled-components"

import { Flexbox } from "../../../components"

const FileLabelAction = styled.div`
  display: none;
  margin-left: auto;
`

const FileLabelText = styled.div`
  width: calc(100% - 128px);
  margin-left: 8px;
  white-space: nowrap;
  text-overflow: ellipsis;
  overflow: hidden;
`

type Props = {
  icon: React.ReactNode
  text: React.ReactNode
  action: React.ReactNode
  onClick?: () => void
}

const handleActionClick = (event: React.MouseEvent) => event.preventDefault()

const FileLabel: React.FCX<Props> = ({ className, icon, text, action, onClick }) => {
  return (
    <Flexbox className={className}>
      {icon}
      <FileLabelText onClick={onClick}>{text}</FileLabelText>
      <FileLabelAction onClick={handleActionClick}>{action}</FileLabelAction>
    </Flexbox>
  )
}

export default styled(FileLabel)`
  height: 24px;

  :hover ${FileLabelAction} {
    display: block;
  }
`
