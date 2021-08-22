import child_process from "child_process";
import { promisify } from "util";
import {
  AirState,
  DayCutin,
  Formation,
  MasterDataInput,
  NightCutin,
  OrgType,
} from "@fleethub/core/types";
import { nonNullable, uniq } from "@fleethub/utils/src";
import fs from "fs-extra";
import got from "got";

import { readMasterData } from "./data/storage";

const exec = promisify(child_process.exec);

type Dictionary = Partial<Record<string, string>>;

type Language = { code: string; path?: string };
const languages: Language[] = [
  { code: "ja", path: "jp" },
  { code: "en" },
  { code: "ko", path: "kr" },
  { code: "zh-CN", path: "scn" },
  { code: "zh-TW", path: "tcn" },
];

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

const uniqDictionary = (dict: Dictionary): Dictionary => {
  const state = new Map<string, string>();

  const entries = Object.entries(dict)
    .map(([key, value]) => {
      if (!value) return undefined;

      const duplicatedKey = state.get(value);
      if (duplicatedKey) return [key, `$t(${duplicatedKey})`] as const;

      state.set(value, key);

      return [key, value] as const;
    })
    .filter(nonNullable);

  return Object.fromEntries(entries);
};

class LocaleUpdater {
  private kc3: typeof got;
  private tsun: typeof got;

  constructor(private md: MasterDataInput, private language: Language) {
    const { path, code } = language;

    this.kc3 = got.extend({
      prefixUrl: `https://raw.githubusercontent.com/KC3Kai/kc3-translations/master/data/${
        path || code
      }`,
    });

    this.tsun = got.extend({
      prefixUrl: `https://raw.githubusercontent.com/planetarian/TsunKitTranslations/main/${code}`,
    });
  }

  get lang() {
    return this.language.code;
  }

  private getKC3Json = async <T = unknown>(filename: string) => {
    const text = await this.kc3.get(filename).text();
    return JSON.parse(text.replace(/^\ufeff/, "").replaceAll("{ -}?", "")) as T;
  };

  private output = async (filename: string, data: unknown) => {
    await fs.outputJSON(
      `packages/site/public/locales/${this.language.code}/${filename}`,
      data
    );
  };

  private importKC3 = async (filename: string, outputName = filename) => {
    const json = await this.getKC3Json(filename);
    await this.output(outputName, json);
  };

