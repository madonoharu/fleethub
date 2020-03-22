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

  const improvableIds = tfdbGears.filter(gear => gear.improvable).map(gear => gear.id)

  await writeTypes(start2)
  await writeShips(start2)
  await writeGears(start2, improvableIds)
  await writeEquippable(start2)
}

update()
