import { GEAR_KEYS, GearKey, mapValues, nonNullable } from "@fh/utils";
import {
  createEquipmentBonuses,
  EquipmentBonuses,
  GearInput,
  ShipInput,
} from "equipment-bonus";
import { Gear, Ship } from "fleethub-core";

const toGearInput = (gear: Gear): GearInput => ({
  accuracy: gear.accuracy,
  anti_air: gear.anti_air,
  armor: gear.armor,
  asw: gear.asw,
  bombing: gear.bombing,
  evasion: gear.evasion,
  firepower: gear.firepower,
  gear_id: gear.gear_id,
  los: gear.los,
  name: gear.name,
  radius: gear.radius,
  range: gear.range,
  torpedo: gear.torpedo,
  types: Array.from(gear.types),
  special_type: gear.special_type,
  ace: gear.ace,
  stars: gear.stars,
});

const toShipInput = (ship: Ship): ShipInput => ({
  ctype: ship.ctype,
  ship_id: ship.ship_id,
  stype: ship.stype,
  yomi: ship.yomi,
});

const getGears = (ship: Ship, excludedKey?: GearKey) =>
  GEAR_KEYS.map((key) => {
    if (excludedKey === key) return;

    const gear = ship.get_gear(key);
    const data = gear && toGearInput(gear);
    gear?.free();

    return data;
  }).filter(nonNullable);

const subtract = (
  left: EquipmentBonuses,
  right: EquipmentBonuses
): EquipmentBonuses => mapValues(left, (value, key) => value - right[key]);

export const getEbonuses = (ship: Ship) =>
  createEquipmentBonuses(toShipInput(ship), getGears(ship));

export const makeGetNextEbonuses = (ship: Ship, excludedKey: GearKey) => {
  const filtered = getGears(ship, excludedKey);

  const ShipInput = toShipInput(ship);

  const current = createEquipmentBonuses(ShipInput, filtered);

  return (gear: Gear) => {
    const next = createEquipmentBonuses(ShipInput, [
      ...filtered,
      toGearInput(gear),
    ]);
    return subtract(next, current);
  };
};
