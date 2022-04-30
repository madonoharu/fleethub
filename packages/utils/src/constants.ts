export const AIR_STATES = [
  "AirSupremacy",
  "AirSuperiority",
  "AirParity",
  "AirIncapability",
  "AirDenial",
] as const;

export const SPECIAL_ENEMY_TYPES = [
  "None",
  "Pillbox",
  "IsolatedIsland",
  "HarbourSummerPrincess",
  "SupplyDepot",
  "SoftSkinned",
  "PtImp",
  "BattleshipSummerPrincess",
  "HeavyCruiserSummerPrincess",
] as const;

export const ENGAGEMENTS = ["Parallel", "HeadOn", "GreenT", "RedT"] as const;

export const SINGLE_FORMATIONS = [
  "LineAhead",
  "DoubleLine",
  "Diamond",
  "Echelon",
  "LineAbreast",
  "Vanguard",
] as const;

export const COMBINED_FLEET_FORMATIONS = [
  "Cruising1",
  "Cruising2",
  "Cruising3",
  "Cruising4",
] as const;

export enum ShipType {
  Unknown = 0,
  /// 海防艦
  DE = 1,
  /// 駆逐艦
  DD = 2,
  /// 軽巡洋艦
  CL = 3,
  /// 重雷装巡洋艦
  CLT = 4,
  /// 重巡洋艦
  CA = 5,
  /// 航空巡洋艦
  CAV = 6,
  /// 軽空母
  CVL = 7,
  /// 戦艦
  FBB = 8,
  /// 戦艦
  BB = 9,
  /// 航空戦艦
  BBV = 10,
  /// 正規空母
  CV = 11,
  /// 超弩級戦艦
  XBB = 12,
  /// 潜水艦
  SS = 13,
  /// 潜水空母
  SSV = 14,
  /// 補給艦
  AP = 15,
  /// 水上機母艦
  AV = 16,
  /// 揚陸艦
  LHA = 17,
  /// 装甲空母
  CVB = 18,
  /// 工作艦
  AR = 19,
  /// 潜水母艦
  AS = 20,
  /// 練習巡洋艦
  CT = 21,
  /// 補給艦
  AO = 22,
}

