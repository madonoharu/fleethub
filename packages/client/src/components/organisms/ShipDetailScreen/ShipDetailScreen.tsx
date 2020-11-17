import React from "react"
import { useTranslation } from "react-i18next"
import { Ship, ShipState } from "@fleethub/core"
import styled from "@emotion/styled"

import { NumberInput, ShipBanner } from "../../molecules"

type ShipDetailScreenProps = {
  ship: Ship
  onChange?: (state: ShipState) => void
}

const ShipDetailScreen: React.FCX<ShipDetailScreenProps> = ({ className, ship, onChange }) => {
  const statKeys = ["firepower", "torpedo", "antiAir", "armor"] as const

  const { t, i18n } = useTranslation()

  const renderStat = (key: typeof statKeys[number]) => {
    const { value, diff, naked, equipment, bonus } = ship[key]

    const handleChange = (next: number) => {
      const delta = next - value
      onChange?.({ ...ship.state, [key]: diff + delta })
    }

    return (
      <div key={key} css={{ display: "flex" }}>
        <NumberInput startLabel={t(key)} value={value} onChange={handleChange} />
        <div>
          素{naked} + 装備{equipment} + ボーナス{bonus} {t("test")}
        </div>
      </div>
    )
  }

  return (
    <div className={className}>
      <ShipBanner size="medium" publicId={ship.banner} />
      {ship.name}
      {statKeys.map(renderStat)}
    </div>
  )
}

export default styled(ShipDetailScreen)`
  width: 600px;
  min-height: 80vh;
`
