import child_process from "child_process";
import { promisify } from "util";
import { storage } from "@fh/admin/src";
import { nonNullable, uniq } from "@fh/utils/src";
import {
  AirSquadronMode,
  AirState,
  DayCutin,
  Engagement,
  Formation,
  MasterData,
  NightCutin,
  OrgType,
  FleetCutin,
} from "fleethub-core";
import fs from "fs-extra";
import got from "got";

const exec = promisify(child_process.exec);

type Dictionary = Partial<Record<string, string>>;

const languages = [
  { code: "ja", kc3: "jp", poi: "ja-JP" },
  { code: "en", poi: "en-US" },
  { code: "ko", kc3: "kr", poi: "ko-KR" },
  { code: "zh-CN", kc3: "scn" },
  { code: "zh-TW", kc3: "tcn" },
] as const;

type LanguageCode = typeof languages[number]["code"];
type Language = { code: LanguageCode; kc3?: string; poi?: string };

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

const fhCommonJa = {
  Equipment: "装備",
  Maps: "海域",
  Stars: "改修値",
  Folder: "フォルダ",
  Type: "種類",
  Change: "変更する",
  Remove: "削除する",
  Consume: "消費する",
  BatchOperation: "一括操作",
  EditMiscStats: "その他のステータスを編集",
  CreateComposition: "編成を作成",
  CreateFolder: "フォルダを作成",
  OpenFolderPage: "フォルダページを開く",
  Chance: "確率",
  Day: "昼戦",
  Night: "夜戦",
  Support: "支援",

  AirState: "制空状態",
  DamageState: "損傷",
  Normal: "通常",
  Shouha: "小破",
  Chuuha: "中破",
  Taiha: "大破",
  Sunk: "轟沈",
  MoraleState: "疲労度",
  Sparkle: "キラ",
  Orange: "橙疲労",
  Red: "赤疲労",
  Proficiency: "熟練度",
  Critical: "クリティカル",
  SpecialAttack: "特殊攻撃",
  SoftSkinned: "ソフトスキン",
  NightContact: "夜間触接",
  Searchlight: "$t(gear_types:29)",
  Starshell: "$t(gear_types:33)",

  Modifier: "補正",
  AttackPower: "攻撃力",
  BasicAttackPower: "基本攻撃力",
  ApShellModifier: "徹甲弾補正",
  CarrierModifier: "空母補正",
  ProficiencyCriticalModifier: "熟練度クリティカル補正",
  HitRate: "命中率",
  AccuracyTerm: "命中項",
  EvasionTerm: "回避項",
  ScratchDamage: "割合",
};

const fhCommon: Record<
  LanguageCode,
  Record<keyof typeof fhCommonJa, string>
