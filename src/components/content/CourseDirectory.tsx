import { useState } from "react";
import { Link } from "react-router-dom";
import { courseCatalog, type CourseId } from "../../campus/lib/course-catalog";
import { useLocale } from "../../i18n/LocaleContext";
export function CourseDirectory({
  company = false,
  ids,
}: {
  company?: boolean;
  ids?: CourseId[];
}) {
  const { locale } = useLocale();
  const fr = locale === "fr";
  const [query, setQuery] = useState("");
  const normalize = (s: string) =>
    s
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "")
      .toLowerCase();
  const available = courseCatalog.filter((c) => !ids || ids.includes(c.id));
  const courses = available.filter((c) =>
    normalize(
      [
        c.title[locale],
        c.description[locale],
        c.company[locale],
        c.audience[locale],
      ].join(" "),
    ).includes(normalize(query.trim())),
  );
  return (
    <div className="course-directory">
      {available.length > 3 && (
        <div className="directory-search">
          <label htmlFor="course-search">
            {fr
              ? "Quel domaine vous intéresse ?"
              : "What would you like to explore?"}
          </label>
          <input
            id="course-search"
            type="search"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder={
              fr
                ? "Cloud, design, bureautique…"
                : "Cloud, design, office skills…"
            }
          />
          <p role="status">
            {courses.length} / {available.length} {fr ? "domaines" : "areas"}
          </p>
        </div>
      )}
      <div className="program-grid">
        {courses.map((c) => (
          <article className="program-card course-card" key={c.id}>
            <span className="eyebrow">
              {company
                ? fr
                  ? "Service aux entreprises"
                  : "Company service"
                : fr
                  ? "Formation pratique"
                  : "Practical course"}
            </span>
            <h3>{c.title[locale]}</h3>
            <p>{(company ? c.company : c.description)[locale]}</p>
            <details>
              <summary>
                {company
                  ? fr
                    ? "Ce qu’il faut préparer"
                    : "What to prepare"
                  : fr
                    ? "Avant de commencer"
                    : "Before you start"}
              </summary>
              <p>
                {company ? c.companyNeeds[locale] : c.prerequisites[0][locale]}
              </p>
            </details>
            <Link
              className="text-link"
              to={"/courses/" + c.id + (company ? "?view=company" : "")}
              aria-label={(fr ? "Découvrir : " : "Explore: ") + c.title[locale]}
            >
              {fr ? "Découvrir ce domaine" : "Explore this area"} →
            </Link>
          </article>
        ))}
      </div>
      {!courses.length && (
        <div className="public-notice">
          <p>
            {fr
              ? "Aucun domaine ne correspond. Essayez un autre mot ou consultez tous les domaines."
              : "No matching areas. Try another word or browse all areas."}
          </p>
          <button className="button" onClick={() => setQuery("")}>
            {fr ? "Effacer la recherche" : "Clear search"}
          </button>
        </div>
      )}
    </div>
  );
}
