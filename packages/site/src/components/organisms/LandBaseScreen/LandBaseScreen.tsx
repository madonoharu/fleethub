import styled from "@emotion/styled";
import { Org } from "@fleethub/core";
import { AIR_SQUADRON_KEYS } from "@fleethub/utils";
import { Paper } from "@mui/material";
import { useTranslation } from "next-i18next";
import React from "react";
import { Flexbox, LabeledValue } from "../../atoms";

import AirSquadronCard from "./AirSquadronCard";

type LandBaseScreenProps = {
  org: Org;
};

const LandBaseScreen: React.FCX<LandBaseScreenProps> = ({ className, org }) => {
  const { t } = useTranslation("common");
  return (
    <Paper className={className}>
      <Flexbox
        gap={1}
        css={{
          width: "100%",
          "> *": {
            flexBasis: "100%",
          },
        }}
      >
        {AIR_SQUADRON_KEYS.map((key) => {
          const as = org.get_air_squadron(key);
          return <AirSquadronCard key={key} airSquadron={as} />;
        })}
      </Flexbox>

      <div css={{ display: "inline-block" }}>
        <LabeledValue
          label={t("InterceptionPower")}
          value={org.interception_power()}
        />
        <LabeledValue
          label={t("HighAltitudeInterceptionPower")}
          value={org.high_altitude_interception_power()}
        />
      </div>
    </Paper>
  );
};

export default styled(LandBaseScreen)`
  padding: 8px;
`;
