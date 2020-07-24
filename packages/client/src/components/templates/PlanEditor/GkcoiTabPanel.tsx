import React, { useMemo } from "react"
import styled from "styled-components"
import { Plan } from "@fleethub/core"
import { bindActionCreators } from "@reduxjs/toolkit"
import { useSelector, useDispatch } from "react-redux"

import { Paper, Button, Link } from "@material-ui/core"

import { Select, ReactGkcoi } from "../../../components"
import { getGkcoiDeck, GkcoiThemes, GkcoiTheme, GkcoiLangs, GkcoiLang } from "../../../utils"
import { selectGkcoiState, gkcoiSlice, filesSelectors } from "../../../store"

import { GithubIcon, Flexbox } from "../../atoms"

const OptionContainer = styled(Flexbox)`
  > :first-child {
    margin-right: auto;
  }
  > * {
    min-width: 120px;
  }
  margin-bottom: 8px;
`

const StyledPaper = styled(Paper)`
  padding: 0 8px;
  min-height: 480px;
`

const themeDict: Record<GkcoiTheme, string> = {
  dark: "Dark",
  "dark-ex": "遠征 dark-ex",
  official: "公式 official",
  "74lc": "七四式(大型) 74lc",
  "74mc": "七四式(中型) 74mc",
  "74sb": "七四式(小型) 74sb",
}
const getThemeLabel = (theme: GkcoiTheme) => themeDict[theme]

const langDict: Record<GkcoiLang, string> = {
  jp: "日本語",
  en: "English",
  kr: "한국어",
  scn: "中文(简体)",
}
const getLangLabel = (lang: GkcoiLang) => langDict[lang]

const useGkcoiState = () => {
  const state = useSelector(selectGkcoiState)
  const dispatch = useDispatch()
  const actions = useMemo(() => bindActionCreators(gkcoiSlice.actions, dispatch), [dispatch])

  return { state, actions }
}

type Props = {
  id: string
  plan: Plan
}

const GkcoiTabPanel: React.FCX<Props> = ({ className, id, plan }) => {
  const { state, actions } = useGkcoiState()
  const cmt = useSelector((state) => filesSelectors.selectById(state, id)?.description)

  const deck = useMemo(() => {
    return getGkcoiDeck(plan, { ...state, cmt })
  }, [plan, state, cmt])

  return (
    <StyledPaper className={className}>
      <OptionContainer>
        <Button startIcon={<GithubIcon />} component={Link} href="https://github.com/Nishisonic/gkcoi">
          Nishisonic/gkcoi
        </Button>

        <Select
          label="Theme"
          variant="outlined"
          options={GkcoiThemes}
          value={state.theme}
          onChange={actions.setTheme}
          getOptionLabel={getThemeLabel}
        />
        <Select
          label="Language"
          variant="outlined"
          options={GkcoiLangs}
          value={state.lang}
          onChange={actions.setLang}
          getOptionLabel={getLangLabel}
        />
      </OptionContainer>

      <ReactGkcoi deck={deck} />
    </StyledPaper>
  )
}

export default styled(GkcoiTabPanel)`
  margin-top: 8px;
`
