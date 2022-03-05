import { Typography } from "@mui/material";
import { Update } from "@reduxjs/toolkit";
import { Comp, DamageState, Fleet, MoraleState } from "fleethub-core";
import { useTranslation } from "next-i18next";
import React from "react";
import { shallowEqual, useDispatch } from "react-redux";

import { useModal } from "../../../hooks";
import {
  fleetsSlice,
  gearsSlice,
  ShipEntity,
  shipsSlice,
} from "../../../store";
import { Flexbox } from "../../atoms";
import {
  DeleteButton,
  BuildButton,
  SelectedMenu,
  ConsumptionRate,
} from "../../molecules";
import BatchOperations from "../BatchOperations";
import ElosLabel from "../ElosLabel";
import FleetInfoPanel from "../FleetInfoPanel";

import FleetShipList from "./FleetShipList";

const FLEET_LENS = [1, 2, 3, 4, 5, 6, 7];

type FleetScreenProps = {
  comp: Comp;
  fleet: Fleet;
};

const FleetScreen: React.FCX<FleetScreenProps> = ({
  className,
  comp,
  fleet,
}) => {
  const dispatch = useDispatch();
  const BatchOperationsModal = useModal();
  const { t } = useTranslation("common");

  const fleetId = fleet.id;

  const handleFleetLenChange = (len: number) => {
    dispatch(fleetsSlice.actions.update({ id: fleetId, changes: { len } }));
  };

  const handleRemoveShips = () => {
    dispatch(fleetsSlice.actions.removeShips(fleetId));
  };

  const handleStarsClick = (value: number | undefined) => {
    const ids = fleet.get_gear_ids_by_improvable();
    const changes = { stars: value };
    const payload = ids.map((id) => ({ id, changes }));

    dispatch(gearsSlice.actions.updateMany(payload));
  };

  const handleExpClick = (value: number | undefined) => {
    const ids = fleet.get_gear_ids_by_proficiency();
    const changes = { exp: value };
    const payload = ids.map((id) => ({ id, changes }));

    dispatch(gearsSlice.actions.updateMany(payload));
  };

  const handleMoraleChange = (state: MoraleState) => {
    const ids = fleet.ship_ids();

    let morale: number;
    if (state === "Sparkle") {
      morale = 85;
    } else if (state === "Normal") {
      morale = 49;
    } else if (state === "Orange") {
      morale = 29;
    } else {
      morale = 0;
    }

    dispatch(
      shipsSlice.actions.updateMany(
        ids.map((id) => ({
          id,
          changes: { morale },
        }))
      )
    );
  };

  const handleCurrentHpChange = (state: DamageState) => {
    const ids = fleet.ship_ids();

    const payload: Update<ShipEntity>[] = ids.map((id) => {
      const current_hp =
        state == "Normal" ? undefined : fleet.get_damage_bound(id, state);
      return {
        id,
        changes: {
          current_hp,
        },
      };
    });

    dispatch(shipsSlice.actions.updateMany(payload));
  };

  const handleConsumptionRateSelect = (value: ConsumptionRate) => {
    const ids = fleet.ship_ids();

    const payload: Update<ShipEntity>[] = ids.map((id) => {
      const fuel = fleet.get_remaining_fuel(id, value.fuel, false);
      const ammo = fleet.get_remaining_ammo(
        id,
        value.ammo,
        value.ammoCeil || false
      );

      return { id, changes: { fuel, ammo } };
    });

    dispatch(shipsSlice.actions.updateMany(payload));
  };

  const handleConsumptionReset = () => {
    const ids = fleet.ship_ids();

    const payload: Update<ShipEntity>[] = ids.map((id) => ({
      id,
      changes: { fuel: undefined, ammo: undefined },
    }));

    dispatch(shipsSlice.actions.updateMany(payload));
  };

  const handleSlotSizeReset = () => {
    const ids = fleet.ship_ids();
    dispatch(shipsSlice.actions.resetSlotSize(ids));
  };

  const singleFp = comp.fighter_power(false, false);

  let fpText: string;
  if (comp.is_combined()) {
    const antiCombinedFp = `${comp.fighter_power(true, false) ?? "?"}`;

    fpText = `${t("FighterPower")} ${t("CombinedFleet")} ${antiCombinedFp}
    ${t("SingleFleet")} ${singleFp ?? "?"}`;
  } else {
    fpText = `${t("FighterPower")} ${singleFp ?? "?"}`;
  }

  return (
    <div className={className}>
      <Flexbox gap={1} mb={0.5}>
        <Typography variant="body2">{fpText}</Typography>
        {[1, 2, 3, 4].map((factor) => (
          <ElosLabel key={factor} factor={factor} elos={comp.elos(factor)} />
        ))}

        {fleetId && (
          <>
            <SelectedMenu
              sx={{ ml: "auto" }}
              label="艦数"
              options={FLEET_LENS}
              value={fleet.len}
              onChange={handleFleetLenChange}
            />
            <BuildButton
              title={t("BatchOperation")}
              size="small"
              onClick={BatchOperationsModal.show}
            />
            <DeleteButton
              title="この艦隊の艦娘を削除"
              size="small"
              onClick={handleRemoveShips}
            />
          </>
        )}
      </Flexbox>

      <FleetShipList fleet={fleet} />

      <FleetInfoPanel sx={{ mt: 1 }} comp={comp} fleet={fleet} />

      <BatchOperationsModal>
        <BatchOperations
          onStarsSelect={handleStarsClick}
          onExpSelect={handleExpClick}
          onMoraleStateSelect={handleMoraleChange}
          onDamageStateSelect={handleCurrentHpChange}
          onConsumptionRateSelect={handleConsumptionRateSelect}
          onConsumptionReset={handleConsumptionReset}
          onSlotSizeReset={handleSlotSizeReset}
        />
      </BatchOperationsModal>
    </div>
  );
};

const Memoized = React.memo(
  FleetScreen,
  ({ fleet: prevFleet, ...prevRest }, { fleet: nextFleet, ...nextRest }) =>
    prevFleet.xxh3 === nextFleet.xxh3 && shallowEqual(prevRest, nextRest)
);

export default Memoized;
