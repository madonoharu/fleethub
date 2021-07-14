import { Gear, Ship } from "@fleethub/core";
import { GEAR_KEYS, GearKey, nonNullable, mapValues } from "@fleethub/utils";
import {
  createEquipmentBonuses,
  EquipmentBonuses,
  GearData,
  ShipData,
} from "equipment-bonus";

const toGearData = (gear: Gear): GearData => ({
  accuracy: gear.accuracy,
  antiAir: gear.anti_air,
  armor: gear.armor,
  asw: gear.asw,
  bombing: gear.bombing,
  evasion: gear.evasion,
  firepower: gear.firepower,
  gearId: gear.gear_id,
  los: gear.los,
  name: gear.name,
  radius: gear.radius,
  range: gear.range,
  specialType2: gear.special_type,
  torpedo: gear.torpedo,
  types: gear.types,
  ace: gear.ace,
  stars: gear.stars,
});

const toShipData = (ship: Ship): ShipData => ({
  ctype: ship.ctype,
  shipId: ship.ship_id,
  stype: ship.stype,
  yomi: ship.yomi,
});

const getGears = (ship: Ship, excludedKey?: GearKey) =>
  GEAR_KEYS.map((key) => {
    if (excludedKey === key) return;

    const gear = ship.get_gear(key);
    const data = gear && toGearData(gear);
    gear?.free();

    return data;
  }).filter(nonNullable);

const subtract = (
  left: EquipmentBonuses,
  right: EquipmentBonuses
): EquipmentBonuses => mapValues(left, (value, key) => value - right[key]);

export const getEbonuses = (ship: Ship) =>
  createEquipmentBonuses(toShipData(ship), getGears(ship));

export const makeGetNextEbonuses = (ship: Ship, excludedKey: GearKey) => {
  const filtered = getGears(ship, excludedKey);

  const shipData = toShipData(ship);

  const current = createEquipmentBonuses(shipData, filtered);

  return (gear: Gear) => {
    const next = createEquipmentBonuses(shipData, [
      ...filtered,
      toGearData(gear),
    ]);
    return subtract(next, current);
  };
};
