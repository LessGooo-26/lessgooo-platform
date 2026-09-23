import { useRef, useState } from "react";
import {
  ArrowRight,
  BookOpen,
  BriefcaseBusiness,
  Cloud,
  Code2,
  FileText,
  GitBranch,
  Image,
  Palette,
  Search,
  ShieldCheck,
  Terminal,
  Workflow,
} from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "./components/ui/button";
import {
  courseCatalog,
  findCourse,
  type CourseId,
  startingChecklist,
  type CourseArea,
  type CourseInquiry,
  type CourseText,
} from "./lib/course-catalog";
import { useLanguage, tx } from "./lib/language";
import type { Lesson } from "./lib/model";
import "./course-catalog.css";
const icons = {
  devops: GitBranch,
  cloud: Cloud,
  cybersecurity: ShieldCheck,
  linux: Terminal,
  "ai-web": Code2,
  secretariat: FileText,
  "ai-infographics": Image,
  "ai-design": Palette,
  "ai-automation": Workflow,
};
export default function CourseCatalog({
  lessons = [],
  openLesson,
  onInquiry,
  companyOnly = false,
  initialCourse,
}: {
  lessons?: Lesson[];
  openLesson?: (lesson: Lesson) => void;
  onInquiry: (inquiry: CourseInquiry) => void;
  companyOnly?: boolean;
  initialCourse?: CourseId;
}) {
  const { locale, t } = useLanguage();
  const trigger = useRef<HTMLButtonElement | null>(null);
  const handingOff = useRef(false);
  const [query, setQuery] = useState("");
  const [selected, setSelected] = useState<CourseArea | null>(
    () => findCourse(initialCourse || "") || null,
  );
  const copy = (value: CourseText) => value[locale];
  const normalized = (value: string) =>
    value
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "")
      .toLowerCase();
  const matches = courseCatalog.filter((course) =>
    normalized(
      [
        course.title[locale],
        course.description[locale],
        course.audience[locale],
      ].join(" "),
    ).includes(normalized(query.trim())),
  );
  const inquire = (service: CourseInquiry["service"]) => {
    if (!selected) return;
    handingOff.current = true;
    onInquiry({ service, course: selected.id });
    setSelected(null);
  };
  const list = (items: CourseText[]) => (
    <ul>
      {items.map((item, index) => (
        <li key={index}>{copy(item)}</li>
      ))}
    </ul>
  );
  return (
    <section
      className="academy-catalog"
      aria-label={t(
        "Course and company service catalog",
        "Catalogue des formations et services aux entreprises",
      )}
    >
      <header className="catalog-intro">
        <div>
          <span className="lesson-kicker">
            LESSGOOO ·{" "}
            {t("LEARN. BUILD. APPLY.", "APPRENDRE. CRÉER. APPLIQUER.")}
          </span>
          <h2>
            {companyOnly
              ? t(
                  "Skills that serve your business",
                  "Des compétences au service de votre entreprise",
                )
              : t(
                  "Find the skill you want to build",
                  "Trouvez la compétence à développer",
                )}
          </h2>
          <p>
            {companyOnly
              ? t(
                  "Explore nine areas of support. See what to prepare, then tell us about your company’s needs.",
                  "Explorez neuf domaines d’accompagnement. Découvrez quoi préparer, puis décrivez les besoins de votre entreprise.",
                )
              : t(
                  "Nine course areas, explained simply. Discover the role, what you need to start and a practical project. Each area is also available as a company service.",
                  "Neuf domaines de formation expliqués simplement. Découvrez le rôle, les prérequis et un projet pratique. Chaque domaine est aussi proposé comme service aux entreprises.",
                )}
          </p>
        </div>
        <span className="catalog-count">
          <strong>09</strong>
          {t("areas to explore", "domaines à explorer")}
        </span>
      </header>
      <label className="catalog-search">
        <Search size={18} aria-hidden="true" />
        <span className="sr-only">
          {t(
            "Find a course or service",
            "Rechercher une formation ou un service",
          )}
        </span>
        <input
          type="search"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder={t(
            "Try Linux, design, office…",
            "Essayez Linux, design, bureau…",
          )}
        />
      </label>
      <div className="catalog-grid">
        {matches.map((course, index) => {
          const Icon = icons[course.id];
          return (
            <article className="catalog-card" key={course.id}>
              <div className={"catalog-symbol tone-" + (index % 3)}>
                <Icon size={27} aria-hidden="true" />
                <span>{t("COURSE + SERVICE", "FORMATION + SERVICE")}</span>
              </div>
              <h3>{copy(course.title)}</h3>
              <p>{copy(companyOnly ? course.company : course.description)}</p>
              <button
                onClick={(event) => {
                  trigger.current = event.currentTarget;
                  handingOff.current = false;
                  setSelected(course);
                }}
                aria-label={t("Explore ", "Découvrir : ") + copy(course.title)}
              >
                {companyOnly
                  ? t("View the service", "Voir le service")
                  : t("Explore the course", "Découvrir la formation")}
                <ArrowRight size={17} aria-hidden="true" />
              </button>
            </article>
          );
        })}
      </div>
      {!matches.length && (
        <p role="status">
          {t(
            "No match. Try another word or clear the search.",
            "Aucun résultat. Essayez un autre mot ou effacez la recherche.",
          )}
        </p>
      )}
      <Dialog
        open={!!selected}
        onOpenChange={(open) => {
          if (!open) setSelected(null);
        }}
      >
        <DialogContent
          className="course-profile"
          onCloseAutoFocus={(event) => {
            event.preventDefault();
            if (!handingOff.current) trigger.current?.focus();
          }}
        >
          <DialogHeader>
            <DialogTitle>{selected && copy(selected.title)}</DialogTitle>
            <DialogDescription>
              {selected &&
                copy(companyOnly ? selected.company : selected.description)}
            </DialogDescription>
          </DialogHeader>
          {selected && (
            <div className="course-profile-body">
              {!companyOnly && (
                <>
                  <div className="course-overview">
                    <section>
                      <h3>
                        {t(
                          "Who is it for?",
                          "À qui s’adresse cette formation ?",
                        )}
                      </h3>
                      <p>{copy(selected.audience)}</p>
                    </section>
                    <section>
                      <h3>
                        {t(
                          "Your role in the real world",
                          "Votre rôle dans le monde professionnel",
                        )}
                      </h3>
                      <p>{copy(selected.role)}</p>
                    </section>
                  </div>
                  <section className="course-prerequisites">
                    <h3>{t("Before you start", "Avant de commencer")}</h3>
                    <p className="course-note">
                      {t(
                        "Preparation guidance for the introductory path. Advanced labs may need additional tools or equipment.",
                        "Conseils de préparation pour le parcours d’introduction. Les exercices avancés peuvent demander d’autres outils ou équipements.",
                      )}
                    </p>
                    {list(selected.prerequisites)}
                    <details>
                      <summary>
                        {t(
                          "Computer and account checklist for every course",
                          "Matériel et comptes : la liste commune à toutes les formations",
                        )}
                      </summary>
                      {list(startingChecklist)}
                    </details>
                  </section>
                  <section>
                    <h3>
                      {t(
                        "Your learning path",
                        "Votre parcours d’apprentissage",
                      )}
                    </h3>
                    <p className="course-note">
                      {t(
                        "Four phases with starter activities. Keep your work in your practice folder.",
                        "Quatre phases avec des activités de découverte. Gardez votre travail dans votre dossier d’exercice.",
                      )}
                    </p>
                    <ol className="course-phases">
                      {selected.phases.map((phase, i) => (
                        <li key={i}>
                          <span aria-hidden="true">
                            {String(i + 1).padStart(2, "0")}
                          </span>
                          <div>
                            <h4>{copy(phase.title)}</h4>
                            <p>{copy(phase.practice)}</p>
                          </div>
                        </li>
                      ))}
                    </ol>
                  </section>
                  <section className="course-project">
                    <span className="lesson-kicker">
                      {t("PUT IT INTO PRACTICE", "PASSER À LA PRATIQUE")}
                    </span>
                    <h3>{copy(selected.project)}</h3>
                    <h4>
                      {t(
                        "You can explain and show…",
                        "Vous savez expliquer et montrer…",
                      )}
                    </h4>
                    {list(selected.evidence)}
                  </section>
                  <section>
                    <h3>{t("Continue learning", "Continuer à apprendre")}</h3>
                    <a
                      className="course-documentation"
                      href={selected.documentation.url}
                      target="_blank"
                      rel="noreferrer"
                    >
                      {selected.documentation.label} ·{" "}
                      {t("official documentation", "documentation officielle")}{" "}
                      ↗
                    </a>
                    <p className="course-note">
                      {t(
                        "External documentation may be in English. This profile contains an outline and starter activities; assessed lessons appear in your lesson library.",
                        "La documentation externe peut être en anglais. Cette fiche contient un plan et des activités de découverte ; les leçons évaluées figurent dans votre bibliothèque de leçons.",
                      )}
                    </p>
                    {openLesson && (
                      <div className="course-related">
                        {selected.lessons.flatMap((id) => {
                          const lesson = lessons.find((item) => item.id === id);
                          return lesson
                            ? [
                                <Button
                                  variant="outline"
                                  key={id}
                                  onClick={() => {
                                    handingOff.current = true;
                                    setSelected(null);
                                    openLesson(lesson);
                                  }}
                                >
                                  <BookOpen size={15} />
                                  {tx(lesson.title)}
                                </Button>,
                              ]
                            : [];
                        })}
                      </div>
                    )}
                  </section>
                </>
              )}
              <section className="course-company">
                <div className="course-company-heading">
                  <BriefcaseBusiness size={23} />
                  <h3>{t("For your company", "Pour votre entreprise")}</h3>
                </div>
                {!companyOnly && <p>{copy(selected.company)}</p>}
                <h4>
                  {t(
                    "Examples of deliverables to agree together",
                    "Exemples de livrables à définir ensemble",
                  )}
                </h4>
                {list(selected.deliverables)}
                <h4>{t("What to prepare", "Ce qu’il faut préparer")}</h4>
                <p>{copy(selected.companyNeeds)}</p>
              </section>
              <p className="course-note">
                {t(
                  "We will clarify scope, availability, tools and pricing with you. An inquiry does not book a course or commit your company to a service.",
                  "Nous préciserons avec vous le périmètre, les disponibilités, les outils et le tarif. Une demande ne réserve pas une formation et n’engage pas votre entreprise.",
                )}
              </p>
              <div className="course-profile-actions">
                {!companyOnly && (
                  <Button onClick={() => inquire("training")}>
                    {t(
                      "Ask about this course",
                      "Se renseigner sur cette formation",
                    )}
                  </Button>
                )}
                <Button
                  variant={companyOnly ? "default" : "outline"}
                  onClick={() => inquire("company")}
                >
                  {t(
                    "Discuss a company project",
                    "Discuter d’un projet d’entreprise",
                  )}
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </section>
  );
}
