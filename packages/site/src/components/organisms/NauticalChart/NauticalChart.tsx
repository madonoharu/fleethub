/** @jsxImportSource @emotion/react */
import styled from "@emotion/styled";
import { FhMap, MapNode } from "@fh/utils";
import { Tooltip } from "@mui/material";
import { Group } from "@visx/group";
import { Graph } from "@visx/network";
import { ScaleSVG } from "@visx/responsive";
import React from "react";

import { NodeLable } from "../../molecules";
import { NodeCircle } from "./NodeIcon";

const NauticalChartNode: React.FC<{
  node: MapNode;
  onClick?: (node: MapNode) => void;
}> = ({ node, onClick }) => {
  const handleClick = () => {
    onClick?.(node);
  };

  return (
    <Tooltip
      title={<NodeLable name={node.point} type={node.type} d={node.d} />}
    >
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

const getViewBox = ({ nodes }: FhMap) => {
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
  map: FhMap;
  onClick?: (node: MapNode) => void;
};

const NauticalChart: React.FCX<Props> = ({ className, map, onClick }) => {
  const getNode = (name: string) =>
    map.nodes.find((node) => node.point === name);

  return (
    <ScaleSVG {...getViewBox(map)}>
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
          graph={map}
          linkComponent={({ link }) => (
            <NauticalChartEdge
              node1={getNode(link[0])}
              node2={getNode(link[1])}
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
