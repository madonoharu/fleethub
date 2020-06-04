import React from "react"
import { Graph } from "@vx/network"
import { Zoom } from "@vx/zoom"
import { Group } from "@vx/group"
import { Tooltip, Typography, IconButton } from "@material-ui/core"

const nodeTypes = [
  { id: -1, name: "Unknown", color: "#000000", background: "#dddddd", border: "#999999" },

  { id: 0, name: "Start", color: "#eeeeff", background: "#4a95e3", border: "#3a77db" },
  { id: 4, name: "Battle", color: "#000000", background: "#ff7979", border: "#ef1a1a" },
  { id: 5, name: "Boss", color: "#ffeeee", background: "#d92b2b", border: "#980d02" },

  { id: 90, name: "Nothing", color: "#000000", background: "#82e9ff", border: "#1abaef" },
  { id: 91, name: "Choice", color: "#000000", background: "#82e9ff", border: "#f7f733" },
  { id: 14, name: "Anchorage Repair", color: "#000000", background: "#a2efff", border: "#f0f0ff" },

  { id: 2, name: "Resource", color: "#000000", background: "#b0ff5b", border: "#76d406" },
  { id: 9, name: "Air Resource", color: "#000000", background: "#8fa933", border: "#577c21" },
  { id: 6, name: "Transport", color: "#000000", background: "#76d406", border: "#b0ff5b" },

  { id: 10, name: "Air Raid", color: "#000000", background: "#ff7979", border: "#fad0d3" },
  { id: 7, name: "Air Battle", color: "#000000", background: "#ff7979", border: "#1abaef" },
  { id: 13, name: "Ambush", color: "#000000", background: "#ffad22", border: "#ef4b1a" },

  { id: 11, name: "Night Battle", color: "#000000", background: "#b076ec", border: "#dad0e1" },
  { id: 3, name: "Maelstrom", color: "#000000", background: "#d2c6ff", border: "#ae8ae7" },

  { id: 8, name: "Finish Line", color: "#000000", background: "#dbe5ea", border: "#497291" },
]

const getNodeTypeStyle = (id: number) => {
  return nodeTypes.find((type) => type.id === id) || nodeTypes[0]
}

type MapRoute = Record<string, [string | null, string, number, number]>
type MapSpots = Record<string, [number, number, string | null]>
export type MapData = {
  route: MapRoute
  spots: MapSpots
  distances: Record<string, number | undefined>
}

type MapNode = {
  point: string
  x: number
  y: number
  d?: number
  type: number
}

type MapLink = {
  source: [number, number, string | null]
  target: [number, number, string | null]
}

const toGraph = ({ route, spots, distances }: MapData) => {
  const nodes: MapNode[] = []
  const links: MapLink[] = []

  for (const [point, [x, y]] of Object.entries(spots)) {
    const type = Object.values(route).find(([source, target]) => target === point)?.[2] ?? -1
    nodes.push({ point, x, y, d: distances[point], type })
  }

  for (const [from, to] of Object.values(route)) {
    const source = from && spots[from]
    const target = to && spots[to]
    if (source && target) links.push({ source, target })
  }

  return { nodes, links }
}

const NauticalChartNode: React.FC<{ node: MapNode; onClick?: (node: MapNode) => void }> = ({ node, onClick }) => {
  const r = 15
  const dOffset = Math.sin(Math.PI / 4) * r
  const typeStyle = getNodeTypeStyle(node.type)

  const handleClick = onClick && (() => onClick(node))

  return (
    <Tooltip title={typeStyle.name}>
      <g cursor="pointer" onClick={handleClick} x={node.x} y={node.y}>
        <circle r={r} fill={typeStyle.background} stroke={typeStyle.border} strokeWidth={4} />

        <Typography component="text" variant="h6" fill={typeStyle.color} textAnchor="middle" dominantBaseline="central">
          {node.point}
        </Typography>

        {node.d && (
          <Group top={dOffset} left={dOffset}>
            <circle r={6} fill="green" opacity={0.6} />
            <Typography component="text" variant="overline" fill="white" textAnchor="middle" dominantBaseline="central">
              {node.d}
            </Typography>
          </Group>
        )}
      </g>
    </Tooltip>
  )
}

const NauticalChartEdge: React.FC<{ link: MapLink }> = ({ link }) => {
  const [x1, y1] = link.source
  const [x2, y2] = link.target
  return (
    <line x1={x1} y1={y1} x2={x2} y2={y2} strokeWidth={2} stroke="#999" strokeOpacity={0.6} markerEnd="url(#arrow)" />
  )
}

type Props = {
  data: MapData
  onClick?: (node: MapNode) => void
}

const NauticalChart: React.FC<Props> = ({ data, onClick }) => {
  const width = 1200
  const height = 700
  const r = 15

  const graph = toGraph(data)

  return (
    <Zoom width={width} height={height}>
      {(zoom) => (
        <svg width={width} height={height} style={{ cursor: zoom.isDragging ? "grabbing" : "grab" }}>
          <g transform={zoom.toString()}>
            <defs>
              <marker
                id="arrow"
                viewBox="0 -5 10 10"
                refX={r + 3}
                markerWidth="8"
                markerHeight="8"
                orient="auto"
                fill="#999"
              >
                <path d="M0,-5L10,0L0,5" />
              </marker>
            </defs>
            <rect
              width={width}
              height={height}
              rx={14}
              fill="rgba(40,40,120,0.5)"
              onTouchStart={zoom.dragStart}
              onTouchMove={zoom.dragMove}
              onTouchEnd={zoom.dragEnd}
              onMouseDown={zoom.dragStart}
              onMouseMove={zoom.dragMove}
              onMouseUp={zoom.dragEnd}
              onMouseLeave={() => {
                if (zoom.isDragging) zoom.dragEnd()
              }}
            />
            <Graph
              graph={graph}
              linkComponent={NauticalChartEdge}
              nodeComponent={(props) => <NauticalChartNode {...props} onClick={onClick} />}
            />
          </g>
        </svg>
      )}
    </Zoom>
  )
}

export default NauticalChart
