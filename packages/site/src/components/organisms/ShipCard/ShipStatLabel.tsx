import { css } from "@emotion/react";
import styled from "@emotion/styled";
import { Button, Tooltip, Typography } from "@mui/material";
import { useTranslation } from "next-i18next";
import React from "react";

import { useModal } from "../../../hooks";
import { ShipEntity } from "../../../store";
import { withSign, getRangeLabel, getSpeedLabel } from "../../../utils";
import { Flexbox, LabeledValue } from "../../atoms";
import { NumberInput, StatIcon } from "../../molecules";

import { ShipStatKey } from "./ShipStats";

const maybeNumber = (v: number | undefined) => v ?? "?";

const BonusText = styled.span(
  ({ theme }) => css`
    color: ${theme.colors.bonus};
  `
);

const ModText = styled.span(
  ({ theme }) => css`
    color: ${theme.colors.diff};
  `
);

type StatProps = {
  statKey: ShipStatKey;
  stat: number | undefined;
  naked: number | undefined;
  mod: number | undefined;
  ebonus: number;
};

type ShipStatEditorProps = StatProps & {
  onModChange?: (value: number | undefined) => void;
};

const ShipStatEditor: React.FC<ShipStatEditorProps> = ({
  statKey,
  stat,
  naked,
  mod,
  ebonus,
  onModChange,
}) => {
  const { t } = useTranslation("common");

  const minStat = (stat || 0) - (naked || 0);
  const minMod = (mod || 0) - (naked || 0);

  const ebonusText = ebonus ? <BonusText>{withSign(ebonus)}</BonusText> : "-";
  const modText = mod ? <ModText>{withSign(mod)}</ModText> : "-";

  const handleDefaultClick = () => {
    onModChange?.(undefined);
  };

  const handleStatChange = (value: number) => {
    const delta = value - (stat || 0);
    onModChange?.((mod || 0) + delta);
  };

  return (
    <div css={{ margin: 8 }}>
      <Typography
        variant="subtitle1"
        component="div"
        display="flex"
        alignItems="center"
      >
        <StatIcon css={{ paddingTop: 1 }} icon={statKey} />
        <span css={{ marginLeft: 8 }}>{t(statKey)}</span>
      </Typography>
      <div>
        <LabeledValue label={t("ShipStatsCurrent")} value={maybeNumber(stat)} />
        <LabeledValue
          label={t("ShipStatsUnequipped")}
          value={maybeNumber(naked)}
        />
        <LabeledValue label={"装備ボーナス"} value={ebonusText} />
        <LabeledValue label={"強化"} value={modText} />
      </div>

      {onModChange && (
        <NumberInput
          css={{ width: 120, marginTop: 8 }}
          label={"表示"}
          value={stat || 0}
          onChange={handleStatChange}
          max={30000}
          min={minStat}
        />
      )}

      {onModChange && (
        <Flexbox mt={1}>
          <NumberInput
            css={{ width: 120 }}
            label={"強化"}
            value={mod || 0}
            onChange={onModChange}
            max={30000}
            min={minMod}
          />
          <Button
            css={{ marginLeft: 8, height: 40 }}
            variant="outlined"
            onClick={handleDefaultClick}
          >
            {t("Reset")}
          </Button>
        </Flexbox>
      )}
    </div>
  );
};

const ValueText = styled.span`
  min-width: 24px;
  text-align: right;
  white-space: nowrap;
`;

type ShipStatLabelProps = StatProps & {
  onUpdate?: (state: Partial<ShipEntity>) => void;
};

const ShipStatLabel: React.FCX<ShipStatLabelProps> = ({
  className,
  onUpdate,
  ...rest
}) => {
  const { statKey, stat, mod, ebonus } = rest;
  const Modal = useModal();
  const { t } = useTranslation("common");

  let handleModChange: ShipStatEditorProps["onModChange"] = undefined;

  if (
    onUpdate &&
    !(statKey == "speed" || statKey == "range" || statKey == "accuracy")
  ) {
    handleModChange = (value: number | undefined) => {
      const key: keyof ShipEntity = `${statKey}_mod`;
      onUpdate({ [key]: value || undefined });
    };
  }

  let text: React.ReactNode;

  if (statKey === "range") {
    const label = getRangeLabel(stat);
    text = <span css={{ marginLeft: 8 }}>{t(label)}</span>;
  } else if (statKey === "speed") {
    const label = getSpeedLabel(stat);
    text = <span css={{ marginLeft: 8 }}>{t(label)}</span>;
  } else if (typeof stat === "number") {
    text = <ValueText>{stat}</ValueText>;
  } else {
    text = <ValueText>?</ValueText>;
  }

  return (
    <>
      <Tooltip title={t(statKey)}>
        <Button onClick={Modal.show} className={className}>
          <StatIcon icon={statKey} />
          {text}
          {Boolean(ebonus || mod) && (
            <>
              <span>(</span>
              {ebonus ? <BonusText>{withSign(ebonus)}</BonusText> : null}
              {mod ? <ModText>{withSign(mod)}</ModText> : null}
              <span>)</span>
            </>
          )}
        </Button>
      </Tooltip>

      <Modal>
        <ShipStatEditor {...rest} onModChange={handleModChange} />
      </Modal>
    </>
  );
};

export default styled(ShipStatLabel)`
  justify-content: flex-start;
  font-size: 0.75rem;
  line-height: 0;
  padding: 0 4px;

  > * {
    display: block;
    flex-shrink: 0;
  }
`;
