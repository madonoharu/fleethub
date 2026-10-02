import { describe, expect, it, spyOn } from "bun:test";
import { act, render, waitFor } from "@testing-library/react";
import type { MasterData } from "fleethub-core";
import { useEffect } from "react";
import { Provider } from "react-redux";
import { SWRConfig, useSWRConfig } from "swr";

import masterDataFixture from "../../../../../../tests/e2e/fixtures/master-data.json";
import { MASTER_DATA_PATH } from "../../../firebase";
import { FhCoreState, useFhCore } from "../../../hooks/useFhCore";
import { GenerationMapContext } from "../../../hooks/useGcs";
import { appSlice, configSlice } from "../../../store";
import { createStore } from "../../../store/createStore";
import { ThemeProvider } from "../../../styles";

import AppWrapper from "./AppWrapper";

function masterData(): MasterData {
  const fixture: unknown = structuredClone(masterDataFixture);
  return fixture as MasterData;
}

function response(data = masterData()): Response {
  return new Response(JSON.stringify(data), {
    headers: { "Content-Type": "application/json" },
  });
}

function setup(fetchData: () => Promise<Response>) {
  const fetchMasterData = spyOn(globalThis, "fetch").mockImplementation(
    Object.assign(fetchData, { preconnect: fetch.preconnect }),
  );
  const store = createStore();
  store.dispatch(
    configSlice.actions.updateMasterShip({
      id: 277,
      changes: { firepower: [200, 200] },
    }),
  );
  const cache = new Map();
  const swrConfig = {
    provider: () => cache,
    shouldRetryOnError: false,
    revalidateOnFocus: false,
    revalidateOnReconnect: false,
  };
  let current: FhCoreState | undefined;
  let revalidate: () => Promise<unknown> = () => {
    throw new Error("The SWR provider must be initialized");
  };
  function DataRefresh({ generation }: { generation: string }) {
    const { mutate } = useSWRConfig();
    useEffect(() => {
      revalidate = () => mutate([MASTER_DATA_PATH, generation]);
    }, [mutate, generation]);
    return null;
  }
  function Probe({ label }: { label: string }) {
    const context = useFhCore();
    useEffect(() => {
      current = context;
    }, [context]);
    return <span>{label}</span>;
  }
  function tree(label: string, generation: string) {
    return (
      <ThemeProvider>
        <Provider store={store}>
          <SWRConfig value={swrConfig}>
            <DataRefresh generation={generation} />
            <GenerationMapContext.Provider value={{ [MASTER_DATA_PATH]: generation }}>
              <AppWrapper>
                <Probe label={label} />
              </AppWrapper>
            </GenerationMapContext.Provider>
          </SWRConfig>
        </Provider>
      </ThemeProvider>
    );
  }
  const view = render(tree("initial child", "1"));
  return {
    ...view,
    store,
    fetchMasterData,
    context: () => current,
    revalidate: () => revalidate(),
    rerender: (label: string, generation = "1") => view.rerender(tree(label, generation)),
  };
}

