import styled from "@emotion/styled";
import { Typography } from "@mui/material";
import { Gear } from "fleethub-core";
import React, { useState } from "react";

import { SearchInput } from "../../organisms";
import GearButton from "../GearList/GearButton";

const searchById = (gears: Gear[], searchValue: string) => {
  const str = /^id(\d+)/.exec(searchValue)?.[1];
  if (!str) return;

  const id = Number(str);
  return gears.find((gear) => gear.gear_id === id);
};

const searchGears = (gears: Gear[], searchValue: string) => {
  const idFound = searchById(gears, searchValue);
  if (idFound) {
    return [idFound];
  }

  return gears.filter((gear) =>
    gear.name.toUpperCase().includes(searchValue.toUpperCase())
  );
};

const Grid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(200px, 1fr));
`;

type GearSearchResultProps = {
  searchValue: string;
  gears: Gear[];
  onSelect?: (gear: Gear) => void;
};

const GearSearchResult: React.FC<GearSearchResultProps> = ({
  searchValue,
  gears,
  onSelect,
}) => {
  return (
    <div>
      <Typography>{`"${searchValue}"の検索結果`}</Typography>

      {gears.length === 0 ? (
        <Typography>見つかりませんでした</Typography>
      ) : (
        <Grid>
          {gears.map((gear) => (
            <GearButton
              key={`gear-${gear.gear_id}`}
              gear={gear}
              onClick={() => onSelect && onSelect(gear)}
            />
          ))}
        </Grid>
      )}
    </div>
  );
};

type GearSearchMenuProps = {
  gears: Gear[];
  onSelect?: (gear: Gear) => void;
};

const GearSearchMenu: React.FCX<GearSearchMenuProps> = ({
  gears,
  onSelect,
}) => {
  const [searchValue, setSearchValue] = useState("");

  return (
    <div>
      <SearchInput
        value={searchValue}
        onChange={setSearchValue}
        autoFocus={true}
      />

      {searchValue && (
        <GearSearchResult
          searchValue={searchValue}
          gears={searchGears(gears, searchValue)}
          onSelect={onSelect}
        />
      )}
    </div>
  );
};

export default GearSearchMenu;
