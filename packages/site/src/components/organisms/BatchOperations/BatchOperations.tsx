import { DAMAGE_STATES, GEAR_EXP_TABLE, MORALE_STATES, range } from "@fh/utils";
import { Button, Stack, Typography } from "@mui/material";

import { DamageState, MoraleState } from "fleethub-core";
import { useTranslation } from "next-i18next/pages";
import React from "react";

import {
  Divider,
  Flexbox,
  ProficiencyIcon,
  StarsLabel,
  MoraleStateIcon,
  DamageStateIcon,
} from "../../atoms";
import { ConsumptionRate, ConsumptionRateSelect } from "../../molecules";
import { cn } from "../../../styles";

const starsTable = range(11).reverse();

const expTable = GEAR_EXP_TABLE.concat().reverse();

const createHandler =
  (fn?: (value: number | undefined) => void): React.MouseEventHandler<HTMLButtonElement> =>
  (event) => {
    const value = event.currentTarget.value;
    if (value === "") {
      fn?.(undefined);
    } else {
      fn?.(Number(value));
    }
  };

type BatchOperationProps = {
  onStarsSelect?: (value: number | undefined) => void;
  onExpSelect?: (value: number | undefined) => void;
  onMoraleStateSelect?: (value: MoraleState) => void;
  onDamageStateSelect?: (value: DamageState) => void;
  onConsumptionRateSelect?: (value: ConsumptionRate) => void;
  onConsumptionReset?: () => void;
  onSlotSizeReset?: () => void;
};

const GridContainer = ({ className, ...props }: React.ComponentProps<"div">) => (
  <div
    {...props}
    className={cn("grid [grid-template-columns:repeat(4,_1fr)] gap-2 [&_>_*]:min-w-fit", className)}
  />
);

const BatchOperations: React.FCX<BatchOperationProps> = ({
  className,
  onStarsSelect,
  onExpSelect,
  onMoraleStateSelect,
  onDamageStateSelect,
  onConsumptionRateSelect,
  onConsumptionReset,
  onSlotSizeReset,
  ...rest
}) => {
  const { t } = useTranslation("common");

  const handleStarsClick = createHandler(onStarsSelect);
  const handleExpClick = createHandler(onExpSelect);

  return (
    <Stack {...rest} className={cn("gap-2", className)}>
      <Typography variant="subtitle1">{t("BatchOperation")}</Typography>

      <Divider label={t("Stars")} />
      <Flexbox>
        {starsTable.map((n) => (
          <Button
            className="grow"
            key={n}

            value={n}
            onClick={handleStarsClick}
          >
            <StarsLabel stars={n} />
          </Button>
        ))}
        <Button variant="outlined" onClick={handleStarsClick}>
          {t("Reset")}
        </Button>
      </Flexbox>

      <Divider label={t("Proficiency")} />
      <Flexbox>
        {expTable.map((exp) => (
          <Button
            className="grow"
            key={exp}

            value={exp}
            onClick={handleExpClick}
          >
            <ProficiencyIcon exp={exp} />
          </Button>
        ))}
        <Button variant="outlined" onClick={handleExpClick}>
          {t("Reset")}
        </Button>
      </Flexbox>

      {onMoraleStateSelect && (
        <>
          <Divider label={t("MoraleState.name")} />
          <GridContainer>
            {MORALE_STATES.map((state) => (
              <Button
                key={state}
                value={state}
                variant="outlined"
                startIcon={<MoraleStateIcon state={state} />}
                onClick={(event) => {
                  onMoraleStateSelect(event.currentTarget.value as MoraleState);
                }}
              >
                {t(`MoraleState.${state}`)}
              </Button>
            ))}
          </GridContainer>
        </>
      )}

      {onDamageStateSelect && (
        <>
          <Divider label={t("DamageState.name")} />
          <GridContainer>
            {DAMAGE_STATES.map((state) => (
              <Button
                key={state}
                value={state}
                variant="outlined"
                startIcon={<DamageStateIcon state={state} />}
                onClick={(event) => {
                  onDamageStateSelect(event.currentTarget.value as DamageState);
                }}
              >
                {t(`DamageState.${state}`)}
              </Button>
            ))}
          </GridContainer>
        </>
      )}

      {onConsumptionRateSelect && (
        <>
          <Divider label={`${t("fuel")} & ${t("ammo")}`} />
          <GridContainer>
            <ConsumptionRateSelect onSelect={onConsumptionRateSelect} />
            <Button variant="outlined" onClick={onConsumptionReset}>
              {t("Reset")}
            </Button>
          </GridContainer>
        </>
      )}

      <Divider />
      <GridContainer>
        <Button variant="outlined" onClick={onSlotSizeReset}>
          搭載数を初期化
        </Button>
      </GridContainer>
    </Stack>
  );
};

export default BatchOperations;
