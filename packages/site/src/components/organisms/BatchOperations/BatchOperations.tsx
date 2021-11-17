/** @jsxImportSource @emotion/react */
import { DAMAGE_STATES, GEAR_EXP_TABLE, MORALE_STATES, range } from "@fh/utils";
import { Button, Stack, Typography } from "@mui/material";
import { styled } from "@mui/system";
import { DamageState, MoraleState } from "fleethub-core";
import { useTranslation } from "next-i18next";
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

const starsTable = range(11).reverse();

const expTable = GEAR_EXP_TABLE.concat().reverse();

const createHandler =
  (
    fn?: (value: number | undefined) => void
  ): React.MouseEventHandler<HTMLButtonElement> =>
  (event) => {
    const value = event.currentTarget.value;
    if (value === "") {
      fn?.(undefined);
    } else {
      fn?.(Number(value));
    }
  };

type BatchOperationPropss = {
  onStarsSelect?: (value: number | undefined) => void;
  onExpSelect?: (value: number | undefined) => void;
  onMoraleStateSelect?: (value: MoraleState) => void;
  onDamageStateSelect?: (value: DamageState) => void;
  onConsumptionRateSelect?: (value: ConsumptionRate) => void;
  onConsumptionReset?: () => void;
  onSlotSizeReset?: () => void;
};

const GridContainer = styled("div")`
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 8px;
  > * {
    min-width: fit-content;
  }
`;

const BatchOperations: React.FCX<BatchOperationPropss> = ({
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
    <Stack gap={1} {...rest}>
      <Typography variant="subtitle1">{t("BatchOperation")}</Typography>

      <Divider label={t("Stars")} />
      <Flexbox>
        {starsTable.map((n) => (
          <Button
            key={n}
            css={{ flexGrow: 1 }}
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
            key={exp}
            css={{ flexGrow: 1 }}
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
          <Divider label={t("MoraleState")} />
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
                {t(state)}
              </Button>
            ))}
          </GridContainer>
        </>
      )}

      {onDamageStateSelect && (
        <>
          <Divider label={t("DamageState")} />
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
                {t(state)}
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

export default styled(BatchOperations)``;
