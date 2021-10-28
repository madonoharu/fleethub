/** @jsxImportSource @emotion/react */
import styled from "@emotion/styled";
import { DamageState, MoraleState, Ship } from "fleethub-core";
import { useTranslation } from "next-i18next";
import React from "react";
import { ShipEntity } from "../../../store";
import {
  DamageStateIcon,
  Divider,
  Flexbox,
  MoraleStateIcon,
} from "../../atoms";
import { NumberInput, Select } from "../../molecules";
import FuelAmmoForm from "./FuelAmmoForm";

const DAMAGE_STATES: DamageState[] = ["Normal", "Shouha", "Chuuha", "Taiha"];
const MORALE_STATE: MoraleState[] = ["Sparkle", "Normal", "Orange", "Red"];

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

  const maxHp = ship.max_hp || 0;

  const { ammo, max_ammo, fuel, max_fuel } = ship;

  const setDamageState = (state: DamageState) => {
    let current_hp: number | undefined = undefined;

    if (state === "Shouha") {
      current_hp = Math.floor(maxHp * (3 / 4));
    } else if (state === "Chuuha") {
      current_hp = Math.floor(maxHp / 2);
    } else if (state === "Taiha") {
      current_hp = Math.floor(maxHp / 4);
    }

    onChange?.({ current_hp });
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

    onChange?.({ morale });
  };

  return (
    <div className={className} style={style}>
      <Divider label={`損傷を設定`} />

      <Flexbox gap={1}>
        <StyledNumberInput
          startLabel="HP"
          value={ship.current_hp}
          max={ship.max_hp || 0}
          min={0}
        />
        <Select
          label={t("DamageState")}
          options={DAMAGE_STATES}
          value={ship.damage_state() as DamageState}
          onChange={setDamageState}
          getOptionLabel={(state) => (
            <StartIcon>
              <DamageStateIcon state={state} />
              <span>{t(state)}</span>
            </StartIcon>
          )}
        />
      </Flexbox>

      <Divider label={`疲労度を設定`} />
      <Flexbox gap={1}>
        <StyledNumberInput value={ship.morale} max={100} min={0} />
        <Select
          label={t("MoraleState")}
          options={MORALE_STATE}
          value={ship.morale_state() as MoraleState}
          onChange={setMoraleState}
          getOptionLabel={(state) => (
            <StartIcon>
              <MoraleStateIcon state={state} />
              <span>{t(state)}</span>
            </StartIcon>
          )}
        />
      </Flexbox>

      <Divider label={`燃料弾薬を設定`} />
      <FuelAmmoForm
        fuel={fuel}
        max_fuel={max_fuel}
        ammo={ammo}
        max_ammo={max_ammo}
        onChange={onChange}
      />
    </div>
  );
};

export default styled(ShipMiscEditForm)`
  > * {
    margin-bottom: 8px;
  }
`;
