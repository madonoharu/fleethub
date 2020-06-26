import React from "react"

import { DndProvider } from "react-dnd"
import { HTML5Backend } from "react-dnd-html5-backend"

import { GatsbyBrowser } from "gatsby"

import "./i18n"

import { StoreProvider } from "./store"
import { ThemeProvider } from "./theme"

export const wrapRootElement: GatsbyBrowser["wrapRootElement"] = ({ element }) => {
  return (
    <StoreProvider>
      <DndProvider backend={HTML5Backend}>
        <ThemeProvider>{element}</ThemeProvider>
      </DndProvider>
    </StoreProvider>
  )
}
