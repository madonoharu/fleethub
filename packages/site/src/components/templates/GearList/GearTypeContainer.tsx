import type { Gear, EBonuses } from "fleethub-core";
import { useTranslation } from "next-i18next/pages";
import React from "react";

import { Divider } from "../../atoms";

import GearButton from "./GearButton";

type Props = {
  entries: Array<[number, Gear[]]>;
  onSelect?: (gear: Gear) => void;
  getNextEbonuses?: (gear: Gear) => EBonuses;
};

const GearTypeContainer: React.FC<Props> = ({ entries, onSelect, getNextEbonuses }) => {
  const { t } = useTranslation("gear_types");

  return (
    <>
      {entries.map(([typeId, gears]) => (
        <div key={typeId}>
          <Divider label={t(typeId)} />
          <div className="grid grid-cols-[repeat(auto-fill,minmax(200px,1fr))]">
            {gears.map((gear) => (
              <GearButton
                key={`gear-${gear.gear_id}`}
                gear={gear}
                onClick={() => onSelect && onSelect(gear)}
                ebonuses={getNextEbonuses?.(gear)}
              />
            ))}
          </div>
        </div>
      ))}
    </>
  );
};

export default GearTypeContainer;
