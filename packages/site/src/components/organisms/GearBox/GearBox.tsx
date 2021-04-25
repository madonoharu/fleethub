import styled from "@emotion/styled";
import { GearState } from "@fleethub/utils";
import { EntityId } from "@reduxjs/toolkit";
import React from "react";
import { useDispatch, useSelector } from "react-redux";

import { useFhCore } from "../../../hooks";
import { gearsSelectors, gearsSlice } from "../../../store";
import GearLabel from "../GearLabel";
import Swappable from "../Swappable";
import AddGearButton from "./AddGearButton";

type Props = {
  id?: EntityId;
  onGearChange?: (state: GearState) => void;
};

const GearBox: React.FCX<Props> = ({ className, id, onGearChange }) => {
  const { createGear } = useFhCore();

  const entity = useSelector((root) => {
    if (id !== undefined) return gearsSelectors.selectById(root, id);
    return undefined;
  });

  const dispatch = useDispatch();

  const gear = entity && createGear(entity);

  const handleGearChange = () => {
    onGearChange?.({ gear_id: 1 });
  };

  const handleUpdate = (changes: Partial<GearState>) => {
    id && dispatch(gearsSlice.actions.update({ id, changes }));
  };

  const handleRemove = () => {
    entity && dispatch(gearsSlice.actions.remove(entity.id));
  };

  let inner: React.ReactElement;

  if (!gear) {
    inner = <AddGearButton className={className} onClick={handleGearChange} />;
  } else {
    inner = (
      <GearLabel
        className={className}
        gear={gear}
        onUpdate={handleUpdate}
        onRemove={handleRemove}
      />
    );
  }

  return (
    <Swappable type="gear" state={id} setState={(s) => console.log(s)}>
      {inner}
    </Swappable>
  );
};

export default styled(GearBox)`
  height: 100%;
`;
