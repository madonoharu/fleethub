import React from "react"
import { fhSystem } from "@fleethub/core"

const fhSystemContext = React.createContext(fhSystem)

export const useFhSystem = () => {
  return React.useContext(fhSystemContext)
}
