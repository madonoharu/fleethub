import { Path, PathValue } from "@fh/utils";
import { styled, Stack } from "@mui/material";
import type { Comp, NodeAttackAnalyzerConfig } from "fleethub-core";
import { produce } from "immer";
import set from "lodash/set";
import { useTranslation } from "next-i18next";
import React from "react";

import CompShipList from "../CompShipList";
import FormationSelect from "../FormationSelect";
import NightFleetConditionsForm from "../NightFleetConditionsForm";

interface Props {
  config: NodeAttackAnalyzerConfig;
  leftShipId: string | undefined;
  rightShipId: string | undefined;
  leftComp: Comp | undefined;
  rightComp: Comp | undefined;
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
          <CompShipList
            comp={leftComp}
            selectedShip={leftShipId}
            onShipClick={onLeftShipChange}
          />
          <Stack direction="row" gap={1}>
            <FormationSelect
              color="primary"
              label={t("Formation.name")}
              combined={leftComp.is_combined()}
              value={config.left?.formation || "LineAhead"}
              onChange={bind("left.formation")}
            />
            <NightFleetConditionsForm
              color="primary"
              value={config.left}
              onChange={bind("left")}
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
          <Stack direction="row" gap={1}>
            <FormationSelect
              label={t("Formation.name")}
              color="secondary"
              combined={rightComp.is_combined()}
              value={config.right?.formation || "LineAhead"}
              onChange={bind("right.formation")}
            />
            <NightFleetConditionsForm
              color="secondary"
              value={config.right}
              onChange={bind("right")}
            />
          </Stack>
        </div>
      )}
    </div>
  );
};

export default styled(AnalyzerForm)`
  display: flex;
  > * {
    flex-basis: 100%;
  }
`;
