import { Fleet, FleetState } from "@fleethub/core";
import React from "react";

import { Flexbox, Text } from "../../../components";
import { Update } from "../../../utils";
import ShipList from "./ShipList";

type Props = {
  fleet: Fleet;
  update: Update<FleetState>;
};

const FleetEditor: React.FC<Props> = ({ fleet, update }) => {
  return (
    <div>
      <Flexbox>
        <Text>制空</Text>
        <Text>索敵</Text>
      </Flexbox>
      <ShipList fleet={fleet} updateFleet={update} />
    </div>
  );
};

export default FleetEditor;
