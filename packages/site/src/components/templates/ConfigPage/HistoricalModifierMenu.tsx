import { Paper } from "@mui/material";
import React from "react";
import { useImmer } from "use-immer";

import { NumberInput } from "../../molecules";

const HistoricalModifierMenu: React.FC = () => {
  const [state] = useImmer([{ mapId: 551, node: "A" }]);
  return (
    <div>
      {state.map((item) => {
        return <Paper key={`${item.mapId}-${item.node}`}>{item.node}</Paper>;
      })}
      <NumberInput label="power_mod.a" value={0} />
    </div>
  );
};

export default HistoricalModifierMenu;