> = {
  ja: fhCommonJa,
  en: {
    Equipment: "Equipment",
    Maps: "Maps",
    Stars: "Stars",
    Folder: "Folder",
    Type: "Type",
    Change: "Change",
    Remove: "Remove",
    Consume: "Consume",
    BatchOperation: "Batch Operation",
    EditMiscStats: "Edit misc stats",
    CreateComposition: "Create composition",
    CreateFolder: "Create folder",
    OpenFolderPage: "Open folder page",
    Chance: "Chance",
    Day: "Day Battle",
    Night: "Night Battle",
    Support: "Support",

    AirState: "Air State",
    DamageState: "Damage",
    Normal: "Normal",
    Shouha: "Shouha",
    Chuuha: "Chuuha",
    Taiha: "Taiha",
    Sunk: "Sunk",
    MoraleState: "Morale",
    Sparkle: "Sparkle",
    Orange: "Orange",
    Red: "Red",
    Proficiency: "Proficiency",
    Critical: "Critical",
    SpecialAttack: "Special Attack",
    SoftSkinned: "Soft-Skinned",
    NightContact: "Night Contact",
    Searchlight: "$t(gear_types:29)",
    Starshell: "$t(gear_types:33)",

    Modifier: "Modifier",
    AttackPower: "Attack Power",
    BasicAttackPower: "Basic Attack Power",
    ApShellModifier: "AP Shell modifier",
    CarrierModifier: "Carrier modifier",
    ProficiencyCriticalModifier: "Proficiency critical modifier",
    HitRate: "Hit Rate",
    AccuracyTerm: "Accuracy Term",
    EvasionTerm: "Evasion Term",
    ScratchDamage: "Scratch",
  },
  ko: {
    Equipment: "장비",
    Maps: "해역",
    Stars: "별 개수",
    Folder: "폴더",
    Type: "종류",
    Change: "변경하다",
    Remove: "삭제하다",
    Consume: "소비하다",
    BatchOperation: "대량 작업",
    EditMiscStats: "기타 상태를 편집합니다",
    CreateComposition: "편성 만들기",
    CreateFolder: "폴더 만들기",
    OpenFolderPage: "폴더 페이지를 열다",
    Chance: "확률",
    Day: "주간전",
    Night: "야간전",
    Support: "지원",

    AirState: "제공상태",
    DamageState: "손상",
    Normal: "통상",
    Shouha: "소파",
    Chuuha: "중파",
    Taiha: "대파",
    Sunk: "굉침",
    MoraleState: "피로도",
    Sparkle: "키라",
    Orange: "주황 피로",
    Red: "빨간 피로",
    Proficiency: "숙련도",
    Critical: "크리티컬",
    SpecialAttack: "특수 공격",
    SoftSkinned: "소프트 스킨",
    NightContact: "야간 촉접",
    Searchlight: "$t(gear_types:29)",
    Starshell: "$t(gear_types:33)",

    Modifier: "보정",
    AttackPower: "공격력",
    BasicAttackPower: "기본 공격력",
    ApShellModifier: "철갑탄 보정",
    CarrierModifier: "항모 보정",
    ProficiencyCriticalModifier: "숙련도 크리티컬 보정",
    HitRate: "명중률",
    AccuracyTerm: "정확율",
    EvasionTerm: "회피율",
    ScratchDamage: "지근탄",
  },
  "zh-CN": {
    Equipment: "装备",
    Maps: "海域",
    Stars: "改修星数",
    Folder: "文件夹",
    Type: "类型",
    Change: "变化",
    Remove: "删除",
    Consume: "消费",
    BatchOperation: "批量操作",
    EditMiscStats: "编辑杂项状态",
    CreateComposition: "编成",
    CreateFolder: "创建文件夹",
    OpenFolderPage: "打开文件夹页面",
    Chance: "概率",
    Day: "昼战",
    Night: "夜战",
    Support: "支援",

    AirState: "制空状态",
    DamageState: "损伤",
    Normal: "通常",
    Shouha: "小破",
    Chuuha: "中破",
    Taiha: "大破",
    Sunk: "轰沉",
    MoraleState: "士气值",
    Sparkle: "刷闪",
    Orange: "橙疲劳",
    Red: "红疲劳",
    Proficiency: "熟练度",
    Critical: "爆击",
    SpecialAttack: "特殊攻击",
    SoftSkinned: "软皮",
    NightContact: "夜间接触",
    Searchlight: "$t(gear_types:29)",
    Starshell: "$t(gear_types:33)",

    Modifier: "补正",
    AttackPower: "攻击力",
    BasicAttackPower: "基本攻击力",
    ApShellModifier: "彻甲弹补正",
    CarrierModifier: "空母补正",
    ProficiencyCriticalModifier: "熟练度爆击补正",
    HitRate: "命中率",
    AccuracyTerm: "命中值",
    EvasionTerm: "回避值",
    ScratchDamage: "擦弹",
  },
  "zh-TW": {
    Equipment: "裝備",
    Maps: "海域",
    Stars: "改修星数",
    Folder: "文件夾",
    Type: "類型",
    Change: "變化",
    Remove: "刪除",
    Consume: "消耗",
    BatchOperation: "批量操作",
    EditMiscStats: "編輯雜項狀態",
    CreateComposition: "編成",
    CreateFolder: "創建文件夾",
    OpenFolderPage: "打開文件夾頁麵",
    Chance: "概率",
    Day: "晝戰",
    Night: "夜戰",
    Support: "支援",

    AirState: "制空狀態",
    DamageState: "損傷",
    Normal: "通常",
    Shouha: "小破",
    Chuuha: "中破",
    Taiha: "大破",
    Sunk: "轟沉",
    MoraleState: "士氣值",
    Sparkle: "刷閃",
    Orange: "橙疲勞",
    Red: "紅疲勞",
    Proficiency: "熟練度",
    Critical: "爆擊",
    SpecialAttack: "特殊攻擊",
    SoftSkinned: "軟皮",
    NightContact: "夜間觸接",
    Searchlight: "$t(gear_types:29)",
    Starshell: "$t(gear_types:33)",

    Modifier: "補正",
    AttackPower: "攻擊力",
    BasicAttackPower: "基本攻擊力",
    ApShellModifier: "徹甲彈補正",
    CarrierModifier: "空母補正",
    ProficiencyCriticalModifier: "熟練度爆擊補正",
    HitRate: "命中率",
    AccuracyTerm: "命中值",
    EvasionTerm: "迴避值",
    ScratchDamage: "擦彈",
  },
};

