import { Path, PathValue } from "@fh/utils";
import constate from "constate";
import { Comp, Engagement, Formation, NightConditions } from "fleethub-core";
import set from "lodash/set";
import React, { useCallback } from "react";
import { useImmer } from "use-immer";

import { useFhCore } from "./useFhCore";

type FleetInfoState = {
  engagement: Engagement;
  formation: Formation;
  shipAntiAirResist: number;
  fleetAntiAirResist: number;
  anti_air_cutin: number | null;

  attackerNightConditions: NightConditions;
  targetNightConditions: NightConditions;
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
    shipAntiAirResist: 1,
    fleetAntiAirResist: 1,
    anti_air_cutin: null,

    attackerNightConditions: {},
    targetNightConditions: {},
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
