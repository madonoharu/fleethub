import deepmerge from "deepmerge"
import { FormationDefinitions, DayCutin, dayCutins, DayCutinType } from "./common"
import { NightSpecialAttackDefinitions } from "./attacks/night/NightSpecialAttack"

type DeepReadonly<T> = T extends {} ? { readonly [K in keyof T]: DeepReadonly<T[K]> } : T
type DeepPartial<T> = T extends {} ? { [K in keyof T]?: DeepPartial<T[K]> } : T

export type FhDefinitions = DeepReadonly<{
  formations: FormationDefinitions
  dayCutins: DayCutin[]
  nightSpecialAttacks: NightSpecialAttackDefinitions
}>

export type FhOptions = DeepPartial<FhDefinitions>

const defaultNightSpecialAttacks: NightSpecialAttackDefinitions = {
  MainTorpRadar: { name: "主魚電", priority: 1, denominator: 130, power: 1.3, accuracy: 1 },
  TorpLookoutRadar: { name: "魚見電", priority: 2, denominator: 150, power: 1.2, accuracy: 1 },

  DoubleAttack: { name: "連撃", priority: 3, denominator: 110, power: 1.2, accuracy: 1.1 },
  MainTorp: { name: "主魚", priority: 3, denominator: 115, power: 1.3, accuracy: 1.5 },
  TorpTorp: { name: "魚魚", priority: 3, denominator: 122, power: 1.5, accuracy: 1.65 },
  MainMainSecond: { name: "主主副", priority: 3, denominator: 130, power: 1.75, accuracy: 1.65 },
  MainMainMain: { name: "主主主", priority: 3, denominator: 140, power: 2, accuracy: 1.5 },

  SubmarineTorpTorp: { name: "潜水魚魚", priority: 3, denominator: 110, power: 1.65, accuracy: 1 },
  SubmarineRadarTorp: { name: "潜水電探", priority: 3, denominator: 102, power: 1.75, accuracy: 1 },

  /**
   * @see https://twitter.com/MorimotoKou/status/1162347762945425410
   */
  AerialAttack1: { name: "夜襲1.25", priority: 1, denominator: 105, power: 1.25, accuracy: 1 },
  AerialAttack2: { name: "夜襲1.20", priority: 2, denominator: 115, power: 1.2, accuracy: 1 },
  SuiseiAttack: { name: "彗星夜襲", priority: 3, denominator: 115, power: 1.2, accuracy: 1 },
  AerialAttack3: { name: "夜襲1.18", priority: 4, denominator: 125, power: 1.18, accuracy: 1 },
}

