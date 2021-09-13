import styled from "@emotion/styled";
import { Formation, Org } from "@fleethub/core";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";
import {
  Typography,
  Accordion,
  AccordionDetails,
  AccordionSummary,
  Collapse,
} from "@mui/material";
import { useTranslation } from "next-i18next";
import React from "react";

import { useOrg } from "../../../hooks";
import { PlanFileEntity, PlanNode } from "../../../store";
import { Flexbox } from "../../atoms";
import { ClearButton, NodeLable } from "../../molecules";
import { FleetScreen, ShipBannerGroup } from "../../organisms";
import PlanNodeDetails from "../PlanNodeDetails";
import Swappable from "../Swappable";

type PlanNodeListItemProps = {
  index: number;
  plan: PlanFileEntity;
  node: PlanNode;
  onUpdate?: (index: number, node: PlanNode) => void;
  onRemove?: () => void;
  onSwap?: (a: number, b: number) => void;
};

const TransitionProps = { mountOnEnter: true };

const PlanNodeListItem: React.FCX<PlanNodeListItemProps> = ({
  index,
  plan,
  node,
  onRemove,
  onSwap,
  className,
}) => {
  const { org } = useOrg(node.org);
  const { t } = useTranslation("common");

  if (!org) return null;

  const main = org.main_ship_ids();
  const escort = org.escort_ship_ids();
  const formation =
    node.enemy_formation || (org.default_formation() as Formation);

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
              <NodeLable name={node.name} type={node.type} d={node.d} />
              <Typography variant="subtitle2">{t(formation)}</Typography>
              <ClearButton size="small" onClick={onRemove} />
            </Flexbox>

            <ShipBannerGroup main={main} escort={escort} />
          </div>
        </AccordionSummary>
        <AccordionDetails>
          <PlanNodeDetails plan={plan} node={node} />
        </AccordionDetails>
      </Accordion>
    </Swappable>
  );
};

export default styled(PlanNodeListItem)`
  .MuiAccordionSummary-root[aria-expanded="true"] {
    ${ShipBannerGroup} {
      display: none;
    }
  }
`;
