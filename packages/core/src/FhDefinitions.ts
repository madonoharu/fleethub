import deepmerge from "deepmerge"
import { DaySpecialAttackDefinitions } from "./attacks/shelling/DaySpecialAttack"
import { FormationDefinitions } from "./common/Formation"
import { NightSpecialAttackDefinitions } from "./attacks/night/NightSpecialAttack"

type DeepReadonly<T> = T extends {} ? { readonly [K in keyof T]: DeepReadonly<T[K]> } : T
type DeepPartial<T> = T extends {} ? { [K in keyof T]?: DeepPartial<T[K]> } : T

export type FhDefinitions = DeepReadonly<{
  formations: FormationDefinitions
  daySpecialAttacks: DaySpecialAttackDefinitions
  nightSpecialAttacks: NightSpecialAttackDefinitions
}>

export type FhOptions = DeepPartial<FhDefinitions>

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
        topHalf: { power: 0.5, accuracy: 0.8, evasion: 1 },
        bottomHalf: { power: 1, accuracy: 1.2, evasion: 1 },
      },
      torpedo: { power: 1, accuracy: 1, evasion: 1 },
      asw: {
        topHalf: { power: 1, accuracy: 1, evasion: 1 },
        bottomHalf: { power: 0.6, accuracy: 1, evasion: 1 },
      },
      night: {
        topHalf: { power: 0.5, accuracy: 1, evasion: 1 },
        bottomHalf: { power: 1, accuracy: 1, evasion: 1 },
      },
    },

    CruisingFormation1: {
      protectionRate: 0.6,
      fleetAntiAir: 1.1,
      shelling: { power: 0.8, accuracy: 1, evasion: 1 },
      torpedo: { power: 0.7, accuracy: 1, evasion: 1 },
      asw: { power: 1.3, accuracy: 1, evasion: 1 },
      night: { power: 1, accuracy: 1, evasion: 1 },
    },

    CruisingFormation2: {
      protectionRate: 0.6,
      fleetAntiAir: 1,
      shelling: { power: 1, accuracy: 1, evasion: 1 },
      torpedo: { power: 0.9, accuracy: 1, evasion: 1 },
      asw: { power: 1.1, accuracy: 1, evasion: 1 },
      night: { power: 1, accuracy: 1, evasion: 1 },
    },

    CruisingFormation3: {
      protectionRate: 0.6,
      fleetAntiAir: 1.5,
      shelling: { power: 0.7, accuracy: 1, evasion: 1 },
      torpedo: { power: 0.6, accuracy: 1, evasion: 1 },
      asw: { power: 1, accuracy: 1, evasion: 1 },
      night: { power: 1, accuracy: 1, evasion: 1 },
    },

    CruisingFormation4: {
      protectionRate: 0.6,
      fleetAntiAir: 1,
      /** @see https://kancolle.fandom.com/ja/wiki/%E3%82%B9%E3%83%AC%E3%83%83%E3%83%89:987#13 */
      shelling: { power: 1.1, accuracy: 1.1, evasion: 1 },
      torpedo: { power: 1, accuracy: 1, evasion: 1 },
      asw: { power: 0.7, accuracy: 1, evasion: 1 },
      night: { power: 1, accuracy: 1, evasion: 1 },
    },
  },

  daySpecialAttacks: {
    Zuiun: { priority: 1, denominator: 130, power: 1.35, accuracy: 1 },
    Suisei: { priority: 2, denominator: 130, power: 1.3, accuracy: 1 },

    MainMain: { priority: 3, denominator: 150, power: 1.5, accuracy: 1.2 },
    MainApShell: { priority: 4, denominator: 140, power: 1.3, accuracy: 1.3 },
    MainRader: { priority: 5, denominator: 130, power: 1.2, accuracy: 1.5 },
    MainSecond: { priority: 6, denominator: 120, power: 1.1, accuracy: 1.3 },
    DoubleAttack: { priority: 7, denominator: 130, power: 1.2, accuracy: 1.1 },

    /** @see https://docs.google.com/spreadsheets/d/1i5jTixnOVjqrwZvF_4Uqf3L9ObHhS7dFqG8KiE5awkY */
    FBA: { priority: 1, denominator: 125, power: 1.25, accuracy: 1 },
    BBA: { priority: 2, denominator: 140, power: 1.2, accuracy: 1 },
    BA: { priority: 3, denominator: 155, power: 1.15, accuracy: 1 },
  },

  nightSpecialAttacks: {
    MainTorpRadar: { priority: 1, denominator: 130, power: 1.3, accuracy: 1 },
    TorpLookoutRadar: { priority: 2, denominator: 150, power: 1.2, accuracy: 1 },

    DoubleAttack: { priority: 3, denominator: 110, power: 1.2, accuracy: 1.1 },
    MainTorp: { priority: 3, denominator: 115, power: 1.3, accuracy: 1.5 },
    TorpTorp: { priority: 3, denominator: 122, power: 1.5, accuracy: 1.65 },
    MainMainSecond: { priority: 3, denominator: 130, power: 1.75, accuracy: 1.65 },
    MainMainMain: { priority: 3, denominator: 140, power: 2, accuracy: 1.5 },

    SubmarineTorpTorp: { priority: 3, denominator: 110, power: 1.65, accuracy: 1 },
    SubmarineRadarTorp: { priority: 3, denominator: 102, power: 1.75, accuracy: 1 },

    /**
     * @see https://twitter.com/MorimotoKou/status/1162347762945425410
     */
    AerialAttack1: { priority: 1, denominator: 105, power: 1.25, accuracy: 1 },
    AerialAttack2: { priority: 2, denominator: 115, power: 1.2, accuracy: 1 },
    SuiseiAttack: { priority: 3, denominator: 115, power: 1.2, accuracy: 1 },
    AerialAttack3: { priority: 4, denominator: 125, power: 1.18, accuracy: 1 },
  },
}

export let fhDefinitions: FhDefinitions = deepmerge({}, defaultFhDefinitions)

export const setFhOptions = (options: FhOptions) => {
  fhDefinitions = deepmerge(defaultFhDefinitions, options) as FhDefinitions
}
