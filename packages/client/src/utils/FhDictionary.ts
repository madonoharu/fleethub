export const StatKeyDictionary = {
  armor: "装甲",
  firepower: "火力",
  torpedo: "雷装",
  speed: "速力",
  bombing: "爆装",
  antiAir: "対空",
  asw: "対潜",
  accuracy: "命中",
  evasion: "回避",
  interception: "迎撃",
  antiBomber: "対爆",
  los: "索敵",
  luck: "運",

  range: "射程",
  radius: "半径",
  cost: "コスト",

  maxHp: "耐久",
}

export const getRangeName = (range: number) => {
  const str = ["無", "短", "中", "長", "超長"][range]

  if (str) return str
  if (range >= 5) return `超長${range}`
  return "不明"
}
