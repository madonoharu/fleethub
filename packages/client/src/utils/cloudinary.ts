export type CloudinaryOptions = {
  publicId: string | number
  folder: string
  width: number
  height: number
}

const cloudName = "djg1epjdj"

export const getCloudinaryUrl = ({ publicId, folder, width, height }: CloudinaryOptions) =>
  `https://res.cloudinary.com/${cloudName}/image/upload/c_scale,f_auto,q_auto,w_${width},h_${height}/${folder}/${publicId}.png`
