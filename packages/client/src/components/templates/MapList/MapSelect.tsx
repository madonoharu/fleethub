import React from "react"
import { maps, MapData } from "@fleethub/data"

import { Button } from "@material-ui/core"

import { Divider } from "../../../components"

const worlds = [
  { id: 1, name: "鎮守府海域" },
  { id: 2, name: "南西諸島海域" },
  { id: 3, name: "北方海域" },
  { id: 7, name: "南西海域" },
  { id: 4, name: "西方海域" },
  { id: 5, name: "南方海域" },
  { id: 6, name: "中部海域" },
  { id: 45, name: "欧州方面反撃作戦 発動！「シングル作戦」" },
  { id: 46, name: "進撃！第二次作戦「南方作戦」" },
  { id: 47, name: "桃の節句！沖に立つ波" },
]

const idToKey = (id: number) => `${Math.floor(id / 10)}-${id % 10}`

type Props = {
  onSelect?: (map: MapData) => void
}

const MapSelect: React.FCX<Props> = ({ className, onSelect }) => {
  return (
    <div className={className}>
      {worlds.map(({ id, name }) => (
        <div key={id}>
          <Divider label={name} />
          {maps
            .filter((data) => Math.floor(data.id / 10) === id)
            .map((data) => (
              <Button key={data.id} onClick={() => onSelect?.(data)}>
                {idToKey(data.id)}
              </Button>
            ))}
        </div>
      ))}
    </div>
  )
}

export default MapSelect
