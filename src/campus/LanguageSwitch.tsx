import { useLanguage } from "./lib/language";
export function LanguageSwitch() {
  const { locale, setLanguage } = useLanguage();
  return (
    <label className="language-switch">
      <span className="sr-only">Language / Langue</span>
      <select
        aria-label="Language / Langue"
        value={locale}
        onChange={(e) => setLanguage(e.target.value as "en" | "fr")}
      >
        <option value="en">EN · English</option>
        <option value="fr">FR · Français</option>
      </select>
    </label>
  );
}
