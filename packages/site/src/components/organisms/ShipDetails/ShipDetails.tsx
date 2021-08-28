import styled from "@emotion/styled";
import {
  Ship,
  SpecialEnemyType,
  Engagement,
  AirState,
  WarfareContext,
} from "@fleethub/core";
import {
  Accordion,
  AccordionSummary,
  AccordionDetails,
} from "@material-ui/core";
import ExpandMoreIcon from "@material-ui/icons/ExpandMore";
import React, { useState } from "react";
import { useTranslation } from "react-i18next";
import { useDispatch } from "react-redux";
import { useImmer } from "use-immer";
import {
  useFhCore,
  useModal,
  useOrgContext,
  usePlanContext,
  useSelectState,
} from "../../../hooks";
import { createShip } from "../../../store";
import { Divider, Flexbox, LabeledValue } from "../../atoms";
import { Select } from "../../molecules";
import ShipCard from "../ShipCard";
import ShipAnalyzer from "./ShipAnalyzer";
import ShipDetailsEnemyList from "./ShipDetailsEnemyList";
import WarfareSideStateSetting, {
  useShipWarfareSettings,
} from "./ShipWarfareSettings";
import { useDummyEnemySelectState } from "./useDummyEnemySelectState";

const AIR_STATES: AirState[] = [
  "AirSupremacy",
  "AirSuperiority",
  "AirParity",
  "AirIncapability",
  "AirDenial",
];

const ENGAGEMENTS: Engagement[] = ["Parallel", "HeadOn", "GreenT", "RedT"];

type ShipDetailsProps = {
  ship: Ship;
};

const ShipDetails: React.FCX<ShipDetailsProps> = ({ className, ship }) => {
  const { t } = useTranslation("common");
  const { core } = useFhCore();
  const org = useOrgContext();

  const attackerSettings = useShipWarfareSettings(ship, org);
  const targetSettings = useShipWarfareSettings(ship, undefined, true);

  const [airState, setAirState] = useState<AirState>("AirSupremacy");
  const [engagement, setEngagement] = useState<Engagement>("Parallel");

  const dummyEnemySelectState = useDummyEnemySelectState();

  const context: WarfareContext = {
    attacker: attackerSettings.context,
    target: targetSettings.context,
    engagement,
    air_state: airState,
  };

  return (
    <div className={className}>
      <Accordion>
        <AccordionSummary expandIcon={<ExpandMoreIcon />}>
          自艦隊設定
        </AccordionSummary>
        <AccordionDetails>
          <WarfareSideStateSetting state={attackerSettings} />
        </AccordionDetails>
      </Accordion>

      <Accordion>
        <AccordionSummary expandIcon={<ExpandMoreIcon />}>
          相手艦設定
        </AccordionSummary>
        <AccordionDetails>
          <WarfareSideStateSetting state={targetSettings} />
        </AccordionDetails>
      </Accordion>

      <Divider label="交戦設定" />
      <Flexbox
        gap={1}
        css={{
          "> *": {
            minWidth: 120,
          },
        }}
      >
        <Select
          label={t("Engagement")}
          options={ENGAGEMENTS}
          value={engagement}
          onChange={setEngagement}
          getOptionLabel={t}
        ></Select>
        <Select
          label={t("AirBattle")}
          options={AIR_STATES}
          value={airState}
          onChange={setAirState}
          getOptionLabel={t}
        />

        <Select label="敵種別補正" {...dummyEnemySelectState} />
      </Flexbox>

      <Flexbox
        gap={1}
        css={{
          "> *": {
            width: "100%",
          },
        }}
      >
        <ShipCard ship={ship} />
        <ShipAnalyzer
          core={core}
          context={context}
          ship={ship}
          target={dummyEnemySelectState.value.ship}
        />
      </Flexbox>

      <ShipDetailsEnemyList context={context} ship={ship} />
    </div>
  );
};

export default styled(ShipDetails)`
  min-height: 80vh;

  > * {
    margin-top: 8px;
  }
`;
