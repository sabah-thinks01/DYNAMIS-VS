export type AppLanguage = "en" | "ta" | "hi";

const LANGUAGE_KEY = "dynamis-language";
let memoryLanguage: AppLanguage = "en";

export function getLanguage(): AppLanguage {
  if (typeof window === "undefined") return "en";
  try {
    const raw = localStorage.getItem(LANGUAGE_KEY);
    if (raw === "ta" || raw === "hi" || raw === "en") {
      return raw;
    }
    return memoryLanguage;
  } catch {
    return memoryLanguage;
  }
}

export function setLanguage(lang: AppLanguage): void {
  memoryLanguage = lang;
  if (typeof window === "undefined") return;
  try {
    localStorage.setItem(LANGUAGE_KEY, lang);
  } catch (e) {
    console.warn("Could not save language to localStorage:", e);
  }
}
