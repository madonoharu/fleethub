import TranslateIcon from "@mui/icons-material/Translate";
import { useRouter } from "next/router";
import React from "react";

import { SelectedMenu } from "../../molecules";

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
  const router = useRouter();

  const handleChange = (lng: string) => {
    void router.replace(router.asPath, undefined, { locale: lng });
  };

  return (
    <SelectedMenu
      className={className}
      startIcon={<TranslateIcon fontSize="small" />}
      options={router.locales || []}
      value={router.locale || ""}
      onChange={handleChange}
      getOptionLabel={getLanguageName}
    />
  );
};

export default LanguageSelect;
