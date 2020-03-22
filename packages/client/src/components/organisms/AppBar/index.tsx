import React from "react"
import styled from "styled-components"

import AppBar from "@material-ui/core/AppBar"
import MuiButton from "@material-ui/core/Button"

import { Link } from "../../../components"

const appBarHeight = 32

type Props = {}

const Component: React.FC<Props> = () => {
  const paths = [
    { to: "/", children: "home" },
    { to: "/gears", children: "/gears" },
    { to: "/ships", children: "ships" },
    { to: "/gears", children: "/gears" },
  ]

  return (
    <AppBar position="sticky">
      {paths.map((path) => (
        <Link key={path.to} {...path} />
      ))}
    </AppBar>
  )
}

export default Component
