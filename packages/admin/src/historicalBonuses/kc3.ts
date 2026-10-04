import ky from "ky";

const REPO = "KC3Kai/kancolle-replay";
const DIR = "js/data/bonus";

/**
 * KC3Kai/kancolle-replay の js/data/bonus 以下に置かれている特効データ。
 *
 * https://github.com/KC3Kai/kancolle-replay/tree/master/js/data/bonus
 */
export interface Kc3BonusFile {
  /** 海域のワールド番号。イベント海域は57以降 */
  world: number;
  /** 海域番号 */
  mapnum: number;
  date?: string;
  note?: string;
  listBonus?: Kc3BonusGroup[];
  /** 基地航空隊用の特効。fleethub-core は基地航空隊の攻撃に特効を通していないので変換しない */
  listBonusLBAS?: Kc3BonusGroup[];
  listDebuff?: Kc3DebuffGroup[];
}

export interface Kc3BonusGroup {
  /** 適用対象のマスの符号。未指定なら全マス */
  nodes?: string[];
  /** 除外するマスの符号 */
  nodesExclude?: string[];
  bonuses: Kc3Bonus[];
}

export interface Kc3Bonus {
  /** 火力補正 */
  dmg?: number;
  /** 命中補正 */
  acc?: number;
  /** 回避補正 */
  eva?: number;

  /** 艦種 (api_stype) */
  shipType?: number[];
  /** 艦型 (api_ctype) */
  shipClass?: number[];
  /** 未改造時の艦船ID。改造後も対象になる */
  shipBase?: number[];
  /** 艦船ID。指定された改造段階のみが対象 */
  shipId?: number[];

  requireEquipId?: number[];
  /** requireEquipId の必要個数 (以上) */
  requireEquipIdNum?: number;
  /** requireEquipId の必要個数 (完全一致) */
  requireEquipIdNumX?: number;
  /** requireEquipId の必要改修値 */
  requireEquipLevel?: number;
  /** 装備種 (api_type[2]) */
  requireEquipType?: number[];
  requireEquipTypeNum?: number;
  /** 基地航空隊のみ。この装備を積んだ中隊は補正対象外 */
  requireEquipIdNot?: number[];
  /** 艦載機のスロットに機数が残っていることを要求する */
  requireSlot?: number;

  /** 条件を満たす装備の数だけ補正を累乗する */
  perEquip?: number;
  /** 艦載機自身に付く補正。機数の残るスロットの装備だけが数えられ、notAirOnly が無い場合は航空攻撃時のみ適用される */
  isPlane?: number;
  notAirOnly?: number;
  /** 基地航空隊のみ。条件を満たす中隊が居れば全中隊に適用する */
  basewide?: number;
  /** 未検証の推測値 */
  unconfirmed?: number;
}

export interface Kc3DebuffGroup {
  nodes?: string[];
  nodesExclude?: string[];
  debuffs: Kc3Debuff[];
}

export interface Kc3Debuff {
  /** 装甲減少の対象となる深海棲艦のID */
  shipId?: number[];
  /** 装甲減少量 */
  amount: number;
}

interface GitHubContent {
  name: string;
  type: string;
  download_url: string | null;
}

export function getMapKey(file: Pick<Kc3BonusFile, "world" | "mapnum">): number {
  return file.world * 10 + file.mapnum;
}

export async function fetchKc3BonusFiles(): Promise<Kc3BonusFile[]> {
  const contents = await ky
    .get(`https://api.github.com/repos/${REPO}/contents/${DIR}`)
    .json<GitHubContent[]>();

  const urls = contents
    .filter((content) => content.type === "file" && content.name.endsWith(".json"))
    .map((content) => content.download_url)
    .filter((url): url is string => Boolean(url));

  return Promise.all(urls.map((url) => ky.get(url).json<Kc3BonusFile>()));
}
