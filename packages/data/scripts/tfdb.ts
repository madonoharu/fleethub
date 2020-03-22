import axios from "axios"

const getTfdb = async (type: string) => {
  const res = await axios.get<string>(
    `https://raw.githubusercontent.com/TeamFleet/WhoCallsTheFleet-DB/master/db/${type}.nedb`
  )

  return res.data
    .split("\n")
    .filter(str => str !== "")
    .map(str => JSON.parse(str))
}

type TfdbShip = {
  id: number
}

export const getTfdbShips = () => getTfdb("ships") as Promise<TfdbShip[]>

type TfdbGear = {
  id: number
  improvable?: boolean
}

export const getTfdbGears = () => getTfdb("items") as Promise<TfdbGear[]>
