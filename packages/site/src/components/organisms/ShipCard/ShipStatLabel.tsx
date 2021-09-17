import { css } from "@emotion/react";
import styled from "@emotion/styled";
import { Button, Tooltip, Typography } from "@mui/material";
import { useTranslation } from "next-i18next";
import React from "react";
import { useModal } from "../../../hooks";
import { ShipEntity } from "../../../store";
import { withSign } from "../../../utils";
import { Flexbox, LabeledValue } from "../../atoms";
import { NumberInput, StatIcon } from "../../molecules";
import { ShipStatKey } from "./ShipStats";

const getSpeedRank = (v: number | undefined) => {
  if (v === undefined || v < 0) return "Unknown";
  if (v === 0) return "SpeedLand";
  if (v <= 5) return "SpeedSlow";
  if (v <= 10) return "SpeedFast";
  if (v <= 15) return "SpeedFaster";
  return "SpeedFastest";
};

const getRangeLabel = (v: number | undefined) => {
  if (!v || v <= 0) return "?";
  if (v === 1) return "RangeShortAbbr";
  if (v === 2) return "RangeMediumAbbr";
  if (v === 3) return "RangeLongAbbr";
  if (v === 4) return "RangeVeryLongAbbr";
  return "RangeExtremeLongAbbr";
};

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
  unknown?: boolean;
};

type ShipStatEditorProps = StatProps & {
  onChange?: (value: number | undefined) => void;
};

const ShipStatEditor: React.FC<ShipStatEditorProps> = ({
  statKey,
  stat,
  naked,
  mod,
  ebonus,
  unknown,
  onChange,
}) => {
  const { t } = useTranslation("common");

  const min = (stat || 0) - (naked || 0);

  const ebonusText = ebonus ? <BonusText>{withSign(ebonus)}</BonusText> : "-";
  const modText = mod ? <ModText>{withSign(mod)}</ModText> : "-";

  const handleDefaultClick = () => {
    onChange?.(undefined);
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

      {onChange && (
        <Flexbox style={{ marginTop: 8 }}>
          <NumberInput
            css={{ width: 120 }}
            label={"表示"}
            value={stat || 0}
            onChange={onChange}
            max={30000}
            min={min}
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

  let handleChange: ShipStatEditorProps["onChange"] = undefined;

  if (
    onUpdate &&
    !(statKey == "speed" || statKey == "range" || statKey == "accuracy")
  ) {
    handleChange = (value: number | undefined) => {
      const key: keyof ShipEntity = `${statKey}_mod`;

      if (stat === undefined || value === undefined) {
        onUpdate({ [key]: value });
      } else {
        const next = (mod || 0) + value - stat;
        onUpdate({ [key]: next || undefined });
      }
    };
  }

  let text: React.ReactNode;

  if (statKey === "range") {
    const label = getRangeLabel(stat);
    text = <span css={{ marginLeft: 8 }}>{t(label)}</span>;
  } else if (statKey === "speed") {
    const rank = getSpeedRank(stat);
    text = <span css={{ marginLeft: 8 }}>{t(rank)}</span>;
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
        <ShipStatEditor {...rest} onChange={handleChange} />
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
