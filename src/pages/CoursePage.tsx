import { Link, useParams, useSearchParams } from "react-router-dom";
import {
  findCourse,
  startingChecklist,
  type CourseText,
} from "../campus/lib/course-catalog";
import { curriculum } from "../campus/lib/curriculum";
import { documentationFor } from "../campus/lib/lesson-references";
import { tx } from "../campus/lib/language";
import { useLocale } from "../i18n/LocaleContext";
import { Section } from "../components/ui/Section";
import { NotFoundPage } from "./NotFoundPage";
export function CoursePage() {
  const { courseId } = useParams();
  const [params] = useSearchParams();
  const { locale } = useLocale();
  const fr = locale === "fr",
    company = params.get("view") === "company";
  const course = findCourse(courseId || "");
  if (!course) return <NotFoundPage />;
  const list = (items: CourseText[]) => (
    <ul className="readable-list">
      {items.map((item, i) => (
        <li key={i}>{item[locale]}</li>
      ))}
    </ul>
  );
  const lessons = curriculum.filter((l) => course.lessons.includes(l.id));
  return (
    <>
      <Section className="page-intro">
        <Link to={company ? "/services" : "/programs"}>
          ← {fr ? "Tous les domaines" : "All areas"}
        </Link>
        <p className="eyebrow">
          {fr
            ? "Apprendre · Pratiquer · Appliquer"
            : "Learn · Practise · Apply"}
        </p>
        <h1>{course.title[locale]}</h1>
        <p className="page-intro__description">
          {(company ? course.company : course.description)[locale]}
        </p>
        <Link
          className="button button--primary"
          to={
            "/contact?service=" +
            (company ? "company" : "training") +
            "&course=" +
            course.id
          }
        >
          {company
            ? fr
              ? "Décrire le besoin de mon entreprise"
              : "Discuss my company’s needs"
            : fr
              ? "Parler de mon projet de formation"
              : "Discuss my learning goals"}
        </Link>
      </Section>
      <Section tone="subtle">
        <div className="public-two-column">
          <article>
            <h2>{fr ? "À qui s’adresse ce domaine ?" : "Who is this for?"}</h2>
            <p>{course.audience[locale]}</p>
            <h3>
              {fr ? "Le rôle dans la vie professionnelle" : "The role at work"}
            </h3>
            <p>{course.role[locale]}</p>
          </article>
          <article>
            <h2>{fr ? "Avant de commencer" : "Before you start"}</h2>
            {list(course.prerequisites)}
            <details>
              <summary>
                {fr
                  ? "Le matériel et les bases communes"
                  : "Equipment and shared basics"}
              </summary>
              {list(startingChecklist)}
            </details>
          </article>
        </div>
      </Section>
      <Section>
        <h2>
          {fr ? "Votre parcours, étape par étape" : "Your path, step by step"}
        </h2>
        <p>
          {fr
            ? "Un aperçu du parcours et des activités de démarrage. Les contenus de leçons disponibles sont présentés plus bas."
            : "A course outline with starter activities. Available lesson content is shown below."}
        </p>
        <ol className="learning-path">
          {course.phases.map((phase, i) => (
            <li key={i}>
              <span aria-hidden="true">0{i + 1}</span>
              <h3>{phase.title[locale]}</h3>
              <p>{phase.practice[locale]}</p>
            </li>
          ))}
        </ol>
        <div className="public-notice">
          <h3>{fr ? "Votre projet pratique" : "Your practical project"}</h3>
          <p>{course.project[locale]}</p>
          <h4>
            {fr
              ? "Ce que vous devez pouvoir montrer"
              : "What you should be able to show"}
          </h4>
          {list(course.evidence)}
        </div>
      </Section>
      <Section tone="subtle">
        <h2>{fr ? "Pour les entreprises" : "For companies"}</h2>
        <div className="public-two-column">
          <div>
            <p>{course.company[locale]}</p>
            {list(course.deliverables)}
          </div>
          <div>
            <h3>{fr ? "Préparer notre échange" : "Prepare our discussion"}</h3>
            <p>{course.companyNeeds[locale]}</p>
            <Link
              className="button button--secondary"
              to={"/contact?service=company&course=" + course.id}
            >
              {fr ? "Préparer ma demande" : "Prepare my enquiry"}
            </Link>
          </div>
        </div>
      </Section>
      <Section>
        <h2>{fr ? "Commencez à explorer" : "Start exploring"}</h2>
        <p>
          <a href={course.documentation.url} target="_blank" rel="noreferrer">
            {course.documentation.label} ↗
          </a>
        </p>
        {lessons.length > 0 ? (
          <div className="public-lesson-list">
            {lessons.map((l) => (
              <details key={l.id}>
                <summary>{tx(l.title)}</summary>
                <p>{tx(l.explanation)}</p>
                <h3>{fr ? "À vous de pratiquer" : "Your practice task"}</h3>
                <p>{tx(l.task)}</p>
                <h3>{fr ? "Résultat attendu" : "Expected result"}</h3>
                <p>{tx(l.criteria)}</p>
                {documentationFor(l.id).map((d) => (
                  <p key={d.url}>
                    <a href={d.url} target="_blank" rel="noreferrer">
                      {d.title} ↗
                    </a>
                  </p>
                ))}
              </details>
            ))}
          </div>
        ) : (
          <p>
            {fr
              ? "Commencez par les activités du parcours et la documentation ci-dessus. Ce domaine ne dispose pas encore de leçons détaillées dans la bibliothèque."
              : "Start with the course activities and documentation above. This area does not yet have detailed lessons in the library."}
          </p>
        )}
        <p className="public-notice">
          {fr
            ? "Le campus local permet de travailler sur les leçons disponibles, les devoirs et les projets. Il nécessite le serveur local de l’application."
            : "Use the local campus for available lessons, homework and projects. It requires the application’s local server."}{" "}
          <a href={import.meta.env.BASE_URL + "campus.html#courses"}>
            {fr ? "Ouvrir le campus" : "Open the campus"} →
          </a>
        </p>
      </Section>
    </>
  );
}
