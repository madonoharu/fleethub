import {
  AirSquadronState,
  FleetState,
  GearState,
  OrgState,
  ShipState,
} from "fleethub-core";

interface Slotitem {
  mstID: number;
  level: number;
  skillLevel: number;
}

interface Squadron {
  mst_id: number;
  level: number;
  skill_level: number;
}

interface Ship {
  mstID: number;
  level: number;
  gradeUpLuck: number;
  gradeUpTaikyu: number;
  gradeUpTaisen: number;

  getSlotitems(): (Slotitem | null)[];
  getSlotitemEx(): Slotitem | null;
}

interface ShipMap {
  get(id: number): Ship | null;
}

interface Airunit {
  squadrons: Squadron[];
}

interface AirnuitMap {
  _dic: Partial<Record<number, Airunit[]>>;
}

interface Deck {
  name: string;
  getShipList(): (Ship | null)[];
}

interface DeckMap {
  getAll(): Deck[];
}

interface Model {
  ship: ShipMap;
  airunit: AirnuitMap;
  deck: DeckMap;
}

function setExp(gear: GearState, ace: number) {
  const exp = [0, 10, 25, 40, 55, 70, 85, 100][ace] || null;
  if (exp !== null) {
    gear.exp = exp;
  }
}

function createGear(input: Slotitem): GearState {
  const result: GearState = {
    gear_id: input.mstID,
    stars: input.level,
  };

  setExp(result, input.skillLevel);

  return result;
}

function createShip(input: Ship): ShipState {
  const { mstID, gradeUpLuck, gradeUpTaikyu, gradeUpTaisen } = input;

  const result: ShipState = {
    ship_id: mstID,
    luck_mod: gradeUpLuck,
    max_hp_mod: gradeUpTaikyu,
    asw_mod: gradeUpTaisen,
  };

  const slotitems = input.getSlotitems();
  const ex = input.getSlotitemEx();

  slotitems.forEach((item, index) => {
    if (item) {
      result[`g${index + 1}` as "g1"] = createGear(item);
    }
  });

  if (ex) {
    result.gx = createGear(ex);
  }

  return {
    ship_id: mstID,
    luck_mod: gradeUpLuck,
    max_hp_mod: gradeUpTaikyu,
    asw_mod: gradeUpTaisen,
  };
}

function createAirSquadron(input: Airunit): AirSquadronState {
  const result: AirSquadronState = {};

  input.squadrons.forEach((item, index) => {
    if (!item.mst_id) {
      return;
    }

    const state: GearState = {
      gear_id: item.mst_id,
      stars: item.level,
    };

    setExp(state, item.skill_level);

    result[`g${index + 1}` as "g1"] = state;
  });

  return result;
}

function createFleet(input: Deck): FleetState {
  const result: FleetState = {};

  input.getShipList().forEach((ship, index) => {
    if (!ship) {
      return;
    }

    result[`s${index + 1}` as "s1"] = createShip(ship);
  });

  return result;
}

function createOrgState(model: Model): OrgState {
  const result: OrgState = {};

  model.deck.getAll().forEach((deck, index) => {
    result[`f${index + 1}` as "f1"] = createFleet(deck);
  });

  const maxMapId = Math.max(...Object.keys(model.airunit._dic).map(Number));
  const airunitArray = model.airunit._dic[maxMapId];
  if (airunitArray) {
    airunitArray.forEach((airunit, index) => {
      result[`a${index + 1}` as "a1"] = createAirSquadron(airunit);
    });
  }

  return result;
}

declare const temp1: { model: Model };

const org = createOrgState(temp1.model);
const str = JSON.stringify(org);
const url = new URL("https://jervis.vercel.app");
url.searchParams.set("org", str);
window.open(url, "_blank", "noreferrer");