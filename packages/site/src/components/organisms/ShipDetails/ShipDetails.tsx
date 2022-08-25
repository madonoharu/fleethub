import styled from "@emotion/styled";
import BuildIcon from "@mui/icons-material/Build";
import { Button, Stack } from "@mui/material";
import { Comp, Ship, ShipConditions } from "fleethub-core";
import { produce } from "immer";
import React, { useEffect } from "react";

import {
  useAppDispatch,
  useRootSelector,
  useFhCore,
  useModal,
} from "../../../hooks";
import {
  shipDetailsSlice,
  ShipDetailsState,
  shipSelectSlice,
} from "../../../store";
import { Flexbox } from "../../atoms";
import AirStateSelect from "../AirStateSelect";
import CustomModifiersDialog from "../CustomModifiersDialog";
import EngagementSelect from "../EngagementSelect";
import ShipCard from "../ShipCard";

import AttackAnalyzerShipConfigForm, {
  toSide,
} from "./AttackAnalyzerShipConfigForm";
import AttackPowerAnalyzer from "./AttackPowerAnalyzer";
import ShipDetailsEnemyList from "./ShipDetailsEnemyList";

function initShipDetailsState(
  current: ShipDetailsState,
  conditions: ShipConditions
): ShipDetailsState {
  const next = produce(current, (draft) => {
    draft.left ||= {};
    draft.right ||= {};

    const leftSide = toSide(conditions.org_type || "Single");
    const rightSide = draft?.right?.org_type && toSide(draft.right.org_type);

    if (!rightSide || leftSide === rightSide) {
      if (leftSide === "Player") {
        draft.right.org_type = "EnemySingle";
      } else {
        draft.right.org_type = "Single";
      }
    }

    Object.assign(draft.left, conditions);
  });

  return next;
}

type ShipDetailsProps = {
  ship: Ship;
  comp?: Comp;
};

const ShipDetails: React.FCX<ShipDetailsProps> = ({
  className,
  ship,
  comp,
}) => {
  const { core } = useFhCore();

  const state = useRootSelector((root) => root.shipDetails);
  const dispatch = useAppDispatch();

  const LeftConfigModal = useModal();
  const RightConfigModal = useModal();

  const update = (payload: Partial<ShipDetailsState>) => {
    dispatch(shipDetailsSlice.actions.update(payload));
  };

  const handleEnemySelect = () => {
    dispatch(
      shipSelectSlice.actions.create({
        abyssal: true,
        position: { tag: "shipDetails" },
      })
    );
  };

  useEffect(() => {
    if (!comp) return;

    const conditions = comp.get_ship_conditions(ship, state.left?.formation);

    update(initShipDetailsState(state, conditions));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <Stack className={className} gap={1}>
      <Flexbox gap={1}>
        <EngagementSelect
          value={state.engagement || "Parallel"}
          onChange={(engagement) => update({ engagement })}
        />
        <AirStateSelect
          value={state.air_state || "AirSupremacy"}
          onChange={(air_state) => update({ air_state })}
        />
        <Button
          variant="contained"
          color="primary"
          startIcon={<BuildIcon />}
          onClick={LeftConfigModal.show}
        >
          自艦隊設定
        </Button>
        <Button
          variant="contained"
          color="secondary"
          startIcon={<BuildIcon />}
          onClick={RightConfigModal.show}
        >
          相手艦設定
        </Button>
        <Button variant="contained" color="primary" onClick={handleEnemySelect}>
          敵を追加して攻撃力を計算する
        </Button>
      </Flexbox>

      <LeftConfigModal>
        <AttackAnalyzerShipConfigForm
          value={state.left || {}}
          onChange={(left) => update({ left })}
        />
      </LeftConfigModal>
      <RightConfigModal>
        <AttackAnalyzerShipConfigForm
          value={state.right || {}}
          onChange={(right) => update({ right })}
        />
      </RightConfigModal>

      <Stack gap={1} flexDirection="row">
        <Stack gap={1} flexBasis="100%">
          <ShipCard
            ship={ship}
            comp={comp}
            visibleMiscStats
            visibleDetails={false}
            visibleUpdate={false}
            visibleRemove={false}
          />
          <CustomModifiersDialog ship={ship} />
        </Stack>
        <AttackPowerAnalyzer
          css={{ flexBasis: "100%" }}
          core={core}
          state={state}
          ship={ship}
        />
      </Stack>

      <ShipDetailsEnemyList state={state} ship={ship} />
    </Stack>
  );
};

export default styled(ShipDetails)`
  min-height: 80vh;
  padding-bottom: 400px;
`;
