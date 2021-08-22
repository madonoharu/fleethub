import styled from "@emotion/styled";
import TranslateIcon from "@material-ui/icons/Translate";
import { useRouter } from "next/router";
import React from "react";

import { Select } from "../../molecules";

const languageNameMap = {
  ja: "日本語",
  en: "English",
  ko: "한국어",
  "zh-CN": "中文(简体)",
  "zh-TW": "中文(繁體)",
};

const getLanguageName = (lang: string) =>
  languageNameMap[lang as keyof typeof languageNameMap] || "";

const LanguageSelect: React.FCX = ({ className }) => {
  const { replace, locales, locale } = useRouter();
  const handleChange = React.useCallback(
    (lng: string) => replace("/", undefined, { locale: lng }),
    [replace]
  );
  return (
    <Select
      className={className}
      startLabel={<TranslateIcon fontSize="inherit" />}
      options={locales || []}
      value={locale || ""}
      onChange={handleChange}
      getOptionLabel={getLanguageName}
    />
  );
};

export default LanguageSelect;
