export type Optional<T extends object, K extends keyof T> = Omit<T, K> &
  Partial<Pick<T, K>>;

type Primitive = string | number | bigint | boolean | symbol | null | undefined;
type UnkownFn = (...args: unknown[]) => unknown;

export type SerInput<T> = T extends UnkownFn | Primitive
  ? T
  : T extends Array<infer Item>
  ? SerInput<Item>[]
  : T extends object
  ? Optional<
      {
        [K in keyof T]: SerInput<T[K]>;
      },
      {
        [K in keyof T]: null extends T[K] ? K : never;
      }[keyof T]
    >
  : T;

import type * as bindings from "./bindings";

export type GearParams = SerInput<bindings.GearState>;
export type ShipParams = SerInput<bindings.ShipState>;
export type FleetParams = SerInput<bindings.FleetState>;
export type AirSquadronParams = SerInput<bindings.AirSquadronState>;
export type OrgParams = SerInput<bindings.OrgState>;

export type MasterGearInput = SerInput<bindings.MasterGear>;
export type MasterShipInput = SerInput<bindings.MasterShip>;
export type MasterDataInput = SerInput<bindings.MasterData>;

export type * from "./bindings.d";
