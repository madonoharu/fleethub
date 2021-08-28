import {
  AirState,
  Engagement,
  Org,
  Ship,
  WarfareSideState,
} from "@fleethub/core";
import {
  Accordion,
  AccordionSummary,
  AccordionDetails,
} from "@material-ui/core";
import ExpandMoreIcon from "@material-ui/icons/ExpandMore";
import React from "react";
import { Flexbox } from "../../atoms";
import { Select } from "../../molecules";
import AirStateSelect from "../AirStateSelect";
import EngagementSelect from "../EngagementSelect";
import FormationSelect from "../FormationSelect";

import ShipWarfareSettings, {
  useShipWarfareSettings,
} from "./ShipWarfareSettings";

type PlanNodeWarfareAnalyzerProps = {
  playerShip: Ship;
  enemyShip: Ship;
  playerOrg: Org;
  enemyOrg: Org;
};

const PlanNodeWarfareAnalyzer: React.FCX<PlanNodeWarfareAnalyzerProps> = ({
  playerShip,
  enemyShip,
  playerOrg,
  enemyOrg,
}) => {
  const playerSettings = useShipWarfareSettings(playerShip, playerOrg);
  const enemySettings = useShipWarfareSettings(enemyShip, enemyOrg);

  return (
    <div>
      <Accordion>
        <AccordionSummary expandIcon={<ExpandMoreIcon />}>
          自艦隊設定
        </AccordionSummary>
        <AccordionDetails>
          <ShipWarfareSettings state={playerSettings} />
        </AccordionDetails>
      </Accordion>

      <Accordion>
        <AccordionSummary expandIcon={<ExpandMoreIcon />}>
          相手艦設定
        </AccordionSummary>
        <AccordionDetails>
          <ShipWarfareSettings state={enemySettings} />
        </AccordionDetails>
      </Accordion>
    </div>
  );
};

export default PlanNodeWarfareAnalyzer;
