import styled from "@emotion/styled";
import { AirSquadron } from "@fleethub/core";
import { GEAR_KEYS, SlotSizeKey } from "@fleethub/utils";
import { Paper, Typography } from "@material-ui/core";
import { EntityId } from "@reduxjs/toolkit";
import React from "react";
import { useMemo } from "react";
import { shallowEqual, useDispatch } from "react-redux";

import { AirSquadronEntity, airSquadronsSlice } from "../../../store";
import { Flexbox, LabeledValue } from "../../atoms";
import GearSlot from "../ShipBox/GearSlot";

const useAirSquadronActions = (id: EntityId) => {
  const dispatch = useDispatch();

  return useMemo(() => {
    const update = (changes: Partial<AirSquadronEntity>) =>
      dispatch(airSquadronsSlice.actions.update({ id, changes }));

    return { update };
  }, [id, dispatch]);
};

const StyledLabeledValue = styled(LabeledValue)`
  margin-right: 8px;
`;

type Props = {
  className?: string;
  label?: string;
  airSquadron: AirSquadron;
};

const AirSquadronCard = React.forwardRef<HTMLDivElement, Props>(
  ({ className, label, airSquadron }, ref) => {
    const { id } = airSquadron;
    const actions = useAirSquadronActions(id);

    return (
      <Paper ref={ref} className={className}>
        <Flexbox>
          <Typography variant="subtitle2">{label}</Typography>
        </Flexbox>

        <Flexbox>
          <StyledLabeledValue label="制空" value={100} />
          <StyledLabeledValue label="防空" value={100} />
          <StyledLabeledValue label="半径" value={100} />
        </Flexbox>

        <div>
          {GEAR_KEYS.filter((_, i) => i < 4).map((key, i) => {
            const gear = airSquadron.get_gear(key);
            const ss = airSquadron.get_slot_size(i);
            const position = { airSquadron: id, key };

            return (
              <GearSlot
                key={key}
                gear={gear}
                slotSize={ss}
                maxSlotSize={18}
                position={position}
                onSlotSizeChange={(value) => {
                  if (value !== undefined) {
                    actions.update({ [`ss${i + 1}` as SlotSizeKey]: value });
                  }
                }}
              />
            );
          })}
        </div>
      </Paper>
    );
  }
);

const Memoized = React.memo(
  AirSquadronCard,
  ({ airSquadron: prev, ...prevRest }, { airSquadron: next, ...nextRest }) =>
    prev.xxh3 === next.xxh3 && shallowEqual(prevRest, nextRest)
);

export default styled(Memoized)`
  padding: 8px;
  min-width: 160px;
`;
