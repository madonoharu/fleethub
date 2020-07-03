import React from "react"
import styled from "styled-components"
import { Plan, PlanAnalyzer, DaySpecialAttack, RateMap } from "@fleethub/core"

import { Tabs as MuiTabs, Tab as MuiTab, TabsProps as MuiTabsProps } from "@material-ui/core"

import { SelectButtons, PlanShareContent, Table } from "../../../components"
import { usePlan, useModal } from "../../../hooks"
import { toPercent } from "../../../utils"

type TabItem = {
  tab: React.ReactNode
  panel: React.ReactNode
}

type TabsPropsBase = {
  value: number
  onChange: (value: number) => void
  list: TabItem[]
}

export type TabsProps = Omit<MuiTabsProps, keyof TabsPropsBase> & TabsPropsBase

const Tabs: React.FC<TabsProps> = ({ value, onChange, list }) => {
  const handleChange = (event: React.ChangeEvent<{}>, next: number) => {
    onChange(next)
  }

  return (
    <>
      <MuiTabs value={value} onChange={handleChange}>
        {list.map(({ tab }, index) => (
          <MuiTab key={index}>{tab}</MuiTab>
        ))}
      </MuiTabs>

      {list[value]?.panel}
    </>
  )
}

export default Tabs
