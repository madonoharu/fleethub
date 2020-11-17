import { outputJSON } from "fs-extra"
import ky from "ky-universal"
import storage from "./data/storage"
import child_process from "child_process"
import { promisify } from "util"
import { MasterData } from "@fleethub/utils/src"

const exec = promisify(child_process.exec)

type Dictionary = Partial<Record<string, string>>

type Language = { code: string; path?: string }
const languages: Language[] = [
  { code: "ja", path: "jp" },
  { code: "en" },
  { code: "ko", path: "kr" },
  { code: "zh-CN", path: "scn" },
  { code: "zh-TW", path: "tcn" },
]

class LocaleUpdater {
  public kc3: typeof ky

  constructor(private md: MasterData, private language: Language) {
    const { path, code } = language

    this.kc3 = ky.extend({
      prefixUrl: `https://raw.githubusercontent.com/KC3Kai/kc3-translations/master/data/${path || code}`,
    })
  }

  public getKC3Json = async <T = unknown>(filename: string) => {
    const text = await this.kc3.get(filename).text()
    return JSON.parse(text.replace(/^\ufeff/, "")) as T
  }

  public output = async (filename: string, data: unknown) => {
    await outputJSON(`packages/client/public/locales/${this.language.code}/${filename}`, data)
  }

  public updateShips = async () => {
    type KC3Ships = Record<string, string>
    type KC3ShipAffixes = { suffixes: Record<string, string> }

    const [kc3Ships, kc3ShipAffixes] = await Promise.all([
      this.getKC3Json<KC3Ships>("ships.json"),
      this.getKC3Json<KC3ShipAffixes>("ship_affix.json"),
    ])

    const dictionary: Dictionary = {}

    this.md.ships.forEach(({ name }) => {
      let translated = name
      Object.entries(kc3Ships).forEach(([key, value]) => {
        translated = translated.replace(RegExp(`^${key}`), value)
      })

      Object.entries(kc3ShipAffixes.suffixes).forEach(([key, value]) => {
        translated = translated.replace(key, value)
      })

      dictionary[name] = translated.replace("{ -}?", "")
    })

    await this.output("ships.json", dictionary)
  }

  public updateGears = async () => {
    const dictionary = await this.getKC3Json<Dictionary>("items.json")
    await this.output("gears.json", dictionary)
  }

  public updateGearCategories = async () => {
    const equiptype = await this.getKC3Json<string[][]>("equiptype.json")
    const dictionary: Dictionary = {}

    this.md.gearCategories.forEach((category) => {
      const str = equiptype[2][category.id]
      if (str) {
        dictionary[category.name] = str
      }
    })

    await this.output("gearCategories.json", dictionary)
  }

  public updateTerms = async () => {
    const kc3Terms = await this.getKC3Json<Dictionary>("terms.json")

    const dictionary: Dictionary = {
      maxHp: kc3Terms["ShipHp"],
      firepower: kc3Terms["ShipFire"],
      torpedo: kc3Terms["ShipTorpedo"],
      antiAir: kc3Terms["ShipAntiAir"],
      armor: kc3Terms["ShipArmor"],
      evasion: kc3Terms["ShipEvasion"],
      asw: kc3Terms["ShipAsw"],
      los: kc3Terms["ShipLos"],
      luck: kc3Terms["ShipLuck"],
      speed: kc3Terms["ShipSpeed"],
      range: kc3Terms["ShipLength"],
      morale: kc3Terms["ShipMorale"],
      accuracy: kc3Terms["ShipAccuracy"],
      radius: kc3Terms["ShipRadius"],
      bombing: kc3Terms["ShipBombing"],
      fuel: kc3Terms["ShipFuel"],
      ammo: kc3Terms["ShipAmmo"],
      antiBomber: kc3Terms["ShipAccAntiBomber"],
      interception: kc3Terms["ShipEvaInterception"],
      cost: kc3Terms["ShipDeployCost"],

      Single: kc3Terms["CombinedNone"],
      CarrierTaskForce: kc3Terms["CombinedCarrier"],
      SurfaceTaskForce: kc3Terms["CombinedSurface"],
      TransportEscort: kc3Terms["CombinedTransport"],
      Combined: kc3Terms["CombinedFleet"],

      LineAhead: kc3Terms["SettingsForLineAhead"],
      DoubleLine: kc3Terms["SettingsForDoubleLine"],
      Diamond: kc3Terms["SettingsForDiamond"],
      Echelon: kc3Terms["SettingsForEchelon"],
      LineAbreast: kc3Terms["SettingsForLineAbreast"],
      Vanguard: kc3Terms["SettingsForVanguard"],
      Cruising1: kc3Terms["SettingsForCombAntiSub"],
      Cruising2: kc3Terms["SettingsForCombForward"],
      Cruising3: kc3Terms["SettingsForCombDiamond"],
      Cruising4: kc3Terms["SettingsForCombBattle"],
    }

    await this.output("terms.json", dictionary)
  }

  public updateShipTypes = async () => {
    const shipTypes: Dictionary = {}
    const kc3stype = await this.getKC3Json<string[]>("stype.json")

    this.md.shipTypes.forEach((type) => {
      shipTypes[type.name] = kc3stype[type.id]
    })

    await this.output("shipTypes.json", shipTypes)
  }

  public updateShipClasses = async () => {
    const shipClasses: Dictionary = {}
    const kc3ctype = await this.getKC3Json<string[]>("ctype.json")

    this.md.shipClasses.forEach((shipClass) => {
      const name = kc3ctype[shipClass.id]
      if (name) {
        shipClasses[shipClass.name] = kc3ctype[shipClass.id]
      }
    })

    await this.output("shipClasses.json", shipClasses)
  }

  public update = async () => {
    await Promise.all([
      this.updateGears(),
      this.updateGearCategories(),
      this.updateShips(),
      this.updateShipTypes(),
      this.updateShipClasses(),
      this.updateTerms(),
    ])
  }
}

const updateLocales = async () => {
  const md = await storage.read()
  const promises = languages.map((lang) => new LocaleUpdater(md, lang).update())

  await Promise.all(promises)
  await exec("yarn prettier --write packages/client/public/locales")
}

updateLocales()
