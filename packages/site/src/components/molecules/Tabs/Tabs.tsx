import styled from "@emotion/styled";
import {
  Tab as MuiTab,
  TabProps as MuiTabProps,
  Tabs as MuiTabs,
  TabsProps as MuiTabsProps,
} from "@material-ui/core";
import React from "react";

const StyledMuiTab = styled(MuiTab)`
  min-width: auto;
`;

type TabItem = {
  panel: React.ReactNode;
} & MuiTabProps;

type TabsPropsBase = {
  value?: number;
  onChange?: (value: number) => void;
  list: TabItem[];
};

export type TabsProps = Omit<MuiTabsProps, keyof TabsPropsBase> & TabsPropsBase;

const Tabs: React.FC<TabsProps> = ({ className, value, onChange, list }) => {
  const [inner, setInner] = React.useState(0);

  const current = value ?? inner;

  const handleChange = (event: React.ChangeEvent<{}>, next: number) => {
    onChange?.(next);
    setInner(next);
  };

  return (
    <div className={className}>
      <MuiTabs value={current} onChange={handleChange}>
        {list.map(({ panel, ...tabProps }, index) => (
          <StyledMuiTab key={index} {...tabProps} />
        ))}
      </MuiTabs>

      {list[current]?.panel}
    </div>
  );
};

export default Tabs;
