import child_process from "child_process";
import { promisify } from "util";

import { storage } from "@fh/admin/src";
import { nonNullable, uniq } from "@fh/utils/src";
import { DayCutin, FleetCutin, MasterData, NightCutin } from "fleethub-core";
import fs from "fs-extra";
import ky from "ky";
import mergeWith from "lodash/mergeWith";

const exec = promisify(child_process.exec);

type Dictionary<K extends string = string> = Partial<Record<K, string>>;

type LanguageCode = (typeof languages)[number]["code"];
type Language = { code: LanguageCode; kc3?: string };

type KC3Ships = Record<string, string>;
type KC3ShipAffix = {
  suffixes: Dictionary;
  byId: Dictionary;
  ctype: Dictionary;
};

type KC3Battle = {
  airbattle: string[][];
  engagement: string[][];
  cutinDay: string[];
  cutinNight: string[];
};

function pickBy(source: Record<string, string>, re: RegExp) {
  const result: Record<string, string> = {};

  Object.entries(source).forEach(([key, value]) => {
    const found = key.match(re);
    if (found) {
      result[found[0]] = value;
    }
  });

  return result;
}

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
  { code: "ja", kc3: "jp" },
  { code: "en" },
  { code: "ko", kc3: "kr" },
  { code: "zh-CN", kc3: "scn" },
  { code: "zh-TW", kc3: "tcn" },
] as const;

class LocaleUpdater {
  private kc3: typeof ky;
  private tsun: typeof ky;
  private code: LanguageCode;
  private path: string;

  constructor(
    private md: MasterData,
    private language: Language,
  ) {
    this.code = language.code;

    this.kc3 = ky.extend({
      prefixUrl: `https://raw.githubusercontent.com/KC3Kai/kc3-translations/master/data/${
        language.kc3 || this.code
      }`,
    });

    this.tsun = ky.extend({
      prefixUrl: `https://raw.githubusercontent.com/planetarian/TsunKitTranslations/main/${this.code}`,
    });

    this.path = `packages/site/public/locales/${this.code}`;
  }

  private async getKC3Json<T = unknown>(filename: string) {
    const text = await this.kc3.get(filename).text();
    return JSON.parse(text.replace(/^\ufeff/, "")) as T;
  }

  private async getKcnavJson() {
    const kcnav = await this.tsun
      .get("kcnav.json")
      .json<Record<string, string>>();

    Object.entries(kcnav).forEach(([key, value]) => {
      kcnav[key] = value
        .replace(/\[\[(.+)\]\]/, (_, p: string) => kcnav[p])
        .trim();
    });

    return kcnav;
  }

