import { getResourceUrl, servers } from "kc-tools"
import cloudinary from "cloudinary"
import immer from "immer"

import { fetchStart2 } from "./start2"
import storage from "./storage"

cloudinary.v2.config({
  cloud_name: "djg1epjdj",
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
})

const btoa = (str: string) => Buffer.from(str, "binary").toString("base64")

const uploadJson = (object: Record<string, unknown>, options?: cloudinary.UploadApiOptions) =>
  cloudinary.v2.uploader.upload(`data:application/json;base64,${btoa(JSON.stringify(object))}`, {
    resource_type: "raw",
    ...options,
  })

const uploadShipBanner = async (id: number) => {
  const resourceType = "ship"
  const imageType = "banner"

  const { ip } = servers[id % servers.length]

  const url = getResourceUrl({ ip, id, resourceType, imageType })

  const res = await cloudinary.v2.uploader
    .upload(url, {
      tags: [resourceType, imageType],
      eval: `upload_options.public_id = resource_info.phash; upload_options.overwrite = false;`,
    })
    .catch((err: cloudinary.UploadApiErrorResponse) => {
      console.error(err.message)
    })

  if (!res) return

  await cloudinary.v2.uploader.add_tag(id.toString(), [res.public_id])

  return res
}

type SearchApiResponse = {
  resources: cloudinary.ResourceApiResponse["resources"][0][]
  next_cursor?: string
}

const getBannerIds = async () => {
  const search = cloudinary.v2.search.expression("ship").with_field("tags").max_results(500)

  let res: SearchApiResponse = await search.execute()
  const resources = res.resources

  while (res.next_cursor) {
    res = await search.next_cursor(res.next_cursor).execute()
    resources.push(...res.resources)
  }

  const bannerIds: Record<string, string> = {}

  resources.forEach((resource) => {
    if (!resource.tags.includes("banner")) return
    resource.tags.forEach((tag) => {
      const id = Number(tag)
      if (Number.isFinite(id)) bannerIds[id] = resource.public_id
    })
  })

  return bannerIds
}

export const updateImage = async () => {
  const bannerIds = await getBannerIds()
  const start2 = await fetchStart2()

  const exists = (id: number) => Boolean(bannerIds[id])

  for (const { api_id: id, api_name: name } of start2.api_mst_ship.map((ship) => ship)) {
    if (exists(id)) continue

    const res = await uploadShipBanner(id)
    console.log(`upload ${name}`)
    if (res) bannerIds[id] = res.public_id
  }

  const { ships } = await storage.read()
  const next = immer(ships, (draft) => {
    draft.forEach((ship) => {
      ship.banner = bannerIds[ship.id] || ""
    })
  })

  if (ships !== next) {
    storage.write({ ships: next })
  }
}
