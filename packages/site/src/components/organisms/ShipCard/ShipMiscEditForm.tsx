/** @jsxImportSource @emotion/react */
import styled from "@emotion/styled";
import { DAMAGE_STATES, MORALE_STATES } from "@fh/utils";
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

  const setDamageState = (state: DamageState) => {
    const next = state === "Normal" ? undefined : ship.get_damage_bound(state);
    onChange?.({ current_hp: next });
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
      <Divider label={t("DamageState")} />

      <Flexbox gap={1}>
        <StyledNumberInput
          startLabel="HP"
          value={ship.current_hp}
          max={ship.max_hp || 0}
          min={0}
        />
        <Select
          options={DAMAGE_STATES}
          value={ship.damage_state()}
          onChange={setDamageState}
          getOptionLabel={(state) => (
            <StartIcon>
              <DamageStateIcon state={state} />
              <span>{t(state)}</span>
            </StartIcon>
          )}
        />
      </Flexbox>

      <Divider label={t("MoraleState")} />
      <Flexbox gap={1}>
        <StyledNumberInput value={ship.morale} max={100} min={0} />
        <Select
          options={MORALE_STATES}
          value={ship.morale_state()}
          onChange={setMoraleState}
          getOptionLabel={(state) => (
            <StartIcon>
              <MoraleStateIcon state={state} />
              <span>{t(state)}</span>
            </StartIcon>
          )}
        />
      </Flexbox>

      <Divider label={`${t("fuel")} & ${t("ammo")}`} />
      <FuelAmmoForm ship={ship} onChange={onChange} />
    </div>
  );
};

export default styled(ShipMiscEditForm)`
  > * {
    margin-bottom: 8px;
  }
`;
