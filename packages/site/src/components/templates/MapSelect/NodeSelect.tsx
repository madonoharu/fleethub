import type { MapNode } from "@fh/utils";
import React from "react";

import { Select } from "../../molecules";

interface Props {
  options: MapNode[] | undefined;
  value: MapNode | undefined;
  onChange: (value: MapNode) => void;
}

const NodeSelect: React.FC<Props> = ({ options, value, onChange }) => {
  if (!options) {
    return null;
  }

  return (
    <Select
      options={options}
      value={value || options[0]}
      onChange={onChange}
      getOptionLabel={(node) => node.point}
    />
  );
};

export default NodeSelect;
