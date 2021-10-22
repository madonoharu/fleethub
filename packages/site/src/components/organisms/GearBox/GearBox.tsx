import { css } from "@emotion/react";
import styled from "@emotion/styled";
import { Gear } from "fleethub-core";
import React, { useMemo } from "react";
import { useDispatch } from "react-redux";

import {
  GearEntity,
  GearPosition,
  gearSelectSlice,
  gearsSlice,
  swapGearPosition,
} from "../../../store";
import GearLabel from "../GearLabel";
import Swappable from "../Swappable";
import AddGearButton from "./AddGearButton";

type Props = {
  gear?: Gear;
  position?: GearPosition;
  size?: "small" | "medium" | undefined;
  equippable?: boolean;
};

const useGearActions = (id?: string) => {
  const dispatch = useDispatch();

  return useMemo(() => {
    const update = (changes: Partial<GearEntity>) => {
      id && dispatch(gearsSlice.actions.update({ id, changes }));
    };

    const remove = () => {
      id && dispatch(gearsSlice.actions.remove(id));
    };

    const swap = (event: Parameters<typeof swapGearPosition>[0]) => {
      dispatch(swapGearPosition(event));
    };

    return { update, remove, swap };
  }, [id, dispatch]);
};

const GearBox: React.FCX<Props> = ({
  className,
  gear,
  position,
  size,
  equippable,
}) => {
  const dispatch = useDispatch();

  const handleAdd = () => {
    dispatch(gearSelectSlice.actions.create({ id: gear?.id, position }));
  };

  const id = gear?.id;

  const actions = useGearActions(id);

  let inner: React.ReactElement;

  if (!gear) {
    inner = <AddGearButton onClick={handleAdd} />;
  } else {
    inner = (
      <GearLabel
        gear={gear}
        equippable={equippable}
        size={size}
        onUpdate={actions.update}
        onReselect={handleAdd}
        onRemove={actions.remove}
      />
    );
  }

  if (!position) {
    return <div className={className}>{inner}</div>;
  }

  return (
    <Swappable
      className={className}
      type="gear"
      item={{ position, id }}
      canDrag={Boolean(position && id)}
      onSwap={actions.swap}
    >
      {inner}
    </Swappable>
  );
};

export default styled(GearBox)(
  ({ size }) => css`
    height: ${size === "small" ? 24 : 28}px;
    width: 100%;
    line-height: initial;
  `
);
