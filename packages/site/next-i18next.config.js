const path = require("path");

// @ts-check
/** @type {import("next-i18next").UserConfig} */
module.exports = {
  i18n: {
    defaultLocale: "ja",
    locales: ["ja", "en", "ko", "zh-CN", "zh-TW"],
  },
  localePath: path.resolve("./public/locales"),
};
