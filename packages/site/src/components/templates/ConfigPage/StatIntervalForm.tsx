import { Typography } from "@mui/material";
import { MasterShip, StatInterval } from "fleethub-core";
import { useTranslation } from "next-i18next";
import React from "react";
import { Updater } from "use-immer";

import { MasterShipOverrides, StatIntervalKey } from "../../../store";
import { Flexbox } from "../../atoms";
import { StatIcon } from "../../molecules";
import ResettableInput from "../../organisms/ResettableInput";

interface StatIntervalFormProps {
  statKey: StatIntervalKey;
  ship: MasterShip;
  config: MasterShipOverrides;
  updater: Updater<MasterShipOverrides>;
}

const StatIntervalForm: React.FC<StatIntervalFormProps> = ({
  statKey,
  ship,
  config,
  updater,
}) => {
  const { t } = useTranslation("common");

  const abyssal = ship.ship_id > 1500;
  const [s0, s1] = ship[statKey];
  const configInterval = config[statKey] || [null, null];

  let elem: React.ReactElement;

  if (abyssal) {
    const handleChange = (v: number | null) => {
      updater((draft) => {
        draft[statKey] = [v, v];
      });
    };

    elem = (
      <ResettableInput
        defaultValue={s0}
        value={configInterval[0]}
        onChange={handleChange}
      />
    );
  } else {
    const handleChange = (i: number) => (v: number | null) => {
      updater((draft) => {
        const next: StatInterval = [...configInterval];
        next[i] = v;
        draft[statKey] = next;
      });
    };

    elem = (
      <Flexbox gap={2}>
        <ResettableInput
          defaultValue={s0}
          value={configInterval[0]}
          onChange={handleChange(0)}
        />
        <ResettableInput
          defaultValue={s1}
          value={configInterval[1]}
          onChange={handleChange(1)}
        />
      </Flexbox>
    );
  }

  return (
    <div>
      <Flexbox gap={1}>
        <StatIcon icon={statKey} />
        <Typography variant="subtitle2">{t(statKey)}</Typography>
      </Flexbox>
      {elem}
    </div>
  );
};

export default StatIntervalForm;
