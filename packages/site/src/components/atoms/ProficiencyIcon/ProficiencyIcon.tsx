import { cn } from "../../../styles/cn";
import { expToAce } from "@fh/utils";
import { Typography } from "@mui/material";
import Image from "next/image";
import React from "react";

import { ACE_ICONS } from "../../../images/icons";

interface ProficiencyIconProps extends React.ComponentProps<"div"> {
  exp: number;
}

const ProficiencyIcon = React.forwardRef<HTMLDivElement, ProficiencyIconProps>((props, ref) => {
  const { exp, className, ...rest } = props;
  const ace = expToAce(exp);

  return (
    <div
      ref={ref}
      {...rest}
      className={cn("h-6 [filter:brightness(110%)_contrast(110%)_saturate(100%)]", className)}
    >
      <Image height={24} width={18} src={ACE_ICONS[ace]} alt={`ace${ace}`} unoptimized />
      <Typography
        className="absolute right-0 bottom-0 rounded-[2px] bg-[rgba(128,64,64,0.6)] text-[length:10px] leading-none"
        aria-label="exp"
      >
        {exp}
      </Typography>
    </div>
  );
});

export default ProficiencyIcon;
