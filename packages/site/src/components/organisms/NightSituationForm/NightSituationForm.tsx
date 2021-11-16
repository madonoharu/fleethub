/** @jsxImportSource @emotion/react */
import { Tooltip, Button, ButtonGroup, ButtonProps } from "@mui/material";
import { styled } from "@mui/system";
import { NightSituation } from "fleethub-core";
import { useTranslation } from "next-i18next";
import React from "react";

import { GearIcon } from "../../molecules";

type NightSituationFormProps = {
  value: NightSituation;
  onChange?: (value: NightSituation) => void;
  color?: "primary" | "secondary";
};

const NightSituationForm: React.FCX<NightSituationFormProps> = ({
  className,
  style,
  value,
  onChange,
  color = "primary",
}) => {
  const { t } = useTranslation("common");

  const handleClick: React.MouseEventHandler<HTMLButtonElement> = (event) => {
    const key = event.currentTarget.value as keyof NightSituation;
    if (key === "night_contact_rank") {
      onChange?.({ ...value, [key]: value[key] ? null : "Rank1" });
    } else {
      onChange?.({ ...value, [key]: !value[key] });
    }
  };

  const bind = (key: keyof NightSituation): ButtonProps => ({
    color,
    variant: value[key] ? "contained" : "outlined",
    value: key,
    onClick: handleClick,
  });

  return (
    <Tooltip title="夜戦設定" placement="top-start">
      <ButtonGroup
        className={className}
        style={style}
        size="small"
        color={color}
      >
        <Button {...bind("night_contact_rank")}>
          <GearIcon iconId={10} />
        </Button>

        <Button title={t("Starshell")} {...bind("starshell")}>
          <GearIcon iconId={27} />
        </Button>
        <Button title={t("Searchlight")} {...bind("searchlight")}>
          <GearIcon iconId={24} />
        </Button>
      </ButtonGroup>
    </Tooltip>
  );
};

export default styled(NightSituationForm)`
  img {
    filter: saturate(1.6) contrast(1.6);
  }
  .MuiButton-contained {
    img {
      filter: saturate(1.6) contrast(1.6) drop-shadow(0 0 0 white);
    }
  }
`;
