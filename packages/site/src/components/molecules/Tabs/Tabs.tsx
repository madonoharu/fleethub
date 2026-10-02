import {
  Tab as MuiTab,
  TabProps as MuiTabProps,
  Tabs as MuiTabs,
  TabsProps as MuiTabsProps,
} from "@mui/material";
import { cn } from "../../../styles/cn";
import React from "react";

interface TabItemProps extends MuiTabProps {
  panel: React.ReactNode;
}

export type TabItem = TabItemProps | null | undefined | false;

function isTabItemProps(item: TabItem): item is TabItemProps {
  return Boolean(item);
}

type TabsPropsBase = {
  value?: number;
  onChange?: (value: number) => void;
  list: TabItem[];
  size?: "small";
};

export type TabsProps = Omit<MuiTabsProps, keyof TabsPropsBase> & TabsPropsBase;

const Tabs: React.FC<TabsProps> = ({ className, value, onChange, list, size, ...rest }) => {
  const [inner, setInner] = React.useState(0);
  const entries = list
    .filter(isTabItemProps)
    .map((item, index): [number, TabItemProps] => [index, item]);
  const map = new Map(entries);

  let index = value ?? inner;
  let item = map.get(index);

  if (!item && entries.length > 0) {
    [index, item] = entries[0];
  }

  const handleChange = (event: React.SyntheticEvent, next: number) => {
    onChange?.(next);
    setInner(next);
  };

  return (
    <div className={className}>
      <MuiTabs
        className={cn("mb-2", size === "small" && "h-8 min-h-0")}
        value={index}
        onChange={handleChange}
        {...rest}
      >
        {entries.map(([index, item]) => {
          const { panel: _, className: tabClassName, ...tabProps } = item;
          return (
            <MuiTab
              key={index}
              value={index}
              {...tabProps}
              className={cn("min-w-auto", size === "small" && "h-8 min-h-0", tabClassName)}
            />
          );
        })}
      </MuiTabs>

      {item ? item.panel : null}
    </div>
  );
};

export default Tabs;
