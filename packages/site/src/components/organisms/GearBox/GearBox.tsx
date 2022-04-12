import { css } from "@emotion/react";
import styled from "@emotion/styled";
import { Gear } from "fleethub-core";
import React, { useMemo } from "react";

import { useAppDispatch } from "../../../hooks";
import {
  entitiesSlice,
  GearEntity,
  GearPosition,
  gearSelectSlice,
  gearsSlice,
  SwapGearPayload,
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
  const dispatch = useAppDispatch();

  return useMemo(() => {
    const update = (changes: Partial<GearEntity>) => {
      id && dispatch(gearsSlice.actions.update({ id, changes }));
    };

    const remove = () => {
      id && dispatch(gearsSlice.actions.remove(id));
    };

    const swap = (payload: SwapGearPayload) => {
      dispatch(entitiesSlice.actions.swapGear(payload));
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
  const dispatch = useAppDispatch();

  const id = gear?.id;

  const handleAdd = () => {
    if (id || position?.id) {
      dispatch(gearSelectSlice.actions.create({ id, position }));
    }
  };

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
