import {
  AirSquadronKey,
  AIR_SQUADRON_KEYS,
  Dict,
  FleetKey,
  FLEET_KEYS,
  GearKey,
  GEAR_KEYS,
  ShipKey,
  SHIP_KEYS,
} from "@fh/utils";
import {
  Fleet,
  FleetState,
  Gear,
  GearState,
  MasterData,
  Org,
  OrgState,
  Ship,
  ShipState,
  StatInterval,
} from "fleethub-core";

type MaybeNumber = number | string | null | undefined;

function toNumber(input: MaybeNumber): number | undefined {
  if (input === null || input === undefined) {
    return undefined;
  }

  const num = Number(input);

  if (Number.isFinite(num)) {
    return num;
  }

  return undefined;
}

const DeckItemKeys = ["i1", "i2", "i3", "i4", "i5", "ix"] as const;
type DeckItemKey = typeof DeckItemKeys[number];

export type MaybeDeckGear = {
  id: MaybeNumber;
  rf?: MaybeNumber;
  mas?: MaybeNumber;
};

export type MaybeDeckItems = Dict<DeckItemKey, MaybeDeckGear>;

export type MaybeDeckShip = {
  id: number | string;
  lv?: MaybeNumber;
  luck?: MaybeNumber;
  hp?: MaybeNumber;
  asw?: MaybeNumber;
  items?: MaybeDeckItems | undefined;
};

export type MaybeDeckFleet = Dict<ShipKey, MaybeDeckShip>;

export type MaybeDeckAirSquadron = {
  items?: MaybeDeckItems | undefined;
  mode?: number;
};

export type MaybeDeck = {
  version: 4;
  hqlv?: MaybeNumber;
} & Dict<FleetKey, MaybeDeckFleet> &
  Dict<AirSquadronKey, MaybeDeckAirSquadron>;

export type DeckGear = {
  id: number;
  rf?: number | undefined;
  mas?: number | undefined;
};

export type DeckItems = Dict<DeckItemKey, DeckGear>;

export type DeckShip = {
  id: number | string;
  lv?: number | undefined;
  luck?: number | undefined;
  hp?: number | undefined;
  asw?: number | undefined;
  items?: DeckItems | undefined;
};

export type DeckFleet = Dict<ShipKey, DeckShip>;

export type DeckAirSquadron = {
  items?: DeckItems | undefined;
  mode?: number;
};

export type Deck = {
  version: 4;
  hqlv?: number | undefined;
} & Dict<FleetKey, DeckFleet> &
  Dict<AirSquadronKey, DeckAirSquadron>;

function createGearState(deck: MaybeDeckGear): GearState {
  const mas = toNumber(deck.mas);

  return {
    gear_id: toNumber(deck.id) || 0,
    stars: toNumber(deck.rf),
    exp: mas && [0, 10, 25, 40, 55, 70, 85, 120][mas],
  };
}

function createGearStateDict(
  items: MaybeDeckItems,
  slotnum?: number
): Dict<GearKey, GearState> {
  const result: Dict<GearKey, GearState> = {};

  GEAR_KEYS.forEach((key, i) => {
    const item = items[key.replace("g", "i") as DeckItemKey];

    if (!item) return;

    const gear = createGearState(item);

    if (i === slotnum && !items.ix) {
      result.gx = gear;
    } else {
      result[key] = gear;
    }
  });

  return result;
}

const calcCurrentLevelAsw = ([at1, at99]: StatInterval, level: number) => {
  if (at1 === null || at99 === null) {
    return null;
  }

  return Math.floor(((at99 - at1) / 99) * level + at1);
};

const getMarriageBonus = (l: number) => {
  if (l < 30) return 4;
  if (l < 40) return 5;
  if (l < 50) return 6;
  if (l < 70) return 7;
  if (l < 90) return 8;
  return 9;
};

