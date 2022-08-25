import {
  Tab as MuiTab,
  TabProps as MuiTabProps,
  Tabs as MuiTabs,
  TabsProps as MuiTabsProps,
} from "@mui/material";
import { styled, css } from "@mui/system";
import React from "react";

const smallStyle = css`
  .MuiTabs-root {
    height: 32px;
    min-height: 0;

    .MuiTab-root {
      height: 32px;
      min-height: 0;
    }
  }
`;

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

const Tabs: React.FC<TabsProps> = ({
  className,
  value,
  onChange,
  list,
  size,
  ...rest
}) => {
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
    <div className={className} css={size === "small" && smallStyle}>
      <MuiTabs value={index} onChange={handleChange} {...rest}>
        {entries.map(([index, item]) => {
          const { panel: _, ...tabProps } = item;
          return <MuiTab key={index} value={index} {...tabProps} />;
        })}
      </MuiTabs>

      {item ? item.panel : null}
    </div>
  );
};

export default styled(Tabs)`
  > .MuiTabs-root {
    margin-bottom: 8px;
    .MuiTab-root {
      min-width: auto;
    }
  }
`;
