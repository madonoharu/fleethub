import { css } from "@emotion/react";
import styled from "@emotion/styled";
import { Button, Tooltip, Typography } from "@material-ui/core";
import { useTranslation } from "next-i18next";
import React from "react";
import { useModal } from "../../../hooks";
import { ShipEntity } from "../../../store";

import { withSign } from "../../../utils";
import { Text, Flexbox, LabeledValue } from "../../atoms";

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

const maybeNumber = (v: number | undefined) => v ?? "?";

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

const ShipStatForm: React.FC<ShipStatEditorProps> = ({
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
        <LabeledValue
          label={t("SettingsShipStatsCurrent")}
          value={maybeNumber(stat)}
        />
        <LabeledValue
          label={t("SettingsShipStatsUnequipped")}
          value={maybeNumber(naked)}
        />
        <LabeledValue label={"装備ボーナス"} value={ebonus} />
        <LabeledValue label={"強化"} value={mod ?? "-"} />
      </div>

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
          {t("SettingsReset")}
        </Button>
      </Flexbox>
    </div>
  );
};

const BonusText = styled(Text)(
  ({ theme }) => css`
    color: ${theme.colors.bonus};
    position: absolute;
    font-size: 10px;
    bottom: -3px;
    left: 16px;
  `
);

const ModText = styled(Text)(
  ({ theme }) => css`
    color: ${theme.colors.diff};
    position: absolute;
    font-size: 10px;
    top: -3px;
    left: 16px;
  `
);

const ValueText = styled(Text)`
  margin-left: 4px;
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

  const handleChange = (value: number | undefined) => {
    if (!onUpdate || statKey == "speed" || statKey == "range") return;

    if (stat === undefined || value === undefined) {
      onUpdate({ [`${statKey}_mod`]: value });
    } else {
      const next = (mod || 0) + value - stat;
      onUpdate({ [`${statKey}_mod`]: next || undefined });
    }
  };

  let text: string;
  if (statKey === "speed") {
    const rank = getSpeedRank(stat);
    text = t(rank);
  } else if (typeof stat === "number") {
    text = stat.toString();
  } else {
    text = "?";
  }

  return (
    <>
      <Tooltip title={t(statKey)}>
        <Button onClick={Modal.show} className={className}>
          <StatIcon icon={statKey} />
          <ValueText>{text}</ValueText>
          {ebonus ? <BonusText>{ebonus}</BonusText> : null}
          {mod ? <ModText>{mod}</ModText> : null}
        </Button>
      </Tooltip>

      <Modal>
        <ShipStatForm {...rest} onChange={handleChange} />
      </Modal>
    </>
  );
};

export default styled(ShipStatLabel)`
  position: relative;
  font-size: 0.75rem;
  line-height: 1.5;
`;
