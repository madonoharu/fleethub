import React from "react"
import styled from "styled-components"

const LabeledValue: React.FCX<{ label: React.ReactNode; value: React.ReactNode }> = ({ className, label, value }) => (
  <div className={className}>
    <div>{label}</div>
    <div>{value}</div>
  </div>
)

export default styled(LabeledValue)`
  display: flex;
  justify-content: space-between;

  > :first-child {
    color: ${(props) => props.theme.palette.text.secondary};
    font-size: 0.75rem;
    margin-right: 8px;
  }
`
