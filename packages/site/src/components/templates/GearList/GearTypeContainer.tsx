import styled from "@emotion/styled";
import { Gear } from "@fh/core";
import { EquipmentBonuses } from "equipment-bonus";
import { useTranslation } from "next-i18next";
import React from "react";

import { useFhCore } from "../../../hooks";
import { Divider } from "../../atoms";
import GearButton from "./GearButton";

const Grid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(200px, 1fr));
`;

type Props = {
  entries: Array<[number, Gear[]]>;
  onSelect?: (gear: Gear) => void;
  getNextEbonuses?: (gear: Gear) => EquipmentBonuses;
};

const GearTypeContainer: React.FC<Props> = ({
  entries,
  onSelect,
  getNextEbonuses,
}) => {
  const { t } = useTranslation("gear_types");

  return (
    <>
      {entries.map(([typeId, gears]) => (
        <div key={typeId}>
          <Divider label={t(typeId)} />
          <Grid>
            {gears.map((gear) => (
              <GearButton
                key={`gear-${gear.gear_id}`}
                gear={gear}
                onClick={() => onSelect && onSelect(gear)}
                ebonuses={getNextEbonuses?.(gear)}
              />
            ))}
          </Grid>
        </div>
      ))}
    </>
  );
};

export default GearTypeContainer;
