import { GEAR_KEYS } from "@fh/utils";
import { Typography } from "@mui/material";
import { Ship } from "fleethub-core";
import { useTranslation } from "next-i18next";
import React from "react";

import { numstr } from "../../../utils";
import { Flexbox } from "../../atoms";
import GearNameplate from "../GearNameplate";

import MasterShipStats from "./MasterShipStats";

interface Props {
  ship: Ship;
}

const AbyssalShipDetails: React.FC<{ ship: Ship }> = ({ ship }) => {
  const { t } = useTranslation("common");

  return (
    <>
      <Flexbox gap={2}>
        <span>{t("torpedo_accuracy")}</span>
        <span>{ship.torpedo_accuracy_mod}</span>
      </Flexbox>
      <Flexbox gap={2}>
        <span>{t("basic_evasion_term")}</span>
        <span>{numstr(ship.basic_evasion_term(), 2)}</span>
      </Flexbox>
      {GEAR_KEYS.map((key) => {
        const gear = ship.get_gear(key);
        return (
          gear && (
            <GearNameplate key={key} iconId={gear.icon_id} name={gear.name} />
          )
        );
      })}
    </>
  );
};

const MasterShipDetails: React.FC<Props> = ({ ship }) => {
  const { t, i18n } = useTranslation(["common", "ships", "stype"]);

  let displayName: string;
  if (i18n.resolvedLanguage === "ja") {
    displayName = ship.name;
  } else {
    displayName = t(`ships:${ship.ship_id}`, ship.name);
  }

  return (
    <Typography variant="body2" component="div">
      <Typography variant="caption">
        ID {ship.ship_id} {t(`stype:${ship.stype}`)}
      </Typography>
      <Typography variant="subtitle2">{displayName}</Typography>
      <MasterShipStats ship={ship} />

      <Flexbox gap={2}>
        <span>{t("common:slots")}</span>
        <Flexbox gap={1}>
          {ship.slots.map((v, i) => (
            <span key={i}>{`${v ?? "?"}`}</span>
          ))}
        </Flexbox>
      </Flexbox>

      {ship.is_abyssal() && <AbyssalShipDetails ship={ship} />}
    </Typography>
  );
};

export default MasterShipDetails;
