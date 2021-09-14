import { MapNode } from "@fh/utils";
import { Typography } from "@mui/material";
import { Group } from "@visx/group";
import React from "react";

import { getNodeTypeStyle } from "../../../styles";

type BaseProps = Pick<MapNode, "type" | "point" | "d">;

type NodeCircleProps = BaseProps &
  Omit<React.SVGProps<SVGGElement>, keyof BaseProps>;

const r1 = 15;
const strokeWidth = 4;
const r2 = 8;

const c1 = r1 + strokeWidth;
const c2 = Math.sin(Math.PI / 4) * r1;

export const NodeCircle = React.forwardRef<SVGGElement, NodeCircleProps>(
  ({ type, point, d, ...rest }, ref) => {
    const typeStyle = getNodeTypeStyle(type);

    return (
      <Group innerRef={ref} {...rest}>
        <circle
          r={r1}
          fill={typeStyle.background}
          stroke={typeStyle.border}
          strokeWidth={strokeWidth}
        />

        <Typography
          component="text"
          style={{ fontWeight: "bold" }}
          fill={typeStyle.color}
          textAnchor="middle"
          dominantBaseline="central"
        >
          {point}
        </Typography>

        {d && (
          <Group top={c2} left={c2}>
            <circle r={r2} fill="green" opacity={0.6} />
            <Typography
              component="text"
              fill="white"
              textAnchor="middle"
              dominantBaseline="central"
            >
              {d}
            </Typography>
          </Group>
        )}
      </Group>
    );
  }
);

type NodeIconProps = BaseProps &
  Omit<React.SVGProps<SVGSVGElement>, keyof BaseProps>;

const NodeIcon = React.forwardRef<SVGSVGElement, NodeIconProps>(
  ({ type, point, d, ...rest }, ref) => (
    <svg ref={ref} width={c1 * 2} height={c1 * 2} {...rest}>
      <NodeCircle type={type} point={point} d={d} />
    </svg>
  )
);

export default NodeIcon;
