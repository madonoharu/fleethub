import React from "react"
import styled from "styled-components"
import { useTranslation } from "react-i18next"

import AppBar from "@material-ui/core/AppBar"
import Box from "@material-ui/core/Box"
import MuiButton from "@material-ui/core/Button"

import { Link, Select } from "../../../components"

import LanguageSelect from "./LanguageSelect"

const Component: React.FCX = ({ className }) => {
  const { t } = useTranslation()

  const paths = [
    { to: "/", children: t("home") },
    { to: "/gears", children: t("gears") },
    { to: "/ships", children: t("ships") },
  ]

  return (
    <AppBar className={className} position="sticky">
      <Box display="flex" justifyContent="end" width="100%">
        {paths.map((path) => (
          <Link key={path.to} {...path} />
        ))}
        <LanguageSelect />
      </Box>
    </AppBar>
  )
}

export default styled(Component)`
  display: flex;
  flex-direction: row;

  ${({ theme }) => theme.acrylic}

  > * {
    color: white;
  }
  ${LanguageSelect} {
    flex-grow: 10;
  }
`
