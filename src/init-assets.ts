import axios from "axios"
import { createWriteStream, existsSync, mkdirSync } from "node:fs"
import { getHeroList } from "./hero-list"
import { HeroDetails } from "./types/hero-detail"
import { getHeroDetails } from "./hero-details"

type Task = () => Promise<void>
type Tasks = Array<Task>

export const downloadFileTask =
  (
    path: string,
    hero: HeroDetails & { icon: string },
    imgType: "cover" | "gallery" | "icon"
  ) =>
  async () => {
    return new Promise<void>((resolve, reject) => {
      const url =
        imgType === "cover"
          ? hero.cover_picture
          : imgType === "icon"
          ? hero.icon
          : hero.gallery_picture

      axios
        .get(url, { responseType: "arraybuffer" })
        .then((resp) => {
          if (existsSync(path)) {
            console.log(`${path} exists, skipping download.`)
            return resolve()
          }
          console.log(`Downloading ${hero.name} ${imgType} image`)
          const output = createWriteStream(path)
          output.write(resp.data)
          output.close()
          resolve()
        })
        .catch((err) => reject(err))
    })
  }

export const initAssets = async () => {
  const folder = "./.cache"
  const tasks: Tasks = []
  if (!existsSync(folder)) {
    console.log("Cache not found, creating cache folder...")
    mkdirSync(folder)
  }

  const heroList = await getHeroList()

  const heroDetails = await Promise.all(
    heroList.map(async ({ heroid, key: icon }) => {
      const data = await getHeroDetails(heroid)

      return Object.assign(data, { icon })
    })
  )

  heroDetails.forEach((hero) => {
    const path = `${folder}/${hero.name}`
    const coverPath = `${path}-cover.jpg`
    const galleryPath = `${path}-gallery.jpg`
    const iconPath = `${path}-square.jpg`
    tasks.push(downloadFileTask(coverPath, hero, "gallery"))
    tasks.push(downloadFileTask(galleryPath, hero, "cover"))
    tasks.push(downloadFileTask(iconPath, hero, "icon"))
  })

  console.log(`Downloading ${tasks.length}`)
  const batchSize = 10

  // download assets by batch
  for (let i = 0; i < tasks.length; i = i + batchSize) {
    const currentTasks = tasks.slice(i, i + batchSize)
    await Promise.all(currentTasks.map((task) => task()))
  }
  console.log(`Downloading ${tasks.length} assets finished`)
}
