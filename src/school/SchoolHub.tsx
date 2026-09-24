import { lazy, Suspense, useEffect, useState } from "react";
import {
  BookOpen,
  CalendarDays,
  FileText,
  GraduationCap,
  Search,
  Target,
  TrendingUp,
  Settings,
  ArrowRight,
  CheckCircle2,
} from "lucide-react";
import { useLanguage } from "../campus/lib/language";
import type { Persona } from "../campus/lib/model";
import { initialCatalog } from "./catalog";
import publishedCatalog from "./published-catalog.json";
import { publicSnapshot } from "./public-snapshot";
import { schoolRequest, schoolError } from "./api";
import {
  type CatalogSnapshot,
  type SchoolProgress,
  type SchoolProfile,
  type Attempt,
  type Resource,
} from "./model";
import { SchoolQuiz, PracticeGenerator } from "./SchoolQuiz";
import { SchoolOrientation } from "./SchoolOrientation";
import { SchoolPresence } from "./SchoolPresence";
import { LessonIllustration } from "./LessonIllustration";
import { SchoolMedia } from "./SchoolMedia";
import "./school.css";

const SchoolEditor = lazy(() => import("./SchoolEditor"));
type Tab =
  | "learn"
  | "practice"
  | "resources"
  | "timetable"
  | "progress"
  | "orientation"
  | "manage";
const normalize = (s: string) =>
  s
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase();
const emptyProgress: SchoolProgress = { profile: null, attempts: [] };
const referenceCatalog = publishedCatalog
  ? publicSnapshot(publishedCatalog)
  : initialCatalog;
