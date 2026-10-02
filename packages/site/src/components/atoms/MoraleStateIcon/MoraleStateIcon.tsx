import { colors } from "../../../styles/colors";
import FlareIcon from "@mui/icons-material/Flare";
import MoodBadIcon from "@mui/icons-material/MoodBad";
import SentimentDissatisfiedIcon from "@mui/icons-material/SentimentDissatisfied";
import SentimentSatisfiedAltIcon from "@mui/icons-material/SentimentSatisfiedAlt";
import { SvgIconProps } from "@mui/material";
import { MoraleState } from "fleethub-core";
import React from "react";

interface Props extends SvgIconProps {
  state: MoraleState;
}

const MoraleStateIcon: React.FC<Props> = ({ state, style, ...props }) => {
  const svgProps = { ...props, style: { color: colors[state], ...style } };
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

export default MoraleStateIcon;
