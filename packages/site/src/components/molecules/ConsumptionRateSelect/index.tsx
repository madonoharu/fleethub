import KeyboardArrowDownIcon from "@mui/icons-material/KeyboardArrowDown";
import { Button, Stack } from "@mui/material";
import { useTranslation } from "next-i18next";
import React from "react";

import { useModal } from "../../../hooks";
import { toPercent } from "../../../utils";
import { FuelIcon, AmmoIcon } from "../../atoms";

const BATTLE_COST_DATA = [
  {
    fuel: 0.2,
    ammo: 0.2,
  },
  {
    fuel: 0.2,
    ammo: 0.3,
    ammoCeil: true,
  },
  {
    fuel: 0.1,
    ammo: 0.1,
  },
  {
    fuel: 0.08,
    ammo: 0,
  },
  {
    fuel: 0.06,
    ammo: 0.04,
  },
  {
    fuel: 0.04,
    ammo: 0.08,
  },
  {
    fuel: 0.04,
    ammo: 0.0,
  },
];

export type ConsumptionRate = {
  fuel: number;
  ammo: number;
  ammoCeil?: boolean;
};

type ConsumptionRateSelectProps = {
  onSelect: (value: ConsumptionRate) => void;
};

const ConsumptionRateSelect: React.FCX<ConsumptionRateSelectProps> = ({
  className,
  onSelect,
}) => {
  const { t } = useTranslation("common");
  const Modal = useModal();

  return (
    <>
      <Button
        className={className}
        variant="outlined"
        endIcon={<KeyboardArrowDownIcon />}
        onClick={Modal.show}
      >
        {t("Consume")}
      </Button>

      <Modal>
        <Stack gap={1} m={1}>
          {BATTLE_COST_DATA.map((value, index) => (
            <Button
              key={index}
              variant="outlined"
              fullWidth
              onClick={() => {
                onSelect(value);
                Modal.hide();
              }}
            >
              <FuelIcon />
              <span>-{toPercent(value.fuel, 0)}</span>
              <AmmoIcon />
              <span>-{toPercent(value.ammo, 0)}</span>
            </Button>
          ))}
        </Stack>
      </Modal>
    </>
  );
};

export default ConsumptionRateSelect;
