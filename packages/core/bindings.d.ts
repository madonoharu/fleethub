export type ShipType =
  | "Unknown"
  | "DE"
  | "DD"
  | "CL"
  | "CLT"
  | "CA"
  | "CAV"
  | "CVL"
  | "FBB"
  | "BB"
  | "BBV"
  | "CV"
  | "XBB"
  | "SS"
  | "SSV"
  | "AP"
  | "AV"
  | "LHA"
  | "CVB"
  | "AR"
  | "AS"
  | "CT"
  | "AO";

export type ShipClass =
  | "Unknown"
  | "AyanamiClass"
  | "IseClass"
  | "KagaClass"
  | "KumaClass"
  | "AkatsukiClass"
  | "KongouClass"
  | "FurutakaClass"
  | "TakaoClass"
  | "MogamiClass"
  | "HatsuharuClass"
  | "ShouhouClass"
  | "FubukiClass"
  | "AobaClass"
  | "AkagiClass"
  | "ChitoseClass"
  | "SendaiClass"
  | "SouryuuClass"
  | "AsashioClass"
  | "NagatoClass"
  | "NagaraClass"
  | "TenryuuClass"
  | "ShimakazeClass"
  | "ShiratsuyuClass"
  | "HiyouClass"
  | "HiryuuClass"
  | "FusouClass"
  | "HoushouClass"
  | "MutsukiClass"
  | "MyoukouClass"
  | "KagerouClass"
  | "ToneClass"
  | "RyuujouClass"
  | "ShoukakuClass"
  | "YuubariClass"
  | "KaidaiVIClass"
  | "JunsenTypeBKai2"
  | "YamatoClass"
  | "YuugumoClass"
  | "JunsenTypeB"
  | "Junsen3Class"
  | "AganoClass"
  | "FleetOfFog"
  | "TaihouClass"
  | "I400Class"
  | "AkitsuMaruClass"
  | "Type3SubmergenceTransportVehicle"
  | "BismarckClass"
  | "Z1Class"
  | "RepairShip"
  | "TaigeiClass"
  | "RyuuhouClass"
  | "OoyodoClass"
  | "UnryuuClass"
  | "AkizukiClass"
  | "AdmiralHipperClass"
  | "KatoriClass"
  | "TypeIXCClass"
  | "VittorioVenetoClass"
  | "AkitsushimaClass"
  | "RevisedKazahayaClass"
  | "MaestraleClass"
  | "MizuhoClass"
  | "GrafZeppelinClass"
  | "ZaraClass"
  | "IowaClass"
  | "KamikazeClass"
  | "QueenElizabethClass"
  | "AquilaClass"
  | "LexingtonClass"
  | "CommandantTesteClass"
  | "JunsenTypeAKai2"
  | "KamoiClass"
  | "GangutClass"
  | "ShimushuClass"
  | "KasugaMaruClass"
  | "TaiyouClass"
  | "EtorofuClass"
  | "ArkRoyalClass"
  | "RichelieuClass"
  | "MarconiClass"
  | "TashkentClass"
  | "JClass"
  | "CasablancaClass"
  | "EssexClass"
  | "HiburiClass"
  | "RoSeries"
  | "JohnCButlerClass"
  | "NelsonClass"
  | "GotlandClass"
  | "NisshinClass"
  | "FletcherClass"
  | "DucaDegliAbruzziClass"
  | "ColoradoClass"
  | "MikuraClass"
  | "NorthamptonClass"
  | "PerthClass"
  | "R1"
  | "DeRuyterClass"
  | "AtlantaClass"
  | "JingeiClass"
  | "MatsuClass"
  | "SouthDakotaClass"
  | "JunsenTypeC"
  | "TypeDCoastalDefenseShip"
  | "YorktownClass"
  | "StLouisClass"
  | "NorthCarolinaClass"
  | "TownClass"
  | "SentakaType"
  | "BrooklynClass"
  | "AuxiliaryTransportShip"
  | "IllustriousClass"
  | "ConteDiCavourClass";

