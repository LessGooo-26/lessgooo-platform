import { useState } from "react";
import { useLanguage } from "../campus/lib/language";
import { guidancePaths, suggestPaths } from "./guidance";
import { profileSchema, type SchoolProfile, type SchoolCatalog } from "./model";
import { schoolError } from "./api";

export function SchoolOrientation({
  catalog,
  classId,
  initial,
  onSave,
  readOnly,
}: {
  catalog: SchoolCatalog;
  classId: string;
  initial: SchoolProfile | null;
  onSave?: (profile: SchoolProfile) => Promise<void>;
  readOnly: boolean;
}) {
  const { locale } = useLanguage(),
    fr = locale === "fr";
  const [profile, setProfile] = useState<SchoolProfile>(
      initial || { classId, grades: [], interests: [] },
    ),
    [shown, setShown] = useState(Boolean(initial)),
    [busy, setBusy] = useState(false),
    [message, setMessage] = useState("");
  const [subject, setSubject] = useState("math"),
    [score, setScore] = useState(""),
    [maximum, setMaximum] = useState("20");
  const recommendations = suggestPaths(profile);
  return (
    <div className="school-orientation">
      <div className="school-section-heading">
        <span className="school-tag">
          {fr ? "Mon avenir reste ouvert" : "Keep your options open"}
        </span>
        <h2>
          {fr
            ? "Explorer des pistes qui me ressemblent"
            : "Explore paths that fit your interests"}
        </h2>
        <p>
          {fr
            ? "Vos intérêts guident les premières suggestions. Les notes renseignées apportent des repères, jamais une décision d'admission ou une limite à votre avenir."
            : "Your interests guide the first suggestions. Self-reported marks provide context, never an admission decision or a limit on your future."}
        </p>
      </div>
      <fieldset disabled={readOnly || busy} className="school-card">
        <legend>{fr ? "Ce que j'aime faire" : "What I enjoy"}</legend>
        <div className="school-interest-grid">
          {guidancePaths.map((path) => (
            <label className="school-choice" key={path.id}>
              <input
                type="checkbox"
                checked={profile.interests.includes(path.id)}
                onChange={(e) => {
                  setShown(false);
                  setProfile({
                    ...profile,
                    interests: e.target.checked
                      ? [...profile.interests, path.id]
                      : profile.interests.filter((id) => id !== path.id),
                  });
                }}
              />
              {path.title[locale]}
            </label>
          ))}
        </div>
      </fieldset>
      <section className="school-card">
        <h3>
          {fr
            ? "Mes notes déclarées (facultatif)"
            : "My self-reported marks (optional)"}
        </h3>
        <p>
          {fr
            ? "Une note manquante reste inconnue. Saisissez son barème réel : sur 20, 100 ou un autre total. Aucun bulletin n'est téléversé."
            : "A missing mark stays unknown. Enter its actual scale: out of 20, 100 or another total. No school report is uploaded."}
        </p>
        {!readOnly && (
          <form
            className="school-form-row"
            onSubmit={(e) => {
              e.preventDefault();
              const g = {
                subjectId: subject,
                score: Number(score),
                maximum: Number(maximum),
              };
              const next = {
                ...profile,
                grades: [
                  ...profile.grades.filter((v) => v.subjectId !== subject),
                  g,
                ],
              };
              if (!profileSchema.safeParse(next).success) {
                setMessage(
                  fr
                    ? "La note doit être comprise entre zéro et le barème."
                    : "The mark must be between zero and the maximum.",
                );
                return;
              }
              setProfile(next);
              setScore("");
              setShown(false);
              setMessage("");
            }}
          >
            <label>
              {fr ? "Matière" : "Subject"}
              <select
                value={subject}
                onChange={(e) => setSubject(e.target.value)}
              >
                {catalog.subjects
                  .filter((s) => s.active)
                  .map((s) => (
                    <option key={s.id} value={s.id}>
                      {s.name[locale]}
                    </option>
                  ))}
              </select>
            </label>
            <label>
              {fr ? "Note" : "Mark"}
              <input
                type="number"
                required
                min="0"
                step="0.01"
                value={score}
                onChange={(e) => setScore(e.target.value)}
              />
            </label>
            <label>
              {fr ? "Sur" : "Out of"}
              <input
                type="number"
                required
                min="0.01"
                max="1000"
                step="0.01"
                value={maximum}
                onChange={(e) => setMaximum(e.target.value)}
              />
            </label>
            <button disabled={busy}>
              {fr ? "Ajouter la note" : "Add mark"}
            </button>
          </form>
        )}
        <ul className="school-mark-list">
          {profile.grades.map((g) => (
            <li key={g.subjectId}>
              <span>
                {catalog.subjects.find((s) => s.id === g.subjectId)?.name[
                  locale
                ] || g.subjectId}{" "}
                <strong>
                  {g.score}/{g.maximum}
                </strong>
              </span>
              {!readOnly && (
                <button
                  aria-label={`${fr ? "Retirer la note : " : "Remove mark: "}${catalog.subjects.find((s) => s.id === g.subjectId)?.name[locale] || g.subjectId}`}
                  onClick={() => {
                    setProfile({
                      ...profile,
                      grades: profile.grades.filter(
                        (v) => v.subjectId !== g.subjectId,
                      ),
                    });
                    setShown(false);
                  }}
                >
                  ×
                </button>
              )}
            </li>
          ))}
        </ul>
      </section>
      <button
        className="school-primary"
        disabled={busy}
        onClick={async () => {
          setBusy(true);
          setMessage("");
          try {
            if (!readOnly) await onSave?.({ ...profile, classId });
            setShown(true);
          } catch (e) {
            setMessage(schoolError(e, fr));
          } finally {
            setBusy(false);
          }
        }}
      >
        {fr ? "Explorer mes pistes" : "Explore my options"}
      </button>
      {message && <p role="alert">{message}</p>}
      {shown && (
        <section aria-live="polite">
          <p className="school-note">
            {fr
              ? "Méthode : centres d'intérêt d'abord, puis moyenne des notes disponibles liées au domaine, ramenées au même barème. Aucune filière n'est exclue. Ces pistes ne constituent pas un test d'aptitude validé."
              : "Method: interests first, then the average of available related marks on a common scale. No path is excluded. This is not a validated aptitude assessment."}
          </p>
          <div className="school-grid">
            {recommendations.map((path) => (
              <article key={path.id} className="school-card">
                <span className="school-tag">
                  {path.interested
                    ? fr
                      ? "Un de vos intérêts"
                      : "One of your interests"
                    : fr
                      ? "À découvrir aussi"
                      : "Also explore"}
                </span>
                <h3>{path.title[locale]}</h3>
                <p>{path.examples[locale]}</p>
                <p>
                  {path.average === null
                    ? fr
                      ? "Aucune note liée à ce domaine n'est renseignée."
                      : "No related marks have been entered."
                    : `${fr ? "Repère déclaré" : "Self-reported reference"} : ${Math.round(path.average * 100)} % (${path.evidence.length} ${fr ? "matière(s)" : "subject(s)"}).`}
                </p>
                {path.evidence.length > 0 && (
                  <p className="school-muted">
                    {path.evidence
                      .map(
                        (g) =>
                          `${catalog.subjects.find((s) => s.id === g.subjectId)?.name[locale] || g.subjectId} ${g.score}/${g.maximum}`,
                      )
                      .join(" · ")}
                  </p>
                )}
              </article>
            ))}
          </div>
          <p>
            {fr
              ? "Comparez les programmes, les coûts, les conditions d'accès et les métiers avec un conseiller et votre famille."
              : "Compare programmes, costs, entry requirements and careers with a counsellor and your family."}{" "}
            <a
              href="https://www.minesup.gov.cm/"
              target="_blank"
              rel="noreferrer"
            >
              {fr ? "Consulter le MINESUP" : "Consult MINESUP"} ↗
            </a>
          </p>
        </section>
      )}
    </div>
  );
}
