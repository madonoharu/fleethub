import { useTranslation } from "next-i18next/pages";
import React from "react";

import { cn } from "../../../styles/cn";
import { GearCategoryFilter } from "../../../store";
import { Flexbox, Checkbox } from "../../atoms";
import { SelectButtons } from "../../molecules";

import FilterIcon from "./FilterIcon";

const getFilterIcon = (key: GearCategoryFilter) => <FilterIcon icon={key} />;

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
      <div className={cn("flex h-10 items-center", className)}>
        <SelectButtons
          value={category}
          options={visibleCategories}
          onChange={onCategoryChange}
          getOptionLabel={getFilterIcon}
        />
        <Flexbox className="ml-auto -mb-0.5">
          <Checkbox
            label={t("Abyssal")}
            size="small"
            checked={abyssal || false}
            onChange={onAbyssalChange}
          />
        </Flexbox>
      </div>
    </>
  );
};

export default FilterBar;
