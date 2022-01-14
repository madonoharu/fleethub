import child_process from "child_process";
import { promisify } from "util";

import { storage } from "@fh/admin/src";
import { nonNullable, uniq } from "@fh/utils/src";
import { MasterData } from "fleethub-core";
import fs from "fs-extra";
import got from "got";

const exec = promisify(child_process.exec);

type Dictionary = Partial<Record<string, string>>;

type LanguageCode = typeof languages[number]["code"];
type Language = { code: LanguageCode; kc3?: string; poi?: string };

type KC3Ships = Record<string, string>;
type KC3ShipAffix = {
  suffixes: Dictionary;
  byId: Dictionary;
  ctype: Dictionary;
};
// eslint-disable-next-line @typescript-eslint/no-unused-vars
type KC3Battle = {
  airbattle: string[][];
  engagement: string[][];
  cutinDay: string[];
  cutinNight: string[];
};

function uniqDictionary(dict: Dictionary): Dictionary {
  const state = new Map<string, string>();

  const entries = Object.entries(dict)
    .filter((entry): entry is [string, string] => nonNullable(entry[1]))
    .map(([key, value]) => {
      const duplicatedKey = state.get(value);

      if (duplicatedKey) {
        return [key, `$t(${duplicatedKey})`] as const;
      }

      state.set(value, key);
      return [key, value] as const;
    });

  return Object.fromEntries(entries);
}

const languages = [
  { code: "ja", kc3: "jp", poi: "ja-JP" },
  { code: "en", poi: "en-US" },
  { code: "ko", kc3: "kr", poi: "ko-KR" },
  { code: "zh-CN", kc3: "scn" },
  { code: "zh-TW", kc3: "tcn" },
] as const;

class LocaleUpdater {
  private kc3: typeof got;
  private tsun: typeof got;
  private poi: typeof got;
  private code: LanguageCode;
  private path: string;

  constructor(private md: MasterData, private language: Language) {
    this.code = language.code;

    this.kc3 = got.extend({
      prefixUrl: `https://raw.githubusercontent.com/KC3Kai/kc3-translations/master/data/${
        language.kc3 || this.code
      }`,
    });

    this.tsun = got.extend({
      prefixUrl: `https://raw.githubusercontent.com/planetarian/TsunKitTranslations/main/${this.code}`,
    });

    this.poi = got.extend({
      prefixUrl: `https://raw.githubusercontent.com/poooi/poi/master/i18n`,
    });

    this.path = `packages/site/public/locales/${this.code}`;
  }

  private async getKC3Json<T = unknown>(filename: string) {
    const text = await this.kc3.get(filename).text();
    return JSON.parse(text.replace(/^\ufeff/, "").replaceAll("{ -}?", "")) as T;
  }

  private async getKcnavJson() {
    const kcnav = await this.tsun
      .get("kcnav.json")
      .json<Record<string, string>>();

    Object.entries(kcnav).forEach(([key, value]) => {
      const result = /\[\[(.+)\]\]/.exec(value);

      if (result) {
        kcnav[key] = kcnav[result[1]];
      }
    });

    return kcnav;
  }

  private async getPoiJson<T = unknown>(dir: string) {
    const json = await this.poi
      .get(`${dir}/${this.language.poi || this.language.code}.json`)
      .json<T>();
    return json;
  }

  private async merge(filename: string, data: Record<string, unknown>) {
    const path = `${this.path}/${filename}`;
    const current: Record<string, unknown> = await fs.readJSON(path);
    await fs.outputJSON(path, { ...current, ...data });
  }

  private async output(filename: string, data: unknown) {
    const path = `${this.path}/${filename}`;
    await fs.outputJSON(path, data);
  }

  private async importKC3(filename: string, outputName = filename) {
    const json = await this.getKC3Json(filename);
    await this.output(outputName, json);
  }

