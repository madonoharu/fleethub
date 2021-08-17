import { css } from "@emotion/react";
import styled from "@emotion/styled";
import {
  Button,
  DialogContent,
  DialogTitle,
  Slider,
  Tooltip,
} from "@material-ui/core";
import BuildIcon from "@material-ui/icons/Build";
import React from "react";

import { useModal } from "../../../hooks";
import { NumberInput } from "../../molecules";

type SlotSizeFormProps = {
  current?: number;
  max?: number;
  onChange?: (value?: number) => void;
};

const SlotSizeForm: React.FC<SlotSizeFormProps> = ({
  current,
  max,
  onChange,
}) => {
  const handleSliderChange = (event: unknown, value: number | number[]) => {
    if (typeof value === "number" && onChange) onChange(value);
  };

  const handleInit = () => {
    onChange && onChange(max);
  };

  return (
    <>
      <DialogTitle>搭載数を変更</DialogTitle>
      <DialogContent>
        <div
          css={css`
            display: flex;
          `}
        >
          <NumberInput
            variant="outlined"
            value={current || 0}
            min={0}
            onChange={onChange}
          />
          <Button onClick={handleInit}>初期値({max ?? "?"})</Button>
        </div>

        {max && (
          <Slider value={current} max={max} onChange={handleSliderChange} />
        )}
      </DialogContent>
    </>
  );
};

type Props = Partial<SlotSizeFormProps> & {
  disabled?: boolean;
  exslot?: boolean;
};

const SlotSizeButton: React.FCX<Props> = ({
  className,
  current,
  max,
  exslot,
  onChange,
}) => {
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

export default styled(SlotSizeButton)(
  ({ theme, current = 0, max = 0, disabled }) => {
    const { palette } = theme;
    let color = palette.text.primary;
    if (current === 0 || disabled) {
      color = palette.action.disabled;
    } else if (current > max) {
      color = palette.secondary.light;
    }

    return css`
      justify-content: flex-end;
      padding: 0 4px;
      width: 24px;
      color: ${color};
    `;
  }
);