export const defaultFhDefinitions: FhDefinitions = {
  formations: {
    LineAhead: {
      protectionRate: 0.45,
      fleetAntiAir: 1,
      shelling: { power: 1, accuracy: 1, evasion: 1 },
      torpedo: { power: 1, accuracy: 1, evasion: 1 },
      asw: { power: 0.6, accuracy: 1, evasion: 1 },
      night: { power: 1, accuracy: 1, evasion: 1 },
    },

    DoubleLine: {
      protectionRate: 0.6,
      fleetAntiAir: 1.2,
      shelling: { power: 0.8, accuracy: 1.2, evasion: 1 },
      torpedo: { power: 0.8, accuracy: 0.8, evasion: 1 },
      asw: { power: 0.8, accuracy: 1.2, evasion: 1 },
      night: { power: 1, accuracy: 0.9, evasion: 1 },
    },

    Diamond: {
      protectionRate: 0.75,
      fleetAntiAir: 1.6,
      shelling: { power: 0.7, accuracy: 1, evasion: 1.1 },
      torpedo: { power: 0.7, accuracy: 0.4, evasion: 1.1 },
      asw: { power: 1.2, accuracy: 1, evasion: 1 },
      night: { power: 1, accuracy: 0.7, evasion: 1 },
    },

    Echelon: {
      protectionRate: 0.6,
      fleetAntiAir: 1,
      shelling: { power: 0.75, accuracy: 1.2, evasion: 1.2 },
      torpedo: { power: 0.6, accuracy: 0.6, evasion: 1.3 },
      asw: { power: 1.1, accuracy: 1.2, evasion: 1.3 },
      /** @see  https://twitter.com/shiro_sh39/status/1121812791843627008 */
      night: { power: 1, accuracy: 0.9, evasion: 1.2 },
    },

    LineAbreast: {
      protectionRate: 0.6,
      fleetAntiAir: 1,
      shelling: { power: 0.6, accuracy: 1.2, evasion: 1.3 },
      torpedo: { power: 0.6, accuracy: 0.3, evasion: 1.4 },
      asw: { power: 1.3, accuracy: 1.2, evasion: 1.1 },
      night: { power: 1, accuracy: 0.8, evasion: 1.2 },
    },

    Vanguard: {
      /** @see https://drive.google.com/file/d/1JE1itNZDBLCKN5XVV3-Q_5QrFSxmCBkE/view */
      protectionRate: 0.75,
      fleetAntiAir: 1.1,
      shelling: {
        TopHalf: { power: 0.5, accuracy: 0.8, evasion: 1 },
        BottomHalf: { power: 1, accuracy: 1.2, evasion: 1 },
      },
      torpedo: { power: 1, accuracy: 1, evasion: 1 },
      asw: {
        TopHalf: { power: 1, accuracy: 1, evasion: 1 },
        BottomHalf: { power: 0.6, accuracy: 1, evasion: 1 },
      },
      night: {
        TopHalf: { power: 0.5, accuracy: 1, evasion: 1 },
        BottomHalf: { power: 1, accuracy: 1, evasion: 1 },
      },
    },

    Cruising1: {
      protectionRate: 0.6,
      fleetAntiAir: 1.1,
      shelling: { power: 0.8, accuracy: 1, evasion: 1 },
      torpedo: { power: 0.7, accuracy: 1, evasion: 1 },
      asw: { power: 1.3, accuracy: 1, evasion: 1 },
      night: { power: 1, accuracy: 1, evasion: 1 },
    },

    Cruising2: {
      protectionRate: 0.6,
      fleetAntiAir: 1,
      shelling: { power: 1, accuracy: 1, evasion: 1 },
      torpedo: { power: 0.9, accuracy: 1, evasion: 1 },
      asw: { power: 1.1, accuracy: 1, evasion: 1 },
      night: { power: 1, accuracy: 1, evasion: 1 },
    },

    Cruising3: {
      protectionRate: 0.6,
      fleetAntiAir: 1.5,
      shelling: { power: 0.7, accuracy: 1, evasion: 1 },
      torpedo: { power: 0.6, accuracy: 1, evasion: 1 },
      asw: { power: 1, accuracy: 1, evasion: 1 },
      night: { power: 1, accuracy: 1, evasion: 1 },
    },

    Cruising4: {
      protectionRate: 0.6,
      fleetAntiAir: 1,
      /** @see https://kancolle.fandom.com/ja/wiki/%E3%82%B9%E3%83%AC%E3%83%83%E3%83%89:987#13 */
      shelling: { power: 1.1, accuracy: 1.1, evasion: 1 },
      torpedo: { power: 1, accuracy: 1, evasion: 1 },
      asw: { power: 0.7, accuracy: 1, evasion: 1 },
      night: { power: 1, accuracy: 1, evasion: 1 },
    },
  },

  dayCutins,
  nightSpecialAttacks: defaultNightSpecialAttacks,
}

export let fhDefinitions: FhDefinitions = deepmerge({}, defaultFhDefinitions)

export const setFhOptions = (options: FhOptions) => {
  fhDefinitions = deepmerge(defaultFhDefinitions, options) as FhDefinitions
}

export const getDayCutin = (type: DayCutinType): DayCutin => {
  const def = dayCutins.find((def) => def.type === type)
  return def || dayCutins[0]
}
