import { Path, PathValue } from "@fh/utils";
import { Stack } from "@mui/material";
import type { Comp, NodeAttackAnalyzerConfig } from "fleethub-core";
import { produce } from "immer";
import set from "es-toolkit/compat/set";
import { useTranslation } from "next-i18next/pages";
import React from "react";

import CompShipList from "../CompShipList";
import FormationSelect from "../FormationSelect";
import NightFleetConditionsForm from "../NightFleetConditionsForm";
import { cn } from "../../../styles";

interface Props {
  config: NodeAttackAnalyzerConfig;
  leftShipId: string | undefined;
  rightShipId: string | undefined;
  leftComp: Comp | undefined;
  rightComp: Comp | undefined;
  disableConfig?: boolean | undefined;
  onLeftShipChange: (id: string) => void;
  onRightShipChange: (id: string) => void;
  onConfigChange: (value: NodeAttackAnalyzerConfig) => void;
}

const AnalyzerForm: React.FCX<Props> = ({
  className,
  config,
  leftShipId,
  rightShipId,
  leftComp,
  rightComp,
  disableConfig,
  onLeftShipChange,
  onRightShipChange,
  onConfigChange,
}) => {
  const { t } = useTranslation("common");

  const bind =
    <P extends Path<NodeAttackAnalyzerConfig>>(path: P) =>
    (value: PathValue<NodeAttackAnalyzerConfig, P>) => {
      const next = produce(config, (draft) => {
        set(draft, path, value);
      });

      onConfigChange(next);
    };

  return (
    <div className={className}>
      {leftComp && (
        <div>
          <CompShipList comp={leftComp} selectedShip={leftShipId} onShipClick={onLeftShipChange} />
          <Stack className="gap-2" direction="row">
            <FormationSelect
              color="primary"
              label={t("Formation.name")}
              combined={leftComp.is_combined()}
              value={config.left?.formation || "LineAhead"}
              onChange={bind("left.formation")}
              disabled={disableConfig}
            />
            <NightFleetConditionsForm
              color="primary"
              value={config.left}
              onChange={bind("left")}
              disabled={disableConfig}
            />
          </Stack>
        </div>
      )}
      {rightComp && (
        <div>
          <CompShipList
            comp={rightComp}
            selectedShip={rightShipId}
            onShipClick={onRightShipChange}
          />
          <Stack className="gap-2" direction="row">
            <FormationSelect
              label={t("Formation.name")}
              color="secondary"
              combined={rightComp.is_combined()}
              value={config.right?.formation || "LineAhead"}
              onChange={bind("right.formation")}
              disabled={disableConfig}
            />
            <NightFleetConditionsForm
              color="secondary"
              value={config.right}
              onChange={bind("right")}
              disabled={disableConfig}
            />
          </Stack>
        </div>
      )}
    </div>
  );
};

export default ({ className, ...props }: React.ComponentProps<typeof AnalyzerForm>) => (
  <AnalyzerForm {...props} className={cn("flex [&_>_*]:[flex-basis:100%]", className)} />
);
