import { ArrowRight, CheckCircle2, Layers3 } from "lucide-react";
import type { Lesson } from "./lib/model";
import { canonicalLessonId } from "./lib/lesson-references";
import { useLanguage, tx } from "./lib/language";
import "./lesson-reader.css";
const chapters = [
  [
    "Linux & automation",
    "Linux et automatisation",
    "linux-1 linux-2 dev-process dev-bash dev-python",
  ],
  ["Networks & HTTP", "Réseaux et HTTP", "dev-network dev-http"],
  [
    "Git & collaboration",
    "Git et collaboration",
    "git-1 dev-git-team dev-git-secrets",
  ],
  [
    "Containers & delivery",
    "Conteneurs et livraison",
    "dev-docker-build dev-compose dev-registry",
  ],
  ["CI/CD", "CI/CD", "dev-actions dev-jenkins dev-delivery"],
  [
    "AWS architecture",
    "Architecture AWS",
    "dev-aws-iam dev-aws-vpc dev-aws-compute dev-aws-storage dev-serverless",
  ],
  [
    "Infrastructure as Code",
    "Infrastructure as Code",
    "dev-terraform dev-tf-modules dev-ansible",
  ],
  [
    "Kubernetes & GitOps",
    "Kubernetes et GitOps",
    "dev-k8s-core dev-k8s-health dev-k8s-security dev-helm dev-gitops",
  ],
  [
    "Observability & reliability",
    "Observabilité et fiabilité",
    "dev-metrics dev-traces dev-slo dev-incident",
  ],
  [
    "Security, cost & platforms",
    "Sécurité, coûts et plateformes",
    "dev-supply-chain dev-cloud-secrets dev-finops dev-platform",
  ],
  [
    "Inside a computer",
    "Dans un ordinateur",
    "kids-hardware kids-peripherals kids-os-files kids-binary",
  ],
  [
    "Create & test",
    "Créer et tester",
    "kids-web-safety kids-scratch-game kids-python kids-web kids-git",
  ],
  [
    "From local to cloud",
    "Du local au cloud",
    "kids-server kids-cloud kids-aws kids-cloud-project",
  ],
  [
    "Explain & think critically",
    "Expliquer et réfléchir",
    "kids-design kids-ai",
  ],
] as const;
export function LessonLibrary({
  lessons,
  validated,
  openLesson,
  searching,
}: {
  lessons: Lesson[];
  validated: Set<string>;
  openLesson: (lesson: Lesson) => void;
  searching: boolean;
}) {
  const { locale, t } = useLanguage();
  const unique = lessons.filter(
    (item, i, all) => all.findIndex((l) => l.id === item.id) === i,
  );
  const known = new Set(chapters.flatMap((row) => row[2].split(" ")));
  const groups: { title: string; number: number; lessons: Lesson[] }[] =
    chapters
      .map((row, index) => ({
        title: row[locale === "en" ? 0 : 1],
        number: index + 1,
        lessons: unique.filter((l) =>
          row[2].split(" ").includes(canonicalLessonId(l.id)),
        ),
      }))
      .filter((group) => group.lessons.length);
  const custom = unique.filter((l) => !known.has(canonicalLessonId(l.id)));
  if (custom.length)
    groups.push({
      title: t("Instructor lessons", "Leçons du formateur"),
      number: 15,
      lessons: custom,
    });
  return (
    <div className="lesson-library">
      <header className="library-intro">
        <div>
          <span className="lesson-kicker">
            {t("LEARN THROUGH PRACTICE", "APPRENDRE PAR LA PRATIQUE")}
          </span>
          <h2>
            {t(
              "Understand the idea. Build something with it.",
              "Comprendre une idée et la mettre en pratique.",
            )}
          </h2>
          <p>
            {t(
              "Open a chapter, follow an illustrated lesson and test your understanding with its attached project.",
              "Ouvrez un chapitre, suivez une leçon illustrée et testez votre compréhension avec son projet associé.",
            )}
          </p>
        </div>
        <div className="library-count">
          <Layers3 size={25} />
          <strong>{unique.length}</strong>
          <span>{t("lessons with practice", "leçons avec pratique")}</span>
        </div>
      </header>
      <div className="library-chapters">
        {groups.map((group, index) => (
          <details
            key={`${group.number}-${searching}`}
            className="library-chapter"
            open={searching || index === 0}
          >
            <summary>
              <span className="chapter-number">
                {String(index + 1).padStart(2, "0")}
              </span>
              <span>
                <strong>{group.title}</strong>
                <small>
                  {group.lessons.length} {t("lessons", "leçons")}
                </small>
              </span>
              <span className="chapter-toggle" aria-hidden="true">
                +
              </span>
            </summary>
            <div className="chapter-lessons">
              {group.lessons.map((l) => (
                <button
                  key={l.id}
                  className="library-lesson"
                  onClick={() => openLesson(l)}
                >
                  <span className={`library-track ${l.track}`}>
                    {validated.has(l.id) ? (
                      <CheckCircle2 size={19} />
                    ) : (
                      <span aria-hidden="true">
                        {l.track === "kids" ? "✦" : "↳"}
                      </span>
                    )}
                  </span>
                  <span className="library-lesson-title">
                    <strong>{tx(l.title)}</strong>
                    <small>
                      {tx(l.level)} · {l.minutes}{" "}
                      {t(
                        "min estimated practice",
                        "min de pratique indicative",
                      )}
                      {validated.has(l.id) && ` · ${t("Validated", "Validé")}`}
                    </small>
                  </span>
                  <span className="library-open">
                    {t("Open", "Ouvrir")} <ArrowRight size={17} />
                  </span>
                </button>
              ))}
            </div>
          </details>
        ))}
      </div>
    </div>
  );
}
