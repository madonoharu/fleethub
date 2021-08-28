/** @type {import('@jest/types').Config.InitialOptions} */
module.exports = {
  transform: {
    "^.+\\.(j|t)sx?$": "esbuild-jest",
  },
};
