import styled from "@emotion/styled";
import { Checkbox, FormControlLabel } from "@mui/material";
import React from "react";

import { Flexbox } from "../../atoms";
import { SelectButtons } from "../../molecules";
import FilterIcon from "./FilterIcon";
import { Group } from "./useGearListState";

const getFilterIcon = (key: string) => <FilterIcon icon={key} />;

const Right = styled(Flexbox)`
  margin-left: auto;
  margin-bottom: -2px;
`;

type Props = {
  abyssal: boolean;
  group: Group;
  visibleGroups: Group[];

  onAbyssalChange: (next: boolean) => void;
  onGroupChange: (next: Group) => void;
};

const FilterBar: React.FCX<Props> = ({
  className,
  visibleGroups,
  abyssal,
  group,
  onAbyssalChange,
  onGroupChange,
}) => {
  const toggleAbyssal = () => onAbyssalChange(!abyssal);

  return (
    <>
      <div className={className}>
        <SelectButtons
          value={group}
          options={visibleGroups}
          onChange={onGroupChange}
          getOptionLabel={getFilterIcon}
        />
        <Right>
          <FormControlLabel
            label="深海"
            control={
              <Checkbox
                size="small"
                checked={abyssal}
                onClick={toggleAbyssal}
              />
            }
          />
        </Right>
      </div>
    </>
  );
};

export default styled(FilterBar)`
  height: 40px;
  display: flex;
  align-items: center;
`;
