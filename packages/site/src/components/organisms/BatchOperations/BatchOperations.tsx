/** @jsxImportSource @emotion/react */
import { GEAR_EXP_TABLE, range } from "@fh/utils";
import { Button, Typography } from "@mui/material";
import { useTranslation } from "next-i18next";
import React from "react";

import { Divider, Flexbox, ProficiencyIcon, StarsLabel } from "../../atoms";

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
  onStarsClick?: (value: number | undefined) => void;
  onExpClick?: (value: number | undefined) => void;
  onSlotSizeReset?: () => void;
};

const BatchOperations: React.FCX<BatchOperationPropss> = ({
  onStarsClick,
  onExpClick,
  onSlotSizeReset,
  ...rest
}) => {
  const { t } = useTranslation("common");

  const handleStarsClick = createHandler(onStarsClick);
  const handleExpClick = createHandler(onExpClick);

  return (
    <div {...rest}>
      <Typography variant="subtitle1">{t("BatchOperation")}</Typography>

      <Divider label={t("Stars")} />
      <Flexbox flexDirection="row-reverse">
        <Button onClick={handleStarsClick}>{t("Reset")}</Button>

        {range(11).map((n) => (
          <Button key={n} value={n} onClick={handleStarsClick}>
            <StarsLabel stars={n} />
          </Button>
        ))}
      </Flexbox>

      <Divider label={t("Proficiency")} />
      <Flexbox flexDirection="row-reverse">
        <Button onClick={handleExpClick}>{t("Reset")}</Button>

        {GEAR_EXP_TABLE.map((exp) => (
          <Button
            key={exp}
            value={exp}
            onClick={handleExpClick}
            css={{ flexGrow: 1 }}
          >
            <ProficiencyIcon exp={exp} />
          </Button>
        ))}
      </Flexbox>

      <Divider />
      <Button onClick={onSlotSizeReset}>搭載数を初期化</Button>
    </div>
  );
};

export default BatchOperations;
