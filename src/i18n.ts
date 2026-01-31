import { BASE_PATH } from "./constants";

export interface Language {
  code: string;
  name: string;
  nativeName: string;
}

export const SUPPORTED_LANGUAGES: Language[] = [
  { code: "en", name: "English", nativeName: "English" },
  { code: "fr", name: "French", nativeName: "Français" },
  { code: "pt", name: "Portuguese", nativeName: "Português" },
];

let currentLanguage = "en";
let translations: Record<string, unknown> = {};

export const getCurrentLanguage = (): string => currentLanguage;

export const setCurrentLanguage = (lang: string): void => {
  currentLanguage = lang;
};

export const loadTranslations = async (lang: string): Promise<void> => {
  const response = await fetch(`${BASE_PATH}/locales/${lang}.json`);
  translations = await response.json();
};

export const t = (key: string): string => {
  const keys = key.split(".");
  let value: unknown = translations;

  for (const k of keys) {
    if (value && typeof value === "object" && k in value) {
      value = (value as Record<string, unknown>)[k];
    } else {
      return key; // Return key as fallback
    }
  }

  return typeof value === "string" ? value : key;
};

export const detectBrowserLanguage = (): string => {
  const browserLang = navigator.language.split("-")[0];
  const supported = SUPPORTED_LANGUAGES.find((l) => l.code === browserLang);
  return supported ? supported.code : "en";
};
