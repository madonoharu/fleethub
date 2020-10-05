type Stat = [number, number]

type Slots = [number, number, number, number, number]

type Materials = [number, number, number, number]

interface AbysallShip {
  api_id: number
  api_sort_id: number
  api_name: string
  api_yomi: string
  api_stype: number
  api_ctype: number
  api_soku: number
  api_slot_num: number
}

interface PlayerShip {
  api_id: number
  api_sortno: number
  api_sort_id: number
  api_name: string
  api_yomi: string
  api_stype: number
  api_ctype: number
  api_afterlv: number
  api_aftershipid: string
  /** 耐久 */
  api_taik: Stat
  /** 装甲 */
  api_souk: Stat
  /** 火力 */
  api_houg: Stat
  api_raig: Stat
  /** 対空 */
  api_tyku: Stat
  /** 護衛空母のみ存在 */
  api_tais?: [number]
  api_luck: Stat
  api_soku: number
  api_leng: number
  api_slot_num: number
  api_maxeq: Slots
  api_buildtime: number
  api_broken: Materials
  api_powup: [number, number, number, number]
  api_backs: number
  api_getmes: string
  api_afterfuel: number
  api_afterbull: number
  api_fuel_max: number
  api_bull_max: number
  api_voicef: number
}

/** 艦船データ */
export type MstShip = AbysallShip | PlayerShip

/** 艦船カテゴリ */
export interface MstStype {
  api_id: number
  api_sortno: number
  api_name: string
  api_scnt: number
  api_kcnt: number
  api_equip_type: {
    [K: string]: 0 | 1
  }
}

/** 特殊装備 */
export interface MstEquipShip {
  api_ship_id: number
  api_equip_type: number[]
}

/** 装備データ */
export interface MstSlotitem {
  api_id: number
  api_sortno: number
  api_name: string
  api_type: [type0: number, type1: number, type2: number, type3: number, type4: number]
  api_taik: number
  api_souk: number
  api_houg: number
  api_raig: number
  api_soku: number
  api_baku: number
  api_tyku: number
  api_tais: number
  api_atap: number
  api_houm: number
  api_raim: number
  api_houk: number
  api_raik: number
  api_bakk: number
  api_saku: number
  api_sakb: number
  api_luck: number
  api_leng: number
  api_cost?: number
  api_distance?: number
  api_rare: number
  api_broken: Materials
  api_usebull: string
  api_version?: number
}

/** 装備カテゴリ */
export interface MstSlotitemEquiptype {
  /** カテゴリID(装備のtype[2]に対応) */
  api_id: number
  api_name: string
  api_show_flg: number
}

/** 補強スロットへの特殊装備 */
export interface MstEquipExslotShip {
  api_slotitem_id: number
  api_ship_ids: number[]
}

export interface Start2 {
  api_mst_ship: MstShip[]
  api_mst_stype: MstStype[]

  api_mst_slotitem: MstSlotitem[]
  api_mst_slotitem_equiptype: MstSlotitemEquiptype[]

  api_mst_equip_ship: MstEquipShip[]
  /** 補強スロットに装備可能なカテゴリ */
  api_mst_equip_exslot: number[]
  api_mst_equip_exslot_ship: MstEquipExslotShip[]
}

export const isPlayerShip = (mstShip: MstShip): mstShip is PlayerShip => "api_houg" in mstShip
