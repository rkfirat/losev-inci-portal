import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import * as Localization from 'expo-localization';
import tr from './locales/tr.json';
import en from './locales/en.json';

// Polling for plural rules if needed (for older environments)
import 'intl-pluralrules';

const resources = {
  tr: { translation: tr },
  en: { translation: en },
};

// Get device language
const deviceLanguage = Localization.getLocales()[0].languageCode;

i18n
  .use(initReactI18next)
  .init({
    resources,
    lng: deviceLanguage === 'tr' ? 'tr' : 'en', // Default to 'en' if not 'tr'
    fallbackLng: 'tr', // LÖSEV project defaults to Turkish
    interpolation: {
      escapeValue: false,
    },
    compatibilityJSON: 'v4',
  });

export default i18n;
