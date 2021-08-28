import { Ship } from "@fleethub/core";
import { useTranslation } from "next-i18next";
import { useMemo, useState } from "react";
import { useFhCore } from "../../../hooks";

type DummyEnemySelectValue = { label: string; ship: Ship };

export const useDummyEnemySelectState = () => {
  const { core } = useFhCore();
  const { t } = useTranslation(["ships", "common"]);

  const options = useMemo(() => {
    const specialEnemies = [1665, 1668, 1653, 1699, 1637, 1696, 1705].map(
      (shipId) => {
        const ship = core.create_ship_by_id(shipId);
        return {
          label: t(`ships:${shipId}`, ship?.name),
          ship: core.create_ship_by_id(shipId),
        };
      }
    );

    const dummyEnemies = [
      { label: t("common:None"), ship: core.create_default_ship() },
      {
        label: t("common:ApShellModifier"),
        ship: core.create_ship_by_id(1511),
      },
      { label: t("common:SoftSkinned"), ship: core.create_ship_by_id(1573) },
      ...specialEnemies,
    ];

    return dummyEnemies.filter((item): item is DummyEnemySelectValue =>
      Boolean(item.ship)
    );
  }, [core, t]);

  const [value, onChange] = useState(options[0]);

  return {
    options,
    value,
    onChange,
  };
};
