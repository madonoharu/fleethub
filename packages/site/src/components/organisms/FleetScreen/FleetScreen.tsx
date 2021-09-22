import styled from "@emotion/styled";
import { Fleet } from "@fh/core";
import { Typography } from "@mui/material";
import { useTranslation } from "next-i18next";
import React from "react";
import { shallowEqual, useDispatch } from "react-redux";

import { useModal } from "../../../hooks";
import { fleetsSlice, gearsSlice } from "../../../store";
import { Flexbox } from "../../atoms";
import { DeleteButton, BuildButton, SelectedMenu } from "../../molecules";
import BatchOperations from "../BatchOperations";
import FleetShipList from "./FleetShipList";

const FLEET_LENS = [1, 2, 3, 4, 5, 6, 7];

type FleetScreenProps = {
  fleet: Fleet;
};

const FleetScreen: React.FCX<FleetScreenProps> = ({ className, fleet }) => {
  const dispatch = useDispatch();
  const BatchOperationModal = useModal();
  const { t } = useTranslation("common");

  const handleFleetLenChange = (len: number) => {
    dispatch(fleetsSlice.actions.update({ id: fleet.id, changes: { len } }));
  };

  const handleRemoveShips = () => {
    dispatch(fleetsSlice.actions.removeShips(fleet.id));
  };

  return (
    <div className={className}>
      <Flexbox gap={1}>
        <Typography variant="body2" css={{ marginLeft: "auto" }}>
          {t("FighterPower")} {fleet.fighter_power(false)}
        </Typography>
        <SelectedMenu
          label="艦数"
          options={FLEET_LENS}
          value={fleet.len}
          onChange={handleFleetLenChange}
        />
        <BuildButton
          title={t("BatchOperation")}
          size="small"
          onClick={BatchOperationModal.show}
        />
        <DeleteButton
          title="この艦隊の艦娘を削除"
          size="small"
          onClick={handleRemoveShips}
        />
      </Flexbox>

      <FleetShipList fleet={fleet} />

      <BatchOperationModal>
        <BatchOperations
          onStarsClick={(stars) => {
            const ids = fleet.get_gear_ids_by_improvable();
            const changes = { stars };
            const payload = ids.map((id) => ({ id, changes }));

            dispatch(gearsSlice.actions.updateMany(payload));
          }}
          onExpClick={(exp) => {
            const ids = fleet.get_gear_ids_by_proficiency();
            const changes = { exp };
            const payload = ids.map((id) => ({ id, changes }));

            dispatch(gearsSlice.actions.updateMany(payload));
          }}
        />
      </BatchOperationModal>
    </div>
  );
};

const Memoized = React.memo(
  FleetScreen,
  ({ fleet: prevFleet, ...prevRest }, { fleet: nextFleet, ...nextRest }) =>
    prevFleet.xxh3 === nextFleet.xxh3 && shallowEqual(prevRest, nextRest)
);

export default styled(Memoized)`
  ${FleetShipList} {
    margin-top: 4px;
  }
`;
