import DoNotDisturbIcon from "@mui/icons-material/DoNotDisturb";

import { ContactRank } from "fleethub-core";
import React from "react";

import { GearIcon } from "../../molecules";
import { cn } from "../../../styles";

interface ContactRankIconProps {
  rank: ContactRank | null;
}

const ContactRankIcon: React.FCX<ContactRankIconProps> = ({ className, rank }) => {
  return (
    <div className={className}>
      <GearIcon iconId={10} />
      <span className="w-4 h-4 flex items-center justify-center text-[0.875rem] rounded-[2px] bg-[#3f51b5] -ml-2 z-1">
        {rank ? rank.substring(4) : <DoNotDisturbIcon fontSize="inherit" />}
      </span>
    </div>
  );
};

export default ({ className, ...props }: React.ComponentProps<typeof ContactRankIcon>) => (
  <ContactRankIcon
    {...props}
    className={cn("flex items-end h-6 leading-[1] text-text-primary", className)}
  />
);
