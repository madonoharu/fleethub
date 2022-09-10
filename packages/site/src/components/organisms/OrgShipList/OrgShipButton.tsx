import AddIcon from "@mui/icons-material/Add";
import { styled, Button } from "@mui/material";
import React from "react";

import { useAppDispatch, useSwap } from "../../../hooks";
import { ShipPosition, shipSelectSlice, SwapShipPayload } from "../../../store";
import ShipBanner from "../ShipBanner";

interface Props {
  className?: string;
  position: ShipPosition;
  id: string | undefined;
  shipId: number | undefined;
  color: "primary" | "secondary";
  selected: boolean;
  onSwap: (event: SwapShipPayload) => void;
  onClick: React.MouseEventHandler<HTMLButtonElement>;
}

const Inner = React.forwardRef<HTMLButtonElement, Props>((props, ref) => {
  const { id, position, shipId, selected, onClick, onSwap: _, ...rest } = props;

  const dispatch = useAppDispatch();

  if (shipId) {
    return (
      <Button
        ref={ref}
        disableElevation
        disableRipple
        variant={selected ? "contained" : "outlined"}
        value={id || ""}
        onClick={onClick}
        {...rest}
      >
        <ShipBanner shipId={shipId} />
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
});

const Memoized = React.memo(Inner);

const OrgShipButton: React.FCX<Props> = (props) => {
  const { id, position, onSwap } = props;

  const item = { id, position };
  const elem = <Memoized {...props} />;

  const ref = useSwap({
    type: "ship",
    item,
    onSwap,
    canDrag: Boolean(id),
    dragLayer: elem,
  });

  return React.cloneElement(elem, { ref });
};

export default styled(OrgShipButton)(({ theme }) => theme.styles.swappable);
