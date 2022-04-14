import styled from "@emotion/styled";
import { useTranslation } from "next-i18next";
import React from "react";

import { GearCategoryFilter } from "../../../store";
import { Flexbox, Checkbox } from "../../atoms";
import { SelectButtons } from "../../molecules";

import FilterIcon from "./FilterIcon";

const getFilterIcon = (key: string) => <FilterIcon icon={key} />;

const Right = styled(Flexbox)`
  margin-left: auto;
  margin-bottom: -2px;
`;

type Props = {
  abyssal?: boolean;
  category: GearCategoryFilter;
  visibleCategories: GearCategoryFilter[];

  onAbyssalChange: (next: boolean) => void;
  onCategoryChange: (next: GearCategoryFilter) => void;
};

const FilterBar: React.FCX<Props> = ({
  className,
  visibleCategories,
  abyssal,
  category,
  onAbyssalChange,
  onCategoryChange,
}) => {
  const { t } = useTranslation("common");
  return (
    <>
      <div className={className}>
        <SelectButtons
          value={category}
          options={visibleCategories}
          onChange={onCategoryChange}
          getOptionLabel={getFilterIcon}
        />
        <Right>
          <Checkbox
            label={t("Abyssal")}
            size="small"
            checked={abyssal || false}
            onChange={onAbyssalChange}
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
