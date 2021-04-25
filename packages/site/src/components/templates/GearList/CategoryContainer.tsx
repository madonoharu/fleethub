import styled from "@emotion/styled";
import { GearCategory, GearCategoryName } from "@fleethub/data";
import { Gear } from "@fleethub/core";
import { EquipmentBonuses } from "equipment-bonus";
import React from "react";

import { Divider } from "../../atoms";
import GearButton from "./GearButton";

const Grid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(200px, 1fr));
`;

type Props = {
  entries: Array<[GearCategory, Gear[]]>;
  onSelect?: (gear: Gear) => void;
  getNextEbonuses?: (gear: Gear) => EquipmentBonuses;
};

const CategoryContainer: React.FC<Props> = ({
  entries,
  onSelect,
  getNextEbonuses,
}) => {
  return (
    <>
      {entries.map(([category, gears]) => (
        <div key={`category-${category}`}>
          <Divider label={GearCategoryName[category]} />
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

export default CategoryContainer;
