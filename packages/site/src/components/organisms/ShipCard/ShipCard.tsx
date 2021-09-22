import styled from "@emotion/styled";
import { DamageState, MoraleState, Org, Ship } from "@fh/core";
import { GearKey, SlotSizeKey } from "@fh/utils";
import { Tooltip, Paper, IconButton, Button } from "@mui/material";
import { useTranslation } from "next-i18next";
import React from "react";

import { useModal, useShipActions } from "../../../hooks";
import { toPercent } from "../../../utils";
import {
  AmmoIcon,
  DamageStateIcon,
  Flexbox,
  FuelIcon,
  MoraleStateIcon,
} from "../../atoms";
import GearSlot from "../GearSlot";
import ShipBanner from "../ShipBanner";
import ShipDetails from "../ShipDetails";
import ShipCardHeader from "./ShipCardHeader";
import ShipMiscEditForm from "./ShipMiscEditForm";
import ShipStats from "./ShipStats";

const Column = styled.div`
  display: flex;
  flex-direction: column;
`;

const TinyIconButton = styled(IconButton)`
  padding: 3px;
  line-height: 0;
  svg {
    font-size: 1rem;
  }
`;

const TinyButton = styled(Button)`
  padding: 0 4px;

  .MuiButton-startIcon {
    margin-right: 4px;
    margin-left: 0;
  }
`;

const StyledShipBanner = styled(ShipBanner)`
  margin-left: 4px;
`;

const GearList = styled.div`
  flex-grow: 1;
  flex-shrink: 1;
`;

type ShipCardProps = {
  ship: Ship;
  org?: Org;
  visibleMiscStats?: boolean;
  disableHeaderAction?: boolean;
};

const ShipCard: React.FCX<ShipCardProps> = ({
  className,
  ship,
  org,
  visibleMiscStats,
  disableHeaderAction,
}) => {
  const { id } = ship;
  const actions = useShipActions(id);
  const { t } = useTranslation("common");
  const EditModal = useModal();
  const DetailModal = useModal();

  const damageState = ship.damage_state() as DamageState;
  const moraleState = ship.morale_state() as MoraleState;
  const { ammo, max_ammo, fuel, max_fuel } = ship;

  const visibleDamageState = visibleMiscStats || damageState !== "Normal";
  const visibleMoraleState = visibleMiscStats || moraleState !== "Normal";

  const ammoRate = max_ammo ? ammo / max_ammo : 1;
  const fuelRate = max_fuel ? fuel / max_fuel : 1;
  const visibleAmmo = visibleMiscStats || ammoRate < 1;
  const visibleFuel = visibleMiscStats || fuelRate < 1;

  return (
    <Paper className={className}>
      <ShipCardHeader
        ship={ship}
        onUpdate={actions.update}
        onEditClick={EditModal.show}
        onDetailClick={DetailModal.show}
        onReselect={actions.reselect}
        onRemove={actions.remove}
        disableHeaderAction={disableHeaderAction}
      />
      <Column>
        <StyledShipBanner shipId={ship.ship_id} size="medium" />
        <ShipStats ship={ship} onUpdate={actions.update} />
      </Column>

      <Column>
        <GearList>
          {(ship.gear_keys() as GearKey[]).map((key, i) => {
            const gear = ship.get_gear(key);
            return (
              <GearSlot
                key={key}
                gear={gear}
                position={{ tag: "ship", id, key }}
                slotSize={ship.get_slot_size(i)}
                maxSlotSize={ship.get_max_slot_size(i)}
                equippable={gear && ship.can_equip(gear, key)}
                onSlotSizeChange={(value) => {
                  actions.update({ [`ss${i + 1}` as SlotSizeKey]: value });
                }}
              />
            );
          })}
        </GearList>

        <Flexbox>
          {visibleDamageState && (
            <Tooltip title={`${t("DamageState")} ${t(damageState)}`}>
              <TinyIconButton onClick={EditModal.show}>
                <DamageStateIcon state={damageState} />
              </TinyIconButton>
            </Tooltip>
          )}
          {visibleMoraleState && (
            <Tooltip title={`${t("MoraleState")} ${t(moraleState)}`}>
              <TinyIconButton onClick={EditModal.show}>
                <MoraleStateIcon state={moraleState} />
              </TinyIconButton>
            </Tooltip>
          )}
          {visibleFuel && (
            <Tooltip title={t("fuel")}>
              <TinyButton
                onClick={EditModal.show}
                startIcon={<FuelIcon />}
                size="small"
              >
                {toPercent(fuelRate, 0)}
              </TinyButton>
            </Tooltip>
          )}
          {visibleAmmo && (
            <Tooltip title={t("ammo")}>
              <TinyButton onClick={EditModal.show} startIcon={<AmmoIcon />}>
                {toPercent(ammoRate, 0)}
              </TinyButton>
            </Tooltip>
          )}
        </Flexbox>
      </Column>

      <EditModal>
        <ShipMiscEditForm ship={ship} onChange={actions.update} />
      </EditModal>

      <DetailModal full>
        <ShipDetails ship={ship} org={org} />
      </DetailModal>
    </Paper>
  );
};

const Styled = styled(ShipCard)`
  height: ${24 * 8}px;
  display: grid;
  grid-template-columns: 160px calc(100% - 160px);
  grid-template-rows: 24px auto;
  grid-template-areas:
    "a a"
    "b c";

  ${ShipCardHeader} {
    grid-area: a;
  }
  div:nth-of-type(2) {
    grid-area: b;
  }
  div:nth-of-type(3) {
    grid-area: c;
  }

  ${ShipCardHeader} svg {
    visibility: hidden;
  }
  :hover ${ShipCardHeader} svg {
    visibility: visible;
  }
`;

export default Styled;
