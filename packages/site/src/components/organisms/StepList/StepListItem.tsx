import InfoIcon from "@mui/icons-material/Info";
import { Typography, Paper, Button } from "@mui/material";
import { styled } from "@mui/system";
import { useTranslation } from "next-i18next";
import React from "react";
import { useDispatch } from "react-redux";

import { useModal, useOrg } from "../../../hooks";
import {
  initalStepConfig,
  PlanEntity,
  StepEntity,
  stepsSlice,
} from "../../../store";
import { Flexbox } from "../../atoms";
import { DeleteButton, NodeLable } from "../../molecules";
import { ShipBannerGroup } from "../../organisms";
import StepDetails from "../StepDetails";
import Swappable from "../Swappable";

type StepListItemProps = {
  plan: PlanEntity;
  step: StepEntity;
  index: number;
  onRemove?: () => void;
  onSwap?: (a: number, b: number) => void;
};

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
  const StepDetailsModal = useModal();

  if (!org) return null;

  const main = org.main_ship_ids();
  const escort = org.escort_ship_ids();
  const config = step.config || initalStepConfig;

  const handleRemove = () => {
    dispatch(stepsSlice.actions.remove(step.id));
  };

  return (
    <>
      <Swappable
        className={className}
        item={{ index }}
        type="node"
        onSwap={({ drag, drop }) => onSwap?.(drag.index, drop.index)}
      >
        <Paper sx={{ p: 1 }}>
          <Flexbox gap={1}>
            <NodeLable name={step.name} type={step.type} d={step.d} />
            <Typography variant="subtitle2">
              {t(config.enemy.formation)}
            </Typography>
            <Button
              sx={{ ml: "auto" }}
              startIcon={<InfoIcon />}
              variant="contained"
              color="primary"
              onClick={StepDetailsModal.show}
            >
              {t("Details")}
            </Button>

            <DeleteButton onClick={handleRemove} />
          </Flexbox>

          <ShipBannerGroup
            className="ShipBannerGroup"
            main={main}
            escort={escort}
          />
        </Paper>
      </Swappable>
      <StepDetailsModal full>
        <StepDetails plan={plan} step={step} />
      </StepDetailsModal>
    </>
  );
};

export default styled(StepListItem)`
  .MuiAccordionSummary-root[aria-expanded="true"] {
    .ShipBannerGroup {
      display: none;
    }
  }
`;
