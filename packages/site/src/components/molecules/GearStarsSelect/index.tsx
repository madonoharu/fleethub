import styled from "@emotion/styled";
import { Button, Tooltip } from "@mui/material";
import { useTranslation } from "next-i18next";
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
  stars,
  onChange,
  ...rest
}) => {
  const { t } = useTranslation("common");
  const Popover = usePopover();

  const handleChange = (value: number) => {
    onChange && onChange(value);
    Popover.hide();
  };

  return (
    <>
      <Tooltip title={t("Stars")}>
        <Button onClick={Popover.show} {...rest}>
          <StarsLabel stars={stars} disabled={!stars} />
        </Button>
      </Tooltip>

      <Popover anchorOrigin={anchorOrigin}>
        <Buttons onChange={handleChange} />
      </Popover>
    </>
  );
};

export default styled(GearStarsSelect)`
  padding: 0 2px;
`;
