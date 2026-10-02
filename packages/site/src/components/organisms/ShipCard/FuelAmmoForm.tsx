import { Button } from "@mui/material";
import { Ship } from "fleethub-core";
import { useTranslation } from "next-i18next/pages";
import React from "react";

import { cn } from "../../../styles/cn";
import { toPercent } from "../../../utils";
import { Flexbox, FuelIcon, AmmoIcon } from "../../atoms";
import { NumberInput, ConsumptionRateSelect } from "../../molecules";

type FuelAmmoFormProps = {
  ship: Ship;
  onChange: (changes: { fuel?: number; ammo?: number }) => void;
};

const FuelAmmoForm: React.FCX<FuelAmmoFormProps> = ({ className, style, ship, onChange }) => {
  const { t } = useTranslation("common");

  const { fuel, ammo, max_fuel, max_ammo } = ship;

  const ammoRate = max_ammo ? ammo / max_ammo : 1;
  const fuelRate = max_fuel ? fuel / max_fuel : 1;

  const setFuel = (fuel: number) => {
    if (fuel === max_fuel) {
      onChange({ fuel: undefined });
    } else {
      onChange({ fuel });
    }
  };

  const setAmmo = (ammo: number) => {
    if (ammo === max_ammo) {
      onChange({ ammo: undefined });
    } else {
      onChange({ ammo });
    }
  };

  return (
    <Flexbox className={cn("gap-2", className)} style={style}>
      <NumberInput
        className="w-[128px]"
        startLabel={<FuelIcon />}
        label={`${t("fuel")} ${toPercent(fuelRate, 0)}`}
        value={fuel}
        min={0}
        max={max_fuel}
        onChange={setFuel}
      />
      <NumberInput
        className="w-[128px]"
        startLabel={<AmmoIcon />}
        label={`${t("ammo")} ${toPercent(ammoRate, 0)}`}
        value={ammo}
        min={0}
        max={max_ammo}
        onChange={setAmmo}
      />
      <ConsumptionRateSelect
        onSelect={(value) => {
          onChange({
            fuel: ship.get_remaining_fuel(value.fuel, false),
            ammo: ship.get_remaining_ammo(value.ammo, value.ammoCeil || false),
          });
        }}
      />
      <Button
        variant="outlined"
        onClick={() => {
          onChange({ fuel: undefined, ammo: undefined });
        }}
      >
        {t("Reset")}
      </Button>
    </Flexbox>
  );
};

export default FuelAmmoForm;