  private async merge(filename: string, data: Record<string, unknown>) {
    const path = `${this.path}/${filename}`;
    const current = (await fs.readJSON(path)) as Record<string, unknown>;

    await fs.outputJSON(
      path,
      mergeWith({}, current, data, (a: unknown, b: unknown) => {
        if (!a) {
          return;
        }

        if (b === "" || b === " " || b === null) {
          return a;
        }

        return;
      }),
    );
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
    const kc3Terms = await this.getKC3Json<Dictionary>("terms.json");
    const kc3Battle = await this.getKC3Json<KC3Battle>("battle.json");

    const worldName = pickBy(kcnav, /(?<=^worldName)\d{2,}/);
    const nodeType = pickBy(kcnav, /(?<=^nodeType).+/);

    const getDayCutin = (i: number) => {
      if (this.code === "zh-TW") {
        return kc3Battle.cutinDay[i].replace(/(Cut-In| 判定).+/, "");
      }

      // battle.jsonのデータがズレてるので対応
      if (this.code === "ko" && (i === 30 || i === 31)) {
        if (!kc3Battle.cutinDay[30].startsWith("즈이운")) {
          i += 1;
        }
      }

      return kc3Battle.cutinDay[i].replace(/ \[.+\]/, "");
    };

    const DayCutin: Dictionary<DayCutin> = {
      DoubleAttack: getDayCutin(2),
      MainSec: getDayCutin(3),
      MainRadar: getDayCutin(4),
      MainAp: getDayCutin(5),
      MainMain: getDayCutin(6),
      FBA: "FBA",
      BBA: "BBA",
      BA: "BA",
      Zuiun: getDayCutin(30),
      AirSea: getDayCutin(31),
    };

    const getNightCutin = (i: number) => {
      if (this.code === "zh-TW") {
        return kc3Battle.cutinNight[i].replace(/(Cut-In| 判定).+/, "");
      }

      if (this.code === "ja" && i === 2) {
        return "砲雷CI";
      }

      return kc3Battle.cutinNight[i].replace(/ \[.+\]/, "");
    };

    const NightCutin: Dictionary<NightCutin> = {
      DoubleAttack: getNightCutin(1),
      TorpTorpMain: getNightCutin(2),
      TorpTorpTorp: getNightCutin(3),
      MainMainSec: getNightCutin(4),
      MainMainMain: getNightCutin(5),
      MainTorpRadar: getNightCutin(7),
      TorpLookoutRadar: getNightCutin(8),
      TorpTsloTorp: getNightCutin(9),
      TorpTsloDrum: getNightCutin(10),
      SubRadarTorp: kc3Terms["CutinLateTorpRadar"],
      SubTorpTorp: kc3Terms["CutinLateTorpTorp"],
      NightZuiun2Radar: `${getNightCutin(30)} 1.36`,
      NightZuiun2: `${getNightCutin(30)} 1.32`,
      NightZuiunRadar: `${getNightCutin(30)} 1.28`,
      NightZuiun: `${getNightCutin(30)} 1.24`,
    };

    const FleetCutin: Dictionary<FleetCutin> = {
      NelsonTouch: getDayCutin(20),
      NagatoClassCutin: getDayCutin(21),
      ColoradoClassCutin: getDayCutin(23),
      KongouClassCutin: getNightCutin(24),
      QueenElizabethClassCutin: getDayCutin(25),
      RichelieuClassCutin: getDayCutin(26),
      Yamato2ShipCutin: getDayCutin(51),
      Yamato3ShipCutin: getDayCutin(50),
    };

    const input = {
      DayCutin,
      NightCutin,
      FleetCutin,
      worldName,
      nodeType,
    };

    await this.merge("common.json", input);
  }

  private async updateShipsAndCtype() {
    const [kc3Ships, kc3ShipAffixes, kc3Ctype] = await Promise.all([
      this.getKC3Json<KC3Ships>("ships.json"),
      this.getKC3Json<KC3ShipAffix>("ship_affix.json"),
      ky(
        "https://raw.githubusercontent.com/KC3Kai/kc3-translations/master/data/en/ctype.json",
      ).json<string[]>(),
    ]);

    const re = RegExp(`(${Object.keys(kc3ShipAffixes.suffixes).join("|")})+$`);

    const entries = this.md.ships
      .map(({ ship_id, name }) => {
        if (ship_id in kc3ShipAffixes.byId) {
          return [ship_id, kc3ShipAffixes.byId[ship_id] || ""] as const;
        }

        const baseName = name.replace(re, "");
        const suffix = name.replace(baseName, "");

        const translatedBaseName = Object.entries(kc3Ships).find(
          ([key]) => key === baseName,
        )?.[1];

        if (!translatedBaseName) return undefined;

        let translatedSuffix = suffix;
        Object.entries(kc3ShipAffixes.suffixes).forEach(([key, suffix]) => {
          if (suffix) {
            translatedSuffix = translatedSuffix.replace(
              key,
              suffix.replace("{ -}?", ""),
            );
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
    new LocaleUpdater(md, lang).update(),
  );

  await Promise.all(promises);
  await exec("yarn prettier --write packages/site/public/locales");
};

updateLocales().catch((err) => console.error(err));
