/* eslint-disable @typescript-eslint/no-empty-interface */
import type {} from "@emotion/react/types/css-prop";

declare module "react" {
  // eslint-disable-next-line @typescript-eslint/ban-types
  type FCX<P = {}> = FC<P & { className?: string; style?: CSSProperties }>;
}

declare module "@reduxjs/toolkit" {
  export type AppThunk = import("./store").AppThunk;
  export type AppStore = import("./store").AppStore;
}

declare module "redux-persist" {
  interface PersistConfig {
    deserialize?: boolean;
  }
}

declare module "@emotion/react" {
  type MyTheme = import("./styles").Theme;
  export interface Theme extends MyTheme {}
}

declare module "@mui/system/createTheme" {
  type Colors = typeof import("./styles/colors")["colors"];

  interface Theme {
    colors: Colors;
    styles: import("./styles").ThemeStyles;
  }
}

declare module "react-i18next" {
  interface CustomTypeOptions {
    resources: {
      common: typeof import("../public/locales/en/common.json");
      gear_types: string[];
      stype: Record<string, string>;
      ctype: Record<string, string>;
      ships: Record<string, string>;
      gears: Record<string, string>;
    };
  }
}

declare module "*.png" {
  const path: string;
  export default path;
}

declare global {
  namespace NodeJS {
    interface ProcessEnv {
      readonly KCS_SCRIPT: string;
      readonly VERSION: string;
    }
  }
}
