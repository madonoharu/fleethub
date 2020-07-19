import React from "react"
import styled from "styled-components"
import { useDispatch, useSelector } from "react-redux"

import { Breadcrumbs, Link } from "@material-ui/core"
import NavigateNextIcon from "@material-ui/icons/NavigateNext"

import { FileEntity, plansSelectors, appSlice } from "../../../store"
import { useFile } from "../../../hooks"

const FileLink: React.FC<{ file: FileEntity }> = ({ file }) => {
  const dispatch = useDispatch()
  const name = useSelector((state) => {
    if (file.type === "plan") {
      return plansSelectors.selectById(state, file.id)?.name
    }

    return file.name
  })

  return (
    <Link color="inherit" onClick={() => dispatch(appSlice.actions.openFile(file.id))}>
      {name}
    </Link>
  )
}

type Props = {
  file: FileEntity
}

const DirectoryBreadcrumbs: React.FCX<Props> = ({ className, file }) => {
  const { parents } = useFile(file.id)

  return (
    <Breadcrumbs className={className} separator={<NavigateNextIcon fontSize="small" />}>
      {parents.concat(file).map((file) => (
        <FileLink key={file.id} file={file} />
      ))}
    </Breadcrumbs>
  )
}

export default styled(DirectoryBreadcrumbs)`
  .MuiBreadcrumbs-separator {
    margin: 0;
  }

  .MuiBreadcrumbs-li {
    font-size: 0.75rem;
  }
`