export type ShipAttr =
  | "Abyssal"
  | "NightCarrier"
  | "Installation"
  | "RoyalNavy"
  | "Kai2"
  | "TurbineSpeedBonus"
  | "Pillbox"
  | "IsolatedIsland"
  | "HarbourSummerPrincess"
  | "SupplyDepot"
  | "PtImp"
  | "BattleshipSummerPrincess"
  | "HeavyCruiserSummerPrincess";

export type SpecialEnemyType =
  | "None"
  | "SoftSkinned"
  | "Pillbox"
  | "IsolatedIsland"
  | "SupplyDepot"
  | "HarbourSummerPrincess"
  | "PtImp"
  | "BattleshipSummerPrincess"
  | "HeavyCruiserSummerPrincess";

export type DamageState = "Normal" | "Shouha" | "Chuuha" | "Taiha" | "Sunk";

export type MoraleState = "Sparkle" | "Normal" | "Orange" | "Red";

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

export type AirState =
  | "AirSupremacy"
  | "AirSuperiority"
  | "AirParity"
  | "AirDenial"
  | "AirIncapability";

export type Engagement = "GreenT" | "Parallel" | "HeadOn" | "RedT";

export type Formation = SingleFormation | CombinedFormation;

export interface FormationWarfareDef {
  power_mod: number | null;
  accuracy_mod: number | null;
  evasion_mod: number | null;
}

export interface NormalFormationDef {
  tag: Formation;
  protection_rate: number | null;
  fleet_anti_air_mod: number;
  shelling: FormationWarfareDef;
  torpedo: FormationWarfareDef;
  asw: FormationWarfareDef;
  night: FormationWarfareDef;
}

export type FormationDef =
  | NormalFormationDef
  | {
      top_half: NormalFormationDef;
      bottom_half: NormalFormationDef;
    };

export type DayCutin =
  | "MainMain"
  | "MainAp"
  | "MainRader"
  | "MainSec"
  | "DoubleAttack"
  | "FBA"
  | "BBA"
  | "BA"
  | "Zuiun"
  | "AirSea";

export interface DayCutinDef {
  tag: DayCutin;
  hits: number;
  chance_denom: number | null;
  power_mod: number | null;
  accuracy_mod: number | null;
}

export type NightCutin =
  | "DoubleAttack"
  | "TorpTorpMain"
  | "TorpTorpTorp"
  | "MainMainSec"
  | "MainMainMain"
  | "MainTorpRadar"
  | "TorpLookoutRadar"
  | "TorpTsloTorp"
  | "TorpTsloDrum"
  | "SubTorpTorp"
  | "SubRadarTorp"
  | "Cvci1_25"
  | "Cvci1_20"
  | "Cvci1_18"
  | "Photobomber";

export interface NightCutinDef {
  tag: NightCutin;
  hits: number;
  chance_denom: number | null;
  power_mod: number | null;
  accuracy_mod: number | null;
}

export interface AntiAirCutinDef {
  id: number;
  chance_numer: number | null;
  multiplier: number | null;
  minimum_bonus: number | null;
  sequential: boolean | null;
}

export type ContactRank = "Rank1" | "Rank2" | "Rank3";

export type Side = "Player" | "Enemy";

export type Role = "Main" | "Escort" | "RouteSup" | "BossSup";

export type OrgType =
  | "Single"
  | "CarrierTaskForce"
  | "SurfaceTaskForce"
  | "TransportEscort"
  | "EnemySingle"
  | "EnemyCombined";

export type GearType =
  | "Unknown"
  | "SmallMainGun"
  | "MediumMainGun"
  | "LargeMainGun"
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
  | "Engine"
  | "AntiAirShell"
  | "ApShell"
  | "VtFuze"
  | "AntiAirGun"
  | "MidgetSubmarine"
  | "EmergencyRepair"
  | "LandingCraft"
  | "Rotorcraft"
  | "AntiSubPatrolAircraft"
  | "MediumArmor"
  | "LargeArmor"
  | "Searchlight"
  | "SupplyContainer"
  | "ShipRepairFacility"
  | "SubmarineTorpedo"
  | "Starshell"
  | "CommandFacility"
  | "AviationPersonnel"
  | "AntiAirFireDirector"
  | "AntiGroundEquipment"
  | "LargeMainGun2"
  | "ShipPersonnel"
  | "LargeSonar"
  | "LargeFlyingBoat"
  | "LargeSearchlight"
  | "CombatRation"
  | "Supplies"
  | "SeaplaneFighter"
  | "AmphibiousTank"
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

