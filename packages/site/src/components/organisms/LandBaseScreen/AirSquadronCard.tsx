import { GEAR_KEYS, SlotSizeKey } from "@fh/utils";
import { Paper, Typography } from "@mui/material";
import { AirSquadron, AirSquadronMode } from "fleethub-core";
import { useTranslation } from "next-i18next/pages";
import React, { useMemo } from "react";
import { shallowEqual } from "react-redux";

import { useAppDispatch, useModal } from "../../../hooks";
import { AirSquadronEntity, airSquadronsSlice } from "../../../store";
import { Flexbox, LabeledValue } from "../../atoms";
import { BusinessCenterButton, SelectedMenu } from "../../molecules";
import GearSlot from "../GearSlot";
import PresetMenu from "../PresetMenu";
import { cn } from "../../../styles";

const AIR_SQUADRON_MODES: AirSquadronMode[] = ["Sortie", "AirDefense"];

const useAirSquadronActions = (id: string) => {
  const dispatch = useAppDispatch();

  return useMemo(() => {
    const update = (changes: Partial<AirSquadronEntity>) =>
      dispatch(airSquadronsSlice.actions.update({ id, changes }));

    const setMode = (mode: AirSquadronMode) => {
      update({ mode });
    };

    return { update, setMode };
  }, [id, dispatch]);
};

const StyledLabeledValue = ({ className, ...props }: React.ComponentProps<typeof LabeledValue>) => (
  <LabeledValue {...props} className={cn("mr-2", className)} />
);

interface Props {
  className?: string;
  label?: string;
  airSquadron: AirSquadron;
}

const AirSquadronCard = React.forwardRef<HTMLDivElement, Props>(
  ({ label, airSquadron, ...rest }, ref) => {
    const { id } = airSquadron;
    const { t } = useTranslation("common");
    const PresetModal = useModal();
    const actions = useAirSquadronActions(id);

    return (
      <Paper ref={ref} {...rest}>
        <Flexbox>
          <Typography variant="subtitle2">{label}</Typography>
          <BusinessCenterButton
            className="ml-auto"
            size="medium"

            title={t("Presets")}
            onClick={PresetModal.show}
          />
          <SelectedMenu
            options={AIR_SQUADRON_MODES}
            value={airSquadron.mode}
            getOptionLabel={t}
            onChange={actions.setMode}
          />
        </Flexbox>

        <Flexbox className="gap-2">
          <Typography variant="body2">{t("FighterPower")}</Typography>
          <StyledLabeledValue label={t("Sortie")} value={airSquadron.fighter_power()} />
          <StyledLabeledValue label={t("AirDefense")} value={airSquadron.interception_power()} />
          <StyledLabeledValue label={t("radius")} value={airSquadron.radius()} />
        </Flexbox>

        {GEAR_KEYS.filter((_, i) => i < 4).map((key, i) => {
          const gear = airSquadron.get_gear(key);
          const ss = airSquadron.get_slot_size(i);
          const max = airSquadron.get_max_slot_size(i);

          return (
            <GearSlot
              key={key}
              gear={gear}
              slotSize={ss}
              maxSlotSize={max}
              position={{ tag: "airSquadrons", id, key }}
              equippable={gear?.can_be_deployed_to_land_base()}
              onSlotSizeChange={(value) => {
                actions.update({ [`ss${i + 1}` as SlotSizeKey]: value });
              }}
            />
          );
        })}

        <PresetModal>
          <PresetMenu position={{ tag: "airSquadrons", id }} />
        </PresetModal>
      </Paper>
    );
  },
);

const Memoized = React.memo(
  AirSquadronCard,
  ({ airSquadron: prev, ...prevRest }, { airSquadron: next, ...nextRest }) =>
    prev.hash === next.hash && shallowEqual(prevRest, nextRest),
);

export default ({ className, ...props }: React.ComponentProps<typeof Memoized>) => (
  <Memoized {...props} className={cn("flex flex-col gap-2 p-[8px_8px_24px] min-w-40", className)} />
);
