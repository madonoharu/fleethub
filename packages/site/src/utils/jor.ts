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
  side: "Player" | "Enemy";
  fleetType: JorFleetType;
  fleets: JorFleetState[];
  landBase: JorAirSquadronState[];
};

export const parseJorUrlData = (url: URL) => {
  const operationJson = url.searchParams.get("operation-json");

  if (operationJson) {
    console.log(JSON.parse(operationJson));
  }
};
