import { useEffect, useId, useState } from "react";
import {
  Monitor,
  Server,
  Database,
  ShieldCheck,
  GitBranch,
  Box,
  Activity,
  Play,
  Pause,
  ArrowRight,
} from "lucide-react";
import { useLanguage } from "./lib/language";
import type { LessonGuide } from "./lib/lesson-guide-model";
const symbols = {
  linux: [Monitor, Server, Database, ShieldCheck],
  git: [Monitor, GitBranch, GitBranch, ShieldCheck],
  containers: [Monitor, Box, Database, ShieldCheck],
  pipeline: [GitBranch, ShieldCheck, Box, Server],
  cloud: [Monitor, ShieldCheck, Server, Database],
  iac: [Monitor, GitBranch, Server, ShieldCheck],
  kubernetes: [Box, Server, Box, Activity],
  observe: [Server, Activity, Database, Monitor],
  security: [Box, ShieldCheck, GitBranch, ShieldCheck],
  kids: [Monitor, Box, Server, ShieldCheck],
};
export function LessonDiagram({ guide }: { guide: LessonGuide }) {
  const { locale, t } = useLanguage(),
    captionId = useId();
  const [active, setActive] = useState(0),
    [playing, setPlaying] = useState(false);
  const [reduced, setReduced] = useState(
    () =>
      typeof window.matchMedia === "function" &&
      window.matchMedia("(prefers-reduced-motion: reduce)").matches,
  );
  useEffect(() => {
    if (typeof window.matchMedia !== "function") return;
    const media = window.matchMedia("(prefers-reduced-motion: reduce)");
    const change = () => {
      setReduced(media.matches);
      if (media.matches) setPlaying(false);
    };
    media.addEventListener("change", change);
    return () => media.removeEventListener("change", change);
  }, []);
  useEffect(() => {
    if (!playing || reduced) return;
    const timer = window.setTimeout(() => {
      if (active === 3) setPlaying(false);
      else setActive(active + 1);
    }, 1400);
    return () => clearTimeout(timer);
  }, [playing, active, reduced]);
  return (
    <figure
      className={`lesson-diagram ${playing && !reduced ? "is-playing" : ""}`}
      aria-labelledby={captionId}
    >
      <div className="diagram-heading">
        <span>{t("The idea, illustrated", "Le principe, en image")}</span>
        <button
          type="button"
          onClick={() => {
            if (reduced) setActive((active + 1) % 4);
            else if (playing) setPlaying(false);
            else {
              setActive(0);
              setPlaying(true);
            }
          }}
          aria-pressed={playing}
        >
          {reduced ? (
            <ArrowRight size={15} />
          ) : playing ? (
            <Pause size={15} />
          ) : (
            <Play size={15} />
          )}
          {reduced
            ? t("Next step", "Étape suivante")
            : playing
              ? t("Pause", "Pause")
              : t("Play the flow", "Animer le parcours")}
        </button>
      </div>
      <ol className="diagram-flow">
        {guide.flow.map((node, i) => {
          const Icon = symbols[guide.family][i];
          return (
            <li key={i} className={active === i ? "flow-active" : ""}>
              <div className="diagram-illustration">
                <svg viewBox="0 0 100 78" aria-hidden="true">
                  <rect
                    x="14"
                    y="8"
                    width="72"
                    height="53"
                    rx="11"
                    fill="currentColor"
                    opacity=".10"
                  />
                  <path
                    d="M28 66h44M40 61v5m20-5v5"
                    stroke="currentColor"
                    strokeWidth="3"
                    strokeLinecap="round"
                  />
                  <circle
                    cx="77"
                    cy="16"
                    r="8"
                    fill="currentColor"
                    opacity=".25"
                  />
                </svg>
                <Icon size={28} aria-hidden="true" />
              </div>
              <span className="flow-number">0{i + 1}</span>
              <strong>{node[locale === "en" ? 0 : 1]}</strong>
            </li>
          );
        })}
      </ol>
      <figcaption id={captionId}>
        {t(
          "Read the four stages in order. The illustration shows the concept; the lab below provides the implementation.",
          "Lisez les quatre étapes dans l’ordre. Le schéma explique le principe ; le laboratoire donne sa mise en pratique.",
        )}
      </figcaption>
    </figure>
  );
}
