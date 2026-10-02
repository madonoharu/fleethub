import { Button, DialogContent, Tooltip } from "@mui/material";
import { useTranslation } from "next-i18next/pages";
import React from "react";

import { cn } from "../../../styles/cn";
import { useModal } from "../../../hooks";
import { Slider } from "../../atoms";
import { NumberInput } from "../../molecules";

type Props = {
  value: number;
  onChange: (value: number) => void;
};

const MAX_LEVEL = 188;

const Form: React.FC<Props> = ({ value, onChange }) => {
  const set1 = React.useCallback(() => onChange(1), [onChange]);
  const set99 = React.useCallback(() => onChange(99), [onChange]);
  const setMax = React.useCallback(() => onChange(MAX_LEVEL), [onChange]);

  const inputProps = { min: 1, max: MAX_LEVEL, value, onChange };

  return (
    <DialogContent>
      <NumberInput startLabel="Lv" fullWidth {...inputProps} />
      <Slider {...inputProps} />
      <div className="flex justify-between">
        <Button className="w-[80px]" variant="outlined" onClick={set1}>
          Lv 1
        </Button>
        <Button className="w-[80px]" variant="outlined" onClick={set99}>
          Lv 99
        </Button>
        <Button className="w-[80px]" variant="outlined" onClick={setMax}>
          Lv {MAX_LEVEL}
        </Button>
      </div>
    </DialogContent>
  );
};

const Component: React.FCX<Props> = ({ className, value, onChange }) => {
  const { t } = useTranslation("common");
  const Modal = useModal();

  return (
    <>
      <Tooltip title={t("Change")}>
        <Button className={cn("h-full w-[48px] justify-start", className)} onClick={Modal.show}>
          Lv{value}
        </Button>
      </Tooltip>

      <Modal>
        <Form value={value} onChange={onChange} />
      </Modal>
    </>
  );
};

export default Component;
