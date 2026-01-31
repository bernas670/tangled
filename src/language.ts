import {
  SUPPORTED_LANGUAGES,
  getCurrentLanguage,
  setCurrentLanguage,
  loadTranslations,
  t,
} from "./i18n";
import { setStoredLanguage } from "./storage";
import { reloadGameData } from "./puzzle";

let dropdown: HTMLElement | null = null;

export const setupLanguageSelector = (): void => {
  const languageBtn = document.getElementById("language-btn");
  if (!languageBtn) return;

  // Create dropdown
  dropdown = document.createElement("div");
  dropdown.className = "language-dropdown";
  dropdown.hidden = true;

  SUPPORTED_LANGUAGES.forEach((lang) => {
    const option = document.createElement("button");
    option.className = "language-option";
    option.dataset.lang = lang.code;
    option.textContent = lang.nativeName;
    if (lang.code === getCurrentLanguage()) {
      option.classList.add("active");
    }
    option.addEventListener("click", () => changeLanguage(lang.code));
    dropdown!.appendChild(option);
  });

  languageBtn.parentElement?.appendChild(dropdown);

  // Toggle dropdown on button click
  languageBtn.addEventListener("click", (e) => {
    e.stopPropagation();
    if (dropdown) {
      dropdown.hidden = !dropdown.hidden;
    }
  });

  // Close dropdown when clicking outside
  document.addEventListener("click", () => {
    if (dropdown) {
      dropdown.hidden = true;
    }
  });
};

export const applyTranslations = (): void => {
  // Apply text content translations
  document.querySelectorAll("[data-i18n]").forEach((el) => {
    const key = el.getAttribute("data-i18n");
    if (key) {
      el.textContent = t(key);
    }
  });

  // Apply HTML content translations
  document.querySelectorAll("[data-i18n-html]").forEach((el) => {
    const key = el.getAttribute("data-i18n-html");
    if (key) {
      el.innerHTML = t(key);
    }
  });

  // Apply aria-label translations
  document.querySelectorAll("[data-i18n-aria]").forEach((el) => {
    const key = el.getAttribute("data-i18n-aria");
    if (key) {
      el.setAttribute("aria-label", t(key));
    }
  });

  // Update active language in dropdown
  if (dropdown) {
    dropdown.querySelectorAll(".language-option").forEach((option) => {
      const lang = (option as HTMLElement).dataset.lang;
      option.classList.toggle("active", lang === getCurrentLanguage());
    });
  }
};

export const changeLanguage = async (lang: string): Promise<void> => {
  if (lang === getCurrentLanguage()) {
    if (dropdown) dropdown.hidden = true;
    return;
  }

  setCurrentLanguage(lang);
  setStoredLanguage(lang);

  await Promise.all([loadTranslations(lang), reloadGameData(lang)]);

  applyTranslations();

  if (dropdown) {
    dropdown.hidden = true;
  }
};
