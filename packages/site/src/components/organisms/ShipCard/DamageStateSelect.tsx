import { css } from "@emotion/react";
import styled from "@emotion/styled";
import { DamageState } from "@fleethub/core";
import { Button, Tooltip, Typography } from "@mui/material";
import CircleIcon from "@mui/icons-material/Circle";
import { useTranslation } from "next-i18next";
import React from "react";
import { useModal } from "../../../hooks";
import { Flexbox } from "../../atoms";
import { NumberInput } from "../../molecules";

const DamageStateFormContainer = styled.div(
  ({ theme }) => css`
    .Normal {
      color: ${theme.colors.DamageNormal};
    }
    .Shouha {
      color: ${theme.colors.DamageShouha};
    }
    .Chuuha {
      color: ${theme.colors.DamageChuuha};
    }
    .Taiha {
      color: ${theme.colors.DamageTaiha};
    }

    height: 128px;

    > * {
      margin-top: 8px;
    }
  `
);

type DamageStateSelectProps = {
  max_hp: number;
  current_hp: number;
  damage_state: DamageState;
  onChange?: (value: number) => void;
};

const DamageStateForm: React.FCX<
  DamageStateSelectProps & {
    onClose?: () => void;
  }
> = ({ className, max_hp, current_hp, onChange, onClose }) => {
  const { t } = useTranslation("common");

  const handleNoneClick = () => {
    onClose?.();
    onChange?.(max_hp);
  };
  const handleShouhaClick = () => {
    onClose?.();
    onChange?.(Math.floor(max_hp * (3 / 4)));
  };
  const handleChuuhaClick = () => {
    onClose?.();
    onChange?.(Math.floor(max_hp / 2));
  };
  const handleTaihaClick = () => {
    onClose?.();
    onChange?.(Math.floor(max_hp / 4));
  };

  return (
    <DamageStateFormContainer className={className}>
      <Typography>損害を設定</Typography>
      <Flexbox gap={1}>
        <Button className="Normal" variant="outlined" onClick={handleNoneClick}>
          {t("Normal")}
        </Button>
        <Button
          className="Shouha"
          variant="outlined"
          onClick={handleShouhaClick}
        >
          {t("Shouha")}
        </Button>
        <Button
          className="Chuuha"
          variant="outlined"
          onClick={handleChuuhaClick}
        >
          {t("Chuuha")}
        </Button>
        <Button className="Taiha" variant="outlined" onClick={handleTaihaClick}>
          {t("Taiha")}
        </Button>
      </Flexbox>

      <NumberInput
        startLabel="HP"
        value={current_hp}
        min={0}
        max={max_hp}
        onChange={onChange}
      />
    </DamageStateFormContainer>
  );
};

const EndIcon = styled.span`
  display: inherit;
`;

const DamageStateSelect: React.FCX<DamageStateSelectProps> = ({
  className,
  style,
  max_hp,
  current_hp,
  damage_state,
  onChange,
}) => {
  const { t } = useTranslation("common");
  const Modal = useModal();

  return (
    <>
      <Tooltip title={`${t("DamageState")} ${t(damage_state)}`}>
        <Button
          className={className}
          style={style}
          size="small"
          onClick={Modal.show}
        >
          <span>
            HP {current_hp}/{max_hp || "?"}
          </span>
          <EndIcon>
            <CircleIcon />
          </EndIcon>
        </Button>
      </Tooltip>

      <Modal>
        <DamageStateForm
          max_hp={max_hp}
          current_hp={current_hp}
          damage_state={damage_state}
          onChange={onChange}
          onClose={Modal.hide}
        />
      </Modal>
    </>
  );
};

export default styled(DamageStateSelect)(
  ({ damage_state, theme }) => css`
    height: 24px;
    gap: 4px;

    svg {
      color: ${theme.colors[`Damage${damage_state}` as const]};
      font-size: 1rem;
    }
  `
);
