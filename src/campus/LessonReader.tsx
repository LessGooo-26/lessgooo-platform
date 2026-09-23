import { useState, type ReactNode } from "react";
import {
  ArrowUpRight,
  BookOpen,
  CheckCircle2,
  ClipboardList,
  Lightbulb,
  Terminal,
} from "lucide-react";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "./components/ui/tabs";
import { Button } from "./components/ui/button";
import { useLanguage, tx } from "./lib/language";
import {
  guideFor,
  projectReference,
  referenceVideos,
} from "./lib/lesson-guides";
import { documentationFor, referencesReviewed } from "./lib/lesson-references";
import { lessonEnvironments } from "./lib/lesson-environments";
import type { Lesson } from "./lib/model";
import type { Copy } from "./lib/lesson-guide-model";
import { LessonDiagram } from "./LessonDiagram";
import "./lesson-reader.css";

export default function LessonReader({
  lesson,
  children,
}: {
  lesson: Lesson;
  children?: ReactNode;
}) {
  const { t, locale } = useLanguage();
  const text = (copy: Copy) => copy[locale === "en" ? 0 : 1];
  const guide = guideFor(lesson.id);
  const [tab, setTab] = useState("understand");
  const environments = guide ? lessonEnvironments(guide) : [];
  const [environmentId, setEnvironmentId] = useState(
    environments[0]?.id || "local",
  );
  const environment =
    environments.find((e) => e.id === environmentId) || environments[0];
  const [choice, setChoice] = useState<number | null>(null),
    [checked, setChecked] = useState(false);
  const [evidence, setEvidence] = useState<Record<string, boolean>>({});
  const docs = documentationFor(lesson.id),
    videos = referenceVideos(lesson.id),
    project = projectReference(lesson.id);
  const correct = lesson.id.length % 2;
  const options = guide
    ? correct === 0
      ? [guide.answer, guide.misconception]
      : [guide.misconception, guide.answer]
    : [];
  if (!guide)
    return (
      <div className="lesson-reader">
        <section className="lesson-section">
          <h3>{t("Understand", "Comprendre")}</h3>
          <p>{tx(lesson.explanation)}</p>
        </section>
        <section className="lesson-project">
          <h3>{t("Your attached project", "Votre projet associé")}</h3>
          <p>{tx(lesson.task)}</p>
          <p>{tx(lesson.criteria)}</p>
          {children}
        </section>
        {/^https:\/\//.test(lesson.resource) && (
          <a href={lesson.resource} target="_blank" rel="noreferrer">
            {t("Instructor resource", "Ressource du formateur")} ↗
          </a>
        )}
      </div>
    );
  return (
    <div className="lesson-reader">
      <Tabs value={tab} onValueChange={setTab}>
        <TabsList
          className="lesson-tabs"
          aria-label={t("Lesson sections", "Sections de la leçon")}
        >
          <TabsTrigger value="understand">
            <BookOpen size={16} />
            {t("Understand", "Comprendre")}
          </TabsTrigger>
          <TabsTrigger value="lab">
            <Terminal size={16} />
            {t("Guided project", "Projet guidé")}
          </TabsTrigger>
          <TabsTrigger value="check">
            <Lightbulb size={16} />
            {t("Check yourself", "Se tester")}
          </TabsTrigger>
          <TabsTrigger value="resources">
            <ArrowUpRight size={16} />
            {t("Resources", "Ressources")}
          </TabsTrigger>
        </TabsList>
        <TabsContent value="understand" className="lesson-pane">
          <div className="lesson-outcome">
            <span className="lesson-kicker">
              {t("YOUR GOAL", "VOTRE OBJECTIF")}
            </span>
            <h3>{text(guide.goal)}</h3>
            <p>{tx(lesson.explanation)}</p>
          </div>
          <LessonDiagram guide={guide} />
          <div className="lesson-context-grid">
            <section className="lesson-section">
              <span className="lesson-kicker">
                {lesson.track === "kids"
                  ? t("YOUR ROLE", "TON RÔLE")
                  : t("THE DEVOPS ROLE", "LE RÔLE DU DEVOPS")}
              </span>
              <h3>
                {t(
                  "What this changes in practice",
                  "Ce que cela change en pratique",
                )}
              </h3>
              <p>{text(guide.role)}</p>
            </section>
            <aside className="lesson-scenario">
              <span className="lesson-kicker">
                {t("REAL-WORLD SCENARIO", "CAS CONCRET")}
              </span>
              <h3>{t("Imagine this situation", "Imaginez cette situation")}</h3>
              <p>{text(guide.scenario)}</p>
            </aside>
          </div>
          <section className="lesson-takeaway">
            <Lightbulb size={22} />
            <div>
              <h3>
                {t("The important distinction", "La distinction à retenir")}
              </h3>
              <p>{text(guide.takeaway)}</p>
            </div>
          </section>
          <Button onClick={() => setTab("lab")}>
            {t("Start the attached project", "Commencer le projet associé")}{" "}
            <ArrowUpRight size={16} />
          </Button>
        </TabsContent>
        <TabsContent value="lab" className="lesson-pane">
          <section className="lesson-project">
            <span className="lesson-kicker">
              {t("PROJECT ATTACHED TO THIS LESSON", "PROJET LIÉ À CETTE LEÇON")}
            </span>
            <h3>{tx(lesson.title)}</h3>
            <p>{text(guide.goal)}</p>
            <p className="lesson-note">
              {t(
                "Follow this guided practice first, then extend it using the instructor assignment below. State which environment and steps you completed.",
                "Suivez cette pratique guidée puis prolongez-la avec le travail du formateur ci-dessous. Précisez l’environnement et les étapes réalisés.",
              )}
            </p>
            <div className="lesson-prerequisites">
              <strong>{t("Before you start", "Avant de commencer")}</strong>
              <p>{text(guide.prerequisites)}</p>
            </div>
          </section>
          {environments.length > 1 && (
            <label
              className="lesson-environment-label"
              htmlFor="lesson-environment"
            >
              {t(
                "Choose your practice environment",
                "Choisissez votre environnement",
              )}
              <select
                id="lesson-environment"
                value={environment.id}
                onChange={(e) => setEnvironmentId(e.target.value)}
              >
                {environments.map((e) => (
                  <option key={e.id} value={e.id}>
                    {text(e.title)}
                  </option>
                ))}
              </select>
            </label>
          )}
          <section className="environment-brief">
            <h3>{text(environment.title)}</h3>
            <p>{text(environment.intro)}</p>
            <ol>
              {environment.checks.map((check, i) => (
                <li key={i}>{text(check)}</li>
              ))}
            </ol>
          </section>
          <div className="lesson-lab-steps">
            {guide.steps.map((item, i) => (
              <section className="lesson-lab-step" key={i}>
                <span className="lab-step-number">0{i + 1}</span>
                <div>
                  <h3>{text(item.title)}</h3>
                  <p>{text(item.instruction)}</p>
                  {item.command && (
                    <details
                      className="lesson-code"
                      open={!environment.offline}
                    >
                      <summary>
                        {environment.offline
                          ? t(
                              "Reference command — not executed in this environment",
                              "Commande de référence — non exécutée dans cet environnement",
                            )
                          : t(
                              "Commands or file content",
                              "Commandes ou contenu du fichier",
                            )}
                      </summary>
                      <pre tabIndex={0}>
                        <code>{item.command}</code>
                      </pre>
                    </details>
                  )}
                  <p className="lesson-expected">
                    <CheckCircle2 size={16} />
                    <span>
                      <strong>{t("Expected: ", "Attendu : ")}</strong>
                      {text(item.expected)}
                    </span>
                  </p>
                </div>
              </section>
            ))}
          </div>
          <section className="lesson-proof">
            <h3>
              <ClipboardList size={20} />
              {t("Your submission checklist", "Votre checklist de rendu")}
            </h3>
            <h4>
              {t("Instructor assignment", "Travail demandé par le formateur")}
            </h4>
            <p className="lesson-assignment">{tx(lesson.task)}</p>
            <p>
              <strong>{t("Review criteria: ", "Critères de revue : ")}</strong>
              {tx(lesson.criteria)}
            </p>
            {[
              ["result", text(guide.verify)],
              [
                "evidence",
                t(
                  "Attach your source/configuration or drawing, plus an observed result and one failure you explained.",
                  "Joignez sources/configuration ou dessin, un résultat observé et une erreur expliquée.",
                ),
              ],
              [
                "reflection",
                t(
                  "Explain your choices in your own words and note anything you could not execute.",
                  "Expliquez vos choix avec vos mots et indiquez ce que vous n’avez pas pu exécuter.",
                ),
              ],
            ].map(([key, label]) => (
              <label key={key}>
                <input
                  type="checkbox"
                  checked={!!evidence[key]}
                  onChange={(e) =>
                    setEvidence({ ...evidence, [key]: e.target.checked })
                  }
                />
                {label}
              </label>
            ))}
            <p className="lesson-note">
              {t(
                "These checks are for your own preparation. Only the instructor’s review validates submitted work.",
                "Cette checklist prépare votre rendu. Seule la revue du formateur valide le travail soumis.",
              )}
            </p>
            {children}
          </section>
          <details className="lesson-answer">
            <summary>
              {t(
                "Finish cleanly: cleanup and recovery",
                "Terminer proprement : nettoyage et reprise",
              )}
            </summary>
            <p>{text(guide.cleanup)}</p>
          </details>
          {project && (
            <a
              className="lesson-text-link"
              href={project.url}
              target="_blank"
              rel="noreferrer"
            >
              {t(
                "Continue with the full DevSecOps capstone",
                "Poursuivre avec le projet complet DevSecOps",
              )}{" "}
              ↗
            </a>
          )}
        </TabsContent>
        <TabsContent value="check" className="lesson-pane">
          <section className="lesson-quiz">
            <span className="lesson-kicker">
              {t("QUICK UNDERSTANDING CHECK", "VÉRIFICATION RAPIDE")}
            </span>
            <h3>{text(guide.question)}</h3>
            <p>
              {t(
                "Choose the strongest explanation before checking the answer.",
                "Choisissez l’explication la plus solide avant de consulter la réponse.",
              )}
            </p>
            <fieldset disabled={checked}>
              <legend className="sr-only">{text(guide.question)}</legend>
              {options.map((option, index) => (
                <label
                  key={index}
                  className={choice === index ? "selected" : ""}
                >
                  <input
                    type="radio"
                    name={`quiz-${lesson.id}`}
                    checked={choice === index}
                    onChange={() => setChoice(index)}
                  />
                  <span>{text(option)}</span>
                </label>
              ))}
            </fieldset>
            {!checked ? (
              <Button
                disabled={choice === null}
                onClick={() => setChecked(true)}
              >
                {t("Check my reasoning", "Vérifier mon raisonnement")}
              </Button>
            ) : (
              <div
                role="status"
                className={`lesson-feedback ${choice === correct ? "correct" : "review"}`}
              >
                <strong>
                  {choice === correct
                    ? t("Good reasoning.", "Bon raisonnement.")
                    : t(
                        "Review this distinction, then try again.",
                        "Revoyez cette distinction puis réessayez.",
                      )}
                </strong>
                <p>{text(guide.answer)}</p>
                <button
                  onClick={() => {
                    setChecked(false);
                    setChoice(null);
                  }}
                >
                  {t("Try again", "Réessayer")}
                </button>
              </div>
            )}
          </section>
          <section className="lesson-interview">
            <span className="lesson-kicker">
              {lesson.track === "kids"
                ? t("EXPLAIN IT TO SOMEONE", "EXPLIQUE À QUELQU’UN")
                : t("INTERVIEW PRACTICE", "PRÉPARATION À L’ENTRETIEN")}
            </span>
            <h3>{t("Say it in your own words", "Expliquez avec vos mots")}</h3>
            <p>
              {t(
                "Try a spoken answer before expanding the model response. Use your project as evidence.",
                "Essayez de répondre à voix haute avant d’ouvrir le corrigé. Appuyez-vous sur votre projet.",
              )}
            </p>
            <details className="lesson-answer">
              <summary>{text(guide.question)}</summary>
              <p>{text(guide.answer)}</p>
            </details>
            <details className="lesson-answer">
              <summary>
                {t(
                  "How would you prove that your solution works?",
                  "Comment prouver que votre solution fonctionne ?",
                )}
              </summary>
              <p>{text(guide.verify)}</p>
              <p>
                {t(
                  "Describe the starting situation, your action, the observed result and one limitation. A screenshot alone does not explain the reasoning.",
                  "Décrivez situation, action, résultat observé et une limite. Une capture seule n’explique pas le raisonnement.",
                )}
              </p>
            </details>
            <details className="lesson-answer">
              <summary>
                {t(
                  "What would change in another environment?",
                  "Que faudrait-il adapter dans un autre environnement ?",
                )}
              </summary>
              <p>
                {lesson.track === "kids"
                  ? t(
                      "Check that the tool and files are available, ask an adult about access, and test the same expected result again.",
                      "Vérifiez outils et fichiers, demandez à un adulte pour les accès puis testez le même résultat.",
                    )
                  : t(
                      "Review identity and permissions, versions, network access, persistent data, resource capacity and recovery. Repeat both a successful test and a deliberately rejected or failed case.",
                      "Revoyez identité, permissions, versions, réseau, persistance, capacité et reprise. Répétez un succès et un cas volontairement refusé ou échoué.",
                    )}
              </p>
            </details>
          </section>
        </TabsContent>
        <TabsContent value="resources" className="lesson-pane">
          <section className="lesson-section">
            <span className="lesson-kicker">
              {t("SOURCE OF TECHNICAL DETAIL", "RÉFÉRENCES TECHNIQUES")}
            </span>
            <h3>
              {t("Documentation for this tool", "Documentation de cet outil")}
            </h3>
            <p>
              {t(
                "These links match the subject of this lesson. Read the documentation for your installed version before adapting a command.",
                "Ces liens correspondent au sujet de cette leçon. Consultez la documentation de votre version avant d’adapter une commande.",
              )}
            </p>
            <ul className="lesson-reference-list">
              {docs.map((doc) => (
                <li key={doc.url}>
                  <a
                    href={doc.url}
                    target="_blank"
                    rel="noreferrer"
                    data-reference-kind="documentation"
                  >
                    <BookOpen size={18} />
                    <span>
                      {doc.title}
                      <small>{new URL(doc.url).hostname}</small>
                    </span>
                    <ArrowUpRight size={18} />
                  </a>
                </li>
              ))}
            </ul>
          </section>
          <section className="lesson-section">
            <h3>{t("YouTube references", "Références YouTube")}</h3>
            {videos.length > 0 && (
              <ul className="lesson-reference-list">
                {videos.map((video) => (
                  <li key={video.url}>
                    <a href={video.url} target="_blank" rel="noreferrer">
                      {video.title}
                      <ArrowUpRight size={18} />
                    </a>
                  </li>
                ))}
              </ul>
            )}
            <p>
              {t(
                "Older videos help explain concepts, but commands and product versions may have changed. Compare them with the official docs. No video loads until you open its link.",
                "Les anciennes vidéos expliquent les concepts, mais commandes et versions peuvent changer. Comparez à la documentation officielle. Aucune vidéo ne charge avant ouverture du lien.",
              )}
            </p>
            <a
              className="lesson-text-link"
              href={`https://www.youtube.com/results?search_query=${encodeURIComponent(`${guide.topic} ${locale === "fr" ? "tutoriel français" : "official tutorial"}`)}`}
              target="_blank"
              rel="noreferrer"
            >
              {t(
                "Find more videos on this topic",
                "Chercher d’autres vidéos sur ce sujet",
              )}{" "}
              ↗
            </a>
            <p className="lesson-note">
              {t(
                "Search results are suggestions to evaluate, not reviewed course endorsements.",
                "Les résultats de recherche sont à évaluer ; ils ne constituent pas une sélection de cours validés.",
              )}
            </p>
          </section>
          <p className="lesson-note">
            {t("Reference review: ", "Revue des références : ")}
            {referencesReviewed}.{" "}
            {t(
              "Original teaching material; exercise lengths are estimates.",
              "Contenu pédagogique original ; les durées d’exercice sont indicatives.",
            )}
          </p>
        </TabsContent>
      </Tabs>
    </div>
  );
}