const uniqDictionary = (dict: Dictionary): Dictionary => {
  const state = new Map<string, string>();

  const entries = Object.entries(dict)
    .map(([key, value]) => {
      if (!value) return undefined;

      const duplicatedKey = state.get(value);
      if (duplicatedKey) {
        return [key, `$t(${duplicatedKey})`] as const;
      }

      state.set(value, key);

      return [key, value] as const;
    })
    .filter(nonNullable);

  return Object.fromEntries(entries);
};

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

  private getKC3Json = async <T = unknown>(filename: string) => {
    const text = await this.kc3.get(filename).text();
    return JSON.parse(text.replace(/^\ufeff/, "").replaceAll("{ -}?", "")) as T;
  };

  private getKcnavJson = async () => {
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
  };

  private getPoiJson = async <T = unknown>(dir: string) => {
    const json = await this.poi
      .get(`${dir}/${this.language.poi || this.language.code}.json`)
      .json<T>();
    return json;
  };

  private output = async (filename: string, data: unknown) => {
    await fs.outputJSON(`${this.path}/${filename}`, data);
  };

  private importKC3 = async (filename: string, outputName = filename) => {
    const json = await this.getKC3Json(filename);
    await this.output(outputName, json);
  };

  private updateCommon = async () => {
    const [
      kc3Terms,
      kc3Battle,
      kcnav,
      poiMenu,
      poiMain,
      poiOthers,
      poiSetting,
    ] = await Promise.all([
      this.getKC3Json<Record<string, string>>("terms.json"),
      this.getKC3Json<KC3Battle>("battle.json"),
      this.getKcnavJson(),
      this.getPoiJson<Record<string, string>>("menu"),
      this.getPoiJson<Record<string, string>>("main"),
      this.getPoiJson<Record<string, string>>("others"),
      this.getPoiJson<Record<string, string>>("setting"),
    ]);

    const worldNames = Object.fromEntries(
      Object.entries(kcnav).filter(([key]) => /^worldName\d+/.test(key))
    );

    const nodeTypes = Object.fromEntries(
      Object.entries(kcnav).filter(([key]) => /^nodeType.+/.test(key))
    );

    const airStateDictionary: Record<AirState, string> = {
      AirParity: kc3Battle.airbattle[0][0],
      AirSupremacy: kc3Battle.airbattle[1][0],
      AirSuperiority: kc3Battle.airbattle[2][0],
      AirDenial: kc3Battle.airbattle[3][0],
      AirIncapability: kc3Battle.airbattle[4][0],
    };

    const engagementDictionary: Record<Engagement, string> = {
      Parallel: kc3Battle.engagement[1][0],
      HeadOn: kc3Battle.engagement[2][0],
      GreenT: kc3Battle.engagement[3][0],
      RedT: kc3Battle.engagement[4][0],
    };

    const orgTypeDictionary: Record<OrgType, string> = {
      Single: kcnav["fleetTypeSingle"],
      CarrierTaskForce: kcnav["fleetTypeCTF"],
      SurfaceTaskForce: kcnav["fleetTypeSTF"],
      TransportEscort: kcnav["fleetTypeTCF"],
      EnemySingle: `${kc3Terms["BattleEnemy"]} ${kcnav["fleetTypeSingle"]}`,
      EnemyCombined: `${kc3Terms["BattleEnemy"]} ${kc3Terms["CombinedFleet"]}`,
    };

    const formationDictionary: Record<Formation, string> = {
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

    const getDayCutin = (i: number) => {
      if (this.code === "zh-TW") {
        return kc3Battle.cutinDay[i].replace(/(Cut-In| 判定).+/, "");
      }

      if (this.code === "ko" && (i === 30 || i === 31)) {
        if (i === 30) return "Zuiun CI";
        if (i === 31) return "Air/Sea CI";
      }

      return kc3Battle.cutinDay[i].replace(/ \[.+\]/, "");
    };

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

    const getNightCutin = (i: number) => {
      if (this.code === "zh-TW") {
        return kc3Battle.cutinDay[i].replace(/(Cut-In| 判定).+/, "");
      }

      return kc3Battle.cutinNight[i].replace(/ \[.+\]/, "");
    };

    const cvci = getNightCutin(6);

    const nightCutinDictionary: Record<NightCutin, string> = {
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

    const fleetCutinDictionary: Record<FleetCutin, string> = {
      NelsonTouch: getDayCutin(20),
      NagatoCutin: getDayCutin(21),
      ColoradoCutin: getDayCutin(23),
      KongouCutin: getNightCutin(24),
    };

    const airSquadronModeDictionary: Record<AirSquadronMode, string> = {
      Sortie: kc3Terms["LandBaseActionSortie"],
      AirDefense: kc3Terms["LandBaseActionDefend"],
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

        "HQAdmiralLv",

        "None",
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

      Ship: kcnav["termShip"],
      Fleet: kcnav["termFleet"],
      Lbas: kc3Terms["LodgerLbas"],
      Composition: kcnav["ribbonCompsTabName"],
      Main: kcnav["termMain"],
      Escort: kcnav["termEscort"],
      ShipClass: kcnav["termClass"],
      Difficulty: kcnav["termDifficulty"],
      Details: kcnav["termDetails"],
      Map: kcnav["termMap"],
      Enemies: kcnav["panelEnemiesTabName"],

      LbasDistance: kcnav["displayLBASDistanceLabel"],

      ElosNodeFactor: kc3Terms["PanelElosNodeFactor"].replace("{0}", ""),

      LandBaseFighterPower: kc3Terms["LandBaseFighterPower"],
      InterceptionPower: kc3Terms["LandBaseTipAirDefensePower"],
      HighAltitudeInterceptionPower: kc3Terms[
        "LandBaseTipHighAltitudeAirDefensePower"
      ].replace(": ≈{0}", ""),

      Engagement: kc3Terms["BattleEngangement"],
      Formation: kcnav["panelEnemiesFormationHeader"],
      Contact: kc3Terms["BattleContact"],
      AirBattle: kc3Terms["BattleAirBattle"],

      Reset: kc3Terms["SettingsReset"],
      ShipStatsCurrent: kc3Terms["SettingsShipStatsCurrent"],
      ShipStatsUnequipped: kc3Terms["SettingsShipStatsUnequipped"],

      WarfareShelling: kc3Terms["ShipWarfareShelling"],
      WarfareTorpedo: kc3Terms["ShipWarfareTorpedo"],
      WarfareAntiSub: kc3Terms["ShipWarfareAntisub"],
      WarfareAntiLand: kc3Terms["ShipWarfareAntiLand"],
      WarfareAerial: kc3Terms["ShipWarfareAerial"],

      AttackTypeDepthCharge: kc3Terms["ShipAttackTypeDepthCharge"],
      AttackTypeAirAttack: kc3Terms["ShipAttackTypeAirAttack"],
      AttackTypeTorpedo: kc3Terms["ShipAttackTypeTorpedo"],
      AttackTypeSingleAttack: kc3Terms["ShipAttackTypeSingleAttack"],
      AttackTypeNone: kc3Terms["ShipAttackTypeNone"],

      PhaseOpeningAsw: kc3Terms["ShipExtraPhaseOpeningASW"],
      PhaseOpeningTorpedo: kc3Terms["ShipExtraPhaseOpeningTorpedo"],
      PhaseClosingTorpedo: kc3Terms["ShipExtraPhaseClosingTorpedo"],
      PhaseOpeningAirStrike: kc3Terms["ShipExtraPhaseOpeningAirStrike"],
      PhaseOpeningJetAssault: kc3Terms["ShipExtraPhaseOpeningJetAssault"],

      FighterPower: poiMain["Fighter Power"],
      AntiAirCutin: poiMain["AACI"],
      AntiAirPropellantBarrage: poiMain["AAPB"],
      Total: poiMain["Total"],

      Edit: poiMenu["Edit"],
      Undo: poiMenu["Undo"],
      Redo: poiMenu["Redo"],
      Copy: poiMenu["Copy"],
      View: poiMenu["View"],
      Close: poiMenu["Close"],
      Help: poiMenu["Help"],
      Save: poiSetting["Save"],

      CopyToClipboard: poiOthers["Copy to clipboard"],

      ...exnteds,

      ...airStateDictionary,
      ...engagementDictionary,
      ...orgTypeDictionary,
      ...formationDictionary,
      ...dayCutinDictionary,
      ...nightCutinDictionary,
      ...fleetCutinDictionary,
      ...airSquadronModeDictionary,
      ...worldNames,
      ...nodeTypes,
      ...fhCommon[this.code],
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
  const md: MasterData = await storage.readJson("data/master_data.json");
  const promises = languages.map((lang) =>
    new LocaleUpdater(md, lang).update()
  );

  await Promise.all(promises);
  await exec("yarn prettier --write packages/site/public/locales");
};

updateLocales().catch((err) => console.error(err));
