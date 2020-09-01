import axios from "axios"

const getTfdb = async <T>(type: string) => {
  const res = await axios.get<string>(
    `https://raw.githubusercontent.com/TeamFleet/WhoCallsTheFleet-DB/master/db/${type}.nedb`
  )

  return res.data
    .split("\n")
    .filter((str) => str !== "")
    .map((str) => JSON.parse(str) as T)
}

type TfdbShip = {
  id: number
}

export const getTfdbShips = () => getTfdb<TfdbShip>("ships")

type TfdbGear = {
  id: number
  improvable?: boolean
}

export const getTfdbGears = () => getTfdb<TfdbGear>("items")
