import { tx } from "../../campus/lib/language";
import { documentationFor } from "../../campus/lib/lesson-references";
import { curriculum } from "../../campus/lib/curriculum";
import { ownerEmail } from "../../campus/lib/workspace";
import { useLocale } from "../../i18n/LocaleContext";
import "../../learning-preview.css";

export function LearningPreview({
  track,
  expanded = false,
}: {
  track?: "kids" | "devops";
  expanded?: boolean;
}) {
  const { locale } = useLocale(),
    fr = locale === "fr";
  const lessons = curriculum.filter((l) => !track || l.track === track);
  const modules = [...new Set(lessons.map((l) => l.module))];
  return (
    <section className="public-learning">
      <div className="public-learning__intro">
        <span>
          {fr
            ? "COMPRENDRE · PRATIQUER · PROGRESSER"
            : "UNDERSTAND · PRACTISE · GROW"}
        </span>
        <h2>
          {track === "kids"
            ? fr
              ? "Des composants de l’ordinateur au cloud."
              : "From computer components to the cloud."
            : fr
              ? "Des fondations aux projets DevOps."
              : "From foundations to DevOps projects."}
        </h2>
        <p>
          {fr
            ? "Des explications, des exercices et des critères de réussite pour progresser étape par étape."
            : "Explanations, hands-on exercises and clear success criteria to progress step by step."}
        </p>
        <a
          className="public-campus-button"
          href={`${import.meta.env.BASE_URL}campus.html#courses`}
        >
          {fr ? "Ouvrir le campus local" : "Open the local campus"} →
        </a>
      </div>
      <div className="public-module-grid">
        {(expanded ? modules : modules.slice(0, 6)).map((module, i) => (
          <article key={module}>
            <span className="public-module-number">
              {String(i + 1).padStart(2, "0")}
            </span>
            <h3>{tx(module)}</h3>
            {lessons
              .filter((l) => l.module === module)
              .map((l) => (
                <details key={l.id}>
                  <summary>{tx(l.title)}</summary>
                  <p>{tx(l.explanation)}</p>
                  <strong>
                    {fr ? "À toi de pratiquer" : "Your practice task"}
                  </strong>
                  <p>{tx(l.task)}</p>
                  <strong>{fr ? "À remettre" : "Evidence to submit"}</strong>
                  <p>{tx(l.criteria)}</p>
                  <a
                    href={documentationFor(l.id)[0]?.url || l.resource}
                    target="_blank"
                    rel="noreferrer"
                  >
                    {fr
                      ? "Documentation de référence"
                      : "Reference documentation"}{" "}
                    ↗
                  </a>
                </details>
              ))}
          </article>
        ))}
      </div>
      <div className="public-career-callout">
        <div>
          <span>
            {fr ? "ATELIER CARRIÈRE LESSGOOO" : "LESSGOOO CAREER LAB"}
          </span>
          <h3>
            {fr
              ? "Prépare ton prochain entretien."
              : "Prepare for your next interview."}
          </h3>
          <p>
            {fr
              ? "Entraînement technique, récit de tes projets et organisation des candidatures. Enregistre ton intérêt dans le campus ; modalités et tarif à convenir."
              : "Technical practice, project storytelling and application tracking. Register your interest in the campus; terms and pricing to be agreed."}
          </p>
        </div>
        <a href={`${import.meta.env.BASE_URL}campus.html#career`}>
          {fr ? "M’inscrire à la préparation" : "Register my interest"} →
        </a>
      </div>
      <p className="public-learning-contact">
        {fr
          ? "Pour parler de ton parcours :"
          : "To discuss your learning path:"}{" "}
        <a href={`mailto:${ownerEmail}`}>{ownerEmail}</a>
      </p>
    </section>
  );
}
