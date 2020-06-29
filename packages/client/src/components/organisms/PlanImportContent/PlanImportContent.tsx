import React from "react"
import { Plan } from "@fleethub/core"
import styled from "styled-components"

import { TextField, Button } from "@material-ui/core"

import { useSnackbar, useFhSystem } from "../../../hooks"

type Props = {
  onOverwrite?: (plan: Plan) => void
  onImport?: (plan: Plan) => void
}
const PlanImportContent: React.FCX<Props> = ({ className, onOverwrite, onImport }) => {
  const [str, setStr] = React.useState("")
  const Snackbar = useSnackbar()

  const fh = useFhSystem()

  const parseDeck = (str: string): Plan | undefined => {
    try {
      const deck = JSON.parse(str)
      return fh.createPlanByDeck(deck)
    } catch {
      Snackbar.show({ message: "読み込みに失敗しました", severity: "error" })
      return
    }
  }

  const handleOverwrite = () => {
    const plan = parseDeck(str)
    if (plan) onOverwrite?.(plan)
  }

  const handleImport = () => {
    const plan = parseDeck(str)
    if (plan) onImport?.(plan)
  }

  return (
    <div className={className}>
      <TextField label="デッキビルダー形式" value={str} onChange={(event) => setStr(event.currentTarget.value)} />
      <Button onClick={handleOverwrite}>現在の編成に上書き</Button>
      <Button onClick={handleImport}>新しい編成を作成</Button>

      <Snackbar />
    </div>
  )
}

export default styled(PlanImportContent)`
  padding: 8px;
`
