import styled from "@emotion/styled";
import { MapData, MapNode } from "@fleethub/data";
import { Tooltip, Typography } from "@material-ui/core";
import { Group } from "@visx/group";
import { Graph } from "@visx/network";
import { ScaleSVG } from "@visx/responsive";
import React from "react";

import { getNodeTypeStyle, NodeCircle } from "./NodeIcon";

export const NodeLable: React.FC<{ node: MapNode }> = ({ node }) => {
  const distance = node.d && `距離: ${node.d}`;

  return (
    <Typography>
      {node.point} {getNodeTypeStyle(node.type).name} {distance}
    </Typography>
  );
};

const NauticalChartNode: React.FC<{
  node: MapNode;
  onClick?: (node: MapNode) => void;
}> = ({ node, onClick }) => {
  const handleClick = () => {
    onClick?.(node);
  };

  return (
    <Tooltip title={<NodeLable node={node} />}>
      <NodeCircle
        type={node.type}
        point={node.point}
        d={node.d}
        cursor="pointer"
        onClick={handleClick}
      />
    </Tooltip>
  );
};

const NauticalChartEdge: React.FC<{ node1?: MapNode; node2?: MapNode }> = ({
  node1,
  node2,
}) => {
  if (!node1 || !node2) return null;

  return (
    <line
      x1={node1.x}
      y1={node1.y}
      x2={node2.x}
      y2={node2.y}
      strokeWidth={2}
      stroke="#999"
      strokeOpacity={0.6}
      strokeDasharray="8"
      markerEnd="url(#arrow)"
    />
  );
};

const getViewBox = ({ nodes }: MapData) => {
  const xs = nodes.map((node) => node.x);
  const ys = nodes.map((node) => node.y);
  const maxX = Math.max(...xs);
  const minX = Math.min(...xs);
  const maxY = Math.max(...ys);
  const minY = Math.min(...ys);

  const xOrigin = minX - 40;
  const yOrigin = minY - 40;
  const width = maxX - xOrigin + 40;
  const height = maxY - yOrigin + 40;

  return { xOrigin, yOrigin, width, height };
};

type Props = {
  data: MapData;
  onClick?: (node: MapNode) => void;
};

const NauticalChart: React.FCX<Props> = ({ className, data, onClick }) => {
  const getNode = (name: string) =>
    data.nodes.find((node) => node.point === name);

  const baseWidth = 1200;
  const baseHeight = 700;

  return (
    <ScaleSVG {...getViewBox(data)}>
      <Group className={className}>
        <defs>
          <marker
            id="arrow"
            viewBox="0 -5 10 10"
            refX={27}
            markerWidth="5"
            markerHeight="5"
            orient="auto"
            fill="#999"
          >
            <path d="M0,-5L10,0L0,5" />
          </marker>
        </defs>
        <Graph
          graph={data}
          linkComponent={({ link }) => (
            <NauticalChartEdge
              node1={getNode(link.source)}
              node2={getNode(link.target)}
            />
          )}
          nodeComponent={(props) => (
            <NauticalChartNode {...props} onClick={onClick} />
          )}
        />
      </Group>
    </ScaleSVG>
  );
};

export default styled(NauticalChart)``;
