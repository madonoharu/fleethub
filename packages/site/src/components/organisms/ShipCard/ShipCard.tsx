import { GearKey, SlotSizeKey } from "@fh/utils";
import { Tooltip, Paper, IconButton, Button } from "@mui/material";
import { Comp, Ship } from "fleethub-core";
import { useTranslation } from "next-i18next/pages";
import React from "react";

import { cn } from "../../../styles/cn";
import { useModal, useShipActions } from "../../../hooks";
import { toPercent } from "../../../utils";
import { AmmoIcon, DamageStateIcon, Flexbox, FuelIcon, MoraleStateIcon } from "../../atoms";
import GearSlot from "../GearSlot";
import PresetMenu from "../PresetMenu";
import ShipBanner from "../ShipBanner";
import ShipDetails from "../ShipDetails";

import ShipCardHeader from "./ShipCardHeader";
import ShipMiscEditForm from "./ShipMiscEditForm";
import ShipStats from "./ShipStats";

type ShipCardProps = {
  ship: Ship;
  comp?: Comp;
  visibleMiscStats?: boolean;
  visibleDetails?: boolean;
  visibleUpdate?: boolean;
  visibleRemove?: boolean;
};

const ShipCard: React.FCX<ShipCardProps> = ({
  className,
  ship,
  comp,
  visibleMiscStats,
  visibleDetails,
  visibleUpdate,
  visibleRemove,
}) => {
  const { id } = ship;
  const { t } = useTranslation("common");

  const actions = useShipActions(id);
  const EditModal = useModal();
  const DetailModal = useModal();
  const PresetModal = useModal();

  const damageState = ship.damage_state();
  const moraleState = ship.morale_state();
  const { ammo, max_ammo, fuel, max_fuel } = ship;

  const visibleDamageState = visibleMiscStats || damageState !== "Normal";
  const visibleMoraleState = visibleMiscStats || moraleState !== "Normal";

  const ammoRate = max_ammo ? ammo / max_ammo : 1;
  const fuelRate = max_fuel ? fuel / max_fuel : 1;
  const visibleAmmo = visibleMiscStats || ammoRate < 1;
  const visibleFuel = visibleMiscStats || fuelRate < 1;

  const readonly = id === "";

  return (
    <Paper
      className={cn(
        "grid h-[192px] min-w-[360px] grid-cols-[160px_calc(100%_-_160px)] grid-rows-[24px_auto] [&>div:nth-of-type(1)]:col-span-2 [&>div:nth-of-type(1)]:row-start-1 [&>div:nth-of-type(1)_svg]:invisible [&>div:nth-of-type(2)]:col-start-1 [&>div:nth-of-type(2)]:row-start-2 [&>div:nth-of-type(3)]:col-start-2 [&>div:nth-of-type(3)]:row-start-2 [&:hover>div:nth-of-type(1)_svg]:visible",
        className,
      )}
    >
      <ShipCardHeader
        ship={ship}
        onUpdate={actions.update}
        onEditClick={EditModal.show}
        onDetailClick={DetailModal.show}
        onReselect={actions.reselect}
        onPreset={PresetModal.show}
        onRemove={actions.remove}
        readonly={readonly}
        visibleDetails={visibleDetails}
        visibleUpdate={visibleUpdate}
        visibleRemove={visibleRemove}
      />
      <div className="flex flex-col">
        <ShipBanner className="ml-1" shipId={ship.ship_id} size="medium" />
        <ShipStats ship={ship} onUpdate={actions.update} />
      </div>

      <div className="flex flex-col">
        <div className="grow shrink">
          {(ship.gear_keys() as GearKey[]).map((key, i) => {
            const gear = ship.get_gear(key);
            return (
              <GearSlot
                key={key}
                gear={gear}
                position={{ tag: "ships", id, key }}
                slotSize={ship.get_slot_size(i)}
                maxSlotSize={ship.get_max_slot_size(i)}
                equippable={gear && ship.can_equip(gear, key)}
                onSlotSizeChange={(value) => {
                  actions.update({ [`ss${i + 1}` as SlotSizeKey]: value });
                }}
              />
            );
          })}
        </div>

        <Flexbox>
          {visibleDamageState && (
            <Tooltip title={`${t("DamageState.name")} ${t(`DamageState.${damageState}`)}`}>
              <IconButton
                className="p-[3px] leading-[0] [&_svg]:text-[1rem]"
                onClick={EditModal.show}
              >
                <DamageStateIcon state={damageState} />
              </IconButton>
            </Tooltip>
          )}
          {visibleMoraleState && (
            <Tooltip title={`${t("MoraleState.name")} ${t(`MoraleState.${moraleState}`)}`}>
              <IconButton
                className="p-[3px] leading-[0] [&_svg]:text-[1rem]"
                onClick={EditModal.show}
              >
                <MoraleStateIcon state={moraleState} />
              </IconButton>
            </Tooltip>
          )}
          {visibleFuel && (
            <Tooltip title={t("fuel")}>
              <Button
                className="px-1 py-0 [&_.MuiButton-startIcon]:mr-1 [&_.MuiButton-startIcon]:ml-0"
                onClick={EditModal.show}
                startIcon={<FuelIcon />}
                size="small"
              >
                {toPercent(fuelRate, 0)}
              </Button>
            </Tooltip>
          )}
          {visibleAmmo && (
            <Tooltip title={t("ammo")}>
              <Button
                className="px-1 py-0 [&_.MuiButton-startIcon]:mr-1 [&_.MuiButton-startIcon]:ml-0"
                onClick={EditModal.show}
                startIcon={<AmmoIcon />}
              >
                {toPercent(ammoRate, 0)}
              </Button>
            </Tooltip>
          )}
        </Flexbox>
      </div>

      <EditModal>
        <ShipMiscEditForm ship={ship} onChange={actions.update} />
      </EditModal>

      <DetailModal full>
        <ShipDetails ship={ship} comp={comp} />
      </DetailModal>

      <PresetModal>
        <PresetMenu
          position={{
            tag: "ships",
            id,
          }}
          onEquip={PresetModal.hide}
        />
      </PresetModal>
    </Paper>
  );
};

export default ShipCard;
