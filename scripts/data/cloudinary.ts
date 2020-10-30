import { getResourceUrl, getCommonIconWeaponUrl, CommonIconWeapon, Start2 } from "kc-tools"
import cloudinary from "cloudinary"
import ky from "ky-universal"

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

  const url = getResourceUrl({ id, resourceType, imageType })

  const res = await cloudinary.v2.uploader
    .upload(url, {
      folder: "ships",
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
      if (Number.isFinite(id)) bannerIds[id] = resource.filename
    })
  })

  return bannerIds
}

export const updateShipBanners = async (start2: Start2) => {
  const bannerIds = await getBannerIds()

  const exists = (id: number) => Boolean(bannerIds[id])

  for (const { api_id: id, api_name: name } of start2.api_mst_ship.map((ship) => ship)) {
    if (exists(id)) continue

    const res = await uploadShipBanner(id)
    console.log(`add ${name}`)
    if (res) bannerIds[id] = res.public_id
  }

  return bannerIds
}

export const updateGearIcons = async () => {
  const commonIconWeaponUrl = getCommonIconWeaponUrl()

  const { frames }: CommonIconWeapon = await ky.get(commonIconWeaponUrl.json).json()
  const searchRes: SearchApiResponse = await cloudinary.v2.search.expression("gear_icons").max_results(500).execute()

  const exsits = (public_id: string) => searchRes.resources.some((resource) => resource.public_id === public_id)

  for (const [key, value] of Object.entries(frames)) {
    const id = key.replace("common_icon_weapon_id_", "")
    const public_id = `gear_icons/${id}.png`

    if (exsits(public_id)) continue

    const { w, h, x, y } = value.frame
    const width = 40
    const height = 40
    const cx = x + Math.floor(w / 2)
    const cy = y + Math.floor(h / 2)

    await cloudinary.v2.uploader.upload(commonIconWeaponUrl.png, {
      public_id,
      transformation: { width, height, x: cx - width / 2, y: cy - height / 2, crop: "crop" },
    })
  }
}