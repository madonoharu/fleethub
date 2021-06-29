import styled from "@emotion/styled";
import { Plan } from "@fleethub/core";
import { AIR_SQUADRON_KEYS } from "@fleethub/utils";
import React from "react";

import AirSquadronCard from "./AirSquadronCard";

type LandBaseScreenProps = {
  plan: Plan;
};

const LandBaseScreen: React.FCX<LandBaseScreenProps> = ({
  className,
  plan,
}) => {
  return (
    <div className={className}>
      {AIR_SQUADRON_KEYS.map((key) => {
        const as = plan.get_air_squadron(key);
        return <AirSquadronCard key={key} airSquadron={as} />;
      })}
    </div>
  );
};

export default styled(LandBaseScreen)`
  display: flex;
  width: 100%;

  > * {
    flex-grow: 1;
  }
`;
