import BuildIcon from "@mui/icons-material/Build";
import { Button, DialogContent, DialogTitle, Slider, Tooltip } from "@mui/material";
import { useTranslation } from "next-i18next/pages";
import React from "react";

import { useModal } from "../../../hooks";
import { NumberInput } from "../../molecules";
import { cn } from "../../../styles";

type SlotSizeFormProps = {
  current?: number;
  max?: number;
  onChange?: (value?: number) => void;
};

const SlotSizeForm: React.FC<SlotSizeFormProps> = ({ current, max, onChange }) => {
  const { t } = useTranslation("common");

  const handleSliderChange = (event: unknown, value: number | number[]) => {
    if (typeof value === "number" && onChange) onChange(value);
  };

  const handleInit = () => {
    onChange?.(undefined);
  };

  return (
    <>
      <DialogTitle>搭載数を変更</DialogTitle>
      <DialogContent>
        <div className="flex">
          <NumberInput
            variant="outlined"
            value={current || 0}
            min={0}
            max={255}
            onChange={onChange}
          />
          <Button onClick={handleInit}>{t("Reset")}</Button>
        </div>

        {max && <Slider value={current} max={max} onChange={handleSliderChange} />}
      </DialogContent>
    </>
  );
};

type Props = Partial<SlotSizeFormProps> & {
  disabled?: boolean;
  exslot?: boolean;
};

const SlotSizeButton: React.FCX<Props> = ({ className, current, max, exslot, onChange }) => {
  const Modal = useModal();

  if (exslot) {
    return (
      <Button className={className} disabled>
        <BuildIcon fontSize="inherit" />
      </Button>
    );
  }

  return (
    <>
      <Tooltip title="搭載数を変更">
        <Button className={className} size="small" onClick={Modal.show}>
          {current ?? "?"}
        </Button>
      </Tooltip>
      <Modal>
        <SlotSizeForm current={current} max={max} onChange={onChange} />
      </Modal>
    </>
  );
};

export default ({ className, ...props }: React.ComponentProps<typeof SlotSizeButton>) => (
  <SlotSizeButton
    {...props}
    className={cn(
      "justify-end px-1 py-0 w-6",
      !props.current || props.disabled
        ? "text-action-disabled"
        : props.current > (props.max ?? 0)
          ? "text-secondary-light"
          : "text-text-primary",
      className,
    )}
  />
);
