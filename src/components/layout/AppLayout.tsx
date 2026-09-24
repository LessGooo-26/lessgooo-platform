import { useEffect, useRef, type ReactNode } from "react";
import { useLocation } from "react-router-dom";
import { publicRoutes } from "../../routes/public-routes";
import { findCourse } from "../../campus/lib/course-catalog";
import { useLocale } from "../../i18n/LocaleContext";
import { Footer } from "./Footer";
import { Header } from "./Header";

export function AppLayout({ children }: { children: ReactNode }) {
  const { content, locale } = useLocale();
  const location = useLocation();
  const previousPath = useRef(location.pathname);
  useEffect(() => {
    const routeId = Object.entries(publicRoutes).find(
      ([, path]) => path === location.pathname,
    )?.[0] as keyof typeof content.navigation | undefined;
    const course = location.pathname.startsWith("/courses/")
      ? findCourse(location.pathname.split("/")[2])
      : undefined;
    document.title =
      "LESSGOOO · " +
      ((location.pathname === "/school"
        ? locale === "fr"
          ? "Soutien scolaire"
          : "School support"
        : undefined) ||
        course?.title[locale] ||
        (routeId ? content.navigation[routeId] : content.notFound.title));
    if (previousPath.current !== location.pathname) {
      previousPath.current = location.pathname;
      document.getElementById("main-content")?.focus();
      document
        .getElementById("main-content")
        ?.scrollIntoView?.({ block: "start" });
    }
  }, [location.pathname, content, locale]);

  return (
    <div className="site-shell">
      <a
        className="skip-link"
        href="#main-content"
        onClick={(event) => {
          event.preventDefault();
          document.getElementById("main-content")?.focus();
        }}
      >
        {content.shell.skipToContent}
      </a>
      <Header />
      <main id="main-content" tabIndex={-1}>
        {children}
      </main>
      <Footer />
    </div>
  );
}
