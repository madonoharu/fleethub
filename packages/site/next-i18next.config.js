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
};
