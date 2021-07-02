import styled from "@emotion/styled";
import { Org } from "@fleethub/core";
import { AIR_SQUADRON_KEYS } from "@fleethub/utils";
import React from "react";

import AirSquadronCard from "./AirSquadronCard";

type LandBaseScreenProps = {
  org: Org;
};

const LandBaseScreen: React.FCX<LandBaseScreenProps> = ({ className, org }) => {
  return (
    <div className={className}>
      {AIR_SQUADRON_KEYS.map((key) => {
        const as = org.get_air_squadron(key);
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
