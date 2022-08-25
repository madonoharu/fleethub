import DoNotDisturbIcon from "@mui/icons-material/DoNotDisturb";
import { styled, css } from "@mui/material";
import { indigo } from "@mui/material/colors";
import { ContactRank } from "fleethub-core";
import React from "react";

import { GearIcon } from "../../molecules";

interface ContactRankIconProps {
  rank: ContactRank | null;
}

const ContactRankIcon: React.FCX<ContactRankIconProps> = ({
  className,
  rank,
}) => {
  return (
    <div className={className}>
      <GearIcon iconId={10} />
      <span
        css={css`
          width: 16px;
          height: 16px;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 0.875rem;
          border-radius: 2px;
          background-color: ${indigo["500"]};
          margin-left: -8px;
          z-index: 1;
        `}
      >
        {rank ? rank.substring(4) : <DoNotDisturbIcon fontSize="inherit" />}
      </span>
    </div>
  );
};

export default styled(ContactRankIcon)(
  ({ theme }) => css`
    display: flex;
    align-items: flex-end;
    height: 24px;
    line-height: 1;
    color: ${theme.palette.text.primary};
  `
);
