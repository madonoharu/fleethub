import { Button, Tooltip, Typography } from "@mui/material";
import { Ship } from "fleethub-core";
import { useTranslation } from "next-i18next/pages";
import React from "react";

import { cn } from "../../../styles/cn";
import { useModal } from "../../../hooks";
import { ShipEntity } from "../../../store";
import { withSign, getRangeAbbr, getSpeedRank } from "../../../utils";
import { Flexbox, LabeledValue } from "../../atoms";
import { NumberInput, StatIcon } from "../../molecules";

import { ShipStatKey } from "./ShipStats";

const maybeNumber = (v: number | undefined) => v ?? "?";

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

  const ebonusText = ebonus ? <span className="text-bonus">{withSign(ebonus)}</span> : "-";
  const modText = mod ? <span className="text-diff">{withSign(mod)}</span> : "-";

  const handleDefaultClick = () => {
    onModChange?.(undefined);
  };

  const handleStatChange = (value: number) => {
    const delta = value - (stat || 0);
    onModChange?.((mod || 0) + delta);
  };

  return (
    <div className="m-2">
      <Typography variant="subtitle1" component="div" className="flex items-center">
        <StatIcon className="pt-px" icon={statKey} />
        <span className="ml-2">{t(`${statKey}`)}</span>
      </Typography>
      <div>
        <LabeledValue label={t("ShipStatsCurrent")} value={maybeNumber(stat)} />
        <LabeledValue label={t("Naked")} value={maybeNumber(naked)} />
        <LabeledValue label={t("EquipmentBonus")} value={ebonusText} />
        <LabeledValue label={t("Increase")} value={modText} />
      </div>

      {onModChange && (
        <NumberInput
          integer
          className="mt-2 w-[120px]"
          label={t("ShipStatsCurrent")}
          value={stat || 0}
          onChange={handleStatChange}
          max={30000}
          min={minStat}
        />
      )}

      {onModChange && (
        <Flexbox className="mt-2">
          <NumberInput
            integer
            className="w-[120px]"
            label={t("Increase")}
            value={mod || 0}
            onChange={onModChange}
            max={30000}
            min={minMod}
          />
          <Button className="ml-2 h-10" variant="outlined" onClick={handleDefaultClick}>
            {t("Reset")}
          </Button>
        </Flexbox>
      )}
    </div>
  );
};

type ShipStatLabelProps = {
  statKey: ShipStatKey;
  ship: Ship;
  onUpdate?: (state: Partial<ShipEntity>) => void;
};

const ShipStatLabel: React.FCX<ShipStatLabelProps> = ({ className, statKey, ship, onUpdate }) => {
  const stat = ship[statKey];
  const naked = ship.get_naked_stat(statKey);
  const mod = ship.get_stat_mod(statKey);
  const ebonus = ship.get_ebonus(statKey);

  const Modal = useModal();
  const { t } = useTranslation("common");

  let handleModChange: ShipStatEditorProps["onModChange"] = undefined;

  if (onUpdate && !(statKey == "speed" || statKey == "range" || statKey == "accuracy")) {
    handleModChange = (value: number | undefined) => {
      const key: keyof ShipEntity = `${statKey}_mod`;
      onUpdate({ [key]: value || undefined });
    };
  }

  let text: React.ReactNode;

  if (statKey === "range") {
    const abbr = getRangeAbbr(stat);
    const label = abbr ? t(`RangeAbbr.${abbr}`) : "?";
    text = <span className="ml-2">{label}</span>;
  } else if (statKey === "speed") {
    const rank = getSpeedRank(stat);
    const label = rank ? t(`SpeedRank.${rank}`) : "?";
    text = <span className="ml-2">{label}</span>;
  } else if (typeof stat === "number") {
    text = <span className="min-w-[24px] text-right whitespace-nowrap">{stat}</span>;
  } else {
    text = <span className="min-w-[24px] text-right whitespace-nowrap">?</span>;
  }

  return (
    <>
      <Tooltip title={t(statKey)}>
        <Button
          onClick={Modal.show}
          className={cn(
            "justify-start px-1 py-0 text-[0.75rem] leading-[0] [&>*]:block [&>*]:shrink-0",
            className,
          )}
        >
          <StatIcon icon={statKey} />
          {text}
          {Boolean(ebonus || mod) && (
            <>
              <span className="ml-0.5">(</span>
              {ebonus ? <span className="text-bonus">{withSign(ebonus)}</span> : null}
              {mod ? <span className="text-diff">{withSign(mod)}</span> : null}
              <span>)</span>
            </>
          )}
        </Button>
      </Tooltip>

      <Modal>
        <ShipStatEditor
          statKey={statKey}
          stat={stat}
          naked={naked}
          mod={mod}
          ebonus={ebonus}
          onModChange={handleModChange}
        />
      </Modal>
    </>
  );
};

export default ShipStatLabel;
