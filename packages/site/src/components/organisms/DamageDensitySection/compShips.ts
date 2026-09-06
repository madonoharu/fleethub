import { nonNullable } from "@fh/utils";
import type { Comp, FleetType, ShipMeta } from "fleethub-core";

/** CompMeta.fleets は Record なので、並び順を実装依存にしないよう明示する。 */
const FLEET_TYPES: FleetType[] = ["Main", "Escort", "RouteSup", "BossSup"];

export interface CompShipEntry extends ShipMeta {
  /**
   * 編成順。画面に並ぶ枠の順で、連合艦隊でも重複しないよう艦隊をまたいだ通し番号。
   * 空き枠も数えるので、画面上の「何番艦」と一致する。
   */
  order: number;
}

/** 編成に乗っている艦を編成順に並べる。 */
export function listCompShips(comp: Comp): CompShipEntry[] {
  const { fleets } = comp.meta();

  let offset = 0;

  return FLEET_TYPES.flatMap((type) => {
    const slots = fleets[type]?.ships ?? [];
    const entries = slots.map(([, ship], index) =>
      ship ? { ...ship, order: offset + index + 1 } : null,
    );

    offset += slots.length;
    return entries.filter(nonNullable);
  });
}

/** 「#3 艦名」。編成順が分からないときは艦名だけ返す。 */
export function withCompShipOrder(
  name: string | undefined,
  order: number | undefined,
): string | undefined {
  if (!name) return name;
  return order === undefined ? name : `#${order} ${name}`;
}

/** 指定の eid の艦が編成に乗っているか。 */
export function hasCompShip(comp: Comp, id: string): boolean {
  return listCompShips(comp).some((ship) => ship.id === id);
}
