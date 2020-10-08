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

const type = getClientPayload()?.type

if (type === "upload") {
  data.upload()
} else if (type === "update") {
  data.update()
} else if (type === "import") {
  data.importStart2()
}
