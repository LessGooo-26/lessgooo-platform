import { useState } from "react";
import { useLanguage } from "../campus/lib/language";
import { scoreQuiz, type Chapter } from "./model";
import { makePractice, practiceTopics, type PracticeTopic } from "./practice";
import { schoolError } from "./api";

export function SchoolQuiz({
  chapter,
  onSubmit,
  preview = false,
}: {
  chapter: Chapter;
  onSubmit?: (answers: Record<string, number>) => Promise<void>;
  preview?: boolean;
}) {
  const { locale } = useLanguage(),
    fr = locale === "fr";
  const [answers, setAnswers] = useState<Record<string, number>>({}),
    [result, setResult] = useState<ReturnType<typeof scoreQuiz> | null>(null),
    [busy, setBusy] = useState(false),
    [error, setError] = useState("");
  return (
    <form
      className="school-quiz"
      onSubmit={async (e) => {
        e.preventDefault();
        setError("");
        setBusy(true);
        try {
          const score = scoreQuiz(chapter, answers);
          await onSubmit?.(answers);
          setResult(score);
        } catch (err) {
          setError(
            schoolError(
              err instanceof Error && err.message === "Complete every question"
                ? new Error("SCHOOL_ANSWERS")
                : err,
              fr,
            ),
          );
        } finally {
          setBusy(false);
        }
      }}
    >
      <h3>
        {fr ? "Je vérifie ce que j'ai compris" : "Check your understanding"}
      </h3>
      <p>
        {fr
          ? "Ce quiz d'entraînement ne remplace pas une évaluation scolaire. Vous pouvez recommencer."
          : "This practice quiz is not a school assessment. You can try again."}
      </p>
      {chapter.questions.map((q, index) => (
        <fieldset key={q.id} disabled={busy || Boolean(result)}>
          <legend>
            {index + 1}. {q.prompt[locale]}
          </legend>
          {q.choices.map((choice, i) => (
            <label className="school-choice" key={i}>
              <input
                type="radio"
                name={q.id}
                checked={answers[q.id] === i}
                onChange={() => setAnswers({ ...answers, [q.id]: i })}
                required
              />
              {choice[locale]}
            </label>
          ))}
          {result && (
            <div
              className={
                answers[q.id] === q.answer ? "school-correct" : "school-revise"
              }
            >
              <strong>
                {answers[q.id] === q.answer
                  ? fr
                    ? "Bien compris"
                    : "Correct"
                  : fr
                    ? "À reprendre"
                    : "Review this"}
              </strong>
              <p>
                {fr ? "Réponse : " : "Answer: "}
                {q.choices[q.answer][locale]}
              </p>
              <p>{q.explanation[locale]}</p>
            </div>
          )}
        </fieldset>
      ))}
      {error && (
        <p role="alert" className="school-error">
          {error}
        </p>
      )}
      {result ? (
        <div role="status">
          <strong>
            {result.correct} / {result.total} —{" "}
            {fr
              ? "Lisez les corrections, puis réessayez."
              : "Read the explanations, then try again."}
          </strong>
          <button
            type="button"
            onClick={() => {
              setResult(null);
              setAnswers({});
            }}
          >
            {fr ? "Recommencer" : "Try again"}
          </button>
        </div>
      ) : (
        <button className="school-primary" disabled={busy}>
          {busy
            ? fr
              ? "Enregistrement…"
              : "Saving…"
            : preview
              ? fr
                ? "Voir ma correction sans enregistrer"
                : "Check without saving"
              : fr
                ? "Corriger mon quiz"
                : "Check my quiz"}
        </button>
      )}
    </form>
  );
}

export function PracticeGenerator() {
  const { locale } = useLanguage(),
    fr = locale === "fr";
  const [topic, setTopic] = useState<PracticeTopic>("equations"),
    [seed, setSeed] = useState(165),
    [answer, setAnswer] = useState(""),
    [checked, setChecked] = useState(false);
  const item = makePractice(topic, seed);
  const labels = fr
    ? ["Équations", "Pourcentages", "Aires", "Probabilités"]
    : ["Equations", "Percentages", "Areas", "Probability"];
  const next = () => {
    setSeed(Math.floor(Math.random() * 100000));
    setAnswer("");
    setChecked(false);
  };
  return (
    <section className="school-card school-practice">
      <span className="school-tag">
        {fr ? "Entraînement renouvelable" : "Fresh practice"}
      </span>
      <h3>
        {fr ? "Un petit problème, chaque jour" : "A small problem, every day"}
      </h3>
      <p>
        {fr
          ? "Les nombres changent. Expliquez votre démarche sur papier avant de vérifier. Ces essais ne sont pas ajoutés aux notes."
          : "The numbers change. Explain your method on paper before checking. These attempts are not added to marks."}
      </p>
      <label>
        {fr ? "Compétence" : "Skill"}
        <select
          value={topic}
          onChange={(e) => {
            setTopic(e.target.value as PracticeTopic);
            next();
          }}
        >
          {practiceTopics.map((v, i) => (
            <option key={v} value={v}>
              {labels[i]}
            </option>
          ))}
        </select>
      </label>
      <form
        onSubmit={(e) => {
          e.preventDefault();
          setChecked(true);
        }}
      >
        <label>
          {item.prompt[locale]}
          <input
            type="number"
            step="any"
            required
            value={answer}
            onChange={(e) => {
              setAnswer(e.target.value);
              setChecked(false);
            }}
          />
        </label>
        <div className="school-actions">
          <button className="school-primary">
            {fr ? "Vérifier" : "Check"}
          </button>
          <button type="button" onClick={next}>
            {fr ? "Un autre problème" : "Another problem"}
          </button>
        </div>
      </form>
      {checked && (
        <div
          role="status"
          className={
            Number(answer) === item.answer ? "school-correct" : "school-revise"
          }
        >
          <strong>
            {Number(answer) === item.answer
              ? fr
                ? "Bonne réponse"
                : "Correct"
              : fr
                ? "Reprenons la méthode"
                : "Let's review the method"}
          </strong>
          <p>{item.explanation[locale]}</p>
        </div>
      )}
    </section>
  );
}