  private async updateCommon() {
    const kcnav = await this.getKcnavJson();

    const worldNames = Object.fromEntries(
      Object.entries(kcnav).filter(([key]) => /^worldName\d+/.test(key))
    );

    const nodeTypes = Object.fromEntries(
      Object.entries(kcnav).filter(([key]) => /^nodeType.+/.test(key))
    );

    // const base: Dictionary = {
    //   max_hp: kc3Terms["ShipHp"],
    //   firepower: kc3Terms["ShipFire"],
    //   torpedo: kc3Terms["ShipTorpedo"],
    //   anti_air: kc3Terms["ShipAntiAir"],
    //   armor: kc3Terms["ShipArmor"],
    //   evasion: kc3Terms["ShipEvasion"],
    //   asw: kc3Terms["ShipAsw"],
    //   los: kc3Terms["ShipLos"],
    //   luck: kc3Terms["ShipLuck"],
    //   speed: kc3Terms["ShipSpeed"],
    //   range: kc3Terms["ShipLength"],
    //   morale: kc3Terms["ShipMorale"],
    //   accuracy: kc3Terms["ShipAccuracy"],
    //   radius: kc3Terms["ShipRadius"],
    //   bombing: kc3Terms["ShipBombing"],
    //   fuel: kc3Terms["ShipFuel"],
    //   ammo: kc3Terms["ShipAmmo"],
    //   anti_bomber: kc3Terms["ShipAccAntiBomber"],
    //   interception: kc3Terms["ShipEvaInterception"],
    //   cost: kc3Terms["ShipDeployCost"],

    //   Ship: kcnav["termShip"],
    //   Fleet: kcnav["termFleet"],
    //   Lbas: kc3Terms["LodgerLbas"],
    //   Composition: kcnav["ribbonCompsTabName"],
    //   ShipClass: kcnav["termClass"],
    //   Difficulty: kcnav["termDifficulty"],
    //   Details: kcnav["termDetails"],
    //   Map: kcnav["termMap"],
    //   Enemies: kcnav["panelEnemiesTabName"],

    //   LbasDistance: kcnav["displayLBASDistanceLabel"],

    //   ElosNodeFactor: kc3Terms["PanelElosNodeFactor"].replace("{0}", ""),

    //   LandBaseFighterPower: kc3Terms["LandBaseFighterPower"],
    //   InterceptionPower: kc3Terms["LandBaseTipAirDefensePower"],
    //   HighAltitudeInterceptionPower: kc3Terms[
    //     "LandBaseTipHighAltitudeAirDefensePower"
    //   ].replace(": ≈{0}", ""),

    //   Engagement: kc3Terms["BattleEngangement"],
    //   Formation: kcnav["panelEnemiesFormationHeader"],
    //   Contact: kc3Terms["BattleContact"],
    //   AirBattle: kc3Terms["BattleAirBattle"],

    //   Reset: kc3Terms["SettingsReset"],
    //   ShipStatsCurrent: kc3Terms["SettingsShipStatsCurrent"],
    //   ShipStatsUnequipped: kc3Terms["SettingsShipStatsUnequipped"],

    //   WarfareShelling: kc3Terms["ShipWarfareShelling"],
    //   WarfareTorpedo: kc3Terms["ShipWarfareTorpedo"],
    //   WarfareAntiSub: kc3Terms["ShipWarfareAntisub"],
    //   WarfareAntiLand: kc3Terms["ShipWarfareAntiLand"],
    //   WarfareAerial: kc3Terms["ShipWarfareAerial"],

    //   AttackTypeDepthCharge: kc3Terms["ShipAttackTypeDepthCharge"],
    //   AttackTypeAirAttack: kc3Terms["ShipAttackTypeAirAttack"],
    //   AttackTypeTorpedo: kc3Terms["ShipAttackTypeTorpedo"],
    //   AttackTypeSingleAttack: kc3Terms["ShipAttackTypeSingleAttack"],
    //   AttackTypeNone: kc3Terms["ShipAttackTypeNone"],

    //   PhaseOpeningAsw: kc3Terms["ShipExtraPhaseOpeningASW"],
    //   PhaseOpeningTorpedo: kc3Terms["ShipExtraPhaseOpeningTorpedo"],
    //   PhaseClosingTorpedo: kc3Terms["ShipExtraPhaseClosingTorpedo"],
    //   PhaseOpeningAirStrike: kc3Terms["ShipExtraPhaseOpeningAirStrike"],
    //   PhaseOpeningJetAssault: kc3Terms["ShipExtraPhaseOpeningJetAssault"],
    // };

    await this.merge("common.json", {
      ...worldNames,
      ...nodeTypes,
    });
  }

