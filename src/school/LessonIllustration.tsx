import { useLanguage } from "../campus/lib/language";
// Lightweight vector illustrations work without external images or video downloads.
export function LessonIllustration({ subject }: { subject: string }) {
  const { locale } = useLanguage(),
    fr = locale === "fr";
  const labels =
    subject === "svt"
      ? fr
        ? ["Cellule", "Tissu", "Organe"]
        : ["Cell", "Tissue", "Organ"]
      : subject === "computing"
        ? fr
          ? ["Entrée", "Instructions", "Résultat"]
          : ["Input", "Instructions", "Output"]
        : subject === "pct"
          ? fr
            ? ["Prédire", "Mesurer", "Expliquer"]
            : ["Predict", "Measure", "Explain"]
          : subject === "math"
            ? fr
              ? ["Énoncé", "Méthode", "Vérification"]
              : ["Problem", "Method", "Check"]
            : fr
              ? ["Idée", "Preuve", "Explication"]
              : ["Idea", "Evidence", "Explanation"];
  return (
    <figure className={`school-illustration school-illustration-${subject}`}>
      <svg viewBox="0 0 660 150" role="img" aria-label={labels.join(" → ")}>
        <path
          d="M95 62 H565"
          stroke="currentColor"
          strokeWidth="2"
          strokeDasharray="6 7"
          opacity=".3"
        />
        {labels.map((label, i) => (
          <g key={label} transform={`translate(${110 + i * 220}, 62)`}>
            <circle r="40" fill="var(--school-art-fill, #e5eefa)" />
            <circle r="31" fill="none" stroke="currentColor" opacity=".18" />
            <text
              y="7"
              textAnchor="middle"
              fontSize="23"
              fontWeight="700"
              fill="currentColor"
            >
              {i + 1}
            </text>
            <text y="72" textAnchor="middle" fontSize="17" fill="currentColor">
              {label}
            </text>
          </g>
        ))}
      </svg>
      <figcaption>
        {fr
          ? "Comprendre la démarche, puis la mettre en pratique."
          : "Understand the process, then put it into practice."}
      </figcaption>
    </figure>
  );
}
