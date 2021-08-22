import styled from "@emotion/styled";
import {
  OrgParams,
  FleetParams,
  ShipParams,
  MasterDataInput,
} from "@fleethub/core";
import { ShipKey } from "@fleethub/utils";
import { Button, Paper } from "@material-ui/core";
import React, { useState } from "react";
import { useDispatch } from "react-redux";
import { useImmer } from "use-immer";
import {
  useFhCoreContext,
  useMasterShip,
  useModal,
  useOrg,
} from "../../../hooks";
import { filesSlice, PlanFileEntity, PlanNode } from "../../../store";
import { DeleteButton } from "../../molecules";
import { FleetScreen } from "../../organisms";
import MapList from "../MapList";
import { MapEnemySelectEvent } from "../MapList/MapList";

const PlanNodeListItem: React.FC<{ id: string }> = ({ id }) => {
  const { org } = useOrg(id);

  if (!org) return null;

  return <FleetScreen fleet={org.get_fleet("f1")} />;
};

type PlanNodeListProps = {
  file: PlanFileEntity;
};

const PlanNodeList: React.FCX<PlanNodeListProps> = ({ className, file }) => {
  const Modal = useModal();
  const dispatch = useDispatch();
  const [multiple, setMultiple] = useState(false);

  const handleMapEnemySelect = (event: MapEnemySelectEvent) => {
    dispatch(filesSlice.actions.addPlanNode(file.id, event));

    if (!multiple) {
      Modal.hide();
    }
  };

  return (
    <Paper className={className}>
      <Button
        variant="contained"
        color="primary"
        onClick={() => {
          setMultiple(false);
          Modal.show();
        }}
      >
        敵編成を追加
      </Button>
      <Button
        variant="contained"
        color="primary"
        onClick={() => {
          setMultiple(true);
          Modal.show();
        }}
      >
        マップから一括入力
      </Button>

      <Modal fullHeight>
        <MapList onMapEnemySelect={handleMapEnemySelect} />
      </Modal>

      <DeleteButton />

      {file.nodes?.map((node) => (
        <PlanNodeListItem key={node.org} id={node.org} />
      ))}
    </Paper>
  );
};

export default styled(PlanNodeList)`
  min-height: 400px;
`;
