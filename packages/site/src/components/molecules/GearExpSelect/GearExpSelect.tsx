import { cn } from "../../../styles/cn";
import { GEAR_EXP_TABLE } from "@fh/utils";
import { Button, Tooltip } from "@mui/material";
import { useTranslation } from "next-i18next/pages";
import React from "react";

import { usePopover } from "../../../hooks";
import { ProficiencyIcon } from "../../atoms";
import NumberInput from "../NumberInput";

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
    <div
      className={cn(
        "[&_button]:w-7 [&_button]:flex [&_button]:px-[3px] [&_button]:py-0 [&_input]:w-16 [&_input]:mx-2 [&_input]:my-0",
        className,
      )}
    >
      <Tooltip title={t("Proficiency")}>
        <Button onClick={Popover.show} className="h-full">
          <ProficiencyIcon exp={exp} />
        </Button>
      </Tooltip>

      <Popover anchorOrigin={anchorOrigin}>
        <div className="flex flex-col-reverse">
          {GEAR_EXP_TABLE.map((bound) => (
            <Button key={bound} id={bound.toString()} onClick={handleChange}>
              <ProficiencyIcon exp={bound} />
            </Button>
          ))}
        </div>

        <NumberInput
          className="w-24 mx-1 my-0"
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

export default GearExpSelect;
