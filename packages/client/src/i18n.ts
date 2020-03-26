import i18n from "i18next"
import { initReactI18next } from "react-i18next"

const resources = {
  en: {
    translation: {
      gears: "gears",
      ships: "ships",
    },
  },
  ja: {
    translation: {
      gears: "装備",
      ships: "艦娘",
    },
  },
}

i18n.use(initReactI18next).init({
  lng: "en",
  fallbackLng: "en",
  debug: true,

  interpolation: {
    escapeValue: false,
  },

  react: {
    wait: true,
  },
  resources: resources,
})

export default i18n
