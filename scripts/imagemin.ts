import imagemin from "imagemin"
import imageminWebp from "imagemin-webp"

imagemin(["images/*.{jpg,png,icon}"], {
  destination: "build/images",
  plugins: [imageminWebp({ method: 6, resize: { width: 32, height: 32 } })],
})
