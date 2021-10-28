/** @jsxImportSource @emotion/react */
import { groupBy } from "@fh/utils";
import { Ship } from "fleethub-core";
import { useTranslation } from "next-i18next";
import React from "react";

import { Divider } from "../../atoms";
import { SearchInput } from "../../organisms";
import FilterBar from "./FilterBar";
import ShipButton from "./ShipButton";
import ShipSearchResult from "./ShipSearchResult";
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
  const { state, update, visibleShips, searchValue, setSearchValue } =
    useShipListState();

  const { t } = useTranslation("ctype");

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
      <FilterBar state={state} update={update} />
      {searchValue ? (
        <ShipSearchResult
          searchValue={searchValue}
          ships={visibleShips}
          renderShip={renderShip}
        />
      ) : (
        getCtypeEntries(visibleShips).map(([ctype, ships]) => (
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
