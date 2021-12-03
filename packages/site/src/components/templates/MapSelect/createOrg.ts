import { MapEnemyComp } from "@fh/utils";
import { FleetState, MasterData, OrgState, ShipState } from "fleethub-core";

const createShip = (md: MasterData, ship_id: number): ShipState => {
  const masterShip = md.ships.find(
    (masterShip) => masterShip.ship_id === ship_id
  );
  const gearEntries = masterShip?.stock.map(
    (g, i) => [`g${i + 1}`, g] as const
  );
  const gears = gearEntries && Object.fromEntries(gearEntries);

  return { ship_id, ...gears };
};

const createFleet = (md: MasterData, shipIds: number[]): FleetState => {
  const entries = shipIds.map(
    (id, i) => [`s${i + 1}`, createShip(md, id)] as const
  );

  const fleet: FleetState = Object.fromEntries(entries);

  fleet.len = shipIds.length;

  return fleet;
};

export const createOrg = (md: MasterData, enemy: MapEnemyComp): OrgState => {
  const { main, escort } = enemy;

  return {
    org_type: escort ? "EnemyCombined" : "EnemySingle",
    f1: createFleet(md, main),
    f2: escort && createFleet(md, escort),
  };
};
