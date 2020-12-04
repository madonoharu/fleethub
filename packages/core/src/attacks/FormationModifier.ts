import { mapValues, uncapitalize } from "@fleethub/utils"
import { FleetType, Formation } from "../common"
import { fhDefinitions } from "../FhDefinitions"

export const getFormationModifiers = (params: {
  formation: Formation
  position: "TopHalf" | "BottomHalf"
  enemyFleetType: FleetType
  isNightBattle?: boolean
}) => {
  const { formation, position } = params

  const { protectionRate, fleetAntiAir, ...rest } = fhDefinitions.formations[formation]

  const modifiers = mapValues(rest, (value) => {
    if ("topHalf" in value) {
      return value[uncapitalize(position)]
    }
    return value
  })

  return {
    protectionRate,
    fleetAntiAir,
    ...modifiers,
  }
}
