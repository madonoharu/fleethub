import { Gear } from "@fh/core";

const searchById = (gears: Gear[], searchValue: string) => {
  const str = /^id(\d+)/.exec(searchValue)?.[1];
  if (!str) return;

  const id = Number(str);
  return gears.find((gear) => gear.gear_id === id);
};

const searchGears = (gears: Gear[], searchValue: string) => {
  const idFound = searchById(gears, searchValue);
  if (idFound) {
    return [idFound];
  }

  return gears.filter((gear) =>
    gear.name.toUpperCase().includes(searchValue.toUpperCase())
  );
};

export default searchGears;
