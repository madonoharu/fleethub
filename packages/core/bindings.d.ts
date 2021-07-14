export type DayCutin =
  | "MainMain"
  | "MainApShell"
  | "MainRader"
  | "MainSecond"
  | "DoubleAttack"
  | "FBA"
  | "BBA"
  | "BA"
  | "Zuiun"
  | "AirSea";

export type SingleFormation =
  | "LineAhead"
  | "DoubleLine"
  | "Diamond"
  | "Echelon"
  | "LineAbreast"
  | "Vanguard";

export type CombinedFormation =
  | "Cruising1"
  | "Cruising2"
  | "Cruising3"
  | "Cruising4";

export type Formation = SingleFormation | CombinedFormation;

export type GearType =
  | "Unknown"
  | "SmallCaliberMainGun"
  | "MediumCaliberMainGun"
  | "LargeCaliberMainGun"
  | "SecondaryGun"
  | "Torpedo"
  | "CbFighter"
  | "CbDiveBomber"
  | "CbTorpedoBomber"
  | "CbRecon"
  | "ReconSeaplane"
  | "SeaplaneBomber"
  | "SmallRadar"
  | "LargeRadar"
  | "Sonar"
  | "DepthCharge"
  | "ExtraArmor"
  | "EngineImprovement"
  | "AntiAirShell"
  | "ApShell"
  | "VtFuze"
  | "AntiAirGun"
  | "MidgetSubmarine"
  | "EmergencyRepairPersonnel"
  | "LandingCraft"
  | "Autogyro"
  | "AntiSubPatrolAircraft"
  | "MediumExtraArmor"
  | "LargeExtraArmor"
  | "Searchlight"
  | "SupplyTransportContainer"
  | "ShipRepairFacility"
  | "SubmarineTorpedo"
  | "Starshell"
  | "CommandFacility"
  | "AviationPersonnel"
  | "AntiAirFireDirector"
  | "AntiGroundEquipment"
  | "LargeCaliberMainGun2"
  | "SurfaceShipPersonnel"
  | "LargeSonar"
  | "LargeFlyingBoat"
  | "LargeSearchlight"
  | "CombatRation"
  | "Supplies"
  | "SeaplaneFighter"
  | "SpecialAmphibiousTank"
  | "LbAttacker"
  | "LbFighter"
  | "LbRecon"
  | "TransportationMaterial"
  | "SubmarineEquipment"
  | "LargeLbAircraft"
  | "JetFighter"
  | "JetFighterBomber"
  | "JetTorpedoBomber"
  | "JetRecon"
  | "LargeRadar2"
  | "CbRecon2";

export interface GearState {
  id: string | null;
  gear_id: number;
  exp: number | null;
  stars: number | null;
}

export interface ShipState {
  id: string | null;
  ship_id: number;
  level: number | null;
  current_hp: number | null;
  max_hp_mod: number | null;
  firepower_mod: number | null;
  torpedo_mod: number | null;
  armor_mod: number | null;
  anti_air_mod: number | null;
  evasion_mod: number | null;
  asw_mod: number | null;
  los_mod: number | null;
  luck_mod: number | null;
  g1: GearState | null;
  g2: GearState | null;
  g3: GearState | null;
  g4: GearState | null;
  g5: GearState | null;
  gx: GearState | null;
  ss1: number | null;
  ss2: number | null;
  ss3: number | null;
  ss4: number | null;
  ss5: number | null;
}

export interface FleetState {
  id: string | null;
  s1: ShipState | null;
  s2: ShipState | null;
  s3: ShipState | null;
  s4: ShipState | null;
  s5: ShipState | null;
  s6: ShipState | null;
  s7: ShipState | null;
}

export interface AirSquadronState {
  id: string | null;
  g1: GearState | null;
  g2: GearState | null;
  g3: GearState | null;
  g4: GearState | null;
  ss1: number | null;
  ss2: number | null;
  ss3: number | null;
  ss4: number | null;
}

export type OrgType =
  | "Single"
  | "CarrierTaskForce"
  | "SurfaceTaskForce"
  | "TransportEscort"
  | "EnemyCombined";

export interface OrgState {
  id: string | null;
  f1: FleetState | null;
  f2: FleetState | null;
  f3: FleetState | null;
  f4: FleetState | null;
  a1: AirSquadronState | null;
  a2: AirSquadronState | null;
  a3: AirSquadronState | null;
  hq_level: number | null;
  org_type: OrgType | null;
  side: Side | null;
}

export interface DayCutinRateAnalysis {
  observation_term: number | null;
  rates: Array<[DayCutin, number | null]>;
  total_cutin_rate: number | null;
}

export interface ShipDayCutinRateAnalysis {
  name: string;
  banner: string | null;
  air_supremacy: DayCutinRateAnalysis;
  air_superiority: DayCutinRateAnalysis;
}

export interface FleetDayCutinRateAnalysis {
  fleet_los_mod: number | null;
  ships: Array<ShipDayCutinRateAnalysis>;
}

