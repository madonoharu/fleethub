import React from "react"
import styled from "styled-components"

import { Tabs as MuiTabs, Tab as MuiTab, TabsProps as MuiTabsProps, TabProps as MuiTabProps } from "@material-ui/core"

const StyledMuiTabs = styled(MuiTabs)`
  margin-bottom: 16px;
`

type TabItem = {
  panel: React.ReactNode
} & MuiTabProps

type TabsPropsBase = {
  value?: number
  onChange?: (value: number) => void
  list: TabItem[]
}

export type TabsProps = Omit<MuiTabsProps, keyof TabsPropsBase> & TabsPropsBase

const Tabs: React.FC<TabsProps> = ({ className, value, onChange, list }) => {
  const [inner, setInner] = React.useState(0)

  const current = value ?? inner

  const handleChange = (event: React.ChangeEvent<{}>, next: number) => {
    onChange?.(next)
    setInner(next)
  }

  return (
    <div className={className}>
      <StyledMuiTabs value={current} onChange={handleChange}>
        {list.map(({ panel, ...tabProps }, index) => (
          <MuiTab key={index} {...tabProps} />
        ))}
      </StyledMuiTabs>

      {list[current]?.panel}
    </div>
  )
}

export default Tabs
