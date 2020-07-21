import React, { Suspense } from "react"
import { DndProvider } from "react-dnd"
import { HTML5Backend } from "react-dnd-html5-backend"

import "./i18n"
import { StoreProvider } from "./store"
import { ThemeProvider } from "./styles"

const AppContent = React.lazy(() => import("./components/templates/AppContent"))

const App: React.FC = () => (
  <StoreProvider>
    <DndProvider backend={HTML5Backend}>
      <ThemeProvider>
        <Suspense fallback={"loading"}>
          <AppContent />
        </Suspense>
      </ThemeProvider>
    </DndProvider>
  </StoreProvider>
)

export default App
