import styled from "@emotion/styled";
import {
  AirState,
  FleetType,
  Formation,
  Plan,
  Ship,
  ShipState,
} from "@fleethub/core";
import React from "react";
import { useTranslation } from "react-i18next";

import { NumberInput, ShipBanner, StatIcon } from "../../molecules";

type ShipDetailScreenProps = {
  ship: Ship;
  onChange?: (state: ShipState) => void;
};

type ShipPosition = {
  isFlagship: boolean;
  index: number;
  fleetType: FleetType;
};

type BattleContext = {
  formation: Formation;
  airState: AirState;
};

const ShipDetailScreen: React.FCX<ShipDetailScreenProps> = ({
  className,
  ship,
  onChange,
}) => {
  const statKeys = [
    "maxHp",
    "firepower",
    "torpedo",
    "antiAir",
    "armor",
    "asw",
    "los",
  ] as const;

  const { t } = useTranslation("terms");

  const renderStat = (key: typeof statKeys[number]) => {
    const { value, diff } = ship[key];

    const handleChange = (next: number) => {
      const delta = next - value;
      onChange?.({ ...ship.state, [key]: diff + delta });
    };

    return (
      <div key={key} css={{ display: "flex" }}>
        <NumberInput
          startLabel={
            <div css={{ display: "flex", fontSize: "0.75rem" }}>
              <StatIcon icon={key} />
              {t(key)}
            </div>
          }
          value={value}
          onChange={handleChange}
        />
        <div>{diff}</div>
      </div>
    );
  };

  return (
    <div className={className}>
      <ShipBanner size="medium" publicId={ship.banner} />
      {ship.name}
      {statKeys.map(renderStat)}
    </div>
  );
};

export default styled(ShipDetailScreen)`
  width: 600px;
  min-height: 80vh;
`;
