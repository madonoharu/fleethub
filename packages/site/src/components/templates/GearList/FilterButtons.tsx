import styled from "@emotion/styled";
import React from "react";

import { SelectButtons } from "../../molecules";
import FilterIcon from "./FilterIcon";

const getFilterIcon = (key: string) => <FilterIcon icon={key} />;

type Props = {
  value: string;
  options: string[];
  onChange: (value: string) => void;
};

const GearFilterButtons: React.FCX<Props> = (props) => (
  <SelectButtons {...props} getOptionLabel={getFilterIcon} />
);

export default styled(GearFilterButtons)`
  button {
    padding: 4px 0;
  }
`;
