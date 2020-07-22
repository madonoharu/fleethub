import React from "react"
import styled from "styled-components"
import copy from "copy-to-clipboard"

import { Container } from "@material-ui/core"
import LinkIcon from "@material-ui/icons/Link"
import FileCopyIcon from "@material-ui/icons/FileCopy"
import DeleteIcon from "@material-ui/icons/Delete"

import { MenuList, MenuItemProps, CopyTextButton } from "../../../components"
import { useFile, usePublishFile, useSnackbar } from "../../../hooks"

import { Input } from "../../atoms"
import { useAsyncCallback } from "react-async-hook"

type Props = {
  id: string
}

const FolderMenu: React.FC<Props> = ({ id }) => {
  const { file, actions } = useFile(id)

  const publish = usePublishFile(id)
  const Snackbar = useSnackbar()

  const asyncOnLinkClick = useAsyncCallback(
    async () => {
      const url = await publish()
      const result = copy(url)
      if (!result) throw new Error("Failed to copy")

      return url
    },
    {
      onSuccess: () => Snackbar.show({ message: "共有URLをコピーしました", severity: "success" }),
      onError: (error) => {
        console.error(error)
        Snackbar.show({ message: "失敗しました", severity: "error" })
      },
    }
  )

  if (file?.type !== "folder") return null

  const handleNameChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    actions.update({ name: event.currentTarget.value })
  }

  const url = asyncOnLinkClick.result

  const list: MenuItemProps[] = [
    {
      icon: <LinkIcon />,
      text: "共有URLをコピーする",
      onClick: asyncOnLinkClick.execute,
      disabled: asyncOnLinkClick.loading,
    },
    { icon: <FileCopyIcon />, text: "コピーする", onClick: actions.copy },
    { icon: <DeleteIcon />, text: "削除する", onClick: actions.remove },
  ]

  return (
    <Container>
      <Input startLabel="name" value={file.name} onChange={handleNameChange} />
      <MenuList list={list} />
      {url && <Input variant="outlined" value={url} InputProps={{ endAdornment: <CopyTextButton value={url} /> }} />}
      <Snackbar />
    </Container>
  )
}

export default FolderMenu
