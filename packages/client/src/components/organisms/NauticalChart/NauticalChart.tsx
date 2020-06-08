import React from "react"
import styled from "styled-components"
import { MapData, MapNode } from "@fleethub/data"

import { Graph } from "@vx/network"
import { Zoom } from "@vx/zoom"
import { Group } from "@vx/group"
import { Tooltip, Typography } from "@material-ui/core"

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

const NauticalChartNode: React.FC<{ node: MapNode; onClick?: (node: MapNode) => void }> = ({ node, onClick }) => {
  const r = 15
  const dOffset = Math.sin(Math.PI / 4) * r
  const typeStyle = getNodeTypeStyle(node.type)

  const handleClick = onClick && (() => onClick(node))

  const distance = node.d && `距離: ${node.d}`

  const tilte = (
    <Typography>
      {node.point} {typeStyle.name} {distance}
    </Typography>
  )

  return (
    <Tooltip title={tilte}>
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

const NauticalChartEdge: React.FC<{ node1?: MapNode; node2?: MapNode }> = ({ node1, node2 }) => {
  if (!node1 || !node2) return null

  return (
    <line
      x1={node1.x}
      y1={node1.y}
      x2={node2.x}
      y2={node2.y}
      strokeWidth={2}
      stroke="#999"
      strokeOpacity={0.6}
      markerEnd="url(#arrow)"
    />
  )
}

type Props = {
  data: MapData
  onClick?: (node: MapNode) => void
}

const NauticalChart: React.FCX<Props> = ({ className, data, onClick }) => {
  const scale = 0.5
  const width = 1200
  const height = 700
  const r = 15

  const getNode = (name: string) => data.nodes.find((node) => node.point === name)

  const mapKey = `${Math.floor(data.id / 10)}-${data.id % 10}`

  return (
    <Zoom className={className} width={width} height={height} scaleXMin={1} scaleYMin={1}>
      {(zoom) => (
        <svg width={width * scale} height={height * scale} style={{ cursor: zoom.isDragging ? "grabbing" : "grab" }}>
          <Group transform={`scale(${scale}, ${scale})`}>
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
                graph={data}
                linkComponent={({ link }) => (
                  <NauticalChartEdge node1={getNode(link.source)} node2={getNode(link.target)} />
                )}
                nodeComponent={(props) => <NauticalChartNode {...props} onClick={onClick} />}
              />
            </g>
          </Group>
        </svg>
      )}
    </Zoom>
  )
}

export default styled(NauticalChart)``
