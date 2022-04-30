import { Typography } from "@mui/material";
import { MasterShip } from "fleethub-core";
import { useTranslation } from "next-i18next";
import React from "react";
import { Updater } from "use-immer";

import { MasterShipOverrides } from "../../../store";
import { Flexbox } from "../../atoms";
import ResettableInput from "../../organisms/ResettableInput";

interface SlotSizeVecFormProps {
  ship: MasterShip;
  config: MasterShipOverrides;
  updater: Updater<MasterShipOverrides>;
}

const SlotSizeVecForm: React.FC<SlotSizeVecFormProps> = ({
  ship,
  config,
  updater,
}) => {
  const { t } = useTranslation("common");
  const configSlots = config.slots || [];

  const handleChange = (i: number) => (v: number | null) => {
    updater((draft) => {
      if (!draft.slots) {
        draft.slots = new Array(ship.slotnum).fill(null);
      }
      draft.slots[i] = v;
    });
  };

  return (
    <>
      <Typography variant="subtitle2">{t("slots")}</Typography>
      <Flexbox gap={1}>
        {ship.slots.map((s, i) => {
          return (
            <ResettableInput
              key={i}
              defaultValue={s}
              value={configSlots[i]}
              min={0}
              max={255}
              onChange={handleChange(i)}
            />
          );
        })}
      </Flexbox>
    </>
  );
};

export default SlotSizeVecForm;
