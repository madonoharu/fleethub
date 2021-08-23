import { Fleet, Org, Ship } from "@fleethub/core";
import {
  AIR_SQUADRON_KEYS,
  FLEET_KEYS,
  Mutable,
  SHIP_KEYS,
} from "@fleethub/utils";
import {
  DeckBuilder as GkcoiDeck,
  DeckBuilderFleet as GkcoiDeckFleet,
  DeckBuilderShip as GkcoiDeckShip,
} from "gkcoi";

import { createDeckItems, getModeNumber } from "./deck";

export type { GkcoiDeck };

const createGkcoiShip = (ship: Ship): GkcoiDeckShip => {
  const items = createDeckItems(ship) || {};

  return {
    id: ship.ship_id,
    lv: ship.level,
    items,
    hp: ship.max_hp ?? NaN,
    fp: ship.firepower ?? NaN,
    tp: ship.torpedo ?? NaN,
    aa: ship.anti_air ?? NaN,
    ar: ship.armor ?? NaN,
    asw: ship.asw ?? NaN,
    ev: ship.evasion ?? NaN,
    los: ship.los ?? NaN,
    luck: ship.luck ?? NaN,
  };
};

const createGkcoiFleet = (fleet: Fleet): GkcoiDeckFleet => {
  const result: Mutable<GkcoiDeckFleet> = {};

  SHIP_KEYS.forEach((key) => {
    const ship = fleet.get_ship(key);

    if (ship && !ship.is_abyssal()) {
      result[key] = createGkcoiShip(ship);
    }
  });

  return result;
};

export type GkcoiTheme = GkcoiDeck["theme"];
export type GkcoiLang = GkcoiDeck["lang"];
export const GkcoiLangs = ["jp", "en", "kr", "scn"] as const;

export type GkcoiOptions = Partial<Pick<GkcoiDeck, "theme" | "lang" | "cmt">>;

const defaultOptions = { lang: "jp", theme: "dark" } as const;

export const createGkcoiDeck = (
  org: Org,
  options?: GkcoiOptions
): GkcoiDeck => {
  const deck: Mutable<GkcoiDeck> = {
    hqlv: org.hq_level,
    ...defaultOptions,
    ...options,
  };

  FLEET_KEYS.forEach((key) => {
    const fleet = org.get_fleet(key);
    if (fleet.len() > 0) {
      deck[key] = createGkcoiFleet(fleet);
    }
  });

  AIR_SQUADRON_KEYS.forEach((key) => {
    const as = org.get_air_squadron(key);

    deck[key] = {
      items: createDeckItems(as) || {},
      mode: getModeNumber(as.mode),
    };
  });

  return deck;
};
