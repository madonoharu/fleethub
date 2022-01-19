/** @jsxImportSource @emotion/react */
import AddIcon from "@mui/icons-material/Add";
import { Button } from "@mui/material";
import { styled } from "@mui/system";
import { ShipMeta } from "fleethub-core";
import React from "react";
import { useDispatch } from "react-redux";

import { useSwap } from "../../../hooks";
import { ShipPosition, shipSelectSlice, SwapShipPayload } from "../../../store";
import ShipBanner from "../ShipBanner";

type Props = {
  className?: string;
  position: ShipPosition;
  meta: ShipMeta | null;
  color: "primary" | "secondary";
  selected: boolean;
  onSwap: (event: SwapShipPayload) => void;
  onSelect: React.MouseEventHandler<HTMLButtonElement>;
};

const Inner = React.forwardRef<HTMLButtonElement, Props>(
  ({ className, position, meta, color, selected, onSelect }, ref) => {
    const dispatch = useDispatch();

    const id = meta?.id || "";

    if (meta) {
      return (
        <Button
          ref={ref}
          className={className}
          variant={selected ? "contained" : "outlined"}
          color={color}
          value={id}
          onClick={onSelect}
        >
          <ShipBanner shipId={meta.ship_id} />
        </Button>
      );
    } else {
      const handleClick = () => {
        dispatch(shipSelectSlice.actions.create({ position }));
      };

      return (
        <Button
          ref={ref}
          className={className}
          variant="outlined"
          color={color}
          onClick={handleClick}
        >
          <AddIcon />
        </Button>
      );
    }
  }
);

const Memoized = React.memo(Inner);

const CompShipButton: React.FCX<Props> = (props) => {
  const { position, meta, onSwap } = props;

  const id = meta?.id || "";
  const item = { id, position };
  const elem = <Memoized {...props} />;

  const ref = useSwap({
    type: "ship",
    item,
    onSwap,
    canDrag: Boolean(meta),
    dragLayer: elem,
  });

  return React.cloneElement(elem, { ref });
};

export default styled(CompShipButton)(({ theme }) => theme.styles.swappable);
