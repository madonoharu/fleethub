import styled from "@emotion/styled";
import { Button } from "@material-ui/core";
import { useTranslation } from "next-i18next";
import React from "react";
import { useModal } from "../../../hooks";
import { toPercent } from "../../../utils";
import { Flexbox, FuelIcon, AmmoIcon } from "../../atoms";
import { NumberInput } from "../../molecules";

const BATTLE_COST_DATA = [
  {
    fuel: 0.2,
    ammo: 0.2,
  },
  {
    fuel: 0.2,
    ammo: 0.3,
    ceil: true,
  },
  {
    fuel: 0.1,
    ammo: 0.1,
  },
  {
    fuel: 0.08,
    ammo: 0,
  },
  {
    fuel: 0.06,
    ammo: 0.04,
  },
  {
    fuel: 0.04,
    ammo: 0.08,
  },
  {
    fuel: 0.04,
    ammo: 0.0,
  },
];

const calcCost = (
  max: number,
  current: number,
  rate: number,
  ceil?: boolean
) => {
  if (!rate) return current;

  const value = ceil ? Math.ceil(max * rate) : Math.floor(max * rate);
  const cost = Math.max(value, 1);
  return Math.max(current - cost, 0);
};

type FuelAmmoFormProps = {
  fuel: number;
  max_fuel: number;
  ammo: number;
  max_ammo: number;
  onChange: (changes: { fuel?: number; ammo?: number }) => void;
};

const FuelAmmoForm: React.FCX<FuelAmmoFormProps> = ({
  className,
  style,
  fuel,
  max_fuel,
  ammo,
  max_ammo,
  onChange,
}) => {
  const { t } = useTranslation("common");
  const Modal = useModal();

  const ammoRate = max_ammo && ammo / max_ammo;
  const fuelRate = max_fuel && fuel / max_fuel;

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
    <>
      <Flexbox className={className} style={style} gap={1}>
        <NumberInput
          startLabel={<FuelIcon />}
          label={`${t("fuel")} ${toPercent(fuelRate)}`}
          value={fuel}
          min={0}
          max={max_fuel}
          onChange={setFuel}
        />
        <NumberInput
          startLabel={<AmmoIcon />}
          label={`${t("ammo")} ${toPercent(ammoRate)}`}
          value={ammo}
          min={0}
          max={max_ammo}
          onChange={setAmmo}
        />
        <Button onClick={Modal.show}>{t("Consume")}</Button>
        <Button
          onClick={() => {
            onChange({ fuel: undefined, ammo: undefined });
          }}
        >
          {t("Reset")}
        </Button>
      </Flexbox>

      <Modal>
        <Flexbox flexDirection="column" gap={1}>
          {BATTLE_COST_DATA.map((cost, index) => (
            <Button
              key={index}
              variant="outlined"
              fullWidth
              onClick={() => {
                onChange({
                  fuel: calcCost(max_fuel, fuel, cost.fuel),
                  ammo: calcCost(max_ammo, ammo, cost.ammo, cost.ceil),
                });
                Modal.hide();
              }}
            >
              <FuelIcon />
              <span>-{toPercent(cost.fuel, 0)}</span>
              <AmmoIcon />
              <span>-{toPercent(cost.ammo, 0)}</span>
            </Button>
          ))}
        </Flexbox>
      </Modal>
    </>
  );
};

export default styled(FuelAmmoForm)`
  ${NumberInput} {
    width: 128px;
  }
`;
