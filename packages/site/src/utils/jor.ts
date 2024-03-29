import {
  AIR_SQUADRON_KEYS,
  Dict,
  FLEET_KEYS,
  GearKey,
  GEAR_KEYS,
  SHIP_KEYS,
  SlotSizeKey,
  SLOT_SIZE_KEYS,
} from "@fh/utils";
import {
  AirSquadronState,
  FleetState,
  GearState,
  OrgState,
  ShipState,
} from "fleethub-core";

export type JorGearState = {
  masterId: number;
  improvement?: number;
  proficiency?: number;
};

export type JorShipState = {
  masterId: number;
  level?: number;
  slots?: number[];
  equipments?: (JorGearState | undefined)[];

  currentHp?: number;
  morale?: number;
  increased?: Partial<{
    hp: number;
    armor: number;
    firepower: number;
    torpedo: number;
    antiAir: number;
    asw: number;
    los: number;
    evasion: number;
    luck: number;
    speed: number;
    range: number;
  }>;
};

export type JorFleetState = {
  ships: (JorShipState | undefined)[];
};

export type JorFleetType =
  | "Single"
  | "CarrierTaskForce"
  | "SurfaceTaskForce"
  | "TransportEscort"
  | "Combined";

export type JorAirSquadronState = {
  equipments: (JorShipState | undefined)[];
  slots: number[];
};

export type JorOrgState = {
  name?: string;
  hqLevel?: number;
  description?: string;
  side: "Player" | "Enemy";
  fleetType: JorFleetType;
  fleets: JorFleetState[];
  landBase: JorAirSquadronState[];
};

const createGear = (input: JorGearState): GearState => {
  return {
    gear_id: input.masterId,
    stars: input.improvement,
    exp: input.proficiency,
  };
};

const createGearDict = (
  input: (JorGearState | undefined)[],
  slotnum?: number
): Dict<GearKey, GearState> => {
  const result: Dict<GearKey, GearState> = {};

  GEAR_KEYS.forEach((key, i) => {
    const item = input[i];
    if (!item) return;

    const gear = createGear(item);

    if (i === slotnum) {
      result.gx = gear;
    } else {
      result[key] = gear;
    }
  });

  return result;
};

const createSlotSizeDict = (input: number[]): Dict<SlotSizeKey, number> => {
  const result: Dict<SlotSizeKey, number> = {};

  SLOT_SIZE_KEYS.forEach((key, i) => {
    const value = input.at(i);

    if (typeof value === "number" && value > 0) {
      result[key] = value;
    }
  });

  return result;
};

const createShip = (input: JorShipState): ShipState => {
  const { equipments, slots, increased } = input;
  const gears = equipments && createGearDict(equipments, slots?.length);
  const slotSizeDict = slots && createSlotSizeDict(slots);

  const result: ShipState = {
    ship_id: input.masterId,
    level: input.level,
    current_hp: input.currentHp,
    morale: input.morale,
    asw_mod: increased?.asw,
    anti_air_mod: increased?.antiAir,
    armor_mod: increased?.armor,
    evasion_mod: increased?.evasion,
    firepower_mod: increased?.firepower,
    los_mod: increased?.los,
    luck_mod: increased?.luck,
    max_hp_mod: increased?.hp,
    torpedo_mod: increased?.torpedo,
    ...gears,
    ...slotSizeDict,
  };

  return result;
};

const createFleet = (input: JorFleetState): FleetState => {
  const result: FleetState = {};

  SHIP_KEYS.forEach((key, i) => {
    const item = input.ships[i];
    if (item) {
      result[key] = createShip(item);
    }
  });

  return result;
};

const createAirSquadron = (input: JorAirSquadronState): AirSquadronState => {
  const gears = createGearDict(input.equipments);
  const slots = createSlotSizeDict(input.slots);

  return {
    ...gears,
    ...slots,
  };
};

export const createOrgStateByJor = (input: JorOrgState): OrgState => {
  const result: OrgState = {
    hq_level: input.hqLevel,
  };

  const { fleetType } = input;

  if (fleetType === "Combined") {
    result.org_type = "EnemyCombined";
  } else if (input.side === "Player") {
    result.org_type = fleetType;
  } else {
    result.org_type = "Single";
  }

  FLEET_KEYS.forEach((key, i) => {
    const item = input.fleets.at(i);
    result[key] = item ? createFleet(item) : {};
  });

  AIR_SQUADRON_KEYS.forEach((key, i) => {
    const item = input.landBase.at(i);
    result[key] = item ? createAirSquadron(item) : {};
  });

  return result;
};
