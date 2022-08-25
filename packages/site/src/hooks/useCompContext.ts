import { Path, PathValue } from "@fh/utils";
import constate from "constate";
import { Comp, CompAnalyzerConfig } from "fleethub-core";
import set from "lodash/set";
import React, { useCallback } from "react";
import { useImmer } from "use-immer";

import { useFhCore } from "./useFhCore";

type Props = {
  comp: Comp;
  children: React.ReactNode;
};

const useComp = ({ comp }: Props) => {
  const { analyzer } = useFhCore();

  const [config, updateConfig] = useImmer<CompAnalyzerConfig>({
    engagement: "Parallel",
    formation: comp.default_formation(),
    ship_anti_air_resist: 1,
    fleet_anti_air_resist: 1,
    anti_air_cutin: null,
    left_night_fleet_conditions: {},
    right_night_fleet_conditions: {},
  });

  const bind = useCallback(
    <P extends Path<CompAnalyzerConfig>>(path: P) => {
      return (value: PathValue<CompAnalyzerConfig, P>) => {
        updateConfig((draft) => {
          set(draft, path, value);
        });
      };
    },
    [updateConfig]
  );

  return {
    comp,
    analyzer,
    config,
    updateConfig,
    bind,
  };
};

export const [CompProvider, useCompContext] = constate(useComp);
