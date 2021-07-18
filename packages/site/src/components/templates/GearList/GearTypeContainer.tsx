import styled from "@emotion/styled";
import { Gear } from "@fleethub/core";
import { EquipmentBonuses } from "equipment-bonus";
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
  const { core } = useFhCore();

  return (
    <>
      {entries.map(([typeId, gears]) => (
        <div key={typeId}>
          <Divider label={core.find_gear_gear_type_name(typeId)} />
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
