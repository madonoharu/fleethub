import { Typography } from "@mui/material";
import React from "react";
import { useTranslation } from "react-i18next";

import { Flexbox } from "../../atoms";
import { GearIcon } from "../../molecules";
import { cn } from "../../../styles";

const StyledGearIcon = ({ className, ...props }: React.ComponentProps<typeof GearIcon>) => (
  <GearIcon {...props} className={cn("shrink-0 mr-1", className)} />
);

type Props = {
  className?: string;
  name: string;
  iconId: number;
  wrap?: boolean;
  equippable?: boolean;
};

export const GearNameplate = React.forwardRef<HTMLDivElement, Props>((props, ref) => {
  const { name, iconId, wrap, equippable = true, className, ...rest } = props;
  const { t, i18n } = useTranslation("gears");

  let displayName: string;
  if (i18n.resolvedLanguage === "ja") {
    displayName = name;
  } else {
    displayName = t(name);
  }

  return (
    <Flexbox
      ref={ref}
      {...rest}
      className={cn(
        "max-w-full [&_p]:text-[0.75rem] [&_p]:leading-[1.66]",
        !equippable && "text-error-light",
        className,
      )}
    >
      <StyledGearIcon iconId={iconId} />
      <Typography variant="body2" align="left" noWrap={!wrap}>
        {displayName}
      </Typography>
    </Flexbox>
  );
});

export default GearNameplate;
