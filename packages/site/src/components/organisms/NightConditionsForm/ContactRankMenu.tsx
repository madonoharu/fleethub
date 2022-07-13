import { Button, Stack } from "@mui/material";
import { ContactRank } from "fleethub-core";
import { useTranslation } from "next-i18next";
import React from "react";

import ContactRankIcon from "./ContactRankIcon";

const OPTIONS = [null, "Rank1", "Rank2", "Rank3"] as const;

interface ContactRankMenuProps {
  onClick?: (value: ContactRank | null) => void;
}

const ContactRankMenu: React.FC<ContactRankMenuProps> = ({ onClick }) => {
  const { t } = useTranslation("common");

  return (
    <Stack>
      {OPTIONS.map((rank) => {
        const key = rank ? (`ContactRank.${rank}` as const) : "None";
        return (
          <Button
            css={{ justifyContent: "flex-start" }}
            key={key}
            startIcon={<ContactRankIcon rank={rank} />}
            onClick={() => {
              onClick?.(rank);
            }}
          >
            {t(key)}
          </Button>
        );
      })}
    </Stack>
  );
};

export default ContactRankMenu;
