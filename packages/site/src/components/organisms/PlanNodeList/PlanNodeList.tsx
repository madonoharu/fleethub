import styled from "@emotion/styled";
import { Button, Paper } from "@mui/material";
import React, { useState } from "react";
import { useDispatch } from "react-redux";
import { useModal } from "../../../hooks";
import {
  createPlanNode,
  filesSlice,
  PlanFileEntity,
  PlanNode,
} from "../../../store";
import { Flexbox } from "../../atoms";
import { DeleteButton } from "../../molecules";
import MapList, { MapEnemySelectEvent } from "../../templates/MapList";
import PlanNodeListItem from "./PlanNodeListItem";

const usePlanNodesActions = (file: PlanFileEntity) => {
  const dispatch = useDispatch();

  const update = (changes: Partial<PlanFileEntity>) => {
    dispatch(filesSlice.actions.update({ id: file.id, changes }));
  };

  const updateNode = (index: number, changes: Partial<PlanNode>) => {
    const node = file.nodes[index];

    if (node) {
      Object.assign(node, changes);
    }

    dispatch(
      filesSlice.actions.update({ id: file.id, changes: { nodes: file.nodes } })
    );
  };

  const removeOne = (index: number) => {
    const nodes = file.nodes.concat();
    nodes.splice(index, 1);
    update({ nodes });
  };

  const removeAll = () => {
    update({ nodes: [] });
  };

  const swap = (i1: number, i2: number) => {
    const nodes = file.nodes.concat();
    const node1 = nodes[i1];
    const node2 = nodes[i2];
    nodes[i1] = node2;
    nodes[i2] = node1;
    update({ nodes });
  };

  return { update, updateNode, removeOne, removeAll, swap };
};

type PlanNodeListProps = {
  file: PlanFileEntity;
};

const PlanNodeList: React.FCX<PlanNodeListProps> = ({ className, file }) => {
  const Modal = useModal();
  const dispatch = useDispatch();
  const [multiple, setMultiple] = useState(false);

  const actions = usePlanNodesActions(file);

  const handleMapEnemySelect = (event: MapEnemySelectEvent) => {
    dispatch(createPlanNode(file.id, event));

    if (!multiple) {
      Modal.hide();
    }
  };

  return (
    <div className={className}>
      <Flexbox gap={1}>
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
          敵編成を一括入力
        </Button>

        <DeleteButton onClick={actions.removeAll} />
      </Flexbox>

      <Modal fullHeight>
        <MapList onMapEnemySelect={handleMapEnemySelect} />
      </Modal>

      {file.nodes?.map((node, index) => (
        <PlanNodeListItem
          key={`${node.org}-${index}`}
          css={{ marginTop: 8 }}
          index={index}
          plan={file}
          node={node}
          onUpdate={actions.updateNode}
          onRemove={() => actions.removeOne(index)}
          onSwap={actions.swap}
        />
      ))}
    </div>
  );
};

export default styled(PlanNodeList)`
  min-height: 400px;
  padding: 8px;
`;
