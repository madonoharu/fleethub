import { MasterDataClient } from "./data"

type ClientPayload = {
  type: string
}

const getClientPayload = (): ClientPayload | undefined => {
  const { CLIENT_PAYLOAD } = process.env

  const payload = CLIENT_PAYLOAD && JSON.parse(CLIENT_PAYLOAD)

  if (!payload || !payload.type) {
    throw Error("CLIENT_PAYLOAD.type is not found")
  }

  return payload
}

const clinet = new MasterDataClient()

const main = async () => {
  const type = getClientPayload()?.type

  await clinet.log(`${type}: Start`)

  if (type === "update_data") {
    await clinet.updateData()
  }

  if (type === "update_images") {
    await clinet.updateImages()
  }

  await clinet.log(`${type}: Success`)
}

main().catch((err) => {
  clinet.error(err)
})
