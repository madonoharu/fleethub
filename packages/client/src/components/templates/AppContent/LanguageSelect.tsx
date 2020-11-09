import React from "react"
import styled from "@emotion/styled"
import { useTranslation } from "react-i18next"

import { Select } from "../../../components"

const LanguageSelect: React.FCX = ({ className }) => {
  const { i18n } = useTranslation()
  const handleChange = React.useCallback((lng: string) => i18n.changeLanguage(lng), [i18n])
  const languages = Object.keys(i18n.options.resources ?? {})
  return <Select className={className} options={languages} value={i18n.language} onChange={handleChange} />
}

export default styled(LanguageSelect)`
  height: 24px;
`
