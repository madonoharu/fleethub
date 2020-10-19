import signale from "signale"
import { MasterDataClient } from "./data"

type ClientPayload = {
  type?: string
}

const getClientPayload = (): ClientPayload | undefined => {
  const { CLIENT_PAYLOAD } = process.env
  if (!CLIENT_PAYLOAD) return

  try {
    return JSON.parse(CLIENT_PAYLOAD)
  } catch {
    return
  }
}

const clinet = new MasterDataClient()

const main = async () => {
  const type = getClientPayload()?.type

  if (!type) {
    signale.error("type is not found")
    return
  }

  if (type === "update") {
    await clinet.update()
  }
}

try {
  main()
} catch (error) {
  clinet.error(error)
}
