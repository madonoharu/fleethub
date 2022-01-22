import styled from "@emotion/styled";
import { Button } from "@mui/material";
import { Ship } from "fleethub-core";
import { useTranslation } from "next-i18next";
import React from "react";

import { toPercent } from "../../../utils";
import { Flexbox, FuelIcon, AmmoIcon } from "../../atoms";
import { NumberInput, ConsumptionRateSelect } from "../../molecules";

const StyledNumberInput = styled(NumberInput)`
  width: 128px;
`;

type FuelAmmoFormProps = {
  ship: Ship;
  onChange: (changes: { fuel?: number; ammo?: number }) => void;
};

const FuelAmmoForm: React.FCX<FuelAmmoFormProps> = ({
  className,
  style,
  ship,
  onChange,
}) => {
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
    <Flexbox className={className} style={style} gap={1}>
      <StyledNumberInput
        startLabel={<FuelIcon />}
        label={`${t("fuel")} ${toPercent(fuelRate)}`}
        value={fuel}
        min={0}
        max={max_fuel}
        onChange={setFuel}
      />
      <StyledNumberInput
        startLabel={<AmmoIcon />}
        label={`${t("ammo")} ${toPercent(ammoRate)}`}
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
