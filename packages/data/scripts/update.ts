import signale from "signale"

import { getTfdbGears } from "./tfdb"
import { getStart2 } from "./start2"
import { writeShips } from "./ships"
import { writeTypes } from "./types"
import { writeGears } from "./gears"
import { writeEquippable } from "./equippable"

signale.config({ displayFilename: true })

const update = async () => {
  const start2 = await getStart2()
  const tfdbGears = await getTfdbGears()

  const improvableIds = tfdbGears.filter((gear) => gear.improvable).map((gear) => gear.id)

  writeTypes(start2)
  writeShips(start2)
  writeGears(start2, improvableIds)
  writeEquippable(start2)
}

update()
