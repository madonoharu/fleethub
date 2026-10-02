import type { Comp } from "fleethub-core";
import { useState } from "react";

type SelectableComp = Pick<Comp, "first_ship_id" | "has_ship_eid">;

export function useCompShipSelection(comp: SelectableComp | undefined) {
  const firstShipId = comp?.first_ship_id();
  const [selectedShipId, setSelectedShipId] = useState(firstShipId);
  const selectionIsPresent =
    comp !== undefined && selectedShipId !== undefined && comp.has_ship_eid(selectedShipId);
  const shipId = selectionIsPresent ? selectedShipId : firstShipId;

  // Remember selection across an empty/absent comp, but commit the fallback
  // when a nonempty comp replaces the selected ship.
  if (firstShipId && selectedShipId !== shipId) {
    setSelectedShipId(firstShipId);
  }

  return [shipId, setSelectedShipId] as const;
}
