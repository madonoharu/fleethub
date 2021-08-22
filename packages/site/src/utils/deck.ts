import {
  Fleet,
  FleetParams,
  Gear,
  GearParams,
  MasterDataInput,
  Org,
  OrgParams,
  Ship,
  ShipParams,
} from "@fleethub/core";
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
} from "@fleethub/utils";

export type DeckGear = {
  id: number;
  rf?: number | undefined;
  mas?: number | undefined;
};

const DeckItemKeys = ["i1", "i2", "i3", "i4", "i5", "ix"] as const;
type DeckItemKey = typeof DeckItemKeys[number];

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

export type DeckAirbase = {
  items?: DeckItems | undefined;
};

export type Deck = {
  version: 4;
  hqlv?: number | undefined;
} & Dict<FleetKey, DeckFleet> &
  Dict<AirSquadronKey, DeckAirbase>;

const createGearParams = (deck: DeckGear): GearParams => {
  return {
    gear_id: deck.id,
    stars: deck.rf,
    exp: deck.mas && [0, 10, 25, 40, 55, 70, 85, 120][deck.mas],
  };
};

const createGearParamsDict = (items: DeckItems): Dict<GearKey, GearParams> => {
  const result: Dict<GearKey, GearParams> = {};

  GEAR_KEYS.forEach((key) => {
    const item = items[key.replace("g", "i") as DeckItemKey];
    if (item) {
      result[key] = createGearParams(item);
    }
  });

  return result;
};

const createShipParams = (
  master: MasterDataInput,
  deck: DeckShip
): ShipParams => {
  const ship_id = Number(deck.id);
  const gears = deck.items && createGearParamsDict(deck.items);

  const base: ShipParams = {
    ship_id,
    level: deck.lv,
    ...gears,
  };

  const masterShip = master.ships.find(
    (masterShip) => masterShip.ship_id === ship_id
  );

  if (!masterShip) return base;

  const { luck, hp, asw } = deck;
  if (luck && luck > 0) {
    base.luck_mod = luck - (masterShip.luck[0] || 0);
  }
  if (hp && hp > 0) {
    base.max_hp_mod = hp - (masterShip.max_hp[0] || 0);
  }
  if (asw && asw > 0) {
    base.asw_mod = asw - (masterShip.asw[0] || 0);
  }

  return base;
};

const createFleetParams = (
  master: MasterDataInput,
  deck: DeckFleet
): FleetParams => {
  const fleet: FleetParams = {};

  SHIP_KEYS.forEach((key) => {
    const s = deck[key];
    if (s) {
      fleet[key] = createShipParams(master, s);
    }
  });

  return fleet;
};

export const createOrgParamsByDeck = (
  master: MasterDataInput,
  deck: Deck
): OrgParams => {
  const org: OrgParams = {};

  FLEET_KEYS.forEach((key) => {
    const f = deck[key];
    if (f) {
      org[key] = createFleetParams(master, f);
    }
  });

  AIR_SQUADRON_KEYS.forEach((key) => {
    const as = deck[key];
    if (as) {
      const gears = as.items && createGearParamsDict(as.items);
      org[key] = gears;
    }
  });

  return org;
};

export const createDeckItems = (obj: {
  get_gear: (key: string) => Gear | undefined;
}): DeckItems | undefined => {
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

  if (Object.keys(result).length === 0) {
    return;
  }

  return result;
};

const createDeckShip = (ship: Ship): DeckShip => {
  const items = createDeckItems(ship);

  return {
    id: ship.ship_id,
    lv: ship.level,
    items,
    luck: ship.luck || undefined,
  };
};

const createDeckFleet = (fleet: Fleet): DeckFleet => {
  const result: DeckFleet = {};

  SHIP_KEYS.forEach((key) => {
    const ship = fleet.get_ship(key);

    if (ship) {
      result[key] = createDeckShip(ship);
    }
  });

  return result;
};

export const createDeck = (org?: Org): Deck => {
  if (!org) return { version: 4 };

  const deck: Deck = {
    version: 4,
    hqlv: org.hq_level,
  };

  FLEET_KEYS.forEach((key) => {
    const fleet = org.get_fleet(key);
    if (fleet.len() > 0) {
      deck[key] = createDeckFleet(fleet);
    }
  });

  AIR_SQUADRON_KEYS.forEach((key) => {
    const as = org.get_air_squadron(key);

    deck[key] = {
      items: createDeckItems(as),
    };
  });

  return deck;
};
