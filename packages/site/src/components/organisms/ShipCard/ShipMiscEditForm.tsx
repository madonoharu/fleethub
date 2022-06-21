import styled from "@emotion/styled";
import { DAMAGE_STATES, MORALE_STATES } from "@fh/utils";
import { Stack, Typography } from "@mui/material";
import { DamageState, MoraleState, Ship } from "fleethub-core";
import { useTranslation } from "next-i18next";
import React from "react";

import { useShipName } from "../../../hooks";
import { ShipEntity } from "../../../store";
import {
  DamageStateIcon,
  Divider,
  Flexbox,
  MoraleStateIcon,
} from "../../atoms";
import { NumberInput, Select } from "../../molecules";
import CustomPowerModifiersForm from "../CustomModifiersDialog/CustomPowerModifiersForm";
import ResettableInput from "../ResettableInput";

import FuelAmmoForm from "./FuelAmmoForm";

const StyledNumberInput = styled(NumberInput)`
  width: 128px;
`;

const StartIcon = styled.div`
  display: flex;
  gap: 8px;
  align-items: center;

  svg {
    font-size: 20px;
  }
`;

type ShipMiscEditFormProps = {
  ship: Ship;
  onChange: (changes: Partial<ShipEntity>) => void;
};

const ShipMiscEditForm: React.FCX<ShipMiscEditFormProps> = ({
  className,
  style,
  ship,
  onChange,
}) => {
  const { t } = useTranslation("common");
  const displayName = useShipName(ship.ship_id, ship.is_abyssal());

  const handleCurrentHpChange = (v: number | undefined) => {
    onChange?.({ current_hp: v });
  };

  const handleMoraleChange = (v: number | undefined) => {
    onChange?.({ morale: v });
  };

  const setDamageState = (state: DamageState) => {
    const next = state === "Normal" ? undefined : ship.get_damage_bound(state);
    handleCurrentHpChange(next);
  };

  const setMoraleState = (state: MoraleState) => {
    let morale: number | undefined = undefined;

    if (state === "Sparkle") {
      morale = 85;
    } else if (state === "Orange") {
      morale = 29;
    } else if (state === "Red") {
      morale = 0;
    }

    handleMoraleChange(morale);
  };

  return (
    <div className={className} style={style}>
      <Typography variant="subtitle1">{displayName}</Typography>

      <Divider label={t("DamageState.name")} />

      <Flexbox gap={1}>
        <StyledNumberInput
          startLabel="HP"
          value={ship.current_hp}
          max={ship.max_hp || 0}
          min={0}
          onChange={handleCurrentHpChange}
        />
        <Select
          options={DAMAGE_STATES}
          value={ship.damage_state()}
          onChange={setDamageState}
          getOptionLabel={(state) => (
            <StartIcon>
              <DamageStateIcon state={state} />
              <span>{t(`DamageState.${state}`)}</span>
            </StartIcon>
          )}
        />
      </Flexbox>

      <Divider label={t("MoraleState.name")} />
      <Flexbox gap={1}>
        <StyledNumberInput
          value={ship.morale}
          max={100}
          min={0}
          onChange={handleMoraleChange}
        />
        <Select
          options={MORALE_STATES}
          value={ship.morale_state()}
          onChange={setMoraleState}
          getOptionLabel={(state) => (
            <StartIcon>
              <MoraleStateIcon state={state} />
              <span>{t(`MoraleState.${state}`)}</span>
            </StartIcon>
          )}
        />
      </Flexbox>

      <Divider label={`${t("fuel")} & ${t("ammo")}`} />
      <FuelAmmoForm ship={ship} onChange={onChange} />

      <CustomPowerModifiersForm
        value={ship.state().custom_power_mods!}
        onChange={(v) => onChange?.({ custom_power_mods: v })}
      />

      <Divider label={`${t("Override")}`} />
      <Stack direction="row" gap={1}>
        <ResettableInput
          css={{ flexGrow: 1 }}
          label={`${t("day_gunfit_accuracy")}`}
          defaultValue={null}
          value={ship.state_day_gunfit_accuracy()}
          onChange={(v) => {
            onChange?.({ day_gunfit_accuracy: v ?? undefined });
          }}
        />
        <ResettableInput
          css={{ flexGrow: 1 }}
          label={`${t("night_gunfit_accuracy")}`}
          defaultValue={null}
          value={ship.state_night_gunfit_accuracy()}
          onChange={(v) => {
            onChange?.({ night_gunfit_accuracy: v ?? undefined });
          }}
        />
      </Stack>
    </div>
  );
};

export default styled(ShipMiscEditForm)`
  > * {
    margin-bottom: 8px;
  }
`;