export interface OrgDayCutinRateAnalysis {
  main: FleetDayCutinRateAnalysis;
  escort: FleetDayCutinRateAnalysis;
}

export interface ShipAntiAirAnalysis {
  ship_id: number;
  adjusted_anti_air: number | null;
  proportional_shotdown_rate: number | null;
  fixed_shotdown_number: number | null;
  minimum_bonus: number | null;
  anti_air_cutin_chance: Array<[number, number]>;
  anti_air_propellant_barrage_chance: number | null;
}

export interface OrgAntiAirAnalysis {
  fleet_anti_air: number;
  ships: Array<ShipAntiAirAnalysis>;
  anti_air_cutin_chance: Array<[number, number]>;
}

export interface FormationAttackModifiers {
  power: number;
  accuracy: number;
  evasion: number;
}

export type FormationAttackDef =
  | FormationAttackModifiers
  | {
      top_half: FormationAttackModifiers;
      bottom_half: FormationAttackModifiers;
    };

export interface FormationDef {
  kind: Formation;
  protection_rate: number;
  fleet_anti_air: number;
  shelling: FormationAttackDef;
  torpedo: FormationAttackDef;
  asw: FormationAttackDef;
  night: FormationAttackDef;
}

export type SpeedGroup = "A" | "B1" | "B2" | "C";

export type GearTypes = [number, number, number, number, number];

export interface MasterGear {
  gear_id: number;
  name: string;
  types: GearTypes;
  special_type: number | null;
  max_hp: number | null;
  firepower: number | null;
  armor: number | null;
  torpedo: number | null;
  anti_air: number | null;
  speed: number | null;
  bombing: number | null;
  asw: number | null;
  los: number | null;
  luck: number | null;
  accuracy: number | null;
  evasion: number | null;
  range: number | null;
  radius: number | null;
  cost: number | null;
  improvable: boolean | null;
  adjusted_anti_air_resistance: number | null;
  fleet_anti_air_resistance: number | null;
}

export interface MasterVariantDef {
  id: number;
  key: string;
  name: string;
}

export interface MasterAttrRule {
  key: string;
  name: string;
  expr: string;
}

export type StatInterval = [number | null, number | null];

export interface MasterShip {
  ship_id: number;
  name: string;
  yomi: string;
  stype: number;
  ctype: number | null;
  sort_id: number | null;
  max_hp: StatInterval;
  firepower: StatInterval;
  armor: StatInterval;
  torpedo: StatInterval;
  evasion: StatInterval;
  anti_air: StatInterval;
  asw: StatInterval;
  los: StatInterval;
  luck: StatInterval;
  speed: number;
  range: number | null;
  fuel: number | null;
  ammo: number | null;
  next_id: number | null;
  next_level: number | null;
  slotnum: number;
  slots: Array;
  stock: Array<GearState>;
  speed_group: SpeedGroup | null;
  useful: boolean | null;
}

export interface MasterIBonusRule {
  expr: string;
  formula: string;
}

export interface MasterIBonuses {
  shelling_power: Array<MasterIBonusRule>;
  shelling_accuracy: Array<MasterIBonusRule>;
  torpedo_power: Array<MasterIBonusRule>;
  torpedo_accuracy: Array<MasterIBonusRule>;
  torpedo_evasion: Array<MasterIBonusRule>;
  asw_power: Array<MasterIBonusRule>;
  asw_accuracy: Array<MasterIBonusRule>;
  night_power: Array<MasterIBonusRule>;
  night_accuracy: Array<MasterIBonusRule>;
  defense_power: Array<MasterIBonusRule>;
  contact_selection: Array<MasterIBonusRule>;
  fighter_power: Array<MasterIBonusRule>;
  adjusted_anti_air: Array<MasterIBonusRule>;
  fleet_anti_air: Array<MasterIBonusRule>;
  effective_los: Array<MasterIBonusRule>;
}

export interface EquipStype {
  id: number;
  equip_type: Array<number>;
}

export interface MstEquipShip {
  api_ship_id: number;
  api_equip_type: Array<number>;
}

export interface MstEquipExslotShip {
  api_slotitem_id: number;
  api_ship_ids: Array<number>;
}

export interface MasterEquippable {
  equip_stype: Array<EquipStype>;
  equip_exslot: Array<number>;
  equip_ship: Array<MstEquipShip>;
  equip_exslot_ship: Array<MstEquipExslotShip>;
}

export interface MasterData {
  gears: Array<MasterGear>;
  gear_types: Array<MasterVariantDef>;
  gear_attrs: Array<MasterAttrRule>;
  ships: Array<MasterShip>;
  ship_types: Array<MasterVariantDef>;
  ship_classes: Array<MasterVariantDef>;
  ship_attrs: Array<MasterAttrRule>;
  ship_banners: Record<string, string>;
  ibonuses: MasterIBonuses;
  equippable: MasterEquippable;
}