export default function SchoolHub({ persona }: { persona?: Persona }) {
  const HeroTitle = persona ? "h2" : "h1";
  const { locale } = useLanguage(),
    fr = locale === "fr",
    text = (f: string, e: string) => (fr ? f : e);
  const [snapshot, setSnapshot] = useState<CatalogSnapshot>({
      catalog: referenceCatalog,
      version: 0,
    }),
    [online, setOnline] = useState(false),
    [loading, setLoading] = useState(true),
    [tab, setTab] = useState<Tab>("learn"),
    [system, setSystem] = useState("fr"),
    [classId, setClassId] = useState("fr-3e"),
    [subjectId, setSubjectId] = useState(""),
    [search, setSearch] = useState(""),
    [selected, setSelected] = useState(""),
    [resourceKind, setResourceKind] = useState(""),
    [progress, setProgress] = useState<SchoolProgress>(emptyProgress),
    [error, setError] = useState("");
  const [report, setReport] = useState<
    { id: string; name: string; attempts: Attempt[] }[]
  >([]);
  useEffect(() => {
    if (selected) {
      const content = document.getElementById("school-content");
      content?.focus();
      content?.scrollIntoView?.({ block: "start" });
    }
  }, [selected]);
  useEffect(() => {
    let live = true;
    void Promise.allSettled([
      schoolRequest<CatalogSnapshot>("catalog", persona),
      persona
        ? schoolRequest<SchoolProgress>("progress", persona)
        : Promise.resolve(emptyProgress),
    ]).then(([catalogResult, progressResult]) => {
      if (!live) return;
      const nextCatalog =
        catalogResult.status === "fulfilled"
          ? catalogResult.value.catalog
          : referenceCatalog;
      if (catalogResult.status === "fulfilled") {
        setSnapshot(catalogResult.value);
        setOnline(true);
      } else setOnline(false);
      const saved =
        progressResult.status === "fulfilled"
          ? progressResult.value
          : emptyProgress;
      setProgress(saved);
      if (persona && progressResult.status === "rejected")
        setError(
          fr
            ? "Le suivi enregistré n'est pas disponible pour le moment."
            : "Saved progress is currently unavailable.",
        );
      const selectedClass =
        nextCatalog.classes.find(
          (c) => c.id === saved.profile?.classId && c.active,
        ) ||
        nextCatalog.classes.find((c) => c.id === "fr-3e" && c.active) ||
        nextCatalog.classes.find((c) => c.active);
      if (selectedClass) {
        setClassId(selectedClass.id);
        setSystem(selectedClass.system);
      }
      setLoading(false);
    });
    return () => {
      live = false;
    };
    // Language changes should not reload the catalogue or reset a learner's selection.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [persona]);
  useEffect(() => {
    if (persona !== "teacher" || tab !== "progress") return;
    let live = true;
    void schoolRequest<typeof report>("report", persona)
      .then((data) => {
        if (live) setReport(data);
      })
      .catch(() => {});
    return () => {
      live = false;
    };
  }, [persona, tab]);
  const c = snapshot.catalog;
  const availableClasses = c.classes.filter(
    (cl) => cl.active && cl.system === system,
  );
  const currentClass = c.classes.find((cl) => cl.id === classId && cl.active);
  const chapters = c.chapters
    .filter(
      (ch) =>
        ch.published &&
        ch.classIds.includes(classId) &&
        c.subjects.some((s) => s.id === ch.subjectId && s.active) &&
        (!subjectId || ch.subjectId === subjectId) &&
        normalize(`${ch.title[locale]} ${ch.goal[locale]}`).includes(
          normalize(search),
        ),
    )
    .sort(
      (a, b) => a.subjectId.localeCompare(b.subjectId) || a.order - b.order,
    );
  const chapter = chapters.find((ch) => ch.id === selected);
  const subjects = c.subjects.filter((s) => s.active);
  const resources = c.resources.filter(
    (r) =>
      r.published &&
      (!r.classIds.length || r.classIds.includes(classId)) &&
      (!subjectId || !r.subjectId || r.subjectId === subjectId) &&
      (!resourceKind || r.kind === resourceKind) &&
      normalize(
        `${r.title[locale]} ${r.description[locale]} ${r.source} ${r.year}`,
      ).includes(normalize(search)) &&
      (!r.mediaId || persona),
  );
  const tabs = [
    { id: "learn", label: text("Apprendre", "Learn"), icon: BookOpen },
    { id: "practice", label: text("M'exercer", "Practise"), icon: Target },
    { id: "resources", label: text("Documents", "Resources"), icon: FileText },
    {
      id: "timetable",
      label: text("Horaires", "Timetable"),
      icon: CalendarDays,
    },
    { id: "progress", label: text("Progrès", "Progress"), icon: TrendingUp },
    {
      id: "orientation",
      label: text("Orientation", "Guidance"),
      icon: GraduationCap,
    },
    ...(persona === "teacher"
      ? [{ id: "manage", label: text("Gérer", "Manage"), icon: Settings }]
      : []),
  ];
  const go = (value: Tab) => {
    if (value === tab) return;
    if (
      !window.dispatchEvent(
        new Event("campus-before-navigate", { cancelable: true }),
      )
    )
      return;
    setTab(value);
    setSelected("");
    setError("");
  };
  const pickClass = (id: string) => {
    setClassId(id);
    setSelected("");
    setSearch("");
  };
  const record = async (answers: Record<string, number>) => {
    if (!chapter || !persona || persona === "parent") return;
    if (!online) throw new Error("SCHOOL_OFFLINE");
    const result = await schoolRequest<{ progress: SchoolProgress }>(
      "attempt",
      persona,
      { chapterId: chapter.id, version: snapshot.version, answers },
    );
    setProgress(result.progress);
  };
  const saveProfile = async (profile: SchoolProfile) => {
    if (!persona) {
      setProgress({ ...progress, profile });
      return;
    }
    if (!online) throw new Error("SCHOOL_OFFLINE");
    setProgress(
      await schoolRequest<SchoolProgress>("profile", persona, profile),
    );
  };
  const days = fr
    ? ["Lundi", "Mardi", "Mercredi", "Jeudi", "Vendredi", "Samedi", "Dimanche"]
    : [
        "Monday",
        "Tuesday",
        "Wednesday",
        "Thursday",
        "Friday",
        "Saturday",
        "Sunday",
      ];
  const feePeriod = {
    unknown: text("période à préciser", "period to be confirmed"),
    month: text("par mois", "per month"),
    term: text("par trimestre", "per term"),
    year: text("par an", "per year"),
    session: text("par séance", "per session"),
  }[c.billing];
  const money = (value: number) =>
    `${value.toLocaleString(fr ? "fr-FR" : "en-GB")} F CFA`;
  const subjectName = (id: string) =>
    c.subjects.find((s) => s.id === id)?.name[locale] || id;
  const latestByChapter = [
    ...new Map(
      [...progress.attempts].reverse().map((a) => [a.chapterId, a]),
    ).values(),
  ];
  return (
    <div className="school-hub">
      <header className="school-hero">
        <div>
          <span className="school-eyebrow">
            LESSGOOO ·{" "}
            {text("Soutien scolaire au Cameroun", "School support in Cameroon")}
          </span>
          <HeroTitle>
            {text(
              "Un pas de plus, chaque jour.",
              "One step forward, every day.",
            )}
          </HeroTitle>
          <p>
            {text(
              "Choisissez votre classe. Comprenez une leçon, entraînez-vous et avancez avec confiance.",
              "Choose your class. Understand a lesson, practise and move forward with confidence.",
            )}
          </p>
          <div className="school-hero-links">
            <a
              href="#school-content"
              onClick={(event) => {
                event.preventDefault();
                const target = document.getElementById("school-content");
                target?.focus();
                target?.scrollIntoView({ block: "start" });
              }}
            >
              {text("Commencer à apprendre", "Start learning")}{" "}
              <ArrowRight size={18} />
            </a>
            <a href={`${import.meta.env.BASE_URL}#/contact`}>
              {text("Demander une inscription", "Ask about enrolment")}
            </a>
          </div>
        </div>
        <div className="school-hero-art" aria-hidden="true">
          <div className="school-orbit">
            <BookOpen size={46} />
            <span>
              <CheckCircle2 size={25} />
            </span>
            <i>1 → 2 → 3</i>
          </div>
          <p>
            {text(
              "Comprendre · Essayer · Progresser",
              "Understand · Try · Improve",
            )}
          </p>
        </div>
      </header>
      <details className="school-offer">
        <summary>
          {text(
            "Répétitions : tarifs, matières et conditions",
            "Tutoring: fees, subjects and conditions",
          )}
        </summary>
        <div className="school-grid">
          <div>
            <h2>
              {text(
                "Une offre lisible pour les familles",
                "Clear information for families",
              )}
            </h2>
            <p>
              {text("Inscription", "Registration")} :{" "}
              <strong>{money(c.registration)}</strong>.
            </p>
            <p>
              {text("Frais des cours", "Tuition")} :{" "}
              <strong>{feePeriod}</strong>.
            </p>
            <p>
              {text(
                "Les autres classes du catalogue permettent de découvrir des ressources ; leur offre de répétition doit être confirmée.",
                "Other catalogue classes provide access to resources; their tutoring offer must be confirmed.",
              )}
            </p>
            <p>
              <strong>
                {text("Matières proposées : ", "Offered subjects: ")}
              </strong>
              {c.tutoringSubjectIds.map(subjectName).join(", ")}.
            </p>
          </div>
          <div className="school-price-list">
            {c.classes
              .filter((cl) => cl.tutoring && cl.active)
              .map((cl) => (
                <p key={cl.id}>
                  <span>{cl.name[locale]}</span>
                  <strong>
                    {cl.tuition === null
                      ? text("Tarif à confirmer", "Fee to confirm")
                      : money(cl.tuition)}
                  </strong>
                </p>
              ))}
          </div>
        </div>
        <p className="school-muted">
          {text(
            "Les créneaux sont affichés dans Horaires. Le lieu, le démarrage et la répartition par matière sont à confirmer. Aucun paiement n'est prélevé ici.",
            "See opening slots in Timetable. Venue, start date and subject allocation need confirmation. No payment is collected here.",
          )}
        </p>
      </details>
      <nav
        className="school-tabs"
        aria-label={text("Espace scolaire", "School space")}
      >
        {tabs.map(({ id, label, icon: Icon }) => (
          <button
            key={id}
            aria-current={tab === id ? "page" : undefined}
            onClick={() => go(id as Tab)}
          >
            <Icon size={19} aria-hidden="true" />
            <span>{label}</span>
          </button>
        ))}
      </nav>
      {tab !== "manage" && (
        <div className="school-filters">
          <label>
            {text("Sous-système", "Subsystem")}
            <select
              value={system}
              onChange={(e) => {
                setSystem(e.target.value);
                pickClass(
                  c.classes.find(
                    (cl) =>
                      cl.active &&
                      cl.system === e.target.value &&
                      cl.id === (e.target.value === "fr" ? "fr-3e" : "en-5"),
                  )?.id ||
                    c.classes.find(
                      (cl) => cl.active && cl.system === e.target.value,
                    )?.id ||
                    "",
                );
              }}
            >
              <option value="fr">{text("Francophone", "Francophone")}</option>
              <option value="en">{text("Anglophone", "Anglophone")}</option>
            </select>
          </label>
          <label>
            {text("Ma classe", "My class")}
            <select value={classId} onChange={(e) => pickClass(e.target.value)}>
              {(["primary", "secondary", "technical"] as const).map((cycle) => (
                <optgroup
                  key={cycle}
                  label={
                    cycle === "primary"
                      ? text("Primaire", "Primary")
                      : cycle === "secondary"
                        ? text("Secondaire général", "General secondary")
                        : text(
                            "Technique / professionnel",
                            "Technical / vocational",
                          )
                  }
                >
                  {availableClasses
                    .filter((cl) => cl.cycle === cycle)
                    .map((cl) => (
                      <option key={cl.id} value={cl.id}>
                        {cl.name[locale]}
                        {cl.exam ? ` · ${cl.exam}` : ""}
                      </option>
                    ))}
                </optgroup>
              ))}
            </select>
          </label>
          {["learn", "practice", "resources"].includes(tab) && (
            <>
              <label>
                {text("Matière", "Subject")}
                <select
                  value={subjectId}
                  onChange={(e) => {
                    setSubjectId(e.target.value);
                    setSelected("");
                  }}
                >
                  <option value="">
                    {text("Toutes les matières", "All subjects")}
                  </option>
                  {subjects.map((s) => (
                    <option key={s.id} value={s.id}>
                      {s.name[locale]}
                    </option>
                  ))}
                </select>
              </label>
              <label className="school-search">
                <span>
                  <Search size={16} /> {text("Rechercher", "Search")}
                </span>
                <input
                  type="search"
                  value={search}
                  onChange={(e) => {
                    setSearch(e.target.value);
                    setSelected("");
                  }}
                  placeholder={text(
                    "Un chapitre, un thème…",
                    "A chapter, a topic…",
                  )}
                />
              </label>
            </>
          )}
        </div>
      )}
      {loading && (
        <p role="status">
          {text("Chargement du catalogue…", "Loading catalogue…")}
        </p>
      )}
      {!loading && !online && (
        <p className="school-note">
          {text(
            "Catalogue de référence consultable. Le suivi et les modifications nécessitent le serveur local ; les essais libres restent disponibles.",
            "Reference catalogue available. Saved progress and editing require the local server; free practice remains available.",
          )}
        </p>
      )}
      {error && (
        <p role="alert" className="school-error">
          {error}
        </p>
      )}
      <div id="school-content" className="school-content" tabIndex={-1}>
        {(tab === "learn" || tab === "practice") && (
          <>
            {chapter ? (
              <article className="school-lesson">
                <button className="school-back" onClick={() => setSelected("")}>
                  ← {text("Retour aux chapitres", "Back to chapters")}
                </button>
                <span className="school-tag">
                  {subjectName(chapter.subjectId)} ·{" "}
                  {text(
                    "Révision originale LESSGOOO",
                    "Original LESSGOOO revision",
                  )}
                </span>
                <h2>{chapter.title[locale]}</h2>
                <p className="school-lead">{chapter.goal[locale]}</p>
                <LessonIllustration subject={chapter.subjectId} />
                <div className="school-card">
                  <h3>{text("Avant de commencer", "Before you start")}</h3>
                  <p>{chapter.prerequisites[locale]}</p>
                </div>
                <section className="school-card">
                  <h3>{text("Comprendre", "Understand")}</h3>
                  <p className="school-prose">{chapter.lesson[locale]}</p>
                  <div className="school-worked">
                    <h4>{text("Exemple pas à pas", "Worked example")}</h4>
                    <p className="school-prose">{chapter.example[locale]}</p>
                  </div>
                </section>
                <section className="school-card">
                  <h3>{text("À vous de jouer", "Your turn")}</h3>
                  <p className="school-prose">{chapter.challenge[locale]}</p>
                  <details>
                    <summary>
                      {text(
                        "J'ai essayé : voir la correction",
                        "I have tried: show the solution",
                      )}
                    </summary>
                    <p className="school-prose">{chapter.solution[locale]}</p>
                  </details>
                </section>
                <SchoolQuiz
                  key={chapter.id}
                  chapter={chapter}
                  preview={!persona || persona === "parent"}
                  onSubmit={
                    persona && persona !== "parent" ? record : undefined
                  }
                />
                <div className="school-next">
                  <p>
                    {text(
                      "Pour progresser : notez une erreur comprise et expliquez la méthode sans regarder la correction.",
                      "To improve: record one mistake you understood and explain the method without looking at the answer.",
                    )}
                  </p>
                  <button
                    onClick={() => {
                      setSubjectId(chapter.subjectId);
                      go("resources");
                    }}
                  >
                    {text(
                      "Aller plus loin avec des ressources",
                      "Explore related resources",
                    )}{" "}
                    <ArrowRight size={17} />
                  </button>
                </div>
              </article>
            ) : (
              <>
                <div className="school-section-heading">
                  <span className="school-tag">
                    {currentClass?.name[locale] ||
                      text("Choisir une classe", "Choose a class")}
                  </span>
                  <h2>
                    {tab === "practice"
                      ? text(
                          "Je pratique, je comprends mes erreurs.",
                          "Practise and understand your mistakes.",
                        )
                      : text(
                          "Qu'allons-nous comprendre aujourd'hui ?",
                          "What will we understand today?",
                        )}
                  </h2>
                  <p>
                    {text(
                      "Ces chapitres de révision sont des points de départ, avec un niveau indicatif. Ils ne couvrent pas encore tout le programme de chaque classe ou série.",
                      "These revision chapters are starting points with suggested levels. They do not yet cover every class or stream's full curriculum.",
                    )}
                  </p>
                </div>
                {subjectId && (
                  <section className="school-card school-subject-intro">
                    <h3>{subjectName(subjectId)}</h3>
                    <p>
                      {
                        subjects.find((s) => s.id === subjectId)?.description[
                          locale
                        ]
                      }
                    </p>
                    <strong>{text("Pour commencer", "To start")}</strong>
                    <p>
                      {
                        subjects.find((s) => s.id === subjectId)?.prerequisites[
                          locale
                        ]
                      }
                    </p>
                  </section>
                )}
                {tab === "practice" && <PracticeGenerator />}
                <div className="school-grid">
                  {chapters.map((ch) => {
                    const last = latestByChapter.find(
                      (a) => a.chapterId === ch.id,
                    );
                    return (
                      <article
                        key={ch.id}
                        className={`school-card school-chapter-card tone-${ch.subjectId}`}
                      >
                        <div className="school-chapter-top">
                          <BookOpen size={22} />
                          <span>{subjectName(ch.subjectId)}</span>
                          {last && (
                            <span className="school-tag">
                              {last.correct}/{last.total}
                            </span>
                          )}
                        </div>
                        <h3>{ch.title[locale]}</h3>
                        <p>{ch.goal[locale]}</p>
                        <div className="school-card-footer">
                          <small>
                            {ch.questions.length}{" "}
                            {text(
                              "questions + défi corrigé",
                              "questions + solved challenge",
                            )}
                          </small>
                          <button
                            className="school-primary"
                            onClick={() => setSelected(ch.id)}
                          >
                            {text("Ouvrir", "Open")}
                            <ArrowRight size={17} />
                          </button>
                        </div>
                      </article>
                    );
                  })}
                </div>
                {chapters.length === 0 && (
                  <div className="school-empty">
                    <BookOpen size={35} />
                    <h3>
                      {text(
                        "Construisons la suite de ce parcours",
                        "This pathway is still growing",
                      )}
                    </h3>
                    <p>
                      {text(
                        "Aucun chapitre publié ne correspond à ces filtres. Les programmes officiels et collections externes restent accessibles dans Documents. Le gestionnaire peut ajouter les chapitres et quiz de cette classe.",
                        "No published chapter matches these filters. Official curricula and external collections remain available in Resources. The manager can add this class's chapters and quizzes.",
                      )}
                    </p>
                    <button
                      onClick={() => {
                        setSearch("");
                        go("resources");
                      }}
                    >
                      {text(
                        "Voir les ressources disponibles",
                        "See available resources",
                      )}
                    </button>
                  </div>
                )}
                <details className="school-card">
                  <summary>
                    {text(
                      "Les matières et leurs prérequis",
                      "Subjects and prerequisites",
                    )}
                  </summary>
                  <p>
                    {text(
                      "Répertoire configurable : la combinaison exacte dépend de la classe, de la série, de la spécialité et de l'établissement. Confirmez-la avec le programme officiel.",
                      "Configurable directory: the exact subject combination depends on class, stream, specialism and school. Confirm it against the official curriculum.",
                    )}
                  </p>
                  <div className="school-grid">
                    {subjects.map((s) => (
                      <div key={s.id}>
                        <h3>{s.name[locale]}</h3>
                        <p>{s.description[locale]}</p>
                        <small>{s.prerequisites[locale]}</small>
                      </div>
                    ))}
                  </div>
                </details>
              </>
            )}
          </>
        )}
        {tab === "resources" && (
          <>
            <div className="school-section-heading">
              <h2>
                {text(
                  "Les bonnes ressources, au bon endroit.",
                  "Useful resources in one place.",
                )}
              </h2>
              <p>
                {text(
                  "Les programmes, livres et examens restent sur leurs sites sources. Vérifiez l'année, la série et les droits d'accès. Nous ne disposons pas encore de toutes les annales ni de tous les manuels prescrits.",
                  "Curricula, books and examinations remain on their source websites. Check the year, stream and access rights. We do not yet have every past paper or prescribed textbook.",
                )}
              </p>
            </div>
            <label className="school-resource-filter">
              {text("Type de ressource", "Resource type")}
              <select
                value={resourceKind}
                onChange={(e) => setResourceKind(e.target.value)}
              >
                <option value="">{text("Tout afficher", "Show all")}</option>
                {Object.entries(resourceLabels(fr)).map(([id, label]) => (
                  <option key={id} value={id}>
                    {label}
                  </option>
                ))}
              </select>
            </label>
            <p className="school-muted">
              {resources.length}{" "}
              {text(
                "ressource(s) pour cette sélection",
                "resource(s) for this selection",
              )}
            </p>
            <div className="school-grid">
              {resources.map((r) => (
                <ResourceCard key={r.id} resource={r} persona={persona} />
              ))}
            </div>
            {!resources.length && (
              <p className="school-empty">
                {text(
                  "Aucune ressource publiée pour ces filtres. Essayez toutes les matières ou retirez la recherche.",
                  "No published resources match these filters. Try all subjects or clear the search.",
                )}
              </p>
            )}
            <details className="school-card">
              <summary>
                {text(
                  "Livres au programme : comment vérifier ?",
                  "Prescribed books: how to check",
                )}
              </summary>
              <ol>
                <li>
                  {text(
                    "Choisir le bon ministère : MINEDUB pour le primaire, MINESEC pour le secondaire.",
                    "Choose the appropriate ministry: MINEDUB for primary, MINESEC for secondary.",
                  )}
                </li>
                <li>
                  {text(
                    "Vérifier l'année scolaire, la classe, le sous-système, la série et l'édition.",
                    "Check the school year, class, subsystem, stream and edition.",
                  )}
                </li>
                <li>
                  {text(
                    "Faire confirmer la liste par l'établissement. Une ancienne liste n'est pas automatiquement reconduite.",
                    "Ask the school to confirm the list. An old list is not automatically current.",
                  )}
                </li>
                <li>
                  {text(
                    "Chercher un prêt en bibliothèque ou une édition ouverte autorisée ; ne pas utiliser une copie commerciale diffusée sans autorisation.",
                    "Look for a library loan or an authorised open edition; do not use unauthorised copies of commercial books.",
                  )}
                </li>
              </ol>
            </details>
          </>
        )}
        {tab === "timetable" && (
          <>
            <div className="school-section-heading">
              <span className="school-tag">Africa/Douala · UTC+1</span>
              <h2>
                {text(
                  "Savoir quand apprendre, sans se perdre.",
                  "Know when to learn, without confusion.",
                )}
              </h2>
              <p>
                {text(
                  "Les heures affichées sont celles du Cameroun. Les plages d'ouverture sont confirmées ; la répartition des cours par classe et matière doit être renseignée.",
                  "Times are in Cameroon time. Opening slots are confirmed; class and subject allocations still need to be entered.",
                )}
              </p>
            </div>
            <div className="school-week">
              {days.map((day, i) => {
                const opening = c.availability.filter((s) => s.day === i + 1),
                  slots = c.timetable
                    .filter(
                      (s) =>
                        s.status !== "cancelled" &&
                        s.classId === classId &&
                        s.day === i + 1,
                    )
                    .sort((a, b) => a.start.localeCompare(b.start));
                return opening.length || slots.length ? (
                  <section className="school-card" key={day}>
                    <h3>{day}</h3>
                    {opening.map((s, j) => (
                      <p className="school-tag" key={j}>
                        {s.start}–{s.end}
                      </p>
                    ))}
                    {slots.length ? (
                      slots.map((s) => (
                        <div className="school-session" key={s.id}>
                          <strong>
                            {s.start}–{s.end} · {subjectName(s.subjectId)}
                          </strong>
                          <p>
                            {s.status === "draft"
                              ? text(
                                  "Brouillon — à confirmer",
                                  "Draft — to be confirmed",
                                )
                              : text("Séance confirmée", "Confirmed session")}
                          </p>
                          {s.location && <p>{s.location}</p>}
                          {s.meetingUrl && s.status === "confirmed" && (
                            <a
                              href={s.meetingUrl}
                              target="_blank"
                              rel="noreferrer"
                            >
                              {text("Rejoindre le cours", "Join the lesson")} ↗
                            </a>
                          )}
                        </div>
                      ))
                    ) : (
                      <p className="school-muted">
                        {text(
                          "Matières à répartir pour cette classe.",
                          "Subject allocation pending for this class.",
                        )}
                      </p>
                    )}
                  </section>
                ) : null;
              })}
            </div>
            <button className="school-print" onClick={() => window.print()}>
              {text("Imprimer l'emploi du temps", "Print timetable")}
            </button>
            <section className="school-card">
              <h3>{text("Classes d'examen", "Examination classes")}</h3>
              <p>
                {text(
                  "Choisissez une classe pour afficher ses créneaux. Les dates des examens nationaux sont publiées par les organismes officiels et ne sont pas déduites des horaires de répétition.",
                  "Choose a class to view its sessions. National exam dates are published by official bodies and are separate from tutoring hours.",
                )}
              </p>
              <div className="school-actions">
                {c.classes
                  .filter((cl) => cl.active && cl.exam)
                  .map((cl) => (
                    <button
                      key={cl.id}
                      onClick={() => {
                        setSystem(cl.system);
                        pickClass(cl.id);
                      }}
                    >
                      {cl.name[locale]} · {cl.exam}
                    </button>
                  ))}
              </div>
              <div className="school-actions">
                <a
                  href="https://camgceb.org/examinations/timetables/"
                  target="_blank"
                  rel="noreferrer"
                >
                  GCE Board ↗
                </a>
                <a
                  href="https://officedubac.cm/"
                  target="_blank"
                  rel="noreferrer"
                >
                  {text("Office du baccalauréat", "Baccalaureate office")} ↗
                </a>
              </div>
            </section>
            {persona && online && (
              <SchoolPresence
                key={persona}
                persona={persona}
                classId={classId}
                catalog={c}
              />
            )}
          </>
        )}
        {tab === "progress" && (
          <>
            <div className="school-section-heading">
              <h2>
                {text(
                  "Voir les efforts et la prochaine étape.",
                  "See your effort and next step.",
                )}
              </h2>
              <p>
                {persona === "parent"
                  ? text(
                      "Vous consultez les tentatives du profil enfant de démonstration. Les notes et les quiz restent modifiables par l'apprenant, pas par cette vue parent.",
                      "You are viewing the demonstration child's attempts. Marks and quizzes can be changed by the learner, not through this parent view.",
                    )
                  : text(
                      "Le suivi présente les 200 dernières tentatives du profil. Les résultats d'entraînement ne sont ni un bulletin officiel ni une promesse de réussite.",
                      "Progress shows the profile's latest 200 attempts. Practice results are neither an official school report nor a promise of success.",
                    )}
              </p>
            </div>
            {!persona && (
              <p className="school-note">
                {text(
                  "Vous êtes en visite libre : les essais ne sont pas enregistrés. Ouvrez le campus local pour utiliser un profil de démonstration.",
                  "You are browsing freely: attempts are not saved. Open the local campus to use a demonstration profile.",
                )}{" "}
                <a href={`${import.meta.env.BASE_URL}campus.html#school`}>
                  Campus →
                </a>
              </p>
            )}
            <div className="school-stats">
              <article className="school-card">
                <strong>{latestByChapter.length}</strong>
                <span>{text("chapitres essayés", "chapters attempted")}</span>
              </article>
              <article className="school-card">
                <strong>{progress.attempts.length}</strong>
                <span>{text("tentatives affichées", "attempts shown")}</span>
              </article>
              <article className="school-card">
                <strong>
                  {latestByChapter.filter((a) => a.correct === a.total).length}
                </strong>
                <span>
                  {text(
                    "derniers quiz sans erreur",
                    "latest quizzes without errors",
                  )}
                </span>
              </article>
            </div>
            {latestByChapter.length ? (
              <div className="school-grid">
                {latestByChapter.map((a) => (
                  <article className="school-card" key={a.id}>
                    <h3>{a.title[locale]}</h3>
                    <p>
                      {a.correct}/{a.total} ·{" "}
                      {new Date(a.created).toLocaleDateString(
                        fr ? "fr-FR" : "en-GB",
                      )}
                    </p>
                    <progress
                      aria-label={a.title[locale]}
                      value={a.correct}
                      max={a.total}
                    />
                    <p>
                      {a.correct === a.total
                        ? text(
                            "Prochaine étape : expliquer la méthode et essayer le défi.",
                            "Next: explain the method and try the challenge.",
                          )
                        : text(
                            "Prochaine étape : relire les corrections et refaire un essai.",
                            "Next: reread the explanations and try again.",
                          )}
                    </p>
                    <button
                      onClick={() => {
                        const ch = c.chapters.find(
                          (ch) => ch.id === a.chapterId && ch.published,
                        );
                        if (!ch) {
                          setError(
                            text(
                              "Ce chapitre a été archivé.",
                              "This chapter has been archived.",
                            ),
                          );
                          return;
                        }
                        const cl = c.classes.find(
                          (cl) => cl.id === ch.classIds[0],
                        );
                        if (cl) {
                          setClassId(cl.id);
                          setSystem(cl.system);
                        }
                        setSubjectId("");
                        setSearch("");
                        go("learn");
                        setSelected(ch.id);
                      }}
                    >
                      {text("Reprendre le chapitre", "Review chapter")}
                    </button>
                  </article>
                ))}
              </div>
            ) : (
              <div className="school-empty">
                <Target size={34} />
                <h3>
                  {text(
                    "Le premier essai compte déjà.",
                    "Your first attempt matters.",
                  )}
                </h3>
                <p>
                  {text(
                    "Choisissez un chapitre et terminez son quiz pour commencer le suivi.",
                    "Choose a chapter and finish its quiz to start tracking progress.",
                  )}
                </p>
                <button onClick={() => go("learn")}>
                  {text("Choisir un chapitre", "Choose a chapter")}
                </button>
              </div>
            )}
            {persona === "teacher" && (
              <section className="school-card">
                <h3>
                  {text(
                    "Suivi des profils élèves de démonstration",
                    "Demonstration learner progress",
                  )}
                </h3>
                <p>
                  {text(
                    "Jusqu'à 20 tentatives récentes par élève. Une absence de tentative ne signifie pas une absence de travail.",
                    "Up to 20 recent attempts per learner. No recorded attempts does not mean no learning took place.",
                  )}
                </p>
                {report.map((row) => (
                  <details key={row.id}>
                    <summary>
                      {row.name} · {row.attempts.length}{" "}
                      {text("tentative(s)", "attempt(s)")}
                    </summary>
                    <ul>
                      {row.attempts.map((a) => (
                        <li key={a.id}>
                          {a.title[locale]} · {a.correct}/{a.total} ·{" "}
                          {new Date(a.created).toLocaleDateString(
                            fr ? "fr-FR" : "en-GB",
                          )}
                        </li>
                      ))}
                    </ul>
                  </details>
                ))}
              </section>
            )}
            <div className="school-card">
              <h3>
                {text(
                  "Parents : accompagner en trois gestes",
                  "Parents: three ways to help",
                )}
              </h3>
              <ol>
                <li>
                  {text(
                    "Demander à l'enfant ce qu'il a compris, sans commencer par la note.",
                    "Ask what your child understood before asking about marks.",
                  )}
                </li>
                <li>
                  {text(
                    "Choisir ensemble un objectif court et réaliste pour la prochaine séance.",
                    "Choose one short, realistic goal together for the next session.",
                  )}
                </li>
                <li>
                  {text(
                    "Valoriser la correction d'une erreur et demander de l'aide quand elle persiste.",
                    "Recognise a corrected mistake and ask for help when a difficulty persists.",
                  )}
                </li>
              </ol>
            </div>
          </>
        )}
        {tab === "orientation" && (
          <SchoolOrientation
            key={`${persona || "guest"}-${classId}`}
            catalog={c}
            classId={classId}
            initial={progress.profile}
            onSave={saveProfile}
            readOnly={persona === "parent"}
          />
        )}
        {tab === "manage" &&
          persona === "teacher" &&
          (online ? (
            <Suspense
              fallback={
                <p>{text("Ouverture de la gestion…", "Opening management…")}</p>
              }
            >
              <SchoolEditor
                snapshot={snapshot}
                onSave={async (catalog, version) => {
                  try {
                    const next = await schoolRequest<CatalogSnapshot>(
                      "catalog",
                      persona,
                      { catalog, version },
                    );
                    setSnapshot(next);
                    return next;
                  } catch (err) {
                    throw new Error(
                      err instanceof Error ? err.message : schoolError(err, fr),
                    );
                  }
                }}
              />
            </Suspense>
          ) : (
            <p className="school-note">
              {text(
                "Démarrez le serveur local pour enregistrer les réglages. GitHub Pages propose une consultation statique.",
                "Start the local server to save settings. GitHub Pages provides static browsing.",
              )}
            </p>
          ))}
      </div>
      <footer className="school-footer">
        <p>
          {text("Catalogue en construction :", "Catalogue in progress:")}{" "}
          {c.classes.filter((cl) => cl.active).length}{" "}
          {text("classes", "classes")} · {subjects.length}{" "}
          {text("matières répertoriées", "listed subjects")} ·{" "}
          {c.chapters.filter((ch) => ch.published).length}{" "}
          {text("chapitres originaux", "original chapters")} ·{" "}
          {c.chapters
            .filter((ch) => ch.published)
            .reduce((n, ch) => n + ch.questions.length, 0)}{" "}
          {text("questions corrigées", "explained questions")}.
        </p>
        <p>
          {text(
            "Sources consultées le 23 septembre 2026. Vérification pédagogique et couverture nationale complètes encore à réaliser ; aucune approbation ministérielle revendiquée.",
            "Sources consulted on 23 September 2026. Full educational review and national coverage are still pending; no ministry approval is claimed.",
          )}
        </p>
      </footer>
    </div>
  );
}

function resourceLabels(fr: boolean): Record<Resource["kind"], string> {
  return fr
    ? {
        programme: "Programme officiel",
        booklist: "Liste de manuels",
        book: "Livre autorisé",
        paper: "Annales",
        mock: "Examen blanc",
        exercise: "Exercices",
        video: "Vidéos",
        audio: "Audio",
        document: "Documents",
        simulation: "Simulations",
        guidance: "Orientation",
      }
    : {
        programme: "Official curriculum",
        booklist: "Textbook list",
        book: "Authorised book",
        paper: "Past papers",
        mock: "Mock examination",
        exercise: "Exercises",
        video: "Videos",
        audio: "Audio",
        document: "Documents",
        simulation: "Simulations",
        guidance: "Guidance",
      };
}
function ResourceCard({
  resource: r,
  persona,
}: {
  resource: Resource;
  persona?: Persona;
}) {
  const { locale } = useLanguage(),
    fr = locale === "fr",
    [expanded, setExpanded] = useState(false);
  const statuses = fr
    ? {
        source: "Source consultée · vérifier l'édition",
        historical: "Édition ancienne",
        complement: "Complément international",
        review: "À vérifier",
      }
    : {
        source: "Source consulted · check edition",
        historical: "Historical edition",
        complement: "International enrichment",
        review: "Needs review",
      };
  return (
    <article className="school-card school-resource">
      <span className="school-tag">
        {resourceLabels(fr)[r.kind]}
        {r.year && ` · ${r.year}`}
      </span>
      <h3>{r.title[locale]}</h3>
      <p>{r.description[locale]}</p>
      <p className="school-muted">
        {r.source} ·{" "}
        {r.language === "both" ? "FR / EN" : r.language.toUpperCase()}
      </p>
      <p
        className={
          r.status === "historical" || r.status === "review"
            ? "school-review-label"
            : "school-muted"
        }
      >
        {statuses[r.status]}
      </p>
      {r.url ? (
        <a href={r.url} target="_blank" rel="noreferrer">
          {fr ? "Consulter la source" : "Open source"} ↗
        </a>
      ) : (
        persona && (
          <button onClick={() => setExpanded(!expanded)}>
            {expanded
              ? fr
                ? "Fermer le fichier"
                : "Close file"
              : fr
                ? "Ouvrir le fichier"
                : "Open file"}
          </button>
        )
      )}
      {expanded && persona && <SchoolMedia id={r.mediaId} persona={persona} />}
      <details>
        <summary>{fr ? "Accès et droits" : "Access and rights"}</summary>
        <p>{r.rights[locale]}</p>
      </details>
    </article>
  );
}
