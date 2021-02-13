import React from "react"
import styled from "@emotion/styled"
import { useTranslation } from "react-i18next"

import { allLanguages, getLanguageName } from "../../../i18n"

import { Select } from "../../molecules"

const LanguageSelect: React.FCX = ({ className }) => {
  const { i18n } = useTranslation()
  const handleChange = React.useCallback((lng: string) => i18n.changeLanguage(lng), [i18n])
  return (
    <Select
      className={className}
      options={allLanguages}
      value={i18n.language}
      onChange={handleChange}
      getOptionLabel={getLanguageName}
    />
  )
}

export default styled(LanguageSelect)``
