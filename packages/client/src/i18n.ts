import NextI18Next from "next-i18next"
import path from "path"

const languageNameMap = {
  ja: "日本語",
  en: "English",
  ko: "한국어",
  "zh-CN": "中文(简体)",
  "zh-TW": "中文(繁體)",
}

export const allLanguages = Object.keys(languageNameMap)

export const getLanguageName = (lang: string) => languageNameMap[lang as keyof typeof languageNameMap] || ""

const { appWithTranslation, withTranslation, useTranslation } = new NextI18Next({
  defaultLanguage: "ja",
  otherLanguages: allLanguages,
  localePath: path.resolve("./public/locales"),
  shallowRender: true,
})

export { appWithTranslation, withTranslation, useTranslation }
