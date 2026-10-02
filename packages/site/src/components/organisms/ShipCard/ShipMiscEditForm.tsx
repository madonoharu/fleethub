import { DAMAGE_STATES, MORALE_STATES } from "@fh/utils";
import { Typography } from "@mui/material";
import { DamageState, MoraleState, Ship } from "fleethub-core";
import { useTranslation } from "next-i18next/pages";
import React from "react";

import { cn } from "../../../styles/cn";
import { useShipName } from "../../../hooks";
import { ShipEntity } from "../../../store";
import { DamageStateIcon, Divider, Flexbox, MoraleStateIcon } from "../../atoms";
import { NumberInput, Select } from "../../molecules";
import CustomPowerModifiersForm from "../CustomModifiersDialog/CustomPowerModifiersForm";
import ResettableInput from "../ResettableInput";

import FuelAmmoForm from "./FuelAmmoForm";

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
    <div className={cn("[&>:not(.MuiTypography-root)]:mb-2", className)} style={style}>
      <Typography variant="subtitle1">{displayName}</Typography>

      <Divider label={t("DamageState.name")} />

      <Flexbox className="gap-2">
        <NumberInput
          className="w-[128px]"
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
            <div className="flex items-center gap-2 [&_svg]:text-[20px]">
              <DamageStateIcon state={state} />
              <span>{t(`DamageState.${state}`)}</span>
            </div>
          )}
        />
      </Flexbox>

      <Divider label={t("MoraleState.name")} />
      <Flexbox className="gap-2">
        <NumberInput
          className="w-[128px]"
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
            <div className="flex items-center gap-2 [&_svg]:text-[20px]">
              <MoraleStateIcon state={state} />
              <span>{t(`MoraleState.${state}`)}</span>
            </div>
          )}
        />
      </Flexbox>

      <Divider label={`${t("fuel")} & ${t("ammo")}`} />
      <FuelAmmoForm ship={ship} onChange={onChange} />

      <CustomPowerModifiersForm
        value={ship.custom_power_mods()}
        onChange={(v) => onChange?.({ custom_power_mods: v })}
      />

      <Divider label={`${t("Override")}`} />
      <div className="flex gap-2">
        <ResettableInput
          className="grow"
          label={`${t("day_gunfit_accuracy")}`}
          defaultValue={null}
          value={ship.state_day_gunfit_accuracy()}
          onChange={(v) => {
            onChange?.({ day_gunfit_accuracy: v ?? undefined });
          }}
        />
        <ResettableInput
          className="grow"
          label={`${t("night_gunfit_accuracy")}`}
          defaultValue={null}
          value={ship.state_night_gunfit_accuracy()}
          onChange={(v) => {
            onChange?.({ night_gunfit_accuracy: v ?? undefined });
          }}
        />
      </div>
    </div>
  );
};

export default ShipMiscEditForm;
