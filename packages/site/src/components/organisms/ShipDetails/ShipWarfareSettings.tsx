import styled from "@emotion/styled";
import {
  Ship,
  Role,
  OrgType,
  Formation,
  Side,
  Org,
  WarfareSideState,
} from "@fleethub/core";
import { Button, Typography } from "@material-ui/core";
import React, { createContext, useContext, useState } from "react";
import { useTranslation } from "react-i18next";
import { useImmer } from "use-immer";
import { Checkbox, Divider, Flexbox, LabeledValue } from "../../atoms";
import { NumberInput, Select } from "../../molecules";
import FormationSelect from "../FormationSelect";
import OrgTypeSelect from "../OrgTypeSelect";
import Table from "../Table";

export const useShipWarfareSettings = (
  ship: Ship,
  org?: Org,
  is_enemy?: boolean
) => {
  const roleIndex: [Role, number] | undefined = org?.find_role_index_of(ship);

  const [context, update] = useImmer<WarfareSideState>({
    org_type:
      (org?.org_type as OrgType) || (is_enemy ? "EnemySingle" : "Single"),
    role: roleIndex?.[0] || "Main",
    ship_index: roleIndex?.[1] || 0,
    fleet_len: 6,
    formation: "LineAhead",
    damage_state: "None",
    morale_state: "Normal",
    fleet_los_mod: 0,
    armor_penetration: 0,
    remaining_ammo_mod: 1.0,
    remaining_fuel_mod: 0,
  });

  const bind =
    <K extends keyof WarfareSideState>(key: K) =>
    (next: WarfareSideState[K]) =>
      update((state) => {
        state[key] = next;
      });

  return { context, update, bind };
};

export type ShipWarfareSettingsProps = {
  state: ReturnType<typeof useShipWarfareSettings>;
};

const ShipWarfareSettings: React.FCX<ShipWarfareSettingsProps> = ({
  className,
  state,
}) => {
  const { t } = useTranslation("common");
  const { context, bind } = state;

  const setShipIndex = (i: number) => bind("ship_index")(i);

  return (
    <div className={className}>
      <Divider label="編成設定" />
      <Flexbox gap={1}>
        <OrgTypeSelect value={context.org_type} onChange={bind("org_type")} />

        <Select
          options={["Main", "Escort"]}
          value={context.role}
          onChange={bind("role")}
          getOptionLabel={t}
        />

        <FormationSelect
          combined={
            context.org_type !== "Single" && context.org_type !== "EnemySingle"
          }
          value={context.formation}
          onChange={bind("formation")}
        />

        <Select
          label="艦隊の艦数"
          css={{ minWidth: 120 }}
          options={[1, 2, 3, 4, 5, 6, 7]}
          value={context.fleet_len}
          onChange={bind("fleet_len")}
        />
      </Flexbox>

      <Divider label="艦の設定" />
      <Flexbox gap={1}>
        <Select
          label="艦の位置"
          css={{ minWidth: 120 }}
          options={[1, 2, 3, 4, 5, 6, 7]}
          value={context.ship_index + 1}
          onChange={(i) => setShipIndex(i - 1)}
        />

        <Button variant="outlined" onClick={() => setShipIndex(0)}>
          旗艦に設定
        </Button>
        <Button
          variant="outlined"
          onClick={() =>
            setShipIndex(Math.max(Math.floor(context.fleet_len / 2) - 1, 0))
          }
        >
          上半分に設定
        </Button>
        <Button
          variant="outlined"
          onClick={() => setShipIndex(context.fleet_len - 1)}
        >
          下半分に設定
        </Button>
      </Flexbox>

      <Divider label="戦闘状態" />
      <Flexbox>
        <Select
          label={t("DamageState")}
          options={["None", "Shouha", "Chuuha", "Taiha", "Sunk"]}
          value={context.damage_state}
          onChange={bind("damage_state")}
          getOptionLabel={t}
        />
        <Select
          label={t("MoraleState")}
          options={["Sparkle", "Normal", "Orange", "Red"]}
          value={context.morale_state}
          onChange={bind("morale_state")}
          getOptionLabel={t}
        />
      </Flexbox>

      <Divider label="昼戦設定" />
      <Flexbox>
        <NumberInput
          value={context.fleet_los_mod || 0}
          onChange={bind("fleet_los_mod")}
        />
      </Flexbox>

      <Divider label="夜戦設定" />
      <Flexbox>
        {/* <Select
          label="夜間触接"
          options={[0, 1, 2, 3]}
          value={state.nightContactRank}
          onChange={state.setNightContactRank}
        />
        <Checkbox
          label={t("Searchlight")}
          checked={state.searchlight}
          onChange={state.setSearchlight}
        />
        <Checkbox
          label={t("Starshell")}
          checked={state.starshell}
          onChange={state.setStarshell}
        /> */}
      </Flexbox>
    </div>
  );
};

export default styled(ShipWarfareSettings)`
  > * {
    gap: 8px;
    margin-top: 8px;
  }

  .MuiFormControl-root {
    min-width: 120px;
  }

  button {
    min-width: 120px;
  }
`;
