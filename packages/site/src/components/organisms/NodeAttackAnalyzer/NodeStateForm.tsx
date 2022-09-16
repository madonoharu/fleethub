import type { NodeState } from "fleethub-core";
import React from "react";

interface Props {
  value: NodeState | undefined;
  onChange?: (value: NodeState) => void;
}

const NodeStateForm: React.FC<Props> = ({ value, onChange }) => {
  return null;
};

export default NodeStateForm;
