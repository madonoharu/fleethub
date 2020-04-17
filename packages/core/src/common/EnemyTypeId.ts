import { ShipId } from "@fleethub/data"

enum EnemyTypeId {
  None = ShipId["駆逐イ級 id1501"],
  Pillbox = ShipId["砲台小鬼 id1665"],
  IsolatedIsland = ShipId["離島棲姫 id1668"],
  SoftSkinned = ShipId["北方棲姫 id1581"],
  HarbourSummerPrincess = ShipId["港湾夏姫 id1699"],
  SupplyDepot = ShipId["集積地棲姫 id1655"],
}

export default EnemyTypeId
