import { Ship } from "@fleethub/core";
import { groupBy } from "@fleethub/utils";
import { useTranslation } from "next-i18next";
import React, { useState } from "react";

import { useFhCore } from "../../../hooks";
import { Divider } from "../../atoms";
import { SearchInput } from "../../organisms";
import FilterBar from "./FilterBar";
import ShipButton from "./ShipButton";
import ShipSearchResult from "./ShipSearchResult";
import searchShip from "./searchShip";
import { useShipListState } from "./useShipListState";

const getCtypeEntries = (ships: Ship[]): Array<[number, Ship[]]> => {
  const group = groupBy(ships, (ship) => ship.ctype);

  return Object.entries(group)
    .filter((entry): entry is [string, Ship[]] => Boolean(entry[1]))
    .map(([k, v]) => [Number(k), v]);
};

type Props = {
  abyssal?: boolean;
  onSelect?: (ship: Ship) => void;
};

const ShipList: React.FC<Props> = ({ onSelect }) => {
  const { t } = useTranslation("ctype");
  const { state, update, masterShips, visibleShips } = useShipListState();
  const [searchValue, setSearchValue] = useState("");

  const ctypeEntries = getCtypeEntries(visibleShips);

  const searchResult = searchValue && searchShip(masterShips, searchValue);

  const renderShip = (ship: Ship) => (
    <ShipButton
      key={`ship-${ship.ship_id}`}
      ship={ship}
      onClick={() => onSelect?.(ship)}
    />
  );

  return (
    <>
      <SearchInput value={searchValue} onChange={setSearchValue} />
      <FilterBar state={state} onChange={update} />
      {searchResult ? (
        <ShipSearchResult
          searchValue={searchValue}
          ships={searchResult}
          renderShip={renderShip}
        />
      ) : (
        ctypeEntries.map(([ctype, ships]) => (
          <React.Fragment key={`ctype-${ctype}`}>
            <Divider label={t(`${ctype}`)} />
            {ships.map(renderShip)}
          </React.Fragment>
        ))
      )}
    </>
  );
};

export default ShipList;
