/** @jsxImportSource @emotion/react */
import styled from "@emotion/styled";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";
import {
  Accordion,
  AccordionSummary,
  AccordionDetails,
  Button,
  Stack,
} from "@mui/material";
import { Org, OrgType, Ship } from "fleethub-core";
import { produce } from "immer";
import React, { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";

import { useFhCore } from "../../../hooks";
import {
  shipDetailsSlice,
  ShipDetailsState,
  shipSelectSlice,
} from "../../../store";
import { Flexbox } from "../../atoms";
import AirStateSelect from "../AirStateSelect";
import EngagementSelect from "../EngagementSelect";
import ShipCard from "../ShipCard";
import AttackPowerAnalyzer from "./AttackPowerAnalyzer";
import ShipDetailsEnemyList from "./ShipDetailsEnemyList";
import ShipParamsSettings from "./ShipParamsSettings";

const isEnemy = (type: OrgType) =>
  type === "EnemySingle" || type === "EnemyCombined";

type ShipDetailsProps = {
  ship: Ship;
  org?: Org;
};

const ShipDetails: React.FCX<ShipDetailsProps> = ({ className, ship, org }) => {
  const { core } = useFhCore();

  const state = useSelector((root) => root.present.shipDetails);
  const dispatch = useDispatch();

  const update = (payload: Partial<ShipDetailsState>) => {
    dispatch(shipDetailsSlice.actions.update(payload));
  };

  const handleEnemySelect = () => {
    dispatch(
      shipSelectSlice.actions.create({
        abyssal: true,
        position: { tag: "shipDetails" },
      })
    );
  };

  useEffect(() => {
    if (!org) return;
    const env = org.create_warfare_ship_environment(
      ship,
      state.player.formation
    );

    if (!env) return;

    const next = produce(state, (draft) => {
      if (org.is_enemy() === isEnemy(draft.enemy.org_type)) {
        if (org.is_player()) {
          draft.enemy.org_type = "EnemySingle";
        } else {
          draft.enemy.org_type = "Single";
        }
      }

      Object.assign(draft.player, env);
    });

    update(next);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <Stack className={className} gap={1}>
      <Accordion>
        <AccordionSummary expandIcon={<ExpandMoreIcon />}>
          自艦隊設定
        </AccordionSummary>
        <AccordionDetails>
          <ShipParamsSettings
            value={state.player}
            onChange={(player) => update({ player })}
          />
        </AccordionDetails>
      </Accordion>

      <Accordion>
        <AccordionSummary expandIcon={<ExpandMoreIcon />}>
          相手艦設定
        </AccordionSummary>
        <AccordionDetails>
          <ShipParamsSettings
            value={state.enemy}
            onChange={(enemy) => update({ enemy })}
          />
        </AccordionDetails>
      </Accordion>

      <Flexbox gap={1}>
        <EngagementSelect
          value={state.engagement}
          onChange={(engagement) => update({ engagement })}
        />
        <AirStateSelect
          value={state.air_state}
          onChange={(air_state) => update({ air_state })}
        />
        <Button variant="contained" color="primary" onClick={handleEnemySelect}>
          敵を追加して攻撃力を計算する
        </Button>
      </Flexbox>

      <Flexbox
        gap={1}
        css={{
          "> *": {
            width: "50%",
          },
        }}
      >
        <ShipCard ship={ship} org={org} visibleMiscStats disableDetails />
        <AttackPowerAnalyzer core={core} state={state} ship={ship} />
      </Flexbox>

      <ShipDetailsEnemyList state={state} ship={ship} />
    </Stack>
  );
};

export default styled(ShipDetails)`
  min-height: 80vh;
  padding-bottom: 400px;
`;
