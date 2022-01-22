import React from "react";

import { Select } from "../../molecules";

const OPTIONS = [1, 2, 3, 4];
const getOptionLabel = (value: number) => ["丁", "丙", "乙", "甲"][value - 1];

type DifficultySelectProps = {
  value: number;
  onChange: (value: number) => void;
};

const DifficultySelect: React.FCX<DifficultySelectProps> = (props) => (
  <Select options={OPTIONS} getOptionLabel={getOptionLabel} {...props} />
);

export default DifficultySelect;
