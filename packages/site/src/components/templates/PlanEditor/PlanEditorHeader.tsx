import styled from "@emotion/styled";
import { FleetType, Plan, PlanState } from "@fleethub/core";
import { Button, ClickAwayListener } from "@material-ui/core";
import EditIcon from "@material-ui/icons/Edit";
import React, { useState } from "react";

import {
  FleetTypeSelect,
  Flexbox,
  NumberInput,
  PlanIcon,
  TextField,
} from "../../../components";
import { useFile } from "../../../hooks";
import { Update } from "../../../utils";
import PlanAction from "./PlanAction";

const StyledTextField = styled(TextField)`
  input {
    padding: 0;
  }
`;

const DescriptionButton = styled(Button)`
  font-size: 0.75rem;
  padding: 2px 5px;
  justify-content: flex-start;

  width: 100%;
  overflow: hidden;
  white-space: nowrap;
  text-overflow: ellipsis;

  .MuiButton-label {
    height: 20px;
  }

  svg {
    visibility: hidden;
  }
  :hover svg {
    visibility: visible;
  }
`;

const DescriptionField: React.FC<{
  value?: string;
  onChange: (value: string) => void;
}> = ({ value, onChange }) => {
  const [editing, setEditing] = useState(false);

  if (!editing)
    return (
      <DescriptionButton
        size="small"
        onClick={() => setEditing(true)}
        startIcon={<EditIcon />}
      >
        {value}
      </DescriptionButton>
    );

  return (
    <ClickAwayListener onClickAway={() => setEditing(false)}>
      <StyledTextField
        startLabel="説明"
        margin="none"
        fullWidth
        value={value}
        onChange={onChange}
      />
    </ClickAwayListener>
  );
};

const LevelInput = styled(NumberInput)`
  input {
    width: 26px;
  }
`;

type Props = {
  id: string;
  plan: Plan;
  update: Update<PlanState>;
};

const PlanEditorHeader: React.FCX<Props> = ({
  className,
  id,
  plan,
  update,
}) => {
  const { file, actions: fileActions } = useFile(id);

  const handleHqLevelChange = (next: number) => {
    update((draft) => {
      draft.hqLevel = next;
    });
  };

  const handleFleetTypeChange = (value: FleetType) => {
    update((draft) => {
      draft.fleetType = value;
    });
  };

  if (!file) return null;

  return (
    <div className={className}>
      <Flexbox>
        <TextField
          placeholder="name"
          startLabel={<PlanIcon />}
          value={file.name}
          onChange={fileActions.setName}
        />
        <LevelInput
          startLabel="司令部Lv"
          value={plan.hqLevel}
          min={1}
          max={120}
          onChange={handleHqLevelChange}
        />
        <FleetTypeSelect
          fleetType={plan.fleetType}
          onChange={handleFleetTypeChange}
        />

        <PlanAction id={id} name={file.name || ""} plan={plan} />
      </Flexbox>

      <DescriptionField
        value={file.description}
        onChange={fileActions.setDescription}
      />
    </div>
  );
};

export default PlanEditorHeader;
