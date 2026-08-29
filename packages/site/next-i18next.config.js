// @ts-check
/** @type {import("next-i18next").UserConfig} */
module.exports = {
  i18n: {
    defaultLocale: "ja",
    locales: ["ja", "en", "ko", "zh-CN", "zh-TW"],
  },
  localePath: "./public/locales",
  returnNull: false,
  returnEmptyString: false,
  // これがないと翻訳ファイルはサーバ起動時に一度読むだけになり、
  // dev で common.json を編集してもキー名が生のまま表示され続ける。
  reloadOnPrerender: process.env.NODE_ENV === "development",
};