export enum ShipClass {
  Unknown = 0,
  /// 綾波型
  AyanamiClass = 1,
  /// 伊勢型
  IseClass = 2,
  /// 加賀型
  KagaClass = 3,
  /// 球磨型
  KumaClass = 4,
  /// 暁型
  AkatsukiClass = 5,
  /// 金剛型
  KongouClass = 6,
  /// 古鷹型
  FurutakaClass = 7,
  /// 高雄型
  TakaoClass = 8,
  /// 最上型
  MogamiClass = 9,
  /// 初春型
  HatsuharuClass = 10,
  /// 祥鳳型
  ShouhouClass = 11,
  /// 吹雪型
  FubukiClass = 12,
  /// 青葉型
  AobaClass = 13,
  /// 赤城型
  AkagiClass = 14,
  /// 千歳型
  ChitoseClass = 15,
  /// 川内型
  SendaiClass = 16,
  /// 蒼龍型
  SouryuuClass = 17,
  /// 朝潮型
  AsashioClass = 18,
  /// 長門型
  NagatoClass = 19,
  /// 長良型
  NagaraClass = 20,
  /// 天龍型
  TenryuuClass = 21,
  /// 島風型
  ShimakazeClass = 22,
  /// 白露型
  ShiratsuyuClass = 23,
  /// 飛鷹型
  HiyouClass = 24,
  /// 飛龍型
  HiryuuClass = 25,
  /// 扶桑型
  FusouClass = 26,
  /// 鳳翔型
  HoushouClass = 27,
  /// 睦月型
  MutsukiClass = 28,
  /// 妙高型
  MyoukouClass = 29,
  /// 陽炎型
  KagerouClass = 30,
  /// 利根型
  ToneClass = 31,
  /// 龍驤型
  RyuujouClass = 32,
  /// 翔鶴型
  ShoukakuClass = 33,
  /// 夕張型
  YuubariClass = 34,
  /// 海大VI型
  KaidaiVIClass = 35,
  /// 巡潜乙型改二
  JunsenTypeBKai2 = 36,
  /// 大和型
  YamatoClass = 37,
  /// 夕雲型
  YuugumoClass = 38,
  /// 巡潜乙型
  JunsenTypeB = 39,
  /// 巡潜3型
  Junsen3Class = 40,
  /// 阿賀野型
  AganoClass = 41,
  /// 霧の艦隊
  FleetOfFog = 42,
  /// 大鳳型
  TaihouClass = 43,
  /// 潜特型(伊400型潜水艦)
  I400Class = 44,
  /// 特種船丙型
  HeiClassAmphibiousAssaultShip = 45,
  /// 三式潜航輸送艇
  Type3SubmergenceTransportVehicle = 46,
  /// Bismarck級
  BismarckClass = 47,
  /// Z1型
  Z1Class = 48,
  /// 工作艦
  RepairShip = 49,
  /// 大鯨型
  TaigeiClass = 50,
  /// 龍鳳型
  RyuuhouClass = 51,
  /// 大淀型
  OoyodoClass = 52,
  /// 雲龍型
  UnryuuClass = 53,
  /// 秋月型
  AkizukiClass = 54,
  /// Admiral Hipper級
  AdmiralHipperClass = 55,
  /// 香取型
  KatoriClass = 56,
  /// UボートIXC型
  TypeIXCClass = 57,
  /// V.Veneto級
  VittorioVenetoClass = 58,
  /// 秋津洲型
  AkitsushimaClass = 59,
  /// 改風早型
  RevisedKazahayaClass = 60,
  /// Maestrale級
  MaestraleClass = 61,
  /// 瑞穂型
  MizuhoClass = 62,
  /// Graf Zeppelin級
  GrafZeppelinClass = 63,
  /// Zara級
  ZaraClass = 64,
  /// Iowa級
  IowaClass = 65,
  /// 神風型
  KamikazeClass = 66,
  /// Queen Elizabeth級
  QueenElizabethClass = 67,
  /// Aquila級
  AquilaClass = 68,
  /// Lexington級
  LexingtonClass = 69,
  /// C.Teste級
  CommandantTesteClass = 70,
  /// 巡潜甲型改二
  JunsenTypeAKai2 = 71,
  /// 神威型
  KamoiClass = 72,
  /// Гангут級
  GangutClass = 73,
  /// 占守型
  ShimushuClass = 74,
  /// 春日丸級
  KasugaMaruClass = 75,
  /// 大鷹型
  TaiyouClass = 76,
  /// 択捉型
  EtorofuClass = 77,
  /// Ark Royal級
  ArkRoyalClass = 78,
  /// Richelieu級
  RichelieuClass = 79,
  /// Guglielmo Marconi級
  MarconiClass = 80,
  /// Ташкент級
  TashkentClass = 81,
  /// J級
  JClass = 82,
  /// Casablanca級
  CasablancaClass = 83,
  /// Essex級
  EssexClass = 84,
  /// 日振型
  HiburiClass = 85,
  /// 呂号潜水艦
  RoSeries = 86,
  /// John C.Butler級
  JohnCButlerClass = 87,
  /// Nelson級
  NelsonClass = 88,
  /// Gotland級
  GotlandClass = 89,
  /// 日進型
  NisshinClass = 90,
  /// Fletcher級
  FletcherClass = 91,
  /// L.d.S.D.d.Abruzzi級
  DucaDegliAbruzziClass = 92,
  /// Colorado級
  ColoradoClass = 93,
  /// 御蔵型
  MikuraClass = 94,
  /// Northampton級
  NorthamptonClass = 95,
  /// Perth級
  PerthClass = 96,
  /// 陸軍特種船(R1)
  R1 = 97,
  /// De Ruyter級
  DeRuyterClass = 98,
  /// Atlanta級
  AtlantaClass = 99,
  /// 迅鯨型
  JingeiClass = 100,
  /// 松型
  MatsuClass = 101,
  /// South Dakota級
  SouthDakotaClass = 102,
  /// 巡潜丙型
  JunsenTypeC = 103,
  /// 丁型海防艦
  TypeDCoastalDefenseShip = 104,
  /// Yorktown級
  YorktownClass = 105,
  /// St. Louis級
  StLouisClass = 106,
  /// North Carolina級
  NorthCarolinaClass = 107,
  /// Town級
  TownClass = 108,
  /// 潜高型
  SentakaType = 109,
  /// Brooklyn級
  BrooklynClass = 110,
  /// 耐氷型雑用輸送艦
  AuxiliaryTransportShip = 111,
  /// Illustrious級
  IllustriousClass = 112,
  /// Conte di Cavour級
  ConteDiCavourClass = 113,
}
