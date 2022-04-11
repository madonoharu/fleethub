import { nonNullable } from "@fh/utils";
import React, { useMemo } from "react";

import { useAppDispatch, useAppSelector, useFhCore } from "../../../hooks";
import { gearSelectSlice } from "../../../store";
import { Dialog } from "../../organisms";

import GearSelectMenu from "./GearSelectMenu";

const GearSelectModal: React.FCX = () => {
  const { core, masterData } = useFhCore();

  const gears = useMemo(
    () => {
      return masterData.gears
        .map((mg) => core.create_gear({ gear_id: mg.gear_id }))
        .filter(nonNullable);
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    []
  );

  const dispatch = useAppDispatch();
  const open = useAppSelector((root) => root.present.gearSelect.open);

  const handleClose = () => dispatch(gearSelectSlice.actions.hide());

  return (
    <Dialog open={open} full onClose={handleClose}>
      {open && <GearSelectMenu gears={gears} />}
    </Dialog>
  );
};

export default GearSelectModal;
