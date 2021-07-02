import styled from "@emotion/styled";
import { Org } from "@fleethub/core";
import { Button, ClickAwayListener } from "@material-ui/core";
import EditIcon from "@material-ui/icons/Edit";
import React, { useState } from "react";

import { PlanFileEntity } from "../../../store";
import { Flexbox, PlanIcon } from "../../atoms";
import { NumberInput, TextField } from "../../molecules";
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

type PlanScreenHeaderProps = {
  org: Org;
  file?: PlanFileEntity;
  onNameChange?: (value: string) => void;
  onHqLevelChange?: (value: number) => void;
};

const PlanScreenHeader: React.FCX<PlanScreenHeaderProps> = ({
  className,
  org,
  file,
  onNameChange,
  onHqLevelChange,
}) => {
  return (
    <div className={className}>
      <Flexbox>
        <TextField
          placeholder="name"
          startLabel={<PlanIcon />}
          value={file?.name || ""}
          onChange={onNameChange}
        />
        <LevelInput
          startLabel="司令部Lv"
          value={org.hq_level}
          min={1}
          max={120}
          onChange={onHqLevelChange}
        />
        <PlanAction org={org} />
      </Flexbox>
    </div>
  );
};

export default PlanScreenHeader;
