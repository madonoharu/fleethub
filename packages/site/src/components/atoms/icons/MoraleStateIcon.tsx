import { css } from "@emotion/react";
import styled from "@emotion/styled";
import { MoraleState } from "@fleethub/core";
import { SvgIconProps } from "@material-ui/core";
import CircleIcon from "@material-ui/icons/Circle";
import FlareIcon from "@material-ui/icons/Flare";
import MoodBadIcon from "@material-ui/icons/MoodBad";
import SentimentDissatisfiedIcon from "@material-ui/icons/SentimentDissatisfied";
import SentimentSatisfiedAltIcon from "@material-ui/icons/SentimentSatisfiedAlt";
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
