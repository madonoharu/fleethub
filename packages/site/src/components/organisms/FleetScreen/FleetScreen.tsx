import styled from "@emotion/styled";
import { Fleet } from "@fh/core";
import { Typography } from "@mui/material";
import React from "react";
import { shallowEqual, useDispatch } from "react-redux";
import { fleetsSlice } from "../../../store";
import { Flexbox } from "../../atoms";
import { DeleteButton, MoreVertButton, SelectedMenu } from "../../molecules";

import FleetShipList from "./FleetShipList";

const FLEET_LENS = [1, 2, 3, 4, 5, 6, 7];

type FleetScreenProps = {
  fleet: Fleet;
};

const FleetScreen: React.FCX<FleetScreenProps> = ({ className, fleet }) => {
  const dispatch = useDispatch();

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
          制空 {fleet.fighter_power(false)}
        </Typography>
        <SelectedMenu
          label="艦数"
          options={FLEET_LENS}
          value={fleet.len}
          onChange={handleFleetLenChange}
        />
        <MoreVertButton size="small" />
        <DeleteButton
          title="この艦隊の艦娘を削除"
          size="small"
          onClick={handleRemoveShips}
        />
      </Flexbox>
      <FleetShipList fleet={fleet} />
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
