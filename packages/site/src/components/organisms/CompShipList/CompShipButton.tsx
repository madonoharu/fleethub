import AddIcon from "@mui/icons-material/Add";
import { Button } from "@mui/material";

import { ShipMeta } from "fleethub-core";
import React from "react";

import { useAppDispatch, useSwap } from "../../../hooks";
import { ShipPosition, shipSelectSlice, SwapShipPayload } from "../../../store";
import ShipBanner from "../ShipBanner";
import { cn } from "../../../styles";

interface Props {
  className?: string;
  position: ShipPosition;
  meta: ShipMeta | null;
  color: "primary" | "secondary";
  selected: boolean;
  onSwap: (event: SwapShipPayload) => void;
  onSelect: React.MouseEventHandler<HTMLButtonElement>;
}

const Inner = React.forwardRef<HTMLButtonElement, Props>(
  ({ position, meta, selected, onSelect, onSwap: _, ...rest }, ref) => {
    const dispatch = useAppDispatch();

    const id = meta?.id || "";

    if (meta) {
      return (
        <Button
          ref={ref}
          variant={selected ? "contained" : "outlined"}
          value={id}
          onClick={onSelect}
          {...rest}
        >
          <ShipBanner shipId={meta.ship_id} />
        </Button>
      );
    } else {
      const handleClick = () => {
        dispatch(shipSelectSlice.actions.create({ position }));
      };

      return (
        <Button ref={ref} variant="outlined" onClick={handleClick} {...rest}>
          <AddIcon />
        </Button>
      );
    }
  },
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

export default ({ className, ...props }: React.ComponentProps<typeof CompShipButton>) => (
  <CompShipButton {...props} className={cn("swappable", className)} />
);
