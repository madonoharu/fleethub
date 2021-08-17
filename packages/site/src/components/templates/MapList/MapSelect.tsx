import { Button } from "@material-ui/core";
import { useTranslation } from "next-i18next";
import React from "react";
import { useAsync } from "react-async-hook";

import { uniq } from "../../../../../utils/cjs";
import { Divider } from "../../atoms";

const fetchAll = () =>
  fetch(
    "https://storage.googleapis.com/kcfleethub.appspot.com/maps/all.json"
  ).then((res) => res.json()) as Promise<number[]>;

type Props = {
  onSelect?: (mapId: number) => void;
};

const MapSelect: React.FCX<Props> = ({ className, onSelect }) => {
  const { t } = useTranslation("common");
  const asyncAll = useAsync(fetchAll, []);

  let inner: React.ReactNode;

  if (asyncAll.status === "loading") {
    inner = "loading";
  }

  if (asyncAll.status === "success" && asyncAll.result) {
    const all = asyncAll.result;

    const worlds = uniq(all.map((mapId) => Math.floor(mapId / 10)));

    inner = (
      <>
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
      </>
    );
  }

  return <div className={className}>{inner}</div>;
};

export default MapSelect;
