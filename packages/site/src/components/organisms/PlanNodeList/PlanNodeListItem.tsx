import { Org } from "@fleethub/core";
import { Divider, Typography } from "@material-ui/core";
import { useWhatChanged } from "@simbathesailor/use-what-changed";
import { useTranslation } from "next-i18next";
import React from "react";
import { useModal, useOrg } from "../../../hooks";
import { PlanNode } from "../../../store";
import { Flexbox } from "../../atoms";
import { ClearButton, EditButton, NodeLable } from "../../molecules";
import { FleetScreen, ShipBannerGroup } from "../../organisms";
import Swappable from "../Swappable";

const PlanNodeOrgInfo: React.FC<{ org: Org }> = ({ org }) => {
  const main = org.get_fleet("f1");
  const escort = org.get_fleet("f2");

  return (
    <div>
      <FleetScreen fleet={main} />
      {org.is_combined() && <FleetScreen fleet={escort} />}
    </div>
  );
};

type PlanNodeListItemProps = {
  index: number;
  node: PlanNode;
  onUpdate?: (index: number, node: PlanNode) => void;
  onRemove?: () => void;
  onSwap?: (a: number, b: number) => void;
};

const PlanNodeListItem: React.FC<PlanNodeListItemProps> = ({
  index,
  node,
  onRemove,
  onSwap,
}) => {
  const { org } = useOrg(node.org);
  const Modal = useModal();
  const { t } = useTranslation("common");

  useWhatChanged([node], `node: ${index}`);

  if (!org) return null;

  const main = org.main_ship_ids();
  const escort = org.escort_ship_ids();

  return (
    <Swappable
      item={{ index }}
      type="node"
      onSwap={(drag, drop) => onSwap?.(drag.index, drop.index)}
    >
      <Flexbox>
        <NodeLable name={node.name} type={node.type} d={node.d} />
        <Typography>{t(node.formation)}</Typography>

        <EditButton size="small" onClick={Modal.show} />
        <ClearButton size="small" onClick={onRemove} />
      </Flexbox>

      <ShipBannerGroup main={main} escort={escort} />

      <Divider />

      <Modal full>
        <PlanNodeOrgInfo org={org} />
      </Modal>
    </Swappable>
  );
};

export default PlanNodeListItem;
