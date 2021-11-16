/** @jsxImportSource @emotion/react */
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

export type TabItem = {
  panel: React.ReactNode;
} & MuiTabProps;

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

  let current = value ?? inner;
  let item = list.at(current);

  if (list.length > 0 && !item) {
    current = 0;
    item = list.at(0);
  }

  const handleChange = (event: React.SyntheticEvent, next: number) => {
    onChange?.(next);
    setInner(next);
  };

  return (
    <div className={className} css={size === "small" && smallStyle}>
      <MuiTabs value={current} onChange={handleChange} {...rest}>
        {list.map(({ panel: _, ...tabProps }, index) => (
          <MuiTab key={index} {...tabProps} />
        ))}
      </MuiTabs>

      {item?.panel}
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
