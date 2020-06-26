import React from "react"
import { DndProvider } from "react-dnd"
import { HTML5Backend } from "react-dnd-html5-backend"

import "./i18n"
import { StoreProvider } from "./store"
import { ThemeProvider } from "./theme"
import { AppContent } from "./components"

const App: React.FC = () => (
  <StoreProvider>
    <DndProvider backend={HTML5Backend}>
      <ThemeProvider>
        <AppContent />
      </ThemeProvider>
    </DndProvider>
  </StoreProvider>
)

export default App
