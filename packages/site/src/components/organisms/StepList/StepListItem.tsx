/** @jsxImportSource @emotion/react */
import styled from "@emotion/styled";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";
import {
  Typography,
  Accordion,
  AccordionDetails,
  AccordionSummary,
} from "@mui/material";
import { useTranslation } from "next-i18next";
import React from "react";
import { useDispatch } from "react-redux";

import { useOrg } from "../../../hooks";
import {
  initalStepConfig,
  PlanFileEntity,
  StepEntity,
  stepsSlices,
} from "../../../store";
import { Flexbox } from "../../atoms";
import { ClearButton, NodeLable } from "../../molecules";
import { ShipBannerGroup } from "../../organisms";
import StepDetails from "../StepDetails";
import Swappable from "../Swappable";

type StepListItemProps = {
  plan: PlanFileEntity;
  step: StepEntity;
  index: number;
  onRemove?: () => void;
  onSwap?: (a: number, b: number) => void;
};

const TransitionProps = { mountOnEnter: true };

const StepListItem: React.FCX<StepListItemProps> = ({
  plan,
  step,
  index,
  onSwap,
  className,
}) => {
  const { org } = useOrg(step.org);
  const { t } = useTranslation("common");
  const dispatch = useDispatch();

  if (!org) return null;

  const main = org.main_ship_ids();
  const escort = org.escort_ship_ids();
  const config = step.config || initalStepConfig;

  const handleRemove = () => {
    dispatch(stepsSlices.actions.remove(step.id));
  };

  return (
    <Swappable
      className={className}
      item={{ index }}
      type="node"
      onSwap={({ drag, drop }) => onSwap?.(drag.index, drop.index)}
    >
      <Accordion disableGutters TransitionProps={TransitionProps}>
        <AccordionSummary expandIcon={<ExpandMoreIcon />}>
          <div>
            <Flexbox gap={1}>
              <NodeLable name={step.name} type={step.type} d={step.d} />
              <Typography variant="subtitle2">
                {t(config.enemy.formation)}
              </Typography>
              <ClearButton size="small" onClick={handleRemove} />
            </Flexbox>

            <ShipBannerGroup
              className="ShipBannerGroup"
              main={main}
              escort={escort}
            />
          </div>
        </AccordionSummary>
        <AccordionDetails>
          <StepDetails plan={plan} step={step} />
        </AccordionDetails>
      </Accordion>
    </Swappable>
  );
};

export default styled(StepListItem)`
  .MuiAccordionSummary-root[aria-expanded="true"] {
    .ShipBannerGroup {
      display: none;
    }
  }
`;