export type GearAttr =
  | "Abyssal"
  | "HighAngleMount"
  | "NightFighter"
  | "NightAttacker"
  | "HeavyBomber"
  | "MainGun"
  | "Radar"
  | "SurfaceRadar"
  | "AirRadar"
  | "DepthChargeProjector"
  | "AdditionalDepthCharge"
  | "AntiSubMortar"
  | "AntiSubWeapon"
  | "AntiSubAircraft"
  | "Seaplane"
  | "CbAircraft"
  | "LbAircraft"
  | "JetAircraft"
  | "Fighter"
  | "Recon"
  | "ObservationSeaplane"
  | "CbFighterBomber"
  | "AntiInstDiveBomber"
  | "NightRecon"
  | "CbSwordfish"
  | "SemiNightPlane"
  | "HighAltitudeInterceptor";

export type AirSquadronMode = "Sortie" | "AirDefense";

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
  morale: number | null;
  ammo: number | null;
  fuel: number | null;
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
  len: number | null;
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
  mode: AirSquadronMode | null;
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
  tag: string;
  id: number;
  name: string;
}

export interface MasterAttrRule {
  tag: string;
  name: string;
  expr: string;
}

export type StatInterval = [number | null, number | null];

export interface MasterShip {
  ship_id: number;
  name: string;
  yomi: string;
  stype: number;
  ctype: number;
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
  elos: Array<MasterIBonusRule>;
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

export interface MasterConstants {
  formations: Array<FormationDef>;
  anti_air_cutins: Array<AntiAirCutinDef>;
  day_cutins: Array<DayCutinDef>;
  night_cutins: Array<NightCutinDef>;
}

export interface MasterData {
  gears: Array<MasterGear>;
  gear_attrs: Array<MasterAttrRule>;
  ships: Array<MasterShip>;
  ship_attrs: Array<MasterAttrRule>;
  ship_banners: Record<string, string>;
  equippable: MasterEquippable;
  ibonuses: MasterIBonuses;
  constants: MasterConstants;
}

export interface AttackPowerModifiers {
  a5: number;
  b5: number;
  a6: number;
  b6: number;
  a7: number;
  b7: number;
  a11: number;
  b11: number;
  a12: number;
  b12: number;
  a13: number;
  b13: number;
  a13_2: number;
  b13_2: number;
  a14: number;
  b14: number;
}

export interface AttackPowerParams {
  basic: number;
  cap: number;
  mods: AttackPowerModifiers;
  ap_shell_mod: number | null;
  carrier_power: number | null;
  proficiency_critical_mod: number | null;
  armor_penetration: number;
  remaining_ammo_mod: number;
}

export interface AttackPower {
  precap: number;
  is_capped: boolean;
  capped: number;
  normal: number;
  critical: number;
  armor_penetration: number;
  remaining_ammo_mod: number;
}

export interface HitRateParams {
  accuracy_term: number;
  evasion_term: number;
  morale_mod: number;
  critical_rate_constant: number;
  critical_percentage_bonus: number;
  hit_percentage_bonus: number;
}

export interface HitRate {
  total: number;
  normal: number;
  critical: number;
}

export interface WarfareShipEnvironment {
  org_type: OrgType;
  role: Role;
  ship_index: number;
  fleet_len: number;
  formation: Formation;
  fleet_los_mod: number | null;
}

export interface WarfareContext {
  attacker_env: WarfareShipEnvironment;
  target_env: WarfareShipEnvironment;
  engagement: Engagement;
  air_state: AirState;
}

export interface NightSituation {
  night_contact_rank: ContactRank | null;
  starshell: boolean;
  searchlight: boolean;
}

export type ShellingAttackType = "Normal" | "Carrier";

export type NightAttackType = "Normal" | "ArkRoyal" | "Carrier";

export type AswAttackType = "DepthCharge" | "Aircraft";

export interface DayCutinRateInfo {
  observation_term: number | null;
  rates: Array<[DayCutin | null, number | null]>;
  total_cutin_rate: number | null;
}

export interface ShipDayCutinRateInfo {
  ship_id: number;
  air_supremacy: DayCutinRateInfo;
  air_superiority: DayCutinRateInfo;
}

export interface FleetDayCutinRateInfo {
  fleet_los_mod: number | null;
  ships: Array<ShipDayCutinRateInfo>;
}

export interface OrgDayCutinRateInfo {
  main: FleetDayCutinRateInfo;
  escort: FleetDayCutinRateInfo;
}

export interface ShipAntiAirInfo {
  ship_id: number;
  adjusted_anti_air: number | null;
  proportional_shotdown_rate: number | null;
  fixed_shotdown_number: number | null;
  minimum_bonus: number | null;
  anti_air_cutin_chance: Array<[number, number]>;
  anti_air_propellant_barrage_chance: number | null;
}

export interface OrgAntiAirInfo {
  fleet_anti_air: number;
  ships: Array<ShipAntiAirInfo>;
  anti_air_cutin_chance: Array<[number, number]>;
}

export interface NightCutinRateInfo {
  cutin_term: number | null;
  rates: Array<[NightCutin | null, number | null]>;
}

export interface ShipNightCutinRateInfo {
  ship_id: number;
  normal: NightCutinRateInfo;
  chuuha: NightCutinRateInfo;
}

export interface NightContactChance {
  rank1: number;
  rank2: number;
  rank3: number;
  total: number;
}

export interface OrgNightCutinRateInfo {
  contact_chance: NightContactChance;
  ships: Array<ShipNightCutinRateInfo>;
}

export interface AirstrikeContactChance {
  air_state: AirState;
  trigger_rate: number;
  rank3: number;
  rank2: number;
  rank1: number;
  total: number;
}

export interface OrgContactChanceInfo {
  single: Array | null;
  combined: Array | null;
}

export interface OrgAirstrikeInfo {
  contact_chance: OrgContactChanceInfo;
}

export interface AttackStats {
  attack_power: AttackPower | null;
  attack_power_params: AttackPowerParams | null;
  hit_rate: HitRate | null;
  hit_rate_params: HitRateParams | null;
  damage: DamageInfo | null;
}

export interface AttackInfoItem<Cutin> {
  cutin: Cutin;
  rate: number | null;
  stats: AttackStats;
}

export interface AttackInfo<AttackType, Cutin> {
  attack_type: AttackType;
  items: Array<AttackInfoItem<Cutin>>;
  damage_state_map: Record<DamageState, number>;
  damage_state_map_is_empty: boolean;
}

export interface DamageInfo {
  miss_damage_min: number;
  miss_damage_max: number;
  normal_damage_min: number;
  normal_damage_max: number;
  critical_damage_min: number;
  critical_damage_max: number;
  damage_map: Record<number, number>;
  damage_state_map: Record<DamageState, number>;
}

export type DayBattleAttackType =
  | { t: "Shelling"; c: ShellingAttackType }
  | {
      t: "Asw";
      c: AswAttackType;
    };

export type NightBattleAttackType =
  | { t: "NightAttack"; c: NightAttackType }
  | {
      t: "Asw";
      c: AswAttackType;
    };

export interface WarfareAnalysisParams {
  warfare_context: WarfareContext;
  attacker_night_situation: NightSituation;
  target_night_situation: NightSituation;
}

export interface WarfareInfo {
  day: AttackInfo<DayBattleAttackType, DayCutin | null> | null;
  closing_torpedo: AttackInfo<null, null> | null;
  night: AttackInfo<NightBattleAttackType, NightCutin | null> | null;
}
