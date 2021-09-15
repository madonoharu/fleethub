import { ImageLoader } from "next/image";

const cloudName = "djg1epjdj";

export const cloudinaryLoader: ImageLoader = ({ src, width }) =>
  src === ""
    ? ""
    : `https://res.cloudinary.com/${cloudName}/image/upload/c_scale,f_auto,q_auto,w_${width}/${src}`;
