import styled from "@emotion/styled";
import { Button } from "@material-ui/core";
import { useTranslation } from "next-i18next";
import React from "react";
import { useAsync } from "react-async-hook";

import { uniq } from "../../../../../utils/cjs";
import { Divider, Flexbox } from "../../atoms";

const fetchAll = () =>
  fetch(
    "https://storage.googleapis.com/kcfleethub.appspot.com/maps/all.json"
  ).then((res) => res.json()) as Promise<number[]>;

type MapSelectProps = {
  onSelect?: (mapId: number) => void;
};

type WorldMapButtonsProps = {
  all: number[];
  worlds: number[];
} & MapSelectProps;

const StyledFlexbox = styled(Flexbox)`
  align-items: flex-start;
  gap: 16px;
  flex-wrap: wrap;
`;

const WorldMapButtons: React.FCX<WorldMapButtonsProps> = ({
  className,
  all,
  worlds,
  onSelect,
}) => {
  const { t } = useTranslation("common");

  return (
    <div className={className}>
      {worlds.map((world) => (
        <div key={world}>
          <Divider label={t(`worldName${world}`)} />
          {all
            .filter((mapId) => Math.floor(mapId / 10) === world)
            .map((mapId) => (
              <Button key={mapId} onClick={() => onSelect?.(mapId)}>
                {world}-{mapId % 10}
              </Button>
            ))}
        </div>
      ))}
    </div>
  );
};

const MapSelect: React.FCX<MapSelectProps> = ({ className, onSelect }) => {
  const asyncAll = useAsync(fetchAll, []);

  let inner: React.ReactNode;

  if (asyncAll.status === "loading") {
    inner = "loading";
  }

  if (asyncAll.status === "success" && asyncAll.result) {
    const all = asyncAll.result;

    const allWorlds = uniq(all.map((mapId) => Math.floor(mapId / 10)));

    const normalWorlds = allWorlds.filter((id) => id < 10);
    const eventWorlds = allWorlds.filter((id) => id >= 10);

    inner = (
      <StyledFlexbox>
        <WorldMapButtons all={all} worlds={normalWorlds} onSelect={onSelect} />
        <WorldMapButtons all={all} worlds={eventWorlds} onSelect={onSelect} />
      </StyledFlexbox>
    );
  }

  return <div className={className}>{inner}</div>;
};

export default MapSelect;
