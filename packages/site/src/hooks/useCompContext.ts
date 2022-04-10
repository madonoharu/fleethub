import { Path, PathValue } from "@fh/utils";
import constate from "constate";
import { Comp, Engagement, Formation, NightSituation } from "fleethub-core";
import set from "lodash/set";
import React, { useCallback } from "react";
import { useImmer } from "use-immer";

import { initialNightSituation } from "../store";

import { useFhCore } from "./useFhCore";

type FleetInfoState = {
  engagement: Engagement;
  formation: Formation;
  adjustedAntiAirResist: number;
  fleetAntiAirResist: number;
  anti_air_cutin: number | null;

  attackerNightSituation: NightSituation;
  targetNightSituation: NightSituation;
};

type Props = {
  comp: Comp;
  children: React.ReactNode;
};

const useComp = ({ comp }: Props) => {
  const { analyzer } = useFhCore();

  const [state, update] = useImmer<FleetInfoState>({
    engagement: "Parallel",
    formation: comp.default_formation(),
    adjustedAntiAirResist: 1,
    fleetAntiAirResist: 1,
    anti_air_cutin: null,

    attackerNightSituation: initialNightSituation,
    targetNightSituation: initialNightSituation,
  });

  const bind = useCallback(
    <P extends Path<FleetInfoState>>(path: P) => {
      return (value: PathValue<FleetInfoState, P>) => {
        update((draft) => {
          set(draft, path, value);
        });
      };
    },
    [update]
  );

  return {
    comp,
    analyzer,
    state,
    update,
    bind,
  };
};

export const [CompProvider, useCompContext] = constate(useComp);
