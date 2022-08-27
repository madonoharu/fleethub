import { Button, Stack } from "@mui/material";
import { parse_ship_conditions } from "fleethub-core";
import type {
  OrgType,
  Side,
  AttackAnalyzerShipConfig,
  ShipConditions,
} from "fleethub-core";
import React from "react";
import { useTranslation } from "react-i18next";

import { Divider, Flexbox } from "../../atoms";
import { NumberInput, Select } from "../../molecules";
import FormationSelect from "../FormationSelect";
import NightFleetConditionsForm from "../NightFleetConditionsForm";
import OrgTypeSelect from "../OrgTypeSelect";

import RoleSelect from "./RoleSelect";

export function toSide(type: OrgType): Side {
  if (type.startsWith("Enemy")) {
    return "Enemy";
  } else {
    return "Player";
  }
}

interface Props {
  value: AttackAnalyzerShipConfig;
  onChange: (value: AttackAnalyzerShipConfig) => void;
}

const AttackAnalyzerShipConfigForm: React.FCX<Props> = ({
  className,
  value,
  onChange,
}) => {
  const { t } = useTranslation("common");
  const { org_type, fleet_type, fleet_len, index, formation } =
    parse_ship_conditions(value) as Required<ShipConditions>;

  const side = toSide(org_type);
  const fleet_los_mod = value.fleet_los_mod || 0;

  const color = side === "Player" ? "primary" : "secondary";

  const bind = <K extends keyof AttackAnalyzerShipConfig>(key: K) => {
    return (next: AttackAnalyzerShipConfig[K]) => {
      onChange({
        ...value,
        [key]: next,
      });
    };
  };

  const setShipIndex = (i: number) => bind("index")(i);

  return (
    <Stack className={className} gap={1}>
      <Divider label="編成設定" />
      <Flexbox gap={1}>
        <OrgTypeSelect
          color={color}
          side={side}
          value={org_type}
          onChange={bind("org_type")}
        />

        <RoleSelect
          color={color}
          value={fleet_type === "Escort" ? "Escort" : "Main"}
          onChange={bind("fleet_type")}
        />

        <FormationSelect
          color={color}
          combined={
            value.org_type !== "Single" && value.org_type !== "EnemySingle"
          }
          value={formation}
          onChange={bind("formation")}
        />

        <Select
          color={color}
          label="艦隊の艦数"
          css={{ minWidth: 120 }}
          options={[1, 2, 3, 4, 5, 6, 7]}
          value={fleet_len}
          onChange={bind("fleet_len")}
        />
      </Flexbox>

      <Divider label="艦の設定" />
      <Flexbox gap={1}>
        <Select
          color={color}
          label="艦の位置"
          css={{ minWidth: 120 }}
          options={[1, 2, 3, 4, 5, 6, 7]}
          value={index + 1}
          onChange={(i) => setShipIndex(i - 1)}
        />

        <Button variant="outlined" onClick={() => setShipIndex(0)}>
          旗艦に設定
        </Button>
        <Button
          variant="outlined"
          onClick={() =>
            setShipIndex(Math.max(Math.floor(fleet_len / 2) - 1, 0))
          }
        >
          上半分に設定
        </Button>
        <Button variant="outlined" onClick={() => setShipIndex(fleet_len - 1)}>
          下半分に設定
        </Button>
      </Flexbox>

      <Divider label="昼戦設定" />
      <Flexbox>
        <NumberInput
          label={t("fleet_los_mod")}
          value={fleet_los_mod}
          onChange={bind("fleet_los_mod")}
        />
      </Flexbox>

      <Divider label="夜戦設定" />
      <NightFleetConditionsForm
        color={color}
        value={value}
        onChange={onChange}
      />
    </Stack>
  );
};

export default AttackAnalyzerShipConfigForm;
