import {
  AirState,
  DayCutin,
  Formation,
  MasterDataInput,
  NightCutin,
  OrgType,
} from "@fleethub/core/types";
import child_process from "child_process";
import { outputJSON } from "fs-extra";
import got from "got";
import { promisify } from "util";

import storage from "./data/storage";

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
type KC3ShipAffixes = { suffixes: Record<string, string> };
type KC3Battle = {
  airbattle: string[][];
  engagement: string[][];
  cutinDay: string[];
  cutinNight: string[];
};

class LocaleUpdater {
  public kc3: typeof got;

  constructor(private md: MasterDataInput, private language: Language) {
    const { path, code } = language;

    this.kc3 = got.extend({
      prefixUrl: `https://raw.githubusercontent.com/KC3Kai/kc3-translations/master/data/${
        path || code
      }`,
    });
  }

  get lang() {
    return this.language.code;
  }

  public getKC3Json = async <T = unknown>(filename: string) => {
    const text = await this.kc3.get(filename).text();
    return JSON.parse(text.replace(/^\ufeff/, "")) as T;
  };

  public output = async (filename: string, data: unknown) => {
    await outputJSON(
      `packages/site/public/locales/${this.language.code}/${filename}`,
      data
    );
  };

  public updateShips = async () => {
    const [kc3Ships, kc3ShipAffixes] = await Promise.all([
      this.getKC3Json<KC3Ships>("ships.json"),
      this.getKC3Json<KC3ShipAffixes>("ship_affix.json"),
    ]);

    const dictionary: Dictionary = {};

    this.md.ships.forEach(({ name }) => {
      let translated = name;
      Object.entries(kc3Ships).forEach(([key, value]) => {
        translated = translated.replace(RegExp(`^${key}`), value);
      });

      Object.entries(kc3ShipAffixes.suffixes).forEach(([key, value]) => {
        translated = translated.replace(key, value);
      });

      dictionary[name] = translated.replace("{ -}?", "");
    });

    await this.output("ships.json", dictionary);
  };

  public updateGears = async () => {
    const dictionary = await this.getKC3Json<Dictionary>("items.json");
    await this.output("gears.json", dictionary);
  };

  public updateGearTypes = async () => {
    const equiptype = await this.getKC3Json<string[][]>("equiptype.json");
    const dictionary: Dictionary = {};

    this.md.gear_types.forEach((type) => {
      const str = equiptype[2][type.id];
      if (str) {
        dictionary[type.name] = str;
      }
    });

    await this.output("gearTypes.json", dictionary);
  };

  public updateTerms = async () => {
    const kc3Terms = await this.getKC3Json<Dictionary>("terms.json");

    const kc3Battle = await this.getKC3Json<KC3Battle>("battle.json");

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
      Single: kc3Terms["CombinedNone"],
      CarrierTaskForce: kc3Terms["CombinedCarrier"],
      SurfaceTaskForce: kc3Terms["CombinedSurface"],
      TransportEscort: kc3Terms["CombinedTransport"],
      EnemyCombined: kc3Terms["CombinedFleet"],
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

      ...airStateDictionary,
      ...engagementDictionary,
      ...orgTypeDictionary,
      ...formationDictionary,
      ...dayCutinDictionary,
      ...nightCutinDictionary,
    };

    await this.output("terms.json", dictionary);
  };

  public updateShipTypes = async () => {
    const shipTypes: Dictionary = {};
    const kc3stype = await this.getKC3Json<string[]>("stype.json");

    this.md.ship_types.forEach((type) => {
      shipTypes[type.name] = kc3stype[type.id];
    });

    await this.output("shipTypes.json", shipTypes);
  };

  public updateShipClasses = async () => {
    const shipClasses: Dictionary = {};
    const kc3ctype = await this.getKC3Json<string[]>("ctype.json");

    this.md.ship_classes.forEach((sc) => {
      const name = kc3ctype[sc.id];
      if (name) {
        shipClasses[sc.name] = kc3ctype[sc.id];
      }
    });

    await this.output("shipClasses.json", shipClasses);
  };

  public update = async () => {
    await Promise.all([
      this.updateGears(),
      this.updateGearTypes(),
      this.updateShips(),
      this.updateShipTypes(),
      this.updateShipClasses(),
      this.updateTerms(),
    ]);
  };
}

const updateLocales = async () => {
  const md = await storage.readMasterData();
  const promises = languages.map((lang) =>
    new LocaleUpdater(md, lang).update()
  );

  await Promise.all(promises);
  await exec("yarn prettier --write packages/site/public/locales");
};

updateLocales().catch((err) => console.error(err));