const calcCurrentLevelMaxHp = ([l, r]: StatInterval, level: number) => {
  if (l === null || r === null) return null;
  if (level < 100) return l;
  return Math.min(l + getMarriageBonus(l), r);
};

function createShipState(
  master: MasterData,
  deck: MaybeDeckShip
): ShipState | undefined {
  const ship_id = Number(deck.id);

  const masterShip = master.ships.find(
    (masterShip) => masterShip.ship_id === ship_id
  );

  if (!masterShip) return;

  const gears =
    deck.items && createGearStateDict(deck.items, masterShip.slotnum);

  const base: ShipState = {
    ship_id,
    level: toNumber(deck.lv),
    ...gears,
  };

  const luck = toNumber(deck.luck);
  const hp = toNumber(deck.hp);
  const asw = toNumber(deck.asw);

  if (luck && luck > 0) {
    base.luck_mod = luck - (masterShip.luck[0] || 0);
  }
  if (hp && hp > 0) {
    const currentLevelMaxHp = calcCurrentLevelMaxHp(
      masterShip.max_hp,
      base.level || 99
    );
    base.max_hp_mod = hp - (currentLevelMaxHp || 0);
  }
  if (asw && asw > 0) {
    const currentLevelAsw = calcCurrentLevelAsw(
      masterShip.asw,
      base.level || 99
    );
    base.asw_mod = asw - (currentLevelAsw || 0);
  }

  return base;
}

function createFleetState(
  master: MasterData,
  deck: MaybeDeckFleet
): FleetState {
  const fleet: FleetState = {};

  SHIP_KEYS.forEach((key) => {
    const s = deck[key];
    if (s) {
      fleet[key] = createShipState(master, s);
    }
  });

  return fleet;
}

export function createOrgStateByDeck(
  master: MasterData,
  deck: MaybeDeck
): OrgState {
  const org: OrgState = {};

  FLEET_KEYS.forEach((key) => {
    const f = deck[key];
    org[key] = f ? createFleetState(master, f) : {};
  });

  AIR_SQUADRON_KEYS.forEach((key) => {
    const items = deck[key]?.items;
    org[key] = items ? createGearStateDict(items) : {};
  });

  return org;
}

export function createDeckItems(obj: {
  get_gear: (key: string) => Gear | undefined;
}): DeckItems {
  const result: DeckItems = {};

  GEAR_KEYS.forEach((key) => {
    const gear = obj.get_gear(key);

    if (gear) {
      result[key.replace("g", "i") as DeckItemKey] = {
        id: gear.gear_id,
        rf: gear.stars || undefined,
        mas: gear.ace || undefined,
      };
    }
  });

  return result;
}

function createDeckShip(ship: Ship): DeckShip {
  const items = createDeckItems(ship);

  return {
    id: ship.ship_id,
    lv: ship.level,
    items,
    luck: ship.luck || undefined,
  };
}

function createDeckFleet(fleet: Fleet): DeckFleet {
  const result: DeckFleet = {};

  SHIP_KEYS.forEach((key) => {
    const ship = fleet.get_ship(key);

    if (ship) {
      result[key] = createDeckShip(ship);
    }
  });

  return result;
}

export const getModeNumber = (mode: string) => {
  switch (mode) {
    case "Sortie":
      return 1;
    case "AirDefense":
      return 2;
  }

  return undefined;
};

export const createDeck = (org?: Org): Deck => {
  if (!org) {
    return { version: 4, hqlv: 120 };
  }

  const deck: Deck = {
    version: 4,
    hqlv: org.hq_level,
  };

  FLEET_KEYS.forEach((key) => {
    const fleet = org.clone_fleet(key);
    if (fleet.count_ships() > 0) {
      deck[key] = createDeckFleet(fleet);
    }
  });

  AIR_SQUADRON_KEYS.forEach((key) => {
    const as = org.get_air_squadron(key);

    deck[key] = {
      items: createDeckItems(as),
      mode: getModeNumber(as.mode),
    };
  });

  return deck;
};
