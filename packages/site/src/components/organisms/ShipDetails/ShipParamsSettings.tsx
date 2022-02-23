import { Button, Stack } from "@mui/material";
import { OrgType, Role, WarfareAnalyzerShipEnvironment } from "fleethub-core";
import React from "react";
import { useTranslation } from "react-i18next";

import { useFhCore } from "../../../hooks";
import { Divider, Flexbox } from "../../atoms";
import { NumberInput, Select } from "../../molecules";
import AttackPowerModifiersForm from "../AttackPowerModifiersForm";
import FormationSelect from "../FormationSelect";
import NightSituationForm from "../NightSituationForm";
import OrgTypeSelect from "../OrgTypeSelect";

type ShipStateSettingsProps = {
  value: WarfareAnalyzerShipEnvironment;
  onChange: (changes: WarfareAnalyzerShipEnvironment) => void;
};

const ShipStateSettings: React.FCX<ShipStateSettingsProps> = ({
  className,
  value,
  onChange,
}) => {
  const { t } = useTranslation("common");
  const { org_type_is_single, org_type_default_formation, org_type_is_player } =
    useFhCore().module;

  const handleOrgTypeChange = (org_type: OrgType) => {
    const changesForm =
      org_type_is_single(org_type) !== org_type_is_single(value.org_type);

    onChange({
      ...value,
      org_type,
      formation: changesForm
        ? org_type_default_formation(org_type)
        : value.formation,
    });
  };

  const bind =
    <K extends keyof WarfareAnalyzerShipEnvironment>(key: K) =>
    (next: WarfareAnalyzerShipEnvironment[K]) =>
      onChange({ ...value, [key]: next });

  const setShipIndex = (i: number) => bind("ship_index")(i);

  const isPlayer = org_type_is_player(value.org_type);
  const color = isPlayer ? "primary" : "secondary";

  return (
    <Stack className={className} gap={1}>
      <Divider label="編成設定" />
      <Flexbox gap={1}>
        <OrgTypeSelect
          color={color}
          value={value.org_type}
          onChange={handleOrgTypeChange}
        />

        <Select<Role>
          color={color}
          options={["Main", "Escort"]}
          value={value.role}
          onChange={bind("role")}
          getOptionLabel={t}
        />

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
          label="艦隊索敵補正"
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

      <Divider label="特攻" />
      <AttackPowerModifiersForm
        value={value.custom_mods}
        onChange={bind("custom_mods")}
      />
    </Stack>
  );
};

export default ShipStateSettings;