  private updateCommon = async () => {
    const kc3Terms = await this.getKC3Json<Record<string, string>>(
      "terms.json"
    );

    const kc3Battle = await this.getKC3Json<KC3Battle>("battle.json");

    const kcnav = await this.tsun
      .get("kcnav.json")
      .json<Record<string, string>>();

    const worldNames = Object.fromEntries(
      Object.entries(kcnav).filter(([key]) => /^worldName\d+/.test(key))
    );

    const nodeTypes = Object.fromEntries(
      Object.entries(kcnav)
        .filter(([key]) => /^nodeType.+/.test(key))
        .map(([key, value]) => [
          key,
          value?.replace("[[", "$t(").replace("]]", ")"),
        ])
    );

    const airStateDictionary: Record<AirState, string> = {
      AirParity: kc3Battle.airbattle[0][0],
      AirSupremacy: kc3Battle.airbattle[1][0],
      AirSuperiority: kc3Battle.airbattle[2][0],
      AirDenial: kc3Battle.airbattle[3][0],
      AirIncapability: kc3Battle.airbattle[4][0],
    };

    const engagementDictionary = {
      Parallel: kc3Battle.engagement[1][0],
      HeadOn: kc3Battle.engagement[2][0],
      GreenT: kc3Battle.engagement[3][0],
      RedT: kc3Battle.engagement[4][0],
    };

    const orgTypeDictionary: Record<OrgType, string | undefined> = {
      Single: kcnav["fleetTypeSingle"],
      CarrierTaskForce: kcnav["fleetTypeCTF"],
      SurfaceTaskForce: kcnav["fleetTypeSTF"],
      TransportEscort: kcnav["fleetTypeTCF"],
      EnemySingle: `${kc3Terms["BattleEnemy"]} ${kcnav["fleetTypeSingle"]}`,
      EnemyCombined: `${kc3Terms["BattleEnemy"]} ${kc3Terms["CombinedFleet"]}`,
    };

    const formationDictionary: Record<Formation, string | undefined> = {
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
    };

    const getDayCutin = (i: number) =>
      kc3Battle.cutinDay[i].replace(/ \[.+\]/, "").replace(/CI$/, "");

    const dayCutinDictionary: Record<DayCutin, string> = {
      DoubleAttack: getDayCutin(2),
      MainSec: getDayCutin(3),
      MainRader: getDayCutin(4),
      MainAp: getDayCutin(5),
      MainMain: getDayCutin(6),
      FBA: "FBA",
      BBA: "BBA",
      BA: "BA",
      Zuiun: getDayCutin(30),
      AirSea: getDayCutin(31),
    };

    const getNightCutin = (i: number) =>
      kc3Battle.cutinNight[i].replace(/ \[.+\]/, "").replace(/CI$/, "");
    const cvci = getNightCutin(6);

    const nightCutinDictionary: Record<NightCutin, string | undefined> = {
      DoubleAttack: getNightCutin(1),
      TorpTorpMain: getNightCutin(2),
      TorpTorpTorp: getNightCutin(3),
      MainMainSec: getNightCutin(4),
      MainMainMain: getNightCutin(5),
      Cvci1_18: cvci + " 1.18",
      Cvci1_20: cvci + " 1.20",
      Photobomber: cvci + " 光電管",
      Cvci1_25: cvci + " 1.25",
      MainTorpRadar: getNightCutin(7),
      TorpLookoutRadar: getNightCutin(8),
      TorpTsloTorp: getNightCutin(9),
      TorpTsloDrum: getNightCutin(10),
      SubRadarTorp: kc3Terms["CutinLateTorpRadar"],
      SubTorpTorp: kc3Terms["CutinLateTorpTorp"],
    };

    const exnteds = Object.fromEntries(
      [
        "SpeedLand",
        "SpeedSlow",
        "SpeedFast",
        "SpeedFaster",
        "SpeedFastest",
        "RangeShortAbbr",
        "RangeMediumAbbr",
        "RangeLongAbbr",
        "RangeVeryLongAbbr",
        "RangeExtremeLongAbbr",

        "SettingsReset",
        "SettingsShipStatsCurrent",
        "SettingsShipStatsUnequipped",

        "Unknown",
      ].map((key) => [key, kc3Terms[key]])
    );

    const dictionary: Dictionary = {
      max_hp: kc3Terms["ShipHp"],
      firepower: kc3Terms["ShipFire"],
      torpedo: kc3Terms["ShipTorpedo"],
      anti_air: kc3Terms["ShipAntiAir"],
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
      anti_bomber: kc3Terms["ShipAccAntiBomber"],
      interception: kc3Terms["ShipEvaInterception"],
      cost: kc3Terms["ShipDeployCost"],

      ...exnteds,

      ...airStateDictionary,
      ...engagementDictionary,
      ...orgTypeDictionary,
      ...formationDictionary,
      ...dayCutinDictionary,
      ...nightCutinDictionary,

      ...worldNames,
      ...nodeTypes,

      LbasDistance: kcnav["displayLBASDistanceLabel"],
      termUnknown: "$t(Unknown)",
    };

    await this.output("common.json", dictionary);
  };

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
  const md = await readMasterData();
  const promises = languages.map((lang) =>
    new LocaleUpdater(md, lang).update()
  );

  await Promise.all(promises);
  await exec("yarn prettier --write packages/site/public/locales");
};

updateLocales().catch((err) => console.error(err));
