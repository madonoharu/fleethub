import { css } from "@emotion/react";
import styled from "@emotion/styled";
import CircleIcon from "@mui/icons-material/Circle";
import FlareIcon from "@mui/icons-material/Flare";
import MoodBadIcon from "@mui/icons-material/MoodBad";
import SentimentDissatisfiedIcon from "@mui/icons-material/SentimentDissatisfied";
import { Button, Tooltip, Typography } from "@mui/material";
import { MoraleState } from "fleethub-core";
import { useTranslation } from "next-i18next";
import React from "react";

import { useModal } from "../../../hooks";
import { Flexbox } from "../../atoms";
import { NumberInput } from "../../molecules";

const MoraleStateIcon: React.FCX<{ state: MoraleState }> = ({ state }) => {
  switch (state) {
    case "Sparkle":
      return <FlareIcon />;
    case "Normal":
      return <CircleIcon />;
    case "Orange":
      return <SentimentDissatisfiedIcon />;
    case "Red":
      return <MoodBadIcon />;
  }
};

const MoraleStateFormContainer = styled.div(
  ({ theme }) => css`
    .Sparkle {
      color: ${theme.colors.Sparkle};
    }
    .Normal {
      color: ${theme.colors.Normal};
    }
    .Orange {
      color: ${theme.colors.Orange};
    }
    .Red {
      color: ${theme.colors.Red};
    }

    height: 128px;

    > * {
      margin-top: 8px;
    }
  `
);

type MoraleStateSelectProps = {
  morale: number;
  morale_state: MoraleState;
  onChange?: (value: number) => void;
};

const MoraleStateForm: React.FCX<
  MoraleStateSelectProps & {
    onClose?: () => void;
  }
> = ({ className, morale, onChange, onClose }) => {
  const { t } = useTranslation("common");

  const handleSparkleClick = () => {
    onClose?.();
    onChange?.(85);
  };
  const handleNormalClick = () => {
    onClose?.();
    onChange?.(49);
  };
  const handleOrangeClick = () => {
    onClose?.();
    onChange?.(29);
  };
  const handleRedClick = () => {
    onClose?.();
    onChange?.(0);
  };

  return (
    <MoraleStateFormContainer className={className}>
      <Typography>疲労度を設定</Typography>
      <Flexbox gap={1}>
        <Button
          className="Sparkle"
          variant="outlined"
          startIcon={<MoraleStateIcon state="Sparkle" />}
          onClick={handleSparkleClick}
        >
          {t("Sparkle")}
        </Button>
        <Button
          className="Normal"
          variant="outlined"
          startIcon={<MoraleStateIcon state="Normal" />}
          onClick={handleNormalClick}
        >
          {t("Normal")}
        </Button>
        <Button
          className="Orange"
          variant="outlined"
          startIcon={<MoraleStateIcon state="Orange" />}
          onClick={handleOrangeClick}
        >
          {t("Orange")}
        </Button>
        <Button
          className="Red"
          variant="outlined"
          startIcon={<MoraleStateIcon state="Red" />}
          onClick={handleRedClick}
        >
          {t("Red")}
        </Button>
      </Flexbox>

      <NumberInput
        startLabel={t("MoraleState")}
        value={morale}
        max={100}
        min={0}
        onChange={onChange}
      />
    </MoraleStateFormContainer>
  );
};

const EndIcon = styled.span`
  display: inherit;
`;

const MoraleStateSelect: React.FCX<MoraleStateSelectProps> = ({
  className,
  style,
  morale,
  morale_state,
  onChange,
}) => {
  const { t } = useTranslation("common");
  const Modal = useModal();

  return (
    <>
      <Tooltip title={`${t("MoraleState")} ${t(morale_state)}`}>
        <Button
          className={className}
          style={style}
          size="small"
          onClick={Modal.show}
        >
          <span>{t("MoraleState")}</span>
          <EndIcon>
            <MoraleStateIcon state={morale_state} />
          </EndIcon>
        </Button>
      </Tooltip>

      <Modal>
        <MoraleStateForm
          morale={morale}
          morale_state={morale_state}
          onChange={onChange}
          onClose={Modal.hide}
        />
      </Modal>
    </>
  );
};

export default styled(MoraleStateSelect)(
  ({ morale_state, theme }) => css`
    height: 24px;
    font-size: 0.75rem;
    gap: 4px;

    svg {
      font-size: 1rem;
      color: ${theme.colors[morale_state]};
    }
  `
);
