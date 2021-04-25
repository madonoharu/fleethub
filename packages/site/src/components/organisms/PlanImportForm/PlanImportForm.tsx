import styled from "@emotion/styled";
import { Plan } from "@fleethub/core";
import { Button, TextField } from "@material-ui/core";
import AddIcon from "@material-ui/icons/Add";
import EditIcon from "@material-ui/icons/Edit";
import React from "react";

import { useFhSystem, useSnackbar } from "../../../hooks";

const PlanImportFormAction = styled.div`
  margin-top: 8px;
`;

type Props = {
  onOverwrite?: (plan: Plan) => void;
  onImport?: (plan: Plan) => void;
};

const PlanImportForm: React.FCX<Props> = ({
  className,
  onOverwrite,
  onImport,
}) => {
  const [str, setStr] = React.useState("");
  const Snackbar = useSnackbar();

  const fh = useFhSystem();

  const parseDeck = (str: string): Plan | undefined => {
    try {
      return fh.createPlanByDeck(JSON.parse(str));
    } catch {
      Snackbar.show({ message: "読み込みに失敗しました", severity: "error" });
      return;
    }
  };

  const handleOverwrite = () => {
    const plan = parseDeck(str);
    if (plan) onOverwrite?.(plan);
  };

  const handleImport = () => {
    const plan = parseDeck(str);
    if (plan) onImport?.(plan);
  };

  return (
    <div className={className}>
      <TextField
        label="デッキビルダー形式"
        variant="outlined"
        fullWidth
        value={str}
        onChange={(event) => setStr(event.currentTarget.value)}
      />
      <PlanImportFormAction>
        <Button onClick={handleOverwrite} startIcon={<EditIcon />}>
          現在の編成に上書き
        </Button>
        <Button onClick={handleImport} startIcon={<AddIcon />}>
          新しい編成を作成
        </Button>
      </PlanImportFormAction>

      <Snackbar />
    </div>
  );
};

export default styled(PlanImportForm)`
  padding: 24px;
`;
