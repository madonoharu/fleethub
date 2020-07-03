import imagemin from "imagemin"
import imageminWebp from "imagemin-webp"

const paths = ["filters", "gears", "proficiency", "stats", "icons"]

paths.forEach((path) => {
  imagemin([`packages/client/src/images/png/${path}/*.png`], {
    destination: `packages/client/src/images/webp/${path}`,
    plugins: [imageminWebp({ method: 6 })],
  })
})

imagemin([`private/ships/*.png`], {
  destination: `packages/client/src/images/webp/ships`,
  plugins: [imageminWebp({ method: 6, resize: { width: 160, height: 40 } })],
})
