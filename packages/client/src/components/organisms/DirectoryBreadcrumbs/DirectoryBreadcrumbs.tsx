import React from "react"
import { useDispatch, useSelector, DefaultRootState, shallowEqual } from "react-redux"

import { Typography, Breadcrumbs, Link } from "@material-ui/core"
import NavigateNextIcon from "@material-ui/icons/NavigateNext"

import { filesSelectors, isDirectory, FileEntity, plansSelectors, appSlice } from "../../../store"
import styled from "styled-components"
import { createSelector } from "@reduxjs/toolkit"

const getParents = (files: FileEntity[], id: string): FileEntity[] => {
  const parent = files.find((file) => isDirectory(file) && file.children.includes(id))

  if (!parent) return []

  return [...getParents(files, parent.id), parent]
}

const selectParents = createSelector(
  (state: DefaultRootState, id: string) => filesSelectors.selectAll(state),
  (state, id) => id,
  (files, id) => getParents(files, id)
)

const FileLink: React.FC<{ file: FileEntity }> = ({ file }) => {
  const dispatch = useDispatch()
  const name = useSelector((state) => {
    if (file.type === "plan") {
      return plansSelectors.selectById(state, file.id)?.name
    }

    if (file.type === "folder") {
      return file.name
    }

    return file.type
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
  const parents = useSelector((state) => selectParents(state, file.id), shallowEqual)

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
