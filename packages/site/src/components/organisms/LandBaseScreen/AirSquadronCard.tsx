import styled from "@emotion/styled";
import { AirSquadron, AirSquadronMode } from "@fh/core";
import { GEAR_KEYS, SlotSizeKey } from "@fh/utils";
import { Paper, Typography } from "@mui/material";
import { useTranslation } from "next-i18next";
import React, { useMemo } from "react";
import { shallowEqual, useDispatch } from "react-redux";

import { AirSquadronEntity, airSquadronsSlice } from "../../../store";
import { Flexbox, LabeledValue } from "../../atoms";
import { SelectedMenu } from "../../molecules";
import GearSlot from "../GearSlot";

const AIR_SQUADRON_MODES: AirSquadronMode[] = ["Sortie", "AirDefense"];

const useAirSquadronActions = (id: string) => {
  const dispatch = useDispatch();

  return useMemo(() => {
    const update = (changes: Partial<AirSquadronEntity>) =>
      dispatch(airSquadronsSlice.actions.update({ id, changes }));

    const setMode = (mode: AirSquadronMode) => {
      update({ mode });
    };

    return { update, setMode };
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
    const { t } = useTranslation("common");
    const actions = useAirSquadronActions(id);

    return (
      <Paper ref={ref} className={className}>
        <Flexbox>
          <Typography variant="subtitle2">{label}</Typography>
          <SelectedMenu
            css={{ marginLeft: "auto" }}
            options={AIR_SQUADRON_MODES}
            value={airSquadron.mode}
            getOptionLabel={t}
            onChange={actions.setMode}
          />
        </Flexbox>

        <Flexbox gap={1}>
          <Typography variant="body2">{t("FighterPower")}</Typography>
          <StyledLabeledValue
            label={t("Sortie")}
            value={airSquadron.fighter_power()}
          />
          <StyledLabeledValue
            label={t("AirDefense")}
            value={airSquadron.interception_power()}
          />
          <StyledLabeledValue
            label={t("radius")}
            value={airSquadron.radius()}
          />
        </Flexbox>

        <div>
          {GEAR_KEYS.filter((_, i) => i < 4).map((key, i) => {
            const gear = airSquadron.get_gear(key);
            const ss = airSquadron.get_slot_size(i);
            const max = airSquadron.get_max_slot_size(i);
            const position = { airSquadron: id, key };

            return (
              <GearSlot
                key={key}
                gear={gear}
                slotSize={ss}
                maxSlotSize={max}
                position={position}
                canEquip={(gear) => airSquadron.can_equip(gear)}
                onSlotSizeChange={(value) => {
                  actions.update({ [`ss${i + 1}` as SlotSizeKey]: value });
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
  padding: 8px 8px 24px;
  min-width: 160px;
`;
