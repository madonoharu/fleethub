import { cn } from "../../../styles/cn";
import { Button, Tooltip } from "@mui/material";
import { useTranslation } from "next-i18next/pages";
import React from "react";

import { usePopover } from "../../../hooks";
import { StarsLabel } from "../../atoms";

import Buttons from "./Buttons";

type GearStarsSelectProps = {
  stars: number;
  onChange?: (stars: number) => void;
};

const anchorOrigin = { vertical: "bottom", horizontal: "center" } as const;

const GearStarsSelect: React.FCX<GearStarsSelectProps> = ({
  className,
  stars,
  onChange,
  ...rest
}) => {
  const { t } = useTranslation("common");
  const Popover = usePopover();

  const handleChange = (value: number) => {
    onChange?.(value);
    Popover.hide();
  };

  return (
    <>
      <Tooltip title={t("Stars")}>
        <Button onClick={Popover.show} {...rest} className={cn("px-0.5 py-0", className)}>
          <StarsLabel stars={stars} disabled={!stars} />
        </Button>
      </Tooltip>

      <Popover anchorOrigin={anchorOrigin}>
        <Buttons onChange={handleChange} />
      </Popover>
    </>
  );
};

export default GearStarsSelect;
