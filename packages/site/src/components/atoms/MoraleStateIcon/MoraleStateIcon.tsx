import FlareIcon from "@mui/icons-material/Flare";
import MoodBadIcon from "@mui/icons-material/MoodBad";
import SentimentDissatisfiedIcon from "@mui/icons-material/SentimentDissatisfied";
import SentimentSatisfiedAltIcon from "@mui/icons-material/SentimentSatisfiedAlt";
import { styled, css, SvgIconProps } from "@mui/material";
import { MoraleState } from "fleethub-core";
import React from "react";

const MoraleStateIcon: React.FC<SvgIconProps & { state: MoraleState }> = ({
  state,
  ...svgProps
}) => {
  switch (state) {
    case "Sparkle":
      return <FlareIcon {...svgProps} aria-label="Sparkle" />;
    case "Normal":
      return <SentimentSatisfiedAltIcon {...svgProps} aria-label="Normal" />;
    case "Orange":
      return <SentimentDissatisfiedIcon {...svgProps} aria-label="Orange" />;
    case "Red":
      return <MoodBadIcon {...svgProps} aria-label="Red" />;
  }
};

export default styled(MoraleStateIcon)(
  ({ state, theme }) => css`
    color: ${theme.colors[state]};
  `
);