  private async updateShipsAndCtype() {
    const [kc3Ships, kc3ShipAffixes, kc3Ctype] = await Promise.all([
      this.getKC3Json<KC3Ships>("ships.json"),
      this.getKC3Json<KC3ShipAffix>("ship_affix.json"),
      got(
        "https://raw.githubusercontent.com/KC3Kai/kc3-translations/master/data/en/ctype.json"
      ).json<string[]>(),
    ]);

    const kc3SuffixEntries = Object.entries(kc3ShipAffixes.suffixes);
    const suffixes = Object.keys(kc3ShipAffixes.suffixes);
    const re = RegExp(`(${suffixes.join("|")})+$`);

    const entries = this.md.ships
      .map(({ ship_id, name }) => {
        if (ship_id in kc3ShipAffixes.byId) {
          return [ship_id, kc3ShipAffixes.byId[ship_id] || ""] as const;
        }

        const baseName = name.replace(re, "");
        const suffix = name.replace(baseName, "");

        const translatedBaseName = Object.entries(kc3Ships).find(
          ([key]) => key === baseName
        )?.[1];

        if (!translatedBaseName) return undefined;

        let translatedSuffix = suffix;
        kc3SuffixEntries.forEach(([key, value]) => {
          if (value) {
            translatedSuffix = translatedSuffix.replace(key, value);
          }
        });

        const translated = `${translatedBaseName}${translatedSuffix}`;
        return [ship_id, translated] as const;
      })
      .filter(nonNullable);

    const ships = Object.fromEntries(entries);

    const ctypeBase = kc3Ctype.map((name) => {
      let translated = name;

      Object.entries(kc3Ships).forEach(([key, value]) => {
        if (name.startsWith(key)) {
          translated = name.replace(key, value);
        }
      });

      Object.entries(kc3ShipAffixes.ctype).forEach(([key, value]) => {
        if (value) {
          translated = translated.replace(key, value);
        }
      });

      return translated;
    });

    const ctypeEntries = uniq(this.md.ships.map((ship) => ship.ctype))
      .map((ctype): [number, string] | undefined => {
        let translated: string | undefined;

        if (ctype <= 1500) {
          translated = ctypeBase[ctype];
        } else {
          translated =
            ships[ctype] ||
            this.md.ships.find((ship) => ship.ship_id === ctype)?.name;
        }

        return translated ? [ctype, translated] : undefined;
      })
      .filter(nonNullable);

    const ctype = Object.fromEntries(ctypeEntries);

    await Promise.all([
      this.output("ships.json", uniqDictionary(ships)),
      this.output("ctype.json", ctype),
    ]);
  }

  private updateGearTypes = async () => {
    const equiptype = await this.getKC3Json<string[][]>("equiptype.json");
    await this.output("gear_types.json", equiptype[2]);
  };

  public update = async () => {
    await Promise.all([
      this.updateCommon(),
      this.updateShipsAndCtype(),
      this.updateGearTypes(),
      this.importKC3("stype.json"),
      this.importKC3("items.json", "gears.json"),
    ]);
  };
}

const updateLocales = async () => {
  const md: MasterData = await storage.readMasterData();
  const promises = languages.map((lang) =>
    new LocaleUpdater(md, lang).update()
  );

  await Promise.all(promises);
  await exec("yarn prettier --write packages/site/public/locales");
};

updateLocales().catch((err) => console.error(err));
