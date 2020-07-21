import React from "react"
import styled from "styled-components"
import { useSelector } from "react-redux"

import { Link } from "@material-ui/core"

import { FileEntity, plansSelectors } from "../../../store"

type FileLinkProps = {
  file: FileEntity
  onClick: (id: string) => void
}

const FileLink: React.FCX<FileLinkProps> = ({ className, file, onClick }) => {
  const handleClick = () => onClick(file.id)

  const name = useSelector((state) => {
    if (file.type === "plan") {
      return plansSelectors.selectById(state, file.id)?.name
    }

    return file.name
  })

  return (
    <Link className={className} color="inherit" noWrap onClick={handleClick}>
      {name}
    </Link>
  )
}

export default styled(FileLink)`
  display: block;
  max-width: 120px;
`
