import { css } from "@emotion/react";
import styled from "@emotion/styled";
import { Org } from "@fh/core";
import { AIR_SQUADRON_KEYS } from "@fh/utils";
import { Paper } from "@mui/material";
import { useTranslation } from "next-i18next";
import React from "react";
import { useDispatch } from "react-redux";

import { SwapEvent, useModal } from "../../../hooks";
import {
  AirSquadronPosition,
  airSquadronsSlice,
  gearsSlice,
  orgsSlice,
} from "../../../store";
import { Flexbox, LabeledValue } from "../../atoms";
import { BuildButton, DeleteButton } from "../../molecules";
import BatchOperations from "../BatchOperations";
import Swappable from "../Swappable";
import AirSquadronCard from "./AirSquadronCard";

type LandBaseScreenProps = {
  org: Org;
};

const LandBaseScreen: React.FCX<LandBaseScreenProps> = ({ className, org }) => {
  const { t } = useTranslation("common");
  const BatchOperationsModal = useModal();
  const dispatch = useDispatch();

  const id = org.id;
  const airSquadrons = AIR_SQUADRON_KEYS.map((key) =>
    org.get_air_squadron(key)
  );

  const handleSwap = (event: SwapEvent<AirSquadronPosition>) => {
    dispatch(orgsSlice.actions.swapAirSquadron(event));
  };

  const handleStarsClick = (value: number | undefined) => {
    const ids = org.get_air_squadron_gear_ids_by_improvable();
    const changes = { stars: value };
    const payload = ids.map((id) => ({ id, changes }));
    dispatch(gearsSlice.actions.updateMany(payload));
  };

  const handleExpClick = (value: number | undefined) => {
    const ids = org.get_air_squadron_gear_ids_by_proficiency();
    const changes = { exp: value };
    const payload = ids.map((id) => ({ id, changes }));
    dispatch(gearsSlice.actions.updateMany(payload));
  };

  const handleSlotSizeReset = () => {
    const ids = airSquadrons.map((as) => as.id);
    dispatch(airSquadronsSlice.actions.resetSlotSize(ids));
  };

  const handleReset = () => {
    const ids = airSquadrons.map((as) => as.id);
    dispatch(airSquadronsSlice.actions.reset(ids));
  };

  return (
    <Paper className={className}>
      <Flexbox>
        <BuildButton
          size="small"
          sx={{ ml: "auto" }}
          onClick={BatchOperationsModal.show}
        />
        <DeleteButton size="small" onClick={handleReset} />
      </Flexbox>
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

      <BatchOperationsModal>
        <BatchOperations
          onStarsClick={handleStarsClick}
          onExpClick={handleExpClick}
          onSlotSizeReset={handleSlotSizeReset}
        />
      </BatchOperationsModal>
    </Paper>
  );
};

export default styled(LandBaseScreen)`
  padding: 8px;
`;
