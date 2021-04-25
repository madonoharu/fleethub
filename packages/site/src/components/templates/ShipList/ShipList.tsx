import { Ship } from "@fleethub/core";
import { ShipClass, uniq } from "@fleethub/utils";
import React, { useState } from "react";

import { useFhSim } from "../../../hooks";
import { Divider } from "../../atoms";
import { SearchInput } from "../../organisms";
import FilterBar from "./FilterBar";
import searchShip from "./searchShip";
import ShipButton from "./ShipButton";
import ShipSearchResult from "./ShipSearchResult";
import { useShipListState } from "./useShipListState";

const toShipClassEntries = (ships: Ship[]): Array<[number, Ship[]]> => {
  const shipClasses = uniq(ships.map((ship) => ship.ship_class));
  return shipClasses.map((shipClass) => [
    shipClass,
    ships.filter((ship) => ship.ship_class === shipClass),
  ]);
};

type Props = {
  abyssal?: boolean;
  onSelect?: (ship: Ship) => void;
};

const ShipList: React.FC<Props> = ({ onSelect }) => {
  const { state, update, masterShips, visibleShips } = useShipListState();
  const [searchValue, setSearchValue] = useState("");
  const { findShipClassName } = useFhSim();

  const shipClassEntries = toShipClassEntries(visibleShips);

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
        shipClassEntries.map(([shipClass, ships]) => (
          <React.Fragment key={`shipClass-${shipClass}`}>
            <Divider label={findShipClassName(shipClass)} />
            {ships.map(renderShip)}
          </React.Fragment>
        ))
      )}
    </>
  );
};

export default ShipList;
