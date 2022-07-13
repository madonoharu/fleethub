import { Button, Stack } from "@mui/material";
import { Formation, OrgType, Role, Side, ShipEnvironment } from "fleethub-core";
import React from "react";
import { useTranslation } from "react-i18next";

import { Divider, Flexbox } from "../../atoms";
import { NumberInput, Select } from "../../molecules";
import FormationSelect from "../FormationSelect";
import NightConditionsForm from "../NightConditionsForm";
import OrgTypeSelect from "../OrgTypeSelect";

export function toSide(type: OrgType): Side {
  if (type.startsWith("Enemy")) {
    return "Enemy";
  } else {
    return "Player";
  }
}

function defaultFormation(type: OrgType): Formation {
  if (type === "Single" || type === "EnemySingle") {
    return "LineAhead";
  } else {
    return "Cruising4";
  }
}

function isSingleFleet(type: OrgType): boolean {
  return type === "Single" || type === "EnemySingle";
}

type RoleSelectProps = {
  color: "primary" | "secondary";
  value: Role;
  onChange: (value: Role) => void;
};

const ROLE_OPTIONS = ["Main", "Escort"] as const;

const RoleSelect: React.FC<RoleSelectProps> = (props) => {
  const { t } = useTranslation("common", { keyPrefix: "FleetType" });
  return <Select<Role> options={ROLE_OPTIONS} getOptionLabel={t} {...props} />;
};

type ShipParamsSettingsProps = {
  value: ShipEnvironment;
  onChange: (changes: ShipEnvironment) => void;
};

const ShipParamsSettings: React.FCX<ShipParamsSettingsProps> = ({
  className,
  value,
  onChange,
}) => {
  const { t } = useTranslation("common");

  const orgType = value.org_type || "Single";
  const side = toSide(orgType);
  const role = value.role || "Main";
  const index = value.index || 0;
  const fleet_len = value.fleet_len || 6;
  const fleet_los_mod = value.fleet_los_mod || 0;

  const handleOrgTypeChange = (next: OrgType) => {
    let nextFormation: Formation | undefined = value.formation;
    if (isSingleFleet(next) !== isSingleFleet(orgType)) {
      nextFormation = defaultFormation(next);
    }

    onChange({
      ...value,
      org_type: next,
      formation: nextFormation,
    });
  };

  const bind = <K extends keyof ShipEnvironment>(key: K) => {
    return (next: ShipEnvironment[K]) => {
      onChange({
        ...value,
        [key]: next,
      });
    };
  };

  const setShipIndex = (i: number) => bind("index")(i);

  const isPlayer = toSide(orgType) === "Player";
  const color = isPlayer ? "primary" : "secondary";

  return (
    <Stack className={className} gap={1}>
      <Divider label="編成設定" />
      <Flexbox gap={1}>
        <OrgTypeSelect
          color={color}
          side={side}
          value={orgType}
          onChange={handleOrgTypeChange}
        />

        <RoleSelect color={color} value={role} onChange={bind("role")} />

        <FormationSelect
          color={color}
          combined={
            value.org_type !== "Single" && value.org_type !== "EnemySingle"
          }
          value={value.formation || "LineAhead"}
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
      <NightConditionsForm
        color={color}
        value={value.night_conditions}
        onChange={bind("night_conditions")}
      />
    </Stack>
  );
};

export default ShipParamsSettings;
