import styled from "@emotion/styled";
import { Button, DialogContent, Tooltip } from "@mui/material";
import { useTranslation } from "next-i18next";
import React from "react";

import { useModal } from "../../../hooks";
import { Slider } from "../../atoms";
import { NumberInput } from "../../molecules";

const StyledButton = styled(Button)`
  width: 80px;
`;

const SpaceBetween = styled.div`
  display: flex;
  justify-content: space-between;
`;

type Props = {
  value: number;
  onChange: (value: number) => void;
};

const Form: React.FC<Props> = ({ value, onChange }) => {
  const set1 = React.useCallback(() => onChange(1), [onChange]);
  const set99 = React.useCallback(() => onChange(99), [onChange]);
  const set180 = React.useCallback(() => onChange(180), [onChange]);

  const inputProps = { min: 1, max: 180, value, onChange };

  return (
    <DialogContent>
      <NumberInput startLabel="Lv" fullWidth {...inputProps} />
      <Slider {...inputProps} />
      <SpaceBetween>
        <StyledButton variant="outlined" onClick={set1}>
          Lv 1
        </StyledButton>
        <StyledButton variant="outlined" onClick={set99}>
          Lv 99
        </StyledButton>
        <StyledButton variant="outlined" onClick={set180}>
          Lv 180
        </StyledButton>
      </SpaceBetween>
    </DialogContent>
  );
};

const Component: React.FCX<Props> = ({ className, value, onChange }) => {
  const { t } = useTranslation("common");
  const Modal = useModal();

  return (
    <>
      <Tooltip title={t("Change")}>
        <Button className={className} onClick={Modal.show}>
          Lv{value}
        </Button>
      </Tooltip>

      <Modal>
        <Form value={value} onChange={onChange} />
      </Modal>
    </>
  );
};

const StyledComponent = styled(Component)`
  height: 100%;
  justify-content: flex-start;
  width: 48px;
`;

export default StyledComponent;
