import React from "react"
import styled from "styled-components"

const Label = styled.div`
  color: ${(props) => props.theme.palette.text.secondary};
  font-size: 0.75rem;
  margin-right: 8px;
`

const Value = styled.div`
  font-size: ${(props) => props.theme.typography.body2.fontSize};
`

const LabeledValue: React.FCX<{ label: React.ReactNode; value: React.ReactNode }> = ({ className, label, value }) => (
  <div className={className}>
    <Label>{label}</Label>
    <Value>{value}</Value>
  </div>
)

export default styled(LabeledValue)`
  display: flex;
  align-items: center;
  justify-content: space-between;
`
