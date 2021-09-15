import { css } from "@emotion/react";
import styled from "@emotion/styled";
import { Org } from "@fh/core";
import { AIR_SQUADRON_KEYS } from "@fh/utils";
import { Paper } from "@mui/material";
import { useTranslation } from "next-i18next";
import React from "react";
import { useDispatch } from "react-redux";

import { SwapEvent } from "../../../hooks";
import { AirSquadronPosition, orgsSlice } from "../../../store";
import { LabeledValue } from "../../atoms";
import Swappable from "../Swappable";
import AirSquadronCard from "./AirSquadronCard";

type LandBaseScreenProps = {
  org: Org;
};

const LandBaseScreen: React.FCX<LandBaseScreenProps> = ({ className, org }) => {
  const { t } = useTranslation("common");
  const dispatch = useDispatch();

  const id = org.id;

  const handleSwap = (event: SwapEvent<AirSquadronPosition>) => {
    dispatch(orgsSlice.actions.swapAirSquadron(event));
  };

  return (
    <Paper className={className}>
      <div
        css={css`
          display: grid;
          grid-template-columns: 1fr 1fr 1fr;
          gap: 8px;
        `}
      >
        {AIR_SQUADRON_KEYS.map((key) => {
          const as = org.get_air_squadron(key);
          return (
            <Swappable
              key={as.id}
              type="airSquadron"
              item={{ org: id, key }}
              onSwap={handleSwap}
            >
              <AirSquadronCard
                key={key}
                airSquadron={as}
                label={`第${key.substring(1)}航空隊`}
              />
            </Swappable>
          );
        })}
      </div>

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
