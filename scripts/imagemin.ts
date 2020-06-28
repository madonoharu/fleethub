import imagemin from "imagemin"
import imageminWebp from "imagemin-webp"

const paths = ["filters", "gears", "proficiency", "ships", "stats"]

paths.forEach((path) => {
  imagemin([`images/${path}/*.{jpg,png}`], {
    destination: `packages/client/quality/images/${path}`,
    plugins: [imageminWebp({ method: 6, quality: 100 })],
  })
})
