import { Button, Paper, Stack } from "@mui/material";
import { useTranslation } from "next-i18next";
import React, { useState } from "react";
import { shallowEqual } from "react-redux";

import { useAppDispatch, useRootSelector, useFhCore } from "../../../hooks";
import { configSlice } from "../../../store";
import { DeleteButton } from "../../molecules";
import { Dialog, ShipNameplate } from "../../organisms";
import ShipList from "../ShipList";

import MasterShipEditor from "./MasterShipEditor";

const ShipsMenu: React.FC = () => {
  const { t } = useTranslation("common");
  const [open, setOpen] = useState(false);
  const [selectedId, setSelectedId] = useState<number>();

  const { allShips } = useFhCore();
  const dispatch = useAppDispatch();

  const shipIds = useRootSelector((root) => {
    return Object.keys(root.config.masterData?.ships || {}).map((v) =>
      Number(v)
    );
  }, shallowEqual);

  return (
    <div>
      <Stack gap={1}>
        <Button
          sx={{ width: "fit-content" }}
          variant="contained"
          color="primary"
          onClick={() => setOpen(true)}
        >
          {t("AddShipConfig")}
        </Button>

        {shipIds.map((id) => (
          <Paper
            key={id}
            css={{ display: "flex", maxWidth: 400, alignItems: "center" }}
          >
            <Button
              css={{ flexGrow: 1 }}
              onClick={() => {
                setSelectedId(id);
              }}
            >
              <ShipNameplate shipId={id} sx={{ height: 40 }} />
            </Button>
            <DeleteButton
              onClick={() => {
                dispatch(configSlice.actions.removeMasterShip(id));
              }}
            />
          </Paper>
        ))}
      </Stack>

      <Dialog
        open={Boolean(selectedId)}
        full
        onClose={() => {
          setSelectedId(undefined);
        }}
      >
        {selectedId && <MasterShipEditor shipId={selectedId} />}
      </Dialog>

      <Dialog open={open} full onClose={() => setOpen(false)}>
        {open && (
          <ShipList
            ships={allShips}
            onSelect={(ship) => {
              setOpen(false);
              setSelectedId(ship.ship_id);
            }}
          />
        )}
      </Dialog>
    </div>
  );
};

export default ShipsMenu;
