import { log, updateData, updateImages } from "./data"

type ClientPayload = {
  type: string
}

const getClientPayload = (): ClientPayload => {
  const { CLIENT_PAYLOAD } = process.env

  const payload = CLIENT_PAYLOAD && JSON.parse(CLIENT_PAYLOAD)

  if (!payload || !payload.type) {
    throw Error("CLIENT_PAYLOAD.type is not found")
  }

  return payload
}

const getErrorMessage = (error: unknown) => {
  if (error instanceof Error) return error.message
  if (typeof error === "string") return error
  return "Unknown error"
}

const main = async () => {
  const type = getClientPayload()?.type

  try {
    await log(`${type}: Start`)

    if (type === "update_data") {
      await updateData()
    }

    if (type === "update_images") {
      await updateImages()
    }

    await log(`${type}: Success`)
  } catch (error) {
    log(getErrorMessage(error))
  }
}

main()
