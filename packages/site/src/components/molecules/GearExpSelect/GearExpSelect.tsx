import styled from "@emotion/styled";
import { GEAR_EXP_TABLE } from "@fh/utils";
import { Button, Tooltip } from "@mui/material";
import { useTranslation } from "next-i18next";
import React from "react";

import { usePopover } from "../../../hooks";
import { ProficiencyIcon } from "../../atoms";
import NumberInput from "../NumberInput";

const ColumnReverse = styled.div`
  display: flex;
  flex-direction: column-reverse;
`;

const StyledNumberInput = styled(NumberInput)`
  width: 96px;
  margin: 0 4px;
`;

const anchorOrigin = {
  vertical: "bottom",
  horizontal: "center",
} as const;

type Props = {
  className?: string;
  exp: number;
  onChange?: (value: number) => void;
};

const GearExpSelect: React.FC<Props> = ({ className, exp, onChange }) => {
  const { t } = useTranslation("common");
  const Popover = usePopover();

  const handleChange: React.MouseEventHandler = (event) => {
    onChange?.(Number(event.currentTarget.id));
    Popover.hide();
  };

  return (
    <div className={className}>
      <Tooltip title={t("Proficiency")}>
        <Button onClick={Popover.show} sx={{ height: "100%" }}>
          <ProficiencyIcon exp={exp} />
        </Button>
      </Tooltip>

      <Popover anchorOrigin={anchorOrigin}>
        <ColumnReverse>
          {GEAR_EXP_TABLE.map((bound) => (
            <Button key={bound} id={bound.toString()} onClick={handleChange}>
              <ProficiencyIcon exp={bound} />
            </Button>
          ))}
        </ColumnReverse>

        <StyledNumberInput
          label="内部熟練度"
          variant="outlined"
          value={exp}
          onChange={onChange}
          min={0}
          max={120}
        />
      </Popover>
    </div>
  );
};

export default styled(GearExpSelect)`
  button {
    width: 28px;
    display: flex;
    padding: 0 3px;
  }
  input {
    width: 64px;
    margin: 0 8px;
  }
`;
