import {
  createContext,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import { siteContent, type Locale } from "../content/site-content";

type LocaleContextValue = {
  locale: Locale;
  setLocale: (locale: Locale) => void;
  content: (typeof siteContent)[Locale];
};

const LocaleContext = createContext<LocaleContextValue | null>(null);

export function LocaleProvider({ children }: { children: ReactNode }) {
  const [locale, setLocale] = useState<Locale>(() => {
    try {
      return localStorage.getItem("lessgooo-language") === "fr" ? "fr" : "en";
    } catch {
      return "en";
    }
  });

  useEffect(() => {
    document.documentElement.lang = locale;
    try {
      localStorage.setItem("lessgooo-language", locale);
    } catch {
      /* Use the in-memory choice. */
    }
  }, [locale]);

  const value = useMemo(
    () => ({ locale, setLocale, content: siteContent[locale] }),
    [locale],
  );

  return (
    <LocaleContext.Provider value={value}>{children}</LocaleContext.Provider>
  );
}

// The provider and its paired hook intentionally share this small module.
// eslint-disable-next-line react-refresh/only-export-components
export function useLocale() {
  const context = useContext(LocaleContext);

  if (!context) {
    throw new Error("useLocale must be used within LocaleProvider");
  }

  return context;
}
