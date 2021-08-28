import styled from "@emotion/styled";
import { DamageState, MoraleState, Ship } from "@fleethub/core";
import { GearKey, SlotSizeKey } from "@fleethub/utils";
import { Tooltip, Paper, IconButton } from "@material-ui/core";
import { useTranslation } from "next-i18next";
import React from "react";

import { useModal, useShipActions } from "../../../hooks";
import { makeGetNextEbonuses } from "../../../utils";
import { DamageStateIcon, Flexbox, MoraleStateIcon } from "../../atoms";
import GearSlot from "../GearSlot";
import ShipBanner from "../ShipBanner";
import DamageSelect from "./DamageStateSelect";
import MoraleStateSelect from "./MoraleStateSelect";
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

const StyledShipBanner = styled(ShipBanner)`
  margin-left: 4px;
`;

const GearList = styled.div`
  flex-grow: 1;
  flex-shrink: 1;
`;

type Props = {
  ship: Ship;
  disableHeaderAction?: boolean;
  onDetailClick?: () => void;
};

const ShipCard: React.FCX<Props> = ({
  className,
  ship,
  disableHeaderAction,
  onDetailClick,
}) => {
  const { id } = ship;
  const actions = useShipActions(id);
  const { t } = useTranslation("common");
  const EditModal = useModal();

  const damageState = ship.damage_state() as DamageState;
  const moraleState = ship.morale_state() as MoraleState;

  return (
    <Paper className={className}>
      <ShipCardHeader
        ship={ship}
        onUpdate={actions.update}
        onEditClick={EditModal.show}
        onDetailClick={onDetailClick}
        onReselect={actions.reselect}
        onRemove={actions.remove}
      />
      <Column>
        <StyledShipBanner shipId={ship.ship_id} size="medium" />
        <ShipStats ship={ship} onUpdate={actions.update} />
      </Column>

      <Column>
        <GearList>
          {(ship.gear_keys() as GearKey[]).map((key, i) => (
            <GearSlot
              key={key}
              gear={ship.get_gear(key)}
              position={{ ship: id, key }}
              slotSize={ship.get_slot_size(i)}
              maxSlotSize={ship.get_max_slot_size(i)}
              onSlotSizeChange={(value) => {
                actions.update({ [`ss${i + 1}` as SlotSizeKey]: value });
              }}
              canEquip={(g) => ship.can_equip(g, key)}
              getNextEbonuses={makeGetNextEbonuses(ship, key)}
            />
          ))}
        </GearList>

        <Flexbox>
          {damageState !== "Normal" && (
            <Tooltip title={`${t("DamageState")} ${t(damageState)}`}>
              <TinyIconButton onClick={EditModal.show}>
                <DamageStateIcon state={damageState} />
              </TinyIconButton>
            </Tooltip>
          )}
          {moraleState !== "Normal" && (
            <Tooltip title={`${t("MoraleState")} ${t(moraleState)}`}>
              <TinyIconButton onClick={EditModal.show}>
                <MoraleStateIcon state={moraleState} />
              </TinyIconButton>
            </Tooltip>
          )}
        </Flexbox>
      </Column>

      <EditModal>
        <ShipMiscEditForm ship={ship} onChange={actions.update} />
      </EditModal>
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
