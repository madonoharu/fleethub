import { Button, Stack } from "@mui/material";
import {
  Formation,
  OrgType,
  Role,
  Side,
  WarfareAnalyzerShipEnvironment,
} from "fleethub-core";
import React from "react";
import { useTranslation } from "react-i18next";

import { useFhCore } from "../../../hooks";
import { Divider, Flexbox } from "../../atoms";
import { NumberInput, Select } from "../../molecules";
import CustomModifiersForm from "../CustomModifiersDialog/CustomModifiersForm";
import FormationSelect from "../FormationSelect";
import NightSituationForm from "../NightSituationForm";
import OrgTypeSelect from "../OrgTypeSelect";

export function toSide(type: OrgType): Side {
  if (type.startsWith("Enemy")) {
    return "Enemy";
  } else {
    return "Player";
  }
}

function defaultFormationFrom(type: OrgType): Formation {
  if (type === "Single" || type === "EnemySingle") {
    return "LineAhead";
  } else {
    return "Cruising4";
  }
}

type RoleSelectProps = {
  color: "primary" | "secondary";
  value: Role;
  onChange: (value: Role) => void;
};

const RoleSelect: React.FC<RoleSelectProps> = (props) => {
  const { t } = useTranslation("common", { keyPrefix: "FleetType" });

  return (
    <Select<Role> options={["Main", "Escort"]} getOptionLabel={t} {...props} />
  );
};

type ShipParamsSettingsProps = {
  side?: Side;
  value: WarfareAnalyzerShipEnvironment;
  onChange: (changes: WarfareAnalyzerShipEnvironment) => void;
};

const ShipParamsSettings: React.FCX<ShipParamsSettingsProps> = ({
  className,
  side,
  value,
  onChange,
}) => {
  const { t } = useTranslation("common");
  const { org_type_is_single } = useFhCore().module;

  const handleOrgTypeChange = (org_type: OrgType) => {
    const changesForm =
      org_type_is_single(org_type) !== org_type_is_single(value.org_type);

    onChange({
      ...value,
      org_type,
      formation: changesForm ? defaultFormationFrom(org_type) : value.formation,
    });
  };

  const bind = <K extends keyof WarfareAnalyzerShipEnvironment>(key: K) => {
    return (next: WarfareAnalyzerShipEnvironment[K]) => {
      onChange({ ...value, [key]: next });
    };
  };

  const setShipIndex = (i: number) => bind("ship_index")(i);

  const isPlayer = toSide(value.org_type) === "Player";
  const color = isPlayer ? "primary" : "secondary";

  return (
    <Stack className={className} gap={1}>
      <Divider label="編成設定" />
      <Flexbox gap={1}>
        <OrgTypeSelect
          color={color}
          side={side}
          value={value.org_type}
          onChange={handleOrgTypeChange}
        />

        <RoleSelect color={color} value={value.role} onChange={bind("role")} />

        <FormationSelect
          color={color}
          combined={
            value.org_type !== "Single" && value.org_type !== "EnemySingle"
          }
          value={value.formation}
          onChange={bind("formation")}
        />

        <Select
          color={color}
          label="艦隊の艦数"
          css={{ minWidth: 120 }}
          options={[1, 2, 3, 4, 5, 6, 7]}
          value={value.fleet_len}
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
          value={value.ship_index + 1}
          onChange={(i) => setShipIndex(i - 1)}
        />

        <Button variant="outlined" onClick={() => setShipIndex(0)}>
          旗艦に設定
        </Button>
        <Button
          variant="outlined"
          onClick={() =>
            setShipIndex(Math.max(Math.floor(value.fleet_len / 2) - 1, 0))
          }
        >
          上半分に設定
        </Button>
        <Button
          variant="outlined"
          onClick={() => setShipIndex(value.fleet_len - 1)}
        >
          下半分に設定
        </Button>
      </Flexbox>

      <Divider label="昼戦設定" />
      <Flexbox>
        <NumberInput
          label={t("fleet_los_mod")}
          value={value.fleet_los_mod || 0}
          onChange={bind("fleet_los_mod")}
        />
      </Flexbox>

      <Divider label="夜戦設定" />
      <NightSituationForm
        color={color}
        value={value.night_situation}
        onChange={bind("night_situation")}
      />

      <CustomModifiersForm
        value={value.custom_mods}
        onChange={bind("custom_mods")}
      />
    </Stack>
  );
};

export default ShipParamsSettings;
