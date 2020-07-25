import React from "react"
import { Plan } from "@fleethub/core"
import styled from "styled-components"
import { useDispatch, useSelector } from "react-redux"
import { useAsyncCallback } from "react-async-hook"

import { Typography } from "@material-ui/core"

import { useSnackbar, useFhSystem } from "../../../hooks"
import { fetchUrlData } from "../../../utils"
import { filesSlice, appSlice, selectAppState } from "../../../store"

import { Flexbox, Divider, Checkbox } from "../../atoms"
import { ImportButton, TextField } from "../../molecules"

const StyledDivider = styled(Divider)`
  margin-top: 8px;
`

type Props = {
  onClose?: () => void
}

const ImportMenu: React.FCX<Props> = ({ className, onClose }) => {
  const [deckStr, setDeckStr] = React.useState("")
  const [urlStr, setUrlStr] = React.useState("")

  const Snackbar = useSnackbar()

  const importToTemp = useSelector((state) => selectAppState(state).importToTemp)
  const dispatch = useDispatch()

  const fh = useFhSystem()

  const handleImportToTempChange = (value: boolean) => {
    dispatch(appSlice.actions.setImportToTemp(value))
  }

  const parseDeck = (str: string): Plan | undefined => {
    try {
      const deck = JSON.parse(str)
      return fh.createPlanByDeck(deck)
    } catch {
      return
    }
  }

  const to = importToTemp ? "temp" : "root"

  const handleDeckImport = () => {
    const plan = parseDeck(deckStr)

    if (!plan) {
      Snackbar.show({ message: "失敗しました", severity: "error" })
      return
    }

    dispatch(filesSlice.actions.createPlan({ plan: plan.state, to }))
    onClose?.()
  }

  const asyncOnUrlImport = useAsyncCallback(
    async () => {
      const data = await fetchUrlData(urlStr)

      if (data) {
        dispatch(filesSlice.actions.add({ data, to }))
        onClose?.()
      } else {
        Snackbar.show({ message: "失敗しました", severity: "error" })
      }
    },
    {
      onError: () => Snackbar.show({ message: "失敗しました", severity: "error" }),
    }
  )

  return (
    <div className={className}>
      <Flexbox>
        <Typography variant="subtitle1">編成を読み込む</Typography>
      </Flexbox>

      <Checkbox label="一時領域に保存" checked={importToTemp} onChange={handleImportToTempChange} />

      <StyledDivider label="デッキビルダー形式から" />
      <Flexbox>
        <TextField variant="outlined" value={deckStr} onChange={setDeckStr} />
        <ImportButton onClick={handleDeckImport} />
      </Flexbox>

      <StyledDivider label="共有URLから" />
      <Flexbox>
        <TextField variant="outlined" value={urlStr} onChange={setUrlStr} />
        <ImportButton onClick={asyncOnUrlImport.execute} disabled={asyncOnUrlImport.loading} />
      </Flexbox>

      <Snackbar />
    </div>
  )
}

export default styled(ImportMenu)`
  padding: 8px;
`
