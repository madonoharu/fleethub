import styled from "@emotion/styled";
import { Dict } from "@fh/utils";
import GitHubIcon from "@mui/icons-material/GitHub";
import { Paper, Button, Link } from "@mui/material";
import { Org } from "fleethub-core";
import { useTranslation } from "next-i18next";
import dynamic from "next/dynamic";
import React, { useMemo } from "react";

import { useAppDispatch, useAppSelector } from "../../../hooks";
import { appSlice } from "../../../store";
import { createGkcoiDeck, GkcoiLang, GkcoiTheme } from "../../../utils";
import { Flexbox } from "../../atoms";
import { Select } from "../../molecules";

const ReactGkcoi = dynamic(() => import("./ReactGkcoi"), { ssr: false });

const THEME_NAMES: Record<GkcoiTheme, string> = {
  dark: "Dark",
  white: "White",
  "dark-ex": "遠征 dark-ex",
  official: "公式 official",
  "74lc": "七四式(大型) 74lc",
  "74mc": "七四式(中型) 74mc",
  "74sb": "七四式(小型) 74sb",
} as const;

const GKCOI_THEMES = Object.keys(THEME_NAMES) as GkcoiTheme[];

const getThemeLabel = (theme: GkcoiTheme) => THEME_NAMES[theme];

const GKCOI_LANGS: Dict<string, GkcoiLang> = {
  ja: "jp",
  en: "en",
  ko: "kr",
  "zh-CN": "scn",
};

type GkcoiScreenProps = {
  org: Org;
};

const GkcoiScreen: React.FCX<GkcoiScreenProps> = ({
  className,
  style,
  org,
}) => {
  const dispatch = useAppDispatch();
  const theme = useAppSelector((root) => root.present.app.gkcoiTheme);
  const { i18n } = useTranslation();
  const lang = GKCOI_LANGS[i18n.language] || "jp";

  const deck = useMemo(
    () => createGkcoiDeck(org, { theme, lang }),
    [org, theme, lang]
  );

  const handleChange = (theme: GkcoiTheme) =>
    dispatch(appSlice.actions.setGkcoiTheme(theme));

  return (
    <Paper className={className} style={style}>
      <Flexbox gap={1} mb={1}>
        <Select
          label="theme"
          options={GKCOI_THEMES}
          value={theme}
          onChange={handleChange}
          getOptionLabel={getThemeLabel}
        />
        <Button
          startIcon={<GitHubIcon />}
          LinkComponent={Link}
          href="https://github.com/Nishisonic/gkcoi"
        >
          Nishisonic/gkcoi
        </Button>
      </Flexbox>
      <ReactGkcoi deck={deck} />
    </Paper>
  );
};

export default styled(GkcoiScreen)`
  padding: 8px;
`;
