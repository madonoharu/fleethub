import { ActionCreators } from "redux-undo";

import { appSlice } from "./appSlice";
import { configSlice } from "./configSlice";
import { createStore } from "./createStore";

function setup() {
  const store = createStore();
  const shipOverride = () =>
    store.getState().present.config.masterData?.ships?.[1];

  const editConfig = () =>
    store.dispatch(
      configSlice.actions.updateMasterShip({ id: 1, changes: {} }),
    );

  return { store, shipOverride, editConfig };
}

it("undo でダメージ分布の表示の設定は戻さない", () => {
  const { store, shipOverride, editConfig } = setup();

  editConfig();
  store.dispatch(appSlice.actions.setDamageDensityOpen(true));
  store.dispatch(appSlice.actions.setDamageDensityIncludeNoPenetration(false));

  store.dispatch(ActionCreators.undo());

  expect(shipOverride()).toBeUndefined();
  expect(store.getState().present.app.damageDensityOpen).toBe(true);
  expect(store.getState().present.app.damageDensityIncludeNoPenetration).toBe(
    false,
  );
});

it("redo でもダメージ分布の表示の設定は戻さない", () => {
  const { store, shipOverride, editConfig } = setup();

  editConfig();
  store.dispatch(ActionCreators.undo());
  store.dispatch(appSlice.actions.setDamageDensityOpen(true));

  store.dispatch(ActionCreators.redo());

  expect(shipOverride()).toEqual({});
  expect(store.getState().present.app.damageDensityOpen).toBe(true);
});
