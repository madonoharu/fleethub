import { Button } from "@mui/material";
import { Ship } from "fleethub-core";
import React, { useState } from "react";

import { useFhCore } from "../../../hooks";
import { Dialog } from "../../organisms";
import ShipList from "../ShipList";

import MasterDataEditor from "./MasterDataEditor";
import MasterShipEditor from "./MasterShipEditor";

const ConfigPage: React.FC = () => {
  const { allShips } = useFhCore();
  const [open, setOpen] = useState(false);
  const [ship, setShip] = useState<Ship>();

  return (
    <div css={{ padding: 8 }}>
      <MasterDataEditor />

      <Button variant="contained" color="primary" onClick={() => setOpen(true)}>
        艦船設定を追加
      </Button>

      <Dialog
        open={Boolean(ship)}
        full
        onClose={() => {
          setShip(undefined);
          setOpen(false);
        }}
      >
        {ship && <MasterShipEditor shipId={ship.ship_id} />}
      </Dialog>

      <Dialog open={open} full onClose={() => setOpen(false)}>
        {open && (
          <ShipList
            ships={allShips}
            onSelect={(ship) => {
              setShip(ship);
            }}
          />
        )}
      </Dialog>
    </div>
  );
};

export default ConfigPage;
