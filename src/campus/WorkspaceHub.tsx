import {
  useEffect,
  useRef,
  useState,
  useImperativeHandle,
  type Ref,
} from "react";
import {
  ArrowRight,
  BookOpen,
  Clock3,
  Grid3X3,
  Search,
  Star,
  Settings2,
} from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "./components/ui/dialog";
import { useLanguage, tx } from "./lib/language";
import {
  visibleTools,
  navigationGroups,
  normalizeSearch,
  type CampusTool,
  type WorkspacePreferences,
} from "./lib/campus-navigation";
import { courseCatalog } from "./lib/course-catalog";
import type { Lesson, Persona } from "./lib/model";
import type { SearchResult } from "./StudioPanel";
import "./workspace-hub.css";
type WorkspaceMode = "tools" | "search" | null;
export type WorkspaceLauncherHandle = {
  openTools: (trigger: HTMLElement) => void;
};
type BaseProps = {
  persona: Persona;
  preferences: WorkspacePreferences;
  go: (page: string) => boolean | void;
  openTools: (trigger: HTMLElement) => void;
};
function ToolIcon({ tool }: { tool: CampusTool }) {
  const Icon = tool.icon;
  return (
    <span className={"suite-icon suite-icon-" + tool.tone}>
      <Icon size={22} aria-hidden="true" />
    </span>
  );
}
export function WorkspaceWelcome({
  persona,
  preferences,
  go,
  openTools,
}: BaseProps) {
  const { t, locale } = useLanguage();
  const tools = visibleTools(persona);
  const pinned = preferences.pinned
    .map((id) => tools.find((tool) => tool.id === id))
    .filter((tool): tool is CampusTool => !!tool);
  const recent = preferences.recent
    .map((id) => tools.find((tool) => tool.id === id))
    .filter((tool): tool is CampusTool => !!tool);
  return (
    <section
      className="suite-welcome"
      aria-label={t("My workspace", "Mon espace de travail")}
    >
      <div className="suite-welcome-heading">
        <div>
          <p className="suite-kicker">
            {t("YOUR LESSGOOO WORKSPACE", "VOTRE ESPACE LESSGOOO")}
          </p>
          <h2>
            {t(
              "A little focus. A new possibility.",
              "Un peu de pratique. Une nouvelle possibilité.",
            )}
          </h2>
          <p>
            {t(
              "Your lessons, ideas and projects, together. Choose a tool and pick up where you left off.",
              "Vos leçons, vos idées et vos projets au même endroit. Choisissez un outil et reprenez votre travail.",
            )}
          </p>
        </div>
        <button
          type="button"
          className="suite-customize"
          onClick={(e) => openTools(e.currentTarget)}
        >
          <Settings2 size={17} />
          {t("Customize", "Personnaliser")}
        </button>
      </div>
      <div className="suite-pinned-grid">
        {pinned.map((tool) => (
          <button
            type="button"
            className="suite-shortcut"
            key={tool.id}
            onClick={() => go(tool.id)}
          >
            <ToolIcon tool={tool} />
            <strong>{tx(tool.label)}</strong>
            <span>{tool.description[locale]}</span>
            <ArrowRight size={17} aria-hidden="true" />
          </button>
        ))}
        {pinned.length === 0 && (
          <p className="suite-empty">
            {t(
              "Pin your favorite tools with Customize to keep them here.",
              "Épinglez vos outils préférés avec Personnaliser pour les retrouver ici.",
            )}
          </p>
        )}
      </div>
      {recent.length > 0 && (
        <div className="suite-recent">
          <span>
            <Clock3 size={16} />
            {t("Recent spaces", "Espaces récents")}
          </span>
          {recent.map((tool) => (
            <button type="button" key={tool.id} onClick={() => go(tool.id)}>
              {tx(tool.label)}
              <ArrowRight size={13} />
            </button>
          ))}
        </div>
      )}
    </section>
  );
}
export function WorkspaceHub({
  persona,
  preferences,
  lessons,
  go,
  ref,
  onPin,
  clearRecent,
  openResult,
  searchCampus,
}: {
  persona: Persona;
  preferences: WorkspacePreferences;
  lessons: Lesson[];
  go: (page: string) => boolean | void;
  ref?: Ref<WorkspaceLauncherHandle>;
  onPin: (id: string) => void;
  clearRecent: () => void;
  openResult: (result: SearchResult) => boolean | void;
  searchCampus: (query: string) => boolean | void;
}) {
  const [mode, setMode] = useState<WorkspaceMode>(null);
  const { locale, t } = useLanguage(),
    [query, setQuery] = useState(""),
    [notice, setNotice] = useState(false);
  const trigger = useRef<HTMLElement | null>(null),
    handingOff = useRef(false),
    searchInput = useRef<HTMLInputElement>(null);
  const tools = visibleTools(persona),
    words = normalizeSearch(query).split(/\s+/).filter(Boolean);
  const matches = (text: string) =>
    words.every((word) => normalizeSearch(text).includes(word));
  const matchedTools = tools.filter((tool) =>
    matches(tx(tool.label) + " " + tool.description[locale]),
  );
  const matchedLessons = words.length
    ? lessons
        .filter((l) => matches(tx(l.title) + " " + tx(l.module)))
        .slice(0, 6)
    : [];
  const matchedCourses =
    words.length && persona !== "child"
      ? courseCatalog
          .filter((c) => matches(c.title[locale] + " " + c.description[locale]))
          .slice(0, 4)
      : [];
  const show = (next: WorkspaceMode, element?: HTMLElement) => {
    trigger.current =
      element ||
      (document.activeElement instanceof HTMLElement
        ? document.activeElement
        : null);
    handingOff.current = false;
    setQuery("");
    setNotice(false);
    setMode(next);
  };
  useImperativeHandle(ref, () => ({
    openTools: (element) => show("tools", element),
  }));
  useEffect(() => {
    const shortcut = (event: KeyboardEvent) => {
      if (
        !(event.ctrlKey || event.metaKey) ||
        event.key.toLowerCase() !== "k" ||
        event.altKey ||
        event.isComposing
      )
        return;
      // Do not steal the shortcut from an active lesson/editor dialog.
      if (document.querySelector('[role="dialog"]') && !mode) return;
      event.preventDefault();
      if (mode) {
        searchInput.current?.focus();
        return;
      }
      trigger.current =
        document.activeElement instanceof HTMLElement
          ? document.activeElement
          : null;
      handingOff.current = false;
      setQuery("");
      setNotice(false);
      setMode("search");
    };
    window.addEventListener("keydown", shortcut);
    return () => window.removeEventListener("keydown", shortcut);
  }, [mode, setMode]);
  const leave = (action: () => boolean | void) => {
    if (action() === false) return;
    handingOff.current = true;
    setMode(null);
  };
  return (
    <>
      <div className="suite-toolbar">
        <button
          type="button"
          className="suite-search-trigger"
          aria-keyshortcuts="Control+k Meta+k"
          onClick={(e) => show("search", e.currentTarget)}
        >
          <Search size={19} />
          <span>{t("Search your campus", "Rechercher dans le campus")}</span>
          <kbd>Ctrl K</kbd>
        </button>
        <button
          type="button"
          className="suite-apps-trigger"
          onClick={(e) => show("tools", e.currentTarget)}
          aria-label={t("All campus tools", "Tous les outils du campus")}
          title={t("All campus tools", "Tous les outils du campus")}
        >
          <Grid3X3 size={21} />
          <span>{t("Tools", "Outils")}</span>
        </button>
      </div>
      <Dialog
        open={mode !== null}
        onOpenChange={(open) => {
          if (!open) setMode(null);
        }}
      >
        <DialogContent
          className="suite-dialog"
          onOpenAutoFocus={(e) => {
            e.preventDefault();
            searchInput.current?.focus();
          }}
          onCloseAutoFocus={(e) => {
            e.preventDefault();
            if (!handingOff.current) trigger.current?.focus();
            else
              requestAnimationFrame(() => {
                if (!document.querySelector('[role="dialog"]'))
                  document.getElementById("campus-main")?.focus();
              });
          }}
        >
          <DialogHeader>
            <DialogTitle>
              {mode === "tools"
                ? t("Your tools, in one place", "Vos outils, au même endroit")
                : t("Find your next step", "Trouvez votre prochaine étape")}
            </DialogTitle>
            <DialogDescription>
              {t(
                "Open a space or a lesson. Use the stars to keep up to six shortcuts on your home page.",
                "Ouvrez un espace ou une leçon. Utilisez les étoiles pour garder jusqu’à six raccourcis sur votre accueil.",
              )}
            </DialogDescription>
          </DialogHeader>
          <form
            className="suite-search-form"
            onSubmit={(e) => {
              e.preventDefault();
              leave(() => searchCampus(query.trim()));
            }}
          >
            <Search size={20} />
            <input
              ref={searchInput}
              type="search"
              aria-label={t(
                "Find a tool or lesson",
                "Trouver un outil ou une leçon",
              )}
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder={t(
                "Try notes, Linux, cloud…",
                "Essayez notes, Linux, cloud…",
              )}
            />
            <button
              type="submit"
              aria-label={t(
                "Search all campus content",
                "Chercher dans tout le campus",
              )}
              title={t(
                "Search all campus content",
                "Chercher dans tout le campus",
              )}
            >
              <ArrowRight size={20} />
            </button>
          </form>
          <div className="suite-results">
            {!words.length && (
              <div className="suite-launcher-note">
                <Star size={15} />
                <span>
                  {preferences.pinned.length}/6{" "}
                  {t(
                    "pinned shortcuts · saved for this profile in this browser",
                    "raccourcis épinglés · conservés pour ce profil dans ce navigateur",
                  )}
                </span>
              </div>
            )}
            {navigationGroups.map((group) => {
              const entries = matchedTools.filter(
                (tool) => tool.group === group.id,
              );
              if (!entries.length) return null;
              return (
                <section
                  className="suite-tool-group"
                  key={group.id}
                  aria-label={group[locale]}
                >
                  <h3>{group[locale]}</h3>
                  <div className="suite-tools-grid">
                    {entries.map((tool) => {
                      const pinned = preferences.pinned.includes(tool.id),
                        pinnable = !["dashboard", "search"].includes(tool.id);
                      return (
                        <div className="suite-tool" key={tool.id}>
                          <button
                            type="button"
                            className="suite-tool-open"
                            onClick={() => leave(() => go(tool.id))}
                          >
                            <ToolIcon tool={tool} />
                            <strong>{tx(tool.label)}</strong>
                            <span>{tool.description[locale]}</span>
                          </button>
                          {pinnable && (
                            <button
                              type="button"
                              className="suite-pin"
                              aria-pressed={pinned}
                              aria-label={
                                (pinned
                                  ? t("Unpin ", "Désépingler ")
                                  : t("Pin ", "Épingler ")) + tx(tool.label)
                              }
                              aria-disabled={
                                !pinned && preferences.pinned.length >= 6
                              }
                              onClick={() => {
                                if (!pinned && preferences.pinned.length >= 6) {
                                  setNotice(true);
                                  return;
                                }
                                setNotice(false);
                                onPin(tool.id);
                              }}
                            >
                              <Star
                                size={16}
                                fill={pinned ? "currentColor" : "none"}
                              />
                            </button>
                          )}
                        </div>
                      );
                    })}
                  </div>
                </section>
              );
            })}
            {matchedCourses.length > 0 && (
              <section className="suite-tool-group">
                <h3>{t("Course areas", "Domaines de formation")}</h3>
                {matchedCourses.map((course) => (
                  <button
                    type="button"
                    className="suite-result-row"
                    key={course.id}
                    onClick={() =>
                      leave(() =>
                        openResult({
                          id: course.id,
                          title: course.title[locale],
                          text: "",
                          page: "courses",
                          type: "courses",
                        }),
                      )
                    }
                  >
                    <BookOpen size={18} />
                    <span>
                      <strong>{course.title[locale]}</strong>
                      <small>
                        {t(
                          "Course outline and company service",
                          "Parcours de formation et service aux entreprises",
                        )}
                      </small>
                    </span>
                    <ArrowRight size={17} />
                  </button>
                ))}
              </section>
            )}
            {matchedLessons.length > 0 && (
              <section className="suite-tool-group">
                <h3>{t("Your lessons", "Vos leçons")}</h3>
                {matchedLessons.map((lesson) => (
                  <button
                    type="button"
                    className="suite-result-row"
                    key={lesson.id}
                    onClick={() =>
                      leave(() =>
                        openResult({
                          id: lesson.id,
                          title: tx(lesson.title),
                          text: "",
                          page: "courses",
                          type: "lessons",
                        }),
                      )
                    }
                  >
                    <BookOpen size={18} />
                    <span>
                      <strong>{tx(lesson.title)}</strong>
                      <small>{tx(lesson.module)}</small>
                    </span>
                    <ArrowRight size={17} />
                  </button>
                ))}
              </section>
            )}
            {words.length &&
            matchedTools.length +
              matchedLessons.length +
              matchedCourses.length ===
              0 ? (
              <p className="suite-empty">
                {t(
                  "No tool or lesson matches yet. Search the whole campus to include notes, files and homework.",
                  "Aucun outil ni aucune leçon ne correspond. Étendez la recherche aux notes, fichiers et devoirs du campus.",
                )}
              </p>
            ) : null}
          </div>
          {notice && (
            <p role="status" className="suite-pin-notice">
              {t(
                "Six shortcuts are already pinned. Remove a star before adding another.",
                "Six raccourcis sont déjà épinglés. Retirez une étoile avant d’en ajouter un autre.",
              )}
            </p>
          )}
          <footer className="suite-dialog-footer">
            <button
              type="button"
              onClick={() => leave(() => searchCampus(query.trim()))}
            >
              {t("Search all content", "Chercher dans tous les contenus")}
              <ArrowRight size={16} />
            </button>
            {preferences.recent.length > 0 && (
              <button type="button" onClick={clearRecent}>
                {t("Clear recent spaces", "Effacer les espaces récents")}
              </button>
            )}
          </footer>
        </DialogContent>
      </Dialog>
    </>
  );
}
