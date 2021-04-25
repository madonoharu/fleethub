import styled from "@emotion/styled";
import { Gear } from "@fleethub/core";
import { GearCategory } from "@fleethub/utils";
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
  entries: Array<[GearCategory, Gear[]]>;
  onSelect?: (gear: Gear) => void;
  getNextEbonuses?: (gear: Gear) => EquipmentBonuses;
};

const CategoryContainer: React.FC<Props> = ({
  entries,
  onSelect,
  getNextEbonuses,
}) => {
  const fhCore = useFhCore();
  return (
    <>
      {entries.map(([category, gears]) => (
        <div key={`category-${category}`}>
          <Divider label={fhCore.findGearCategoryName(category)} />
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