describe("AppWrapper master-data lifecycle", () => {
  it("keeps the real core and derived data across parent rerenders with active overrides", async () => {
    const view = setup(async () => response());
    await view.findByText("initial child");
    const initial = view.context();
    expect(initial?.core.create_ship_by_id(277)?.naked_firepower).toBe(200);

    view.rerender("updated child");
    expect(view.getByText("updated child")).toBeInTheDocument();
    act(() => {
      view.store.dispatch(appSlice.actions.toggleExplorerOpen());
    });

    expect(view.context()).toBe(initial);
    expect(view.context()?.core).toBe(initial?.core);
    expect(view.context()?.analyzer).toBe(initial?.analyzer);
    expect(view.context()?.allShips).toBe(initial?.allShips);
    expect(view.context()?.masterData).toBe(initial?.masterData);
    expect(view.fetchMasterData).toHaveBeenCalledTimes(1);
  });

  it("rebuilds real calculations when overrides change, source data refreshes, or overrides are removed", async () => {
    const view = setup(async () => response());
    await view.findByText("initial child");
    const initial = view.context();

    act(() => {
      view.store.dispatch(
        configSlice.actions.updateMasterShip({
          id: 277,
          changes: { firepower: [300, 300] },
        }),
      );
    });
    const overridden = view.context();
    expect(overridden?.core).not.toBe(initial?.core);
    expect(overridden?.core.create_ship_by_id(277)?.naked_firepower).toBe(300);
    expect(initial?.core.create_ship_by_id(277)?.naked_firepower).toBe(200);

    const refreshedData = masterData();
    refreshedData.ships[0].armor = [90, 90];
    refreshedData.ships[0].firepower = [100, 100];
    view.fetchMasterData.mockResolvedValue(response(refreshedData));
    view.rerender("refreshed child", "2");
    await view.findByText("refreshed child");
    const refreshed = view.context();
    expect(refreshed?.core).not.toBe(overridden?.core);
    expect(refreshed?.core.create_ship_by_id(277)?.naked_armor).toBe(90);
    expect(refreshed?.core.create_ship_by_id(277)?.naked_firepower).toBe(300);
    expect(view.fetchMasterData.mock.calls.at(-1)?.[0]).toEqual(
      expect.stringContaining("generation=2"),
    );

    act(() => {
      view.store.dispatch(configSlice.actions.removeMasterShip(277));
    });
    expect(view.context()?.core).not.toBe(refreshed?.core);
    expect(view.context()?.core.create_ship_by_id(277)?.naked_firepower).toBe(100);
    expect(view.context()?.core.create_ship_by_id(277)?.naked_armor).toBe(90);
  });

  it("renders nothing while loading and initializes the real core when data arrives", async () => {
    let resolve: (value: Response) => void = () => {
      throw new Error("The pending fetch must be initialized");
    };
    const pending = new Promise<Response>((resolveFetch) => {
      resolve = resolveFetch;
    });
    const view = setup(() => pending);
    expect(view.queryByText("initial child")).not.toBeInTheDocument();
    expect(view.context()).toBeUndefined();

    await act(async () => {
      resolve(response());
      await pending;
    });

    await view.findByText("initial child");
    expect(view.context()?.core.create_ship_by_id(277)?.naked_firepower).toBe(200);
  });

  it("renders fetch errors and recovers when a new master-data generation succeeds", async () => {
    const failure = new Error("Master-data transport failed");
    const logError = spyOn(console, "error").mockImplementation(() => {});
    const view = setup(() => Promise.reject(failure));
    await view.findByText("データ取得に失敗しました");
    expect(view.getByRole("alert")).toHaveTextContent("Master-data transport failed");
    expect(logError).toHaveBeenCalledWith(failure);
    expect(view.context()).toBeUndefined();
    expect(view.queryByText("initial child")).not.toBeInTheDocument();

    view.fetchMasterData.mockResolvedValue(response());
    view.rerender("recovered child", "2");
    await view.findByText("recovered child");
    await waitFor(() => expect(view.queryByRole("alert")).not.toBeInTheDocument());
    expect(view.context()?.core.create_ship_by_id(277)?.naked_firepower).toBe(200);
  });

  it("shows a refresh error instead of children backed by stale data and recovers on retry", async () => {
    const logError = spyOn(console, "error").mockImplementation(() => {});
    const view = setup(async () => response());
    await view.findByText("initial child");
    const initial = view.context();
    const failure = new Error("Master-data refresh failed");
    view.fetchMasterData.mockRejectedValue(failure);

    await act(async () => {
      await view.revalidate();
    });

    expect(view.getByRole("alert")).toHaveTextContent("Master-data refresh failed");
    expect(view.queryByText("initial child")).not.toBeInTheDocument();
    expect(logError).toHaveBeenCalledWith(failure);
    expect(initial?.core.create_ship_by_id(277)?.naked_firepower).toBe(200);

    view.fetchMasterData.mockResolvedValue(response());
    await act(async () => {
      await view.revalidate();
    });

    await view.findByText("initial child");
    expect(view.queryByRole("alert")).not.toBeInTheDocument();
    expect(view.context()?.core.create_ship_by_id(277)?.naked_firepower).toBe(200);
  });
});
