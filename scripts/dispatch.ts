import signale from "signale"
import * as data from "./data"

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

const main = async () => {
  const type = getClientPayload()?.type

  if (!type) {
    signale.error("type is not found")
    return
  }

  data.sendMessage(`start ${type}`)
  if (type === "upload") {
    data.upload()
  } else if (type === "update") {
    data.update()
  } else if (type === "import") {
    data.importStart2()
  }
  data.sendMessage(`success ${type}`)
}

try {
  main()
} catch (error) {
  data.sendError(error)
}
