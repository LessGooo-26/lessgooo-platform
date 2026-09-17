import { useSyncExternalStore } from "react";
import english from "./english.json";
import french from "./french.json";
let language: "en" | "fr" = "en";
try {
  if (localStorage.getItem("lessgooo-language") === "fr") language = "fr";
} catch {
  /* Storage may be disabled. */
}
const listeners = new Set<() => void>();
const subscribe = (callback: () => void) => {
  listeners.add(callback);
  return () => {
    listeners.delete(callback);
  };
};
export function setLanguage(value: "en" | "fr") {
  language = value;
  document.documentElement.lang = value;
  try {
    localStorage.setItem("lessgooo-language", value);
  } catch {
    /* Choice still works for this visit. */
  }
  listeners.forEach((callback) => callback());
}
export const localeCode = () => (language === "en" ? "en-GB" : "fr-FR");
export function tx<T>(value: T): T {
  if (typeof value !== "string") return value;
  if (language === "fr")
    return ((french as Record<string, string>)[value] ?? value) as T;
  const found = (english as Record<string, string>)[value];
  if (found !== undefined) return found as T;
  const patterns: [RegExp, (match: RegExpMatchArray) => string][] = [
    [/^Monter le bloc (\d+)$/, (m) => `Move block ${m[1]} up`],
    [/^Supprimer le bloc (\d+)$/, (m) => `Delete block ${m[1]}`],
    [/^Contenu du bloc (\d+)$/, (m) => `Block ${m[1]} content`],
    [/^Terminer : (.+)$/, (m) => `Complete: ${m[1]}`],
    [/^Aide : (.+)$/, (m) => `Help: ${tx(m[1])}`],
    [/^Présence de (.+)$/, (m) => `Attendance: ${m[1]}`],
    [
      /^Vous disposez de (\d+) crédit\(s\)\. Une réservation utilise un crédit\.$/,
      (m) => `You have ${m[1]} credit(s). A booking uses one credit.`,
    ],
    [
      /^Confirmez uniquement après vérification de (.+)\. Aucun encaissement n’est effectué par ce bouton\.$/,
      (m) =>
        `Confirm only after checking ${m[1]}. This button does not charge money.`,
    ],
    [/^Clé configurée · (.+)$/, (m) => `Key configured · ${m[1]}`],
    [
      /^Renseignez (.+)\. Cette valeur sera enregistrée dans le campus local\.$/,
      () => "Fill in this field. It will be saved in the local campus.",
    ],
  ];
  for (const [pattern, render] of patterns) {
    const match = value.match(pattern);
    if (match) return render(match) as T;
  }
  return value;
}
export function useLanguage() {
  const locale = useSyncExternalStore(
    subscribe,
    () => language,
    () => "en" as const,
  );
  return {
    locale,
    setLanguage,
    t: (en: string, fr: string) => (locale === "en" ? en : fr),
  };
}
