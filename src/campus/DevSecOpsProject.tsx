import runbookDownload from "../../README.md?url";
import { ArrowRight, BookOpen, ShieldCheck } from "lucide-react";
import { useLanguage } from "./lib/language";
import {
  devsecopsGuide,
  devsecopsPhases,
  type ProjectCopy,
} from "./lib/devsecops-project";
import "./devsecops-project.css";

export function DevSecOpsProject() {
  const { locale, t } = useLanguage();
  const text = (value: ProjectCopy) => value[locale];
  return (
    <section
      className="devsecops-project panel"
      aria-labelledby="devsecops-title"
    >
      <div className="devsecops-intro">
        <span className="devsecops-eyebrow">
          <ShieldCheck size={18} />{" "}
          {t("HANDS-ON PROJECT · 10 PHASES", "PROJET PRATIQUE · 10 PHASES")}
        </span>
        <h2 id="devsecops-title">
          {t(
            "Take LESSGOOO from code to a cloud lab",
            "Du code LESSGOOO au laboratoire cloud",
          )}
        </h2>
        <p>
          {t(
            "Build it. Secure it. Deploy it. Explain it. Use this campus application to practice the full DevSecOps journey, one phase at a time.",
            "Construire, sécuriser, déployer, expliquer. Utilisez ce campus pour pratiquer tout le parcours DevSecOps, une phase à la fois.",
          )}
        </p>
        <a
          className="devsecops-guide"
          href={devsecopsGuide}
          target="_blank"
          rel="noreferrer"
        >
          <BookOpen size={18} />{" "}
          {t("Open the step-by-step runbook", "Ouvrir le guide pas à pas")}{" "}
          <ArrowRight size={18} />
        </a>
        <a
          className="devsecops-download"
          href={runbookDownload}
          download="LESSGOOO-DevSecOps-README.md"
        >
          {t(
            "Download this runbook for offline study",
            "Télécharger ce guide pour travailler hors ligne",
          )}
        </a>
      </div>
      <ol
        className="devsecops-flow"
        aria-label={t("Project journey", "Parcours du projet")}
      >
        {[
          t("Code", "Code"),
          t("Security + SBOM", "Sécurité + SBOM"),
          t("Containers", "Conteneurs"),
          t("EKS + Argo CD", "EKS + Argo CD"),
          t("Observe + recover", "Observer + restaurer"),
        ].map((stage) => (
          <li key={stage}>{stage}</li>
        ))}
      </ol>
      <p className="devsecops-lab-note">
        {t(
          "Start locally with fictional data. AWS is optional and paid: agree a budget before creating resources. This demo has no real login system; keep the lab private.",
          "Commencez en local avec des données fictives. AWS est facultatif et payant : convenez d’un budget avant toute création. Cette démo n’a pas de vraie connexion utilisateur ; gardez le laboratoire privé.",
        )}
      </p>
      <div className="devsecops-phases">
        {devsecopsPhases.map((phase, index) => (
          <details key={phase.id} className="devsecops-phase">
            <summary>
              <span className="devsecops-phase-number">
                {String(index + 1).padStart(2, "0")}
              </span>
              <span>
                <strong>{text(phase.title)}</strong>
                <small>{text(phase.goal)}</small>
              </span>
            </summary>
            <div className="devsecops-phase-body">
              <h3>{t("Your tasks", "Vos exercices")}</h3>
              <ul>
                {phase.tasks.map((task) => (
                  <li key={task.en}>{text(task)}</li>
                ))}
              </ul>
              <h3>{t("Evidence to submit", "Preuves à remettre")}</h3>
              <p>{text(phase.evidence)}</p>
              <h3>{t("Ready to move on when…", "Passer à la suite quand…")}</h3>
              <p>{text(phase.check)}</p>
              <a
                href={devsecopsGuide + "#" + phase.id}
                target="_blank"
                rel="noreferrer"
              >
                {t("Commands and explanations", "Commandes et explications")}{" "}
                <ArrowRight size={14} />
              </a>
            </div>
          </details>
        ))}
      </div>
      <p className="devsecops-evidence-note">
        {t(
          "Keep commands, redacted screenshots and decisions in your notebook or project repository. Ask your instructor to review the evidence for each phase. Opening a phase does not mark it complete.",
          "Gardez commandes, captures expurgées et décisions dans votre carnet ou dépôt. Demandez au formateur de relire les preuves de chaque phase. Ouvrir une phase ne la valide pas.",
        )}
      </p>
    </section>
  );
}
