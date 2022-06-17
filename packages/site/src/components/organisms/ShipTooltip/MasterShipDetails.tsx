import { GEAR_KEYS } from "@fh/utils";
import { Typography, Stack } from "@mui/material";
import { Ship } from "fleethub-core";
import { useTranslation } from "next-i18next";
import React from "react";

import { useShipName } from "../../../hooks";
import { numstr } from "../../../utils";
import GearNameplate from "../GearNameplate";

import MasterShipStats from "./MasterShipStats";

interface Props {
  ship: Ship;
}

const MasterShipDetails: React.FCX<Props> = ({ className, ship }) => {
  const { t } = useTranslation(["common", "stype"]);

  const abyssal = ship.is_abyssal();
  const displayName = useShipName(ship.ship_id);

  return (
    <Typography className={className} variant="body2" component="div">
      <Typography variant="caption">
        ID {ship.ship_id} {t(`stype:${ship.stype}`)}
      </Typography>
      <Typography variant="subtitle2">{displayName}</Typography>
      <MasterShipStats ship={ship} />

      <div css={{ display: "grid", gridTemplateColumns: "1fr 1fr" }}>
        <span>{t("common:slots")}</span>
        <Stack direction="row" gap={1}>
          {ship.slots.map((v, i) => (
            <span key={i}>{`${v ?? "?"}`}</span>
          ))}
        </Stack>

        {abyssal && (
          <>
            <span>{t("common:torpedo_accuracy")}</span>
            <span>{ship.innate_torpedo_accuracy}</span>
            <span>{t("common:basic_evasion_term")}</span>
            <span>{numstr(ship.basic_evasion_term()) || "?"}</span>
            <span>{t("common:ohko_power")}</span>
            <span>{numstr(ship.ohko_power()) || "?"}</span>
          </>
        )}
      </div>

      {abyssal &&
        GEAR_KEYS.map((key) => {
          const gear = ship.get_gear(key);
          return (
            gear && (
              <GearNameplate key={key} iconId={gear.icon_id} name={gear.name} />
            )
          );
        })}
    </Typography>
  );
};

export default MasterShipDetails;
