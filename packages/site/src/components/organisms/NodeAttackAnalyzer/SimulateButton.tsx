import { Alert, AlertTitle, Button, Stack } from "@mui/material";
import type { Comp, NodeAttackAnalyzerConfig } from "fleethub-core";
import React from "react";

import { useModal } from "../../../hooks";
import { Divider } from "../../atoms";

import SimulatorResultTable from "./SimulatorResultTable";

interface Props {
  config: NodeAttackAnalyzerConfig;
  leftComp?: Comp;
  rightComp?: Comp;
  times: number;
}

const SimulateButton: React.FC<Props> = (props) => {
  const { leftComp, rightComp } = props;
  const Modal = useModal();

  if (!leftComp || !rightComp) {
    return null;
  }

  const disabled = !leftComp.has_route_sup();

  return (
    <Stack gap={1}>
      <Divider label="砲撃支援シミュレータ" />

      <Alert severity="info">
        <AlertTitle>多分そのうち別の形で実装を直します</AlertTitle>
        <Button
          css={{ width: "fit-content" }}
          color="primary"
          variant="contained"
          disabled={disabled}
          onClick={Modal.show}
        >
          {disabled ? "支援艦隊が設定されていません" : "実行"}
        </Button>
      </Alert>

      <Modal>
        <SimulatorResultTable {...props} />
      </Modal>
    </Stack>
  );
};

export default SimulateButton;
