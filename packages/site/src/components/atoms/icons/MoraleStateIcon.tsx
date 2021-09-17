import { css } from "@emotion/react";
import styled from "@emotion/styled";
import { MoraleState } from "@fh/core";
import FlareIcon from "@mui/icons-material/Flare";
import MoodBadIcon from "@mui/icons-material/MoodBad";
import SentimentDissatisfiedIcon from "@mui/icons-material/SentimentDissatisfied";
import SentimentSatisfiedAltIcon from "@mui/icons-material/SentimentSatisfiedAlt";
import { SvgIconProps } from "@mui/material";
import React from "react";

const MoraleStateIcon: React.FC<SvgIconProps & { state: MoraleState }> = ({
  state,
  ...svgProps
}) => {
  switch (state) {
    case "Sparkle":
      return <FlareIcon {...svgProps} />;
    case "Normal":
      return <SentimentSatisfiedAltIcon {...svgProps} />;
    case "Orange":
      return <SentimentDissatisfiedIcon {...svgProps} />;
    case "Red":
      return <MoodBadIcon {...svgProps} />;
  }
};

export default styled(MoraleStateIcon)(
  ({ state, theme }) => css`
    color: ${theme.colors[state]};
  `
);
