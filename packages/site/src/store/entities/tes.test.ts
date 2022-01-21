import { entitiesSlice } from "./entitiesSlice";
import { schemata } from "./schemata";

// https://github.com/vercel/next.js/issues/32539

let count = 0;
const genId = () => `${count++}`;

schemata.forEach((schema) => {
  schema.generateId = genId;
});

it("entitiesSlice", () => {
  const initialState = entitiesSlice.getInitialState();

  const action = entitiesSlice.actions.createShip({
    id: genId(),
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
