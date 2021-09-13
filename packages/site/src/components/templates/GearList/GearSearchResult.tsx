import styled from "@emotion/styled";
import { Gear } from "@fleethub/core";
import { Typography } from "@mui/material";
import React from "react";

import GearButton from "./GearButton";

const Grid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(200px, 1fr));
`;

type Props = {
  searchValue: string;
  gears: Gear[];
  onSelect?: (gear: Gear) => void;
};

const GearSearchResult: React.FC<Props> = ({
  searchValue,
  gears,
  onSelect,
}) => {
  const text = (
    <Typography>
      &quot;{searchValue}&quot;の検索結果{" "}
      {gears.length === 0 && "見つかりませんでした"}
    </Typography>
  );
  return (
    <div>
      {text}
      <Grid>
        {gears.map((gear) => (
          <GearButton
            key={`gear-${gear.gear_id}`}
            gear={gear}
            onClick={() => onSelect && onSelect(gear)}
          />
        ))}
      </Grid>
    </div>
  );
};

export default GearSearchResult;
