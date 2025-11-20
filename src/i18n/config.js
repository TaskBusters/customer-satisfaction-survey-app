import i18n from "i18next"
import { initReactI18next } from "react-i18next"
import enTranslations from "./locales/en.json"
import filTranslations from "./locales/fil.json"

const getInitialLanguage = () => {
  const stored = localStorage.getItem("i18nextLng")
  if (stored) return stored
  
  const browserLang = navigator.language || navigator.userLanguage
  if (browserLang.startsWith("fil") || browserLang.startsWith("tl")) return "fil"
  return "en"
}

i18n
  .use(initReactI18next)
  .init({
    fallbackLng: "en",
    lng: getInitialLanguage(),
    resources: {
      en: { translation: enTranslations },
      fil: { translation: filTranslations },
    },
    interpolation: {
      escapeValue: false,
    },
  })

export default i18n
