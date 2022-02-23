/* eslint-disable @typescript-eslint/no-unsafe-return */
import { entitiesSlice } from "./entitiesSlice";

jest.mock("@reduxjs/toolkit", () => {
  const originalModule = jest.requireActual("@reduxjs/toolkit");

  let count = 0;
  const nanoid = () => `${count++}`;

  return {
    __esModule: true,
    ...originalModule,
    nanoid,
  };
});

it("entitiesSlice", () => {
  const initialState = entitiesSlice.getInitialState();

  const action = entitiesSlice.actions.createShip({
    input: {
      ship_id: 1,
      g1: { gear_id: 2 },
    },
  });

  const state = entitiesSlice.reducer(initialState, action);

  expect(state).toMatchObject({
    gears: {
      ids: ["1"],
      entities: { "1": { id: "1", gear_id: 2 } },
    },
    ships: {
      ids: ["0"],
      entities: { "0": { id: "0", ship_id: 1, g1: "1" } },
    },
  });
});
