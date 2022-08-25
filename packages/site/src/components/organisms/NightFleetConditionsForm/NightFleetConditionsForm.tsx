import { Tooltip, Button, ButtonGroup } from "@mui/material";
import { styled } from "@mui/system";
import { ContactRank, NightFleetConditions } from "fleethub-core";
import { useTranslation } from "next-i18next";
import React from "react";

import { useModal } from "../../../hooks";
import { GearIcon } from "../../molecules";

import ContactRankIcon from "./ContactRankIcon";
import ContactRankMenu from "./ContactRankMenu";

function isSome(value: unknown): boolean {
  return value !== undefined && value !== null;
}

type NightFleetConditionsFormProps = {
  value: NightFleetConditions | undefined;
  onChange?: (value: NightFleetConditions) => void;
  color?: "primary" | "secondary";
};

const NightFleetConditionsForm: React.FCX<NightFleetConditionsFormProps> = ({
  className,
  style,
  value,
  onChange,
  color = "primary",
}) => {
  const { t } = useTranslation("common");

  const ContactModal = useModal();

  const handleContactRankChange = (rank: ContactRank | null) => {
    onChange?.({
      ...value,
      night_contact_rank: rank ?? undefined,
    });
    ContactModal.hide();
  };

  const starshell = isSome(value?.starshell_index);
  const searchlight = isSome(value?.searchlight_index);

  return (
    <>
      <Tooltip title="夜戦設定" placement="top-start">
        <ButtonGroup
          className={className}
          style={style}
          size="small"
          color={color}
        >
          <Button
            onClick={ContactModal.show}
            variant={value?.night_contact_rank ? "contained" : "outlined"}
          >
            <ContactRankIcon rank={value?.night_contact_rank ?? null} />
          </Button>

          <Button
            title={t("Starshell")}
            variant={starshell ? "contained" : "outlined"}
            onClick={() => {
              onChange?.({
                ...value,
                starshell_index: starshell ? undefined : 0,
              });
            }}
          >
            <GearIcon iconId={27} />
          </Button>
          <Button
            title={t("Searchlight")}
            variant={searchlight ? "contained" : "outlined"}
            onClick={() => {
              onChange?.({
                ...value,
                searchlight_index: searchlight ? undefined : 0,
              });
            }}
          >
            <GearIcon iconId={24} />
          </Button>
        </ButtonGroup>
      </Tooltip>
      <ContactModal>
        <ContactRankMenu onClick={handleContactRankChange} />
      </ContactModal>
    </>
  );
};

export default styled(NightFleetConditionsForm)`
  img {
    filter: saturate(1.6) contrast(1.6);
  }
  .MuiButton-contained {
    img {
      filter: saturate(1.6) contrast(1.6) drop-shadow(0 0 0 white);
    }
  }
`;
