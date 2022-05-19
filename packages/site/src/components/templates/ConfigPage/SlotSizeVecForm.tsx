import { Typography } from "@mui/material";
import { MasterShip, SlotSizeVec } from "fleethub-core";
import { useTranslation } from "next-i18next";
import React from "react";

import { MasterShipOverrides } from "../../../store";
import { Flexbox } from "../../atoms";
import ResettableInput from "../../organisms/ResettableInput";

interface SlotSizeVecFormProps {
  ship: MasterShip;
  config: MasterShipOverrides;
  onChange: (value: SlotSizeVec) => void;
}

const SlotSizeVecForm: React.FC<SlotSizeVecFormProps> = ({
  ship,
  config,
  onChange,
}) => {
  const { t } = useTranslation("common");
  const current = config.slots || [];

  const handleChange = (index: number) => (value: number | null) => {
    const next = [...current];
    next[index] = value;
    onChange(next);
  };

  return (
    <>
      <Typography variant="subtitle2">{t("slots")}</Typography>
      <Flexbox gap={1} flexWrap="wrap">
        {ship.slots.map((defaultValue, i) => {
          return (
            <ResettableInput
              key={i}
              label={`${i + 1}`}
              defaultValue={defaultValue}
              value={current[i]}
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
