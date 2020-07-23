import React from "react"
import { useSelector, useDispatch } from "react-redux"

import { PlanEditor, DirectoryBreadcrumbs } from "../../../components"
import { openDefaultFile, selectAppState, filesSelectors } from "../../../store"

import FolderPage from "../FolderPage"

const FileViewer: React.FC = () => {
  const dispatch = useDispatch()

  const file = useSelector((state) => {
    const { fileId } = selectAppState(state)
    return fileId && filesSelectors.selectById(state, fileId)
  })

  React.useEffect(() => {
    if (file) return
    dispatch(openDefaultFile())
  }, [dispatch, file])

  if (!file) return null

  return (
    <>
      <DirectoryBreadcrumbs file={file} />
      {file.type === "plan" ? <PlanEditor id={file.id} /> : <FolderPage id={file.id} />}
    </>
  )
}

export default FileViewer
