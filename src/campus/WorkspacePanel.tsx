import { DevSecOpsProject } from "./DevSecOpsProject";
import { tx, localeCode } from "./lib/language";
import { workspaceRequest, post } from "./lib/workspace-api";
import {
  MediaLibrary,
  Galleries,
  ProfileEditor,
  type PersonalData,
} from "./PersonalSpace";
import { useCallback, useEffect, useState, type ReactNode } from "react";
import {
  BookOpen,
  BriefcaseBusiness,
  Check,
  CloudUpload,
  Download,
  ExternalLink,
  FileText,
  GitBranch,
  GraduationCap,
  Lightbulb,
  Loader2,
  Plus,
  Presentation,
  Rocket,
  Search,
  Video,
} from "lucide-react";
import { toast } from "sonner";
import { Button } from "./components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "./components/ui/dialog";
import type { Campus, Persona } from "./lib/model";
import { interviewQuestions } from "./lib/curriculum";
import { practiceProjects, resourceChecked, videos } from "./lib/resources";
import {
  noteMarkdown,
  ownerEmail,
  type CareerInterest,
  type IntegrationStatus,
  type JobApplication,
  type Media,
  type Note,
  type NoteBlock,
} from "./lib/workspace";

export function BrandLogo({ className = "" }: { className?: string }) {
  return (
    <a
      className={`brand-link ${className}`}
      href={`${import.meta.env.BASE_URL}campus.html`}
      aria-label={tx("LESSGOOO — Accueil du campus")}
    >
      <img
        src={`${import.meta.env.BASE_URL}logo-lessgooo.png`}
        alt={tx("LESSGOOO Academy")}
      />
    </a>
  );
}
export function HelpTip({
  children,
  label = "Aide",
}: {
  children: ReactNode;
  label?: string;
}) {
  const [open, setOpen] = useState(false);
  return (
    <span className="help-tip">
      <button
        type="button"
        aria-label={tx(label)}
        aria-expanded={open}
        onClick={() => setOpen(!open)}
        onKeyDown={(e) => {
          if (e.key === "Escape") setOpen(false);
        }}
      >
        {tx("!")}
      </button>
      {open && (
        <span className="help-popover" role="note">
          {tx(children)}
        </span>
      )}
    </span>
  );
}
function saveDownload(blob: Blob, name: string) {
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = name;
  a.click();
  setTimeout(() => URL.revokeObjectURL(url), 1000);
}
type WorkspaceData = PersonalData & {
  notes: Note[];
  interests: CareerInterest[];
  applications: JobApplication[];
  media: Media[];
};
const applicationLabels: Record<string, string> = {
  saved: "À préparer",
  applied: "Envoyée",
  interview: "Entretien",
  offer: "Proposition",
  closed: "Clôturée",
};
const serviceLabels = {
  interview: "Préparation aux entretiens",
  applications: "Accompagnement candidatures",
  both: "Entretiens & candidatures",
};

export function Launchpad({
  c,
  go,
}: {
  c: Campus;
  go: (page: string) => void;
}) {
  const kids = c.lessons.every((l) => l.track === "kids");
  return (
    <section className="learning-launchpad">
      <div className="launch-copy">
        <span className="launch-label">{tx("LEARNING BY DOING")}</span>
        <h2>
          {tx("De la curiosité")}
          <br />
          {tx("aux")} <em>{tx("compétences.")}</em>
        </h2>
        <p>
          {tx("Apprends. Construis. Partage tes progrès.")}
          <br />
          {tx("Ton prochain déclic commence ici.")}
        </p>
        <button className="launch-cta" onClick={() => go("courses")}>
          {tx("Explorer")} {tx(c.lessons.length)}
          {tx(" leçons ")}
          <BookOpen size={18} />
        </button>
      </div>
      <div className="learning-orbit" aria-hidden="true">
        <span className="orbit-cloud">{tx("☁")}</span>
        <span className="orbit-bubble bubble-one">{tx("&lt;/&gt;")}</span>
        <span className="orbit-bubble bubble-two">{tx("💡")}</span>
        <span className="orbit-bubble bubble-three">{tx("🚀")}</span>
        <span className="orbit-label">{tx("LESSGOOO!")}</span>
        <div className="orbit-ring" />
      </div>
      <div className="launch-shortcuts">
        <button onClick={() => go("explore")}>
          <Rocket />
          <strong>
            {tx(kids ? "Imaginer & construire" : "15 projets pour pratiquer")}
          </strong>
          <span>{tx("Des défis, des preuves, du concret →")}</span>
        </button>
        <button onClick={() => go("notebook")}>
          <FileText />
          <strong>{tx("Mon carnet d’idées")}</strong>
          <span>{tx("Notes, checklists & présentations →")}</span>
        </button>
        <button onClick={() => go(kids ? "library" : "career")}>
          <GraduationCap />
          <strong>
            {tx(kids ? "Mes créations" : "Mon prochain entretien")}
          </strong>
          <span>
            {tx(
              kids
                ? "Retrouve et partage ton travail →"
                : "Préparation & suivi des candidatures →",
            )}
          </span>
        </button>
      </div>
    </section>
  );
}
export function WorkspacePanel({
  page,
  persona,
  c,
}: {
  page: string;
  persona: Persona;
  c: Campus;
}) {
  const [data, setData] = useState<WorkspaceData>({
      notes: [],
      interests: [],
      applications: [],
      media: [],
      galleries: [],
      profile: {
        id: "",
        owner: "",
        name: "",
        email: "",
        phone: "",
        bio: "",
        avatar: "",
      },
    }),
    [error, setError] = useState(""),
    [busy, setBusy] = useState(false),
    [ready, setReady] = useState(false);
  const load = useCallback(async () => {
    try {
      setData(await workspaceRequest("/api/workspace", persona));
      setError("");
      setReady(true);
    } catch (e) {
      setError((e as Error).message);
    }
  }, [persona]);
  useEffect(() => {
    void load();
  }, [load]);
  const act = async (action: string, value: unknown) => {
    setBusy(true);
    try {
      setData(await post("/api/workspace", persona, { action, data: value }));
      toast.success(tx("Enregistré dans le campus"));
      return true;
    } catch (e) {
      toast.error(tx((e as Error).message));
      return false;
    } finally {
      setBusy(false);
    }
  };
  if (page === "explore")
    return <Explore kids={["child", "parent"].includes(persona)} />;
  if (page === "integrations")
    return persona === "teacher" ? (
      <IntegrationPanel />
    ) : (
      <p>{tx("Ouvrez les intégrations depuis la vue formateur.")}</p>
    );
  if (error)
    return (
      <div className="error-box" role="alert">
        {tx(error)}
        <Button onClick={() => void load()}>{tx("Réessayer")}</Button>
      </div>
    );
  if (!ready)
    return (
      <p role="status">
        <Loader2 className="spin" />
        {tx("Chargement de votre espace…")}
      </p>
    );
  if (page === "notebook")
    return <Notebook notes={data.notes} act={act} busy={busy} />;
  if (page === "library")
    return <MediaLibrary data={data} persona={persona} reload={load} />;
  if (page === "galleries")
    return <Galleries data={data} persona={persona} reload={load} />;
  if (page === "profile")
    return <ProfileEditor data={data} persona={persona} reload={load} />;
  if (page === "career")
    return ["adult", "teacher"].includes(persona) ? (
      <Career
        data={data}
        act={act}
        busy={busy}
        teacher={persona === "teacher"}
        c={c}
      />
    ) : (
      <p>{tx("Ce service est destiné aux adultes.")}</p>
    );
  return null;
}
export function Explore({ kids }: { kids: boolean }) {
  const [query, setQuery] = useState(""),
    [topic, setTopic] = useState("Tous");
  const projects = practiceProjects.filter(
    (p) =>
      (topic === "Tous" || p.topic === topic) &&
      `${tx(p.title)} ${tx(p.topic)} ${tx(p.mission)}`
        .toLowerCase()
        .includes(query.toLowerCase()),
  );
  if (kids)
    return (
      <div className="workspace-stack">
        <div className="feature-banner yellow">
          <Lightbulb />
          <div>
            <h2>{tx("Du boîtier au cloud : à toi de créer !")}</h2>
            <p>
              {tx(
                "Dessine ton ordinateur, construis un jeu, invente une page et présente ton projet. Tes missions et leurs exercices sont dans Parcours & leçons.",
              )}
            </p>
          </div>
        </div>
        {[
          "Une unité centrale en papier",
          "Un jeu Scratch qui compte les points",
          "Mon site sur un animal imaginaire",
          "Le voyage de mon projet vers AWS",
        ].map((title, i) => (
          <article className="panel project-card" key={title}>
            <span className="project-number">
              {tx("0")}
              {tx(i + 1)}
            </span>
            <h3>{tx(title)}</h3>
            <p>
              {tx(
                [
                  "Nomme les composants et explique ce que fait chaque pièce.",
                  "Ajoute un score, un bouton de départ et une fin de partie.",
                  "Crée une page lisible avec ton dessin et des textes courts.",
                  "Dessine les serveurs et les fichiers sans créer de compte payant.",
                ][i],
              )}
            </p>
            <p>
              {tx(
                "À remettre : ta création et une explication dans tes propres mots.",
              )}
            </p>
          </article>
        ))}
      </div>
    );
  return (
    <div className="workspace-stack">
      <div className="feature-banner blue">
        <Rocket />
        <div>
          <h2>{tx("Construis un portfolio dont tu peux parler.")}</h2>
          <p>
            {tx(
              "Des projets de Docker à la fiabilité, avec un parcours DevSecOps en dix phases. Commence en local et montre les preuves.",
            )}
          </p>
        </div>
        <span className="stamp">
          {tx("BUILD")}
          <br />
          {tx("LEARN")}
          <br />
          {tx("REPEAT")}
        </span>
      </div>
      <div className="workspace-toolbar">
        <label className="search-label">
          <Search size={18} />
          <input
            placeholder={tx("Chercher un projet, un outil…")}
            aria-label={tx("Rechercher un projet")}
            value={query}
            onChange={(e) => setQuery(e.target.value)}
          />
        </label>
        <label>
          {tx("Thème")}
          <select value={topic} onChange={(e) => setTopic(e.target.value)}>
            {["Tous", ...new Set(practiceProjects.map((p) => p.topic))].map(
              (t) => (
                <option key={t} value={t}>
                  {tx(t)}
                </option>
              ),
            )}
          </select>
        </label>
      </div>
      {projects.some((p) => p.id === "campus-devsecops") && (
        <DevSecOpsProject />
      )}
      <div className="project-catalog">
        {projects
          .filter((p) => p.id !== "campus-devsecops")
          .map((p, i) => (
            <article className="panel project-card" key={p.id}>
              <div className="project-meta">
                <span>{tx(p.topic)}</span>
                <small>{tx(p.level)}</small>
              </div>
              <span className="project-number">
                {tx(String(i + 1).padStart(2, "0"))}
              </span>
              <h3>{tx(p.title)}</h3>
              <p>{tx(p.mission)}</p>
              <div className="deliverable">
                <strong>{tx("À livrer")}</strong>
                <p>{tx(p.deliverable)}</p>
              </div>
              <a href={p.repo} target="_blank" rel="noreferrer">
                <GitBranch size={17} />
                {tx(" Ouvrir le dépôt de référence")}
                {tx(" ")}
                <ExternalLink size={14} />
              </a>
            </article>
          ))}
      </div>
      {!projects.length && (
        <p>{tx("Aucun projet ne correspond à cette recherche.")}</p>
      )}
      <section className="video-shelf">
        <div className="workspace-heading">
          <h2>
            <Video />
            {tx("La vidéothèque de départ")}
          </h2>
          <span>{tx("Ressources externes · anglais")}</span>
        </div>
        <div className="video-grid">
          {videos.map((v, i) => (
            <a
              className="video-card"
              href={v.url}
              key={v.url}
              target="_blank"
              rel="noreferrer"
            >
              <div className={`video-cover cover-${i}`}>
                <Video size={38} />
                <span>{tx(v.topic.toUpperCase())}</span>
                <b>{tx("▶")}</b>
              </div>
              <div>
                <h3>{tx(v.title)}</h3>
                <strong>{tx(v.author)}</strong>
                <p>{tx(v.note)}</p>
              </div>
            </a>
          ))}
        </div>
        <p className="footnote">
          {tx("Sélection pédagogique vérifiée le")}
          {tx(resourceChecked)}
          {tx(
            ". Liens vers leurs auteurs, sans partenariat implicite. Les versions des outils évoluent : consultez la documentation actuelle. Les dépôts de démonstration sont à utiliser en laboratoire.",
          )}
        </p>
      </section>
    </div>
  );
}

type Act = (action: string, value: unknown) => Promise<boolean>;
function Career({
  data,
  act,
  busy,
  teacher,
  c,
}: {
  data: WorkspaceData;
  act: Act;
  busy: boolean;
  teacher: boolean;
  c: Campus;
}) {
  const [register, setRegister] = useState(false),
    [job, setJob] = useState<JobApplication | null>(null),
    [practice, setPractice] = useState(0),
    [answer, setAnswer] = useState(""),
    [reveal, setReveal] = useState(false);
  const createJob = () =>
    setJob({
      id: "",
      owner: "",
      company: "",
      role: "",
      url: "",
      status: "saved",
      nextStep: "",
      date: "",
    });
  return (
    <div className="workspace-stack">
      <section className="career-hero">
        <div>
          <span className="launch-label">{tx("LESSGOOO CAREER LAB")}</span>
          <h2>
            {tx("Ton savoir-faire mérite")}
            <br />
            {tx("d’être")}
            <em>{tx("bien présenté.")}</em>
          </h2>
          <p>
            {tx(
              "Entretiens techniques, récit de tes projets, CV et organisation des candidatures : prépare ta prochaine étape.",
            )}
          </p>
          <Button onClick={() => setRegister(true)}>
            <BriefcaseBusiness size={18} />
            {tx("M’inscrire à la préparation")}
          </Button>
          <small>
            {tx(
              "Demande d’intérêt enregistrée localement. Modalités et tarif à convenir ; aucun emploi garanti.",
            )}
          </small>
        </div>
        <div className="career-stairs" aria-hidden="true">
          <span>{tx("01 · MON PROJET")}</span>
          <span>{tx("02 · MON HISTOIRE")}</span>
          <span>{tx("03 · MON ENTRETIEN")}</span>
        </div>
      </section>
      <div className="career-tracks">
        {[
          "Un CV étayé par tes projets",
          "Une simulation d’entretien",
          "Un plan de candidatures",
        ].map((t, i) => (
          <article className="panel" key={t}>
            <span className={`tile-icon ${["blue", "orange", "green"][i]}`}>
              {i === 0 ? (
                <FileText />
              ) : i === 1 ? (
                <GraduationCap />
              ) : (
                <BriefcaseBusiness />
              )}
            </span>
            <h3>{tx(t)}</h3>
            <p>
              {tx(
                [
                  "Relie chaque compétence à un résultat vérifiable et prépare un portfolio lisible.",
                  "Entraîne ton raisonnement technique et tes réponses avec la méthode STAR.",
                  "Suis les offres, les prochaines actions et les retours sans perdre le fil.",
                ][i],
              )}
            </p>
          </article>
        ))}
      </div>
      <section className="panel interview-practice">
        <div className="workspace-heading">
          <h2>{tx("La question du moment")}</h2>
          <label>
            {tx("Thème")}
            <select
              value={practice}
              onChange={(e) => {
                setPractice(Number(e.target.value));
                setAnswer("");
                setReveal(false);
              }}
            >
              {interviewQuestions.map(([topic], i) => (
                <option key={topic} value={i}>
                  {tx(topic)}
                </option>
              ))}
            </select>
          </label>
        </div>
        <span className="badge orange">
          {tx(practice + 1)}
          {tx(" / ")}
          {tx(interviewQuestions.length)}
          {tx("· Entraînement")}
        </span>
        <h3>{tx(interviewQuestions[practice][1])}</h3>
        <label>
          {tx("Ton raisonnement")}
          <textarea
            rows={4}
            value={answer}
            onChange={(e) => setAnswer(e.target.value)}
            placeholder={tx(
              "Explique tes hypothèses, tes vérifications et tes compromis…",
            )}
          />
        </label>
        <div className="workspace-toolbar">
          <Button variant="outline" onClick={() => setReveal(!reveal)}>
            {tx(reveal ? "Masquer les pistes" : "Voir les pistes de réponse")}
          </Button>
          <Button
            disabled={!answer.trim() || busy}
            onClick={async () => {
              await act("note", {
                title: `Entretien — ${interviewQuestions[practice][0]}`,
                icon: "🎯",
                revision: 0,
                blocks: [
                  {
                    id: crypto.randomUUID(),
                    type: "heading",
                    text: interviewQuestions[practice][1],
                  },
                  { id: crypto.randomUUID(), type: "text", text: answer },
                ],
              });
            }}
          >
            {tx("Garder ma réponse dans le carnet")}
          </Button>
        </div>
        {reveal && (
          <p className="answer">{tx(interviewQuestions[practice][2])}</p>
        )}
      </section>
      <section className="panel">
        <div className="workspace-heading">
          <div>
            <h2>{tx("Mon tableau de candidatures")}</h2>
            <p>
              {tx(
                "Le statut « Envoyée » est un suivi manuel. Le campus n’envoie pas de candidature à ta place.",
              )}
            </p>
          </div>
          <Button onClick={createJob}>
            <Plus size={16} />
            {tx("Ajouter une offre")}
          </Button>
        </div>
        <div className="application-board">
          {Object.entries(applicationLabels).map(([status, label]) => (
            <div className="application-column" key={status}>
              <h3>
                {tx(label)}
                {tx(" ")}
                <span>
                  {tx(
                    data.applications.filter((a) => a.status === status).length,
                  )}
                </span>
              </h3>
              {data.applications
                .filter((a) => a.status === status)
                .map((a) => (
                  <button
                    className="job-card"
                    key={a.id}
                    onClick={() => setJob(a)}
                  >
                    <strong>{a.role}</strong>
                    <span>{a.company}</span>
                    <small>
                      {tx(a.nextStep || "Définir la prochaine étape")}
                    </small>
                    {a.date && <time>{tx(a.date)}</time>}
                  </button>
                ))}
              <p className="column-hint">
                {tx(
                  status === "saved"
                    ? "Les offres à explorer"
                    : "Tes étapes apparaîtront ici",
                )}
              </p>
            </div>
          ))}
        </div>
      </section>
      <section className="panel">
        <h2>
          {tx(
            teacher
              ? "Demandes pour le service carrière"
              : "Mes demandes de préparation",
          )}
        </h2>
        {data.interests.length ? (
          data.interests.map((i) => (
            <article className="interest-row" key={i.id}>
              <div>
                <strong>
                  {i.name}
                  {tx(" · ")}
                  {tx(serviceLabels[i.service])}
                </strong>
                <p>{i.goal}</p>
                <a href={`mailto:${i.email}`}>{i.email}</a>
                <small>
                  {tx("Enregistrée le")}
                  {tx(" ")}
                  {tx(new Date(i.created).toLocaleDateString(localeCode()))}
                </small>
              </div>
              {teacher ? (
                <label>
                  {tx("Suivi")}
                  <select
                    value={i.status}
                    onChange={(e) =>
                      void act("careerStatus", {
                        id: i.id,
                        status: e.target.value,
                      })
                    }
                  >
                    <option value="new">{tx("Nouvelle")}</option>
                    <option value="contacted">{tx("Contactée")}</option>
                    <option value="closed">{tx("Clôturée")}</option>
                  </select>
                </label>
              ) : (
                <span className="badge blue">
                  {tx(
                    i.status === "new"
                      ? "Demande enregistrée"
                      : i.status === "contacted"
                        ? "Prise de contact"
                        : "Clôturée",
                  )}
                </span>
              )}
            </article>
          ))
        ) : (
          <p>{tx("Les inscriptions à la préparation apparaîtront ici.")}</p>
        )}
      </section>
      <Dialog open={register} onOpenChange={setRegister}>
        <DialogContent className="editor-dialog">
          <DialogHeader>
            <BrandLogo className="dialog-logo" />
            <DialogTitle>{tx("Préparer ma prochaine étape")}</DialogTitle>
            <DialogDescription>
              {tx(
                "Une demande d’intérêt pour la préparation aux entretiens et aux candidatures. Contact de référence :",
              )}
              {tx(ownerEmail)}
              {tx(".")}
            </DialogDescription>
          </DialogHeader>
          <form
            className="workspace-form"
            onSubmit={async (e) => {
              e.preventDefault();
              const form = new FormData(e.currentTarget);
              if (
                await act("career", {
                  name: form.get("name"),
                  email: form.get("email"),
                  service: form.get("service"),
                  goal: form.get("goal"),
                  consent: form.get("consent") === "on",
                })
              )
                setRegister(false);
            }}
          >
            <label>
              {tx("Nom")}
              <input
                name="name"
                required
                maxLength={100}
                defaultValue={teacher ? "" : c.students[0]?.name}
              />
            </label>
            <label>
              {tx("Email de contact")}
              <input name="email" type="email" required maxLength={254} />
            </label>
            <label>
              {tx("Accompagnement souhaité")}
              {tx(" ")}
              <HelpTip>
                {tx(
                  "Choisis l’entretien technique, l’organisation des candidatures ou les deux.",
                )}
              </HelpTip>
              <select name="service" aria-label={tx("Accompagnement souhaité")}>
                {Object.entries(serviceLabels).map(([v, l]) => (
                  <option key={v} value={v}>
                    {tx(l)}
                  </option>
                ))}
              </select>
            </label>
            <label>
              {tx("Ton objectif")}
              <textarea
                name="goal"
                required
                minLength={10}
                maxLength={3000}
                rows={4}
              />
            </label>
            <label className="checkbox-label">
              <input name="consent" type="checkbox" required />
              {tx(
                "J’accepte l’enregistrement local de ma demande et une prise de contact concernant ce service.",
              )}
            </label>
            <p className="footnote">
              {tx(
                "Aucun règlement, email automatique ou candidature envoyé. Les données restent sur cet ordinateur.",
              )}
            </p>
            <Button type="submit" disabled={busy}>
              {tx("Enregistrer ma demande")}
            </Button>
          </form>
        </DialogContent>
      </Dialog>
      <Dialog open={!!job} onOpenChange={(b) => !b && setJob(null)}>
        <DialogContent className="editor-dialog">
          <DialogHeader>
            <DialogTitle>{tx("Suivre une candidature")}</DialogTitle>
            <DialogDescription>
              {tx(
                "Organise tes démarches et conserve une prochaine action précise.",
              )}
            </DialogDescription>
          </DialogHeader>
          {job && (
            <form
              className="workspace-form"
              onSubmit={async (e) => {
                e.preventDefault();
                const { id, ...rest } = job;
                if (
                  await act("application", { ...rest, ...(id ? { id } : {}) })
                )
                  setJob(null);
              }}
            >
              <label>
                {tx("Entreprise")}
                <input
                  required
                  maxLength={120}
                  value={job.company}
                  onChange={(e) => setJob({ ...job, company: e.target.value })}
                />
              </label>
              <label>
                {tx("Poste")}
                <input
                  required
                  maxLength={150}
                  value={job.role}
                  onChange={(e) => setJob({ ...job, role: e.target.value })}
                />
              </label>
              <label>
                {tx("Lien HTTPS de l’offre")}
                <input
                  type="url"
                  value={job.url}
                  onChange={(e) => setJob({ ...job, url: e.target.value })}
                />
              </label>
              <label>
                {tx("Étape")}
                <select
                  value={job.status}
                  onChange={(e) =>
                    setJob({
                      ...job,
                      status: e.target.value as JobApplication["status"],
                    })
                  }
                >
                  {Object.entries(applicationLabels).map(([v, l]) => (
                    <option key={v} value={v}>
                      {tx(l)}
                    </option>
                  ))}
                </select>
              </label>
              <label>
                {tx("Prochaine action")}
                <textarea
                  value={job.nextStep}
                  maxLength={1500}
                  onChange={(e) => setJob({ ...job, nextStep: e.target.value })}
                />
              </label>
              <label>
                {tx("Date de rappel visuelle")}
                {tx(" ")}
                <HelpTip>
                  {tx(
                    "Cette date apparaît sur ta carte ; elle ne crée pas de notification automatique.",
                  )}
                </HelpTip>
                <input
                  type="date"
                  aria-label={tx("Date de rappel visuelle")}
                  value={job.date}
                  onChange={(e) => setJob({ ...job, date: e.target.value })}
                />
              </label>
              <Button disabled={busy} type="submit">
                {tx("Enregistrer l’offre")}
              </Button>
            </form>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}

const blockTypes: Record<NoteBlock["type"], string> = {
  text: "Texte",
  heading: "Titre / diapositive",
  todo: "À faire",
  code: "Code",
  quote: "Citation",
  divider: "Séparateur",
};
function newBlock(type: NoteBlock["type"], text = ""): NoteBlock {
  return {
    id: crypto.randomUUID(),
    type,
    text: tx(text),
    ...(type === "todo" ? { checked: false } : {}),
  };
}
function Notebook({
  notes,
  act,
  busy,
}: {
  notes: Note[];
  act: Act;
  busy: boolean;
}) {
  const [draft, setDraft] = useState<Note | null>(null),
    [dirty, setDirty] = useState(false),
    [present, setPresent] = useState(false),
    [slide, setSlide] = useState(0);
  useEffect(() => {
    const warn = (e: BeforeUnloadEvent) => {
      if (dirty) {
        e.preventDefault();
        e.returnValue = "";
      }
    };
    window.addEventListener("beforeunload", warn);
    const navigate = (e: Event) => {
      if (
        dirty &&
        !window.confirm(tx("Quitter les modifications non enregistrées ?"))
      )
        e.preventDefault();
    };
    window.addEventListener("campus-before-navigate", navigate);
    return () => {
      window.removeEventListener("beforeunload", warn);
      window.removeEventListener("campus-before-navigate", navigate);
    };
  }, [dirty]);
  const select = (note: Note) => {
    if (
      dirty &&
      !window.confirm(tx("Quitter les modifications non enregistrées ?"))
    )
      return;
    setDraft(structuredClone(note));
    setDirty(false);
  };
  const create = (template: "blank" | "lesson" | "project") => {
    if (
      dirty &&
      !window.confirm(tx("Quitter les modifications non enregistrées ?"))
    )
      return;
    setDraft({
      id: "",
      owner: "",
      title: tx(
        template === "blank"
          ? "Mon nouveau carnet"
          : template === "lesson"
            ? "Mes notes de cours"
            : "Mon projet DevOps",
      ),
      icon: template === "project" ? "🚀" : "📝",
      revision: 0,
      updated: "",
      blocks:
        template === "blank"
          ? [newBlock("text")]
          : template === "lesson"
            ? [
                newBlock("heading", "Ce que j’ai compris"),
                newBlock("text"),
                newBlock("heading", "Mon exemple"),
                newBlock("code"),
                newBlock(
                  "todo",
                  "Refaire l’exercice sans regarder la solution",
                ),
              ]
            : [
                newBlock("heading", "Le problème"),
                newBlock("text"),
                newBlock("heading", "Ma solution"),
                newBlock("text"),
                newBlock("heading", "Mes preuves"),
                newBlock("todo", "Ajouter les résultats des tests"),
                newBlock("heading", "Ce que je veux améliorer"),
                newBlock("text"),
              ],
    });
    setDirty(true);
  };
  const change = (updated: Note) => {
    setDraft(updated);
    setDirty(true);
  };
  const slides =
    draft?.blocks.reduce<{ title: string; blocks: NoteBlock[] }[]>(
      (out, b) => {
        if (b.type === "heading") out.push({ title: b.text, blocks: [] });
        else out[out.length - 1].blocks.push(b);
        return out;
      },
      [{ title: draft.title, blocks: [] }],
    ) || [];
  return (
    <div className="notebook-layout">
      <aside className="notebook-tree">
        <div className="notebook-brand">
          <FileText />
          {tx("LESSGOOO NOTES")}
        </div>
        <Button onClick={() => create("blank")}>
          <Plus size={16} />
          {tx("Nouvelle page")}
        </Button>
        <p className="eyebrow">{tx("MES PAGES")}</p>
        {notes.map((n) => (
          <button
            className={draft?.id === n.id ? "selected" : ""}
            onClick={() => select(n)}
            key={n.id}
          >
            {tx(n.icon)} <span>{n.title}</span>
          </button>
        ))}
        {!notes.length && (
          <p>
            {tx("Ton espace pour réfléchir, noter et raconter tes projets.")}
          </p>
        )}
        <p className="eyebrow">{tx("PARTIR D’UN MODÈLE")}</p>
        <button onClick={() => create("lesson")}>
          {tx("📚 Notes de cours")}
        </button>
        <button onClick={() => create("project")}>
          {tx("🚀 Présentation de projet")}
        </button>
        <p className="footnote">
          {tx(
            "Pages privées dans la vue actuelle. Sauvegarde locale, sans compte Notion.",
          )}
        </p>
      </aside>
      <section className="notebook-editor">
        {draft ? (
          <>
            <div className="notebook-cover">
              <span>{tx("ÉCRIS TA PROCHAINE IDÉE.")}</span>
              <BrandLogo />
            </div>
            <div className="notebook-tools">
              <label>
                {tx("Icône")}
                {tx(" ")}
                <HelpTip>
                  {tx("L’icône sert à retrouver rapidement cette page.")}
                </HelpTip>
                <select
                  aria-label={tx("Icône de la page")}
                  value={draft.icon}
                  onChange={(e) =>
                    change({ ...draft, icon: e.target.value as Note["icon"] })
                  }
                >
                  {["📝", "🚀", "💡", "🎯", "☁️", "🌈"].map((icon) => (
                    <option key={icon}>{tx(icon)}</option>
                  ))}
                </select>
              </label>
              <span role="status">
                {tx(dirty ? "Modifications à enregistrer" : "Page enregistrée")}
              </span>
              <Button
                variant="outline"
                onClick={() =>
                  saveDownload(
                    new Blob([noteMarkdown(draft)], {
                      type: "text/markdown;charset=utf-8",
                    }),
                    draft.title.replace(/[^\p{L}\p{N} _-]/gu, "_") + ".md",
                  )
                }
              >
                <Download size={15} />
                {tx("Exporter")}
              </Button>
              <Button
                variant="outline"
                onClick={() => {
                  setSlide(0);
                  setPresent(true);
                }}
              >
                <Presentation size={15} />
                {tx("Présenter")}
              </Button>
              <Button
                disabled={busy || !dirty}
                onClick={async () => {
                  const { id, ...rest } = draft;
                  if (await act("note", { ...rest, ...(id ? { id } : {}) })) {
                    setDraft(null);
                    setDirty(false);
                  }
                }}
              >
                <Check size={15} />
                {tx("Enregistrer")}
              </Button>
            </div>
            <label className="note-title-label">
              {tx("Titre de la page")}
              <input
                className="note-title"
                value={draft.title}
                maxLength={160}
                onChange={(e) => change({ ...draft, title: e.target.value })}
              />
            </label>
            <div className="note-blocks">
              {draft.blocks.map((b, i) => (
                <div className={`note-block block-${b.type}`} key={b.id}>
                  <div className="block-control">
                    <label className="sr-only" htmlFor={`type-${b.id}`}>
                      {tx("Type du bloc")}
                      {tx(i + 1)}
                    </label>
                    <select
                      id={`type-${b.id}`}
                      value={b.type}
                      onChange={(e) =>
                        change({
                          ...draft,
                          blocks: draft.blocks.map((x) =>
                            x.id === b.id
                              ? {
                                  ...x,
                                  type: e.target.value as NoteBlock["type"],
                                }
                              : x,
                          ),
                        })
                      }
                    >
                      {Object.entries(blockTypes).map(([v, l]) => (
                        <option key={v} value={v}>
                          {tx(l)}
                        </option>
                      ))}
                    </select>
                    <button
                      aria-label={tx(`Monter le bloc ${i + 1}`)}
                      disabled={i === 0}
                      onClick={() => {
                        const blocks = [...draft.blocks];
                        [blocks[i - 1], blocks[i]] = [blocks[i], blocks[i - 1]];
                        change({ ...draft, blocks });
                      }}
                    >
                      {tx("↑")}
                    </button>
                    <button
                      aria-label={tx(`Supprimer le bloc ${i + 1}`)}
                      onClick={() =>
                        change({
                          ...draft,
                          blocks: draft.blocks.filter((x) => x.id !== b.id),
                        })
                      }
                    >
                      {tx("×")}
                    </button>
                  </div>
                  {b.type === "divider" ? (
                    <hr />
                  ) : (
                    <div className="block-content">
                      {b.type === "todo" && (
                        <input
                          aria-label={tx(`Terminer : ${b.text || "tâche"}`)}
                          type="checkbox"
                          checked={!!b.checked}
                          onChange={(e) =>
                            change({
                              ...draft,
                              blocks: draft.blocks.map((x) =>
                                x.id === b.id
                                  ? { ...x, checked: e.target.checked }
                                  : x,
                              ),
                            })
                          }
                        />
                      )}
                      <textarea
                        aria-label={tx(`Contenu du bloc ${i + 1}`)}
                        placeholder={tx(
                          b.type === "heading"
                            ? "Un titre pour ta prochaine idée…"
                            : b.type === "code"
                              ? "Colle ton code sans secret…"
                              : "Écris ici…",
                        )}
                        rows={
                          b.type === "code" ? 5 : b.type === "heading" ? 1 : 3
                        }
                        value={b.text}
                        maxLength={20000}
                        onChange={(e) =>
                          change({
                            ...draft,
                            blocks: draft.blocks.map((x) =>
                              x.id === b.id
                                ? { ...x, text: e.target.value }
                                : x,
                            ),
                          })
                        }
                      />
                    </div>
                  )}
                </div>
              ))}
            </div>
            <div className="add-blocks">
              <span>
                {tx("Ajouter un bloc")}
                {tx(" ")}
                <HelpTip>
                  {tx(
                    "Un titre ouvre une nouvelle diapositive en mode Présenter. Les autres blocs suivent ce titre.",
                  )}
                </HelpTip>
              </span>
              {Object.entries(blockTypes).map(([type, label]) => (
                <button
                  key={type}
                  disabled={draft.blocks.length >= 150}
                  onClick={() =>
                    change({
                      ...draft,
                      blocks: [
                        ...draft.blocks,
                        newBlock(type as NoteBlock["type"]),
                      ],
                    })
                  }
                >
                  {tx("+")}
                  {tx(label)}
                </button>
              ))}
            </div>
          </>
        ) : (
          <div className="notebook-welcome">
            <span>{tx("💡")}</span>
            <h2>
              {tx("Les grandes idées commencent")}
              <br />
              {tx("par une petite note.")}
            </h2>
            <p>
              {tx(
                "Crée une page, ajoute des blocs, coche tes étapes et transforme tes titres en diapositives.",
              )}
            </p>
            <Button onClick={() => create("lesson")}>
              {tx("Créer mon premier carnet")}
            </Button>
          </div>
        )}
      </section>
      <Dialog open={present} onOpenChange={setPresent}>
        <DialogContent
          className="presentation-dialog"
          onKeyDown={(e) => {
            if (e.key === "ArrowRight")
              setSlide((s) => Math.min(slides.length - 1, s + 1));
            if (e.key === "ArrowLeft") setSlide((s) => Math.max(0, s - 1));
          }}
        >
          <DialogHeader>
            <BrandLogo />
            <DialogTitle>{slides[slide]?.title}</DialogTitle>
            <DialogDescription>
              {draft?.title}
              {tx(" · Diapositive ")}
              {tx(slide + 1)}
              {tx(" sur ")}
              {tx(slides.length)}
            </DialogDescription>
          </DialogHeader>
          <div className="slide-content">
            {slides[slide]?.blocks.map((b) =>
              b.type === "divider" ? (
                <hr key={b.id} />
              ) : b.type === "code" ? (
                <pre key={b.id}>{b.text}</pre>
              ) : b.type === "quote" ? (
                <blockquote key={b.id}>{b.text}</blockquote>
              ) : (
                <p key={b.id}>
                  {tx(b.type === "todo" ? (b.checked ? "☑ " : "☐ ") : "")}
                  {b.text}
                </p>
              ),
            )}
          </div>
          <div className="slide-controls">
            <Button
              variant="outline"
              disabled={slide === 0}
              onClick={() => setSlide(slide - 1)}
            >
              {tx("← Précédente")}
            </Button>
            <span>
              {tx(slide + 1)}
              {tx(" / ")}
              {tx(slides.length)}
            </span>
            <Button
              disabled={slide >= slides.length - 1}
              onClick={() => setSlide(slide + 1)}
            >
              {tx("Suivante →")}
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
type Checkout = {
  reference: string;
  amount: number;
  currency: string;
  email: string;
  status: string;
  url: string;
  description: string;
};
function IntegrationPanel() {
  const [status, setStatus] = useState<
      (IntegrationStatus & { checkouts?: Checkout[] }) | null
    >(null),
    [error, setError] = useState(""),
    [busy, setBusy] = useState(false);
  const load = useCallback(async () => {
    try {
      setStatus(await workspaceRequest("/api/integrations", "teacher"));
      setError("");
    } catch (e) {
      setError((e as Error).message);
    }
  }, []);
  useEffect(() => {
    void load();
  }, [load]);
  const run = async (fn: () => Promise<unknown>) => {
    setBusy(true);
    try {
      await fn();
      await load();
    } catch (e) {
      toast.error(tx((e as Error).message));
    } finally {
      setBusy(false);
    }
  };
  if (error)
    return (
      <div className="error-box">
        {tx(error)}
        <Button onClick={() => void load()}>{tx("Réessayer")}</Button>
      </div>
    );
  if (!status) return <p>{tx("Chargement des connexions…")}</p>;
  return (
    <div className="workspace-stack">
      <div className="feature-banner green">
        <CloudUpload />
        <div>
          <h2>{tx("Connecter le campus à tes outils.")}</h2>
          <p>
            {tx("Compte de référence :")}
            <strong>{status.email}</strong>
            {tx(". Chaque connexion affiche son état réel.")}
          </p>
        </div>
      </div>
      <div className="integration-grid">
        <section className="panel integration-card">
          <span className="integration-icon drive-icon">{tx("△")}</span>
          <h2>
            {tx("Google Drive")}
            {tx(" ")}
            <HelpTip>
              {tx(
                "Les devoirs et leurs pièces jointes sont copiés dans un dossier privé du compte indiqué. Une modification de devoir relance sa synchronisation.",
              )}
            </HelpTip>
          </h2>
          <span
            className={`badge ${status.drive.connected ? "green" : "orange"}`}
          >
            {tx(
              status.drive.connected
                ? "Compte connecté"
                : "Connexion nécessaire",
            )}
          </span>
          <p>
            {tx(
              status.drive.connected
                ? status.drive.email
                : "Autorise le compte LESSGOOO pour conserver une copie des travaux dans Drive.",
            )}
          </p>
          <Button
            disabled={busy || !status.drive.configured}
            onClick={() =>
              void run(async () => {
                const d = await post<{ url: string }>(
                  "/api/integrations/google/start",
                  "teacher",
                  {},
                );
                window.location.assign(d.url);
              })
            }
          >
            {tx("Connecter Google Drive")}
          </Button>
          {!status.drive.configured && (
            <form
              className="workspace-form"
              onSubmit={(e) => {
                e.preventDefault();
                const form = e.currentTarget,
                  d = new FormData(form);
                void run(async () => {
                  await post("/api/integrations/config", "teacher", {
                    googleClientId: d.get("clientId"),
                    googleClientSecret: d.get("clientSecret"),
                  });
                  form.reset();
                });
              }}
            >
              <label>
                {tx("Identifiant du client Google")}
                {tx(" ")}
                <HelpTip>
                  {tx(
                    "Le client OAuth Web créé dans Google Cloud pour ce campus.",
                  )}
                </HelpTip>
                <input
                  aria-label={tx("Identifiant du client Google")}
                  name="clientId"
                  required
                  autoComplete="off"
                  maxLength={1000}
                />
              </label>
              <label>
                {tx("Secret du client Google")}
                {tx(" ")}
                <HelpTip>
                  {tx(
                    "La valeur est chiffrée localement et ne sera pas réaffichée.",
                  )}
                </HelpTip>
                <input
                  aria-label={tx("Secret du client Google")}
                  name="clientSecret"
                  type="password"
                  required
                  autoComplete="off"
                  maxLength={4000}
                />
              </label>
              <Button disabled={busy}>
                {tx("Enregistrer la configuration Google")}
              </Button>
            </form>
          )}
          {!status.drive.configured && (
            <details className="setup-guide">
              <summary>{tx("! Activer la connexion OAuth")}</summary>
              <ol>
                <li>
                  {tx(
                    "Dans Google Cloud, activer Drive API et créer un client OAuth de type application Web pour",
                  )}
                  {tx(ownerEmail)}
                  {tx(".")}
                </li>
                <li>
                  {tx("Ajouter le retour")}
                  {tx(" ")}
                  <code>
                    {tx(
                      "http://127.0.0.1:4173/api/integrations/google/callback",
                    )}
                  </code>
                  {tx(" ")}
                  {tx("(4174 en développement).")}
                </li>
                <li>
                  {tx(
                    "Renseigner l’identifiant et le secret du client dans les champs ci-dessus. Ils restent sur cet ordinateur.",
                  )}
                </li>
                <li>
                  {tx(
                    "Utiliser ensuite le bouton de connexion. En mode test OAuth, ajouter l’email comme utilisateur de test.",
                  )}
                </li>
              </ol>
              <a
                href="https://console.cloud.google.com/apis/credentials"
                target="_blank"
                rel="noreferrer"
              >
                {tx("Ouvrir Google Cloud")}
                <ExternalLink size={14} />
              </a>
            </details>
          )}
          {status.drive.folder && (
            <a
              href={`https://drive.google.com/drive/folders/${encodeURIComponent(status.drive.folder)}`}
              target="_blank"
              rel="noreferrer"
            >
              {tx("Ouvrir le dossier des devoirs")}
              <ExternalLink size={14} />
            </a>
          )}
          <Button
            variant="outline"
            disabled={!status.drive.connected || busy}
            onClick={() =>
              void run(() =>
                post("/api/integrations/google/sync", "teacher", {}),
              )
            }
          >
            {tx("Synchroniser / réessayer")}
          </Button>
          <small>
            {tx(
              "Les devoirs restent disponibles localement en cas de coupure. Aucun partage public automatique.",
            )}
          </small>
        </section>
        <section className="panel integration-card">
          <span className="integration-icon pay-icon">
            {tx("N")}
            <span>{tx("↗")}</span>
          </span>
          <h2>
            {tx("Notch Pay")}
            {tx(" ")}
            <HelpTip>
              {tx(
                "Le paiement se termine sur la page hébergée du prestataire. Le statut est vérifié côté serveur avec le montant et la référence attendus.",
              )}
            </HelpTip>
          </h2>
          <span
            className={`badge ${status.payment.configured ? "green" : "orange"}`}
          >
            {tx(
              status.payment.configured
                ? `Clé configurée · ${status.payment.mode}`
                : "Compte marchand à activer",
            )}
          </span>
          <p>
            {tx("Option retenue pour les paiements locaux :")}
            {tx(" ")}
            <strong>{tx("2 % à l’encaissement")}</strong>
            {tx(", avec")}
            {tx(" ")}
            <strong>{tx("1 % au retrait local")}</strong>
            {tx("selon le tarif consulté le 16 septembre 2026.")}
          </p>
          <p className="footnote">
            {tx(
              "Chariow Starter annonce 15 %, avec des fonctions de boutique incluses. Disponibilité, vérification du marchand et frais applicables à confirmer pour ton activité.",
            )}
          </p>
          <div className="workspace-toolbar">
            <a
              href="https://business.notchpay.co/register"
              target="_blank"
              rel="noreferrer"
            >
              {tx("Configurer le compte marchand ↗")}
            </a>
            <a
              href="https://notchpay.co/pricing"
              target="_blank"
              rel="noreferrer"
            >
              {tx("Tarifs officiels ↗")}
            </a>
            <a
              href="https://chariow.com/en/pricing"
              target="_blank"
              rel="noreferrer"
            >
              {tx("Comparatif Chariow ↗")}
            </a>
          </div>
          <details className="setup-guide">
            <summary>{tx("! Configurer la clé de paiement")}</summary>
            <p>
              {tx(
                "Après la création et la validation du marchand, ajouter NOTCHPAY_PUBLIC_KEY dans .env.local. Définir NOTCHPAY_MODE à test ou live selon la clé, puis redémarrer. Aucun mot de passe de compte n’est utilisé par le campus. Tester d’abord avec les moyens de test fournis par Notch Pay.",
              )}
            </p>
          </details>
          <form
            className="workspace-form"
            onSubmit={(e) => {
              e.preventDefault();
              const form = e.currentTarget,
                d = new FormData(form);
              void run(async () => {
                await post("/api/integrations/config", "teacher", {
                  notchKey: d.get("notchKey"),
                  notchMode: d.get("mode"),
                });
                form.reset();
              });
            }}
          >
            <label>
              {tx("Clé API publique Notch Pay")}
              {tx(" ")}
              <HelpTip>
                {tx(
                  "Copie la clé du tableau marchand. Il ne s’agit pas de ton mot de passe. Elle est conservée chiffrée sur cet ordinateur.",
                )}
              </HelpTip>
              <input
                aria-label={tx("Clé API publique Notch Pay")}
                name="notchKey"
                type="password"
                required
                autoComplete="off"
                maxLength={4000}
              />
            </label>
            <label>
              {tx("Environnement")}
              {tx(" ")}
              <HelpTip>
                {tx(
                  "Ce choix doit correspondre à la clé fournie par Notch Pay. Une clé live permet de créer de vrais liens de règlement.",
                )}
              </HelpTip>
              <select
                aria-label={tx("Environnement Notch Pay")}
                name="mode"
                defaultValue="test"
              >
                <option value="test">{tx("Test")}</option>
                <option value="live">{tx("Live — règlements réels")}</option>
              </select>
            </label>
            <Button disabled={busy}>
              {tx("Enregistrer la configuration Notch Pay")}
            </Button>
          </form>
        </section>
      </div>
      <section className="panel">
        <div className="workspace-heading">
          <h2>{tx("Les devoirs vers Drive")}</h2>
          <Button variant="outline" onClick={() => void load()}>
            {tx("Actualiser")}
          </Button>
        </div>
        {status.jobs.length ? (
          <div className="sync-list">
            {status.jobs.map((j) => (
              <article key={j.id}>
                <FileText />
                <div>
                  <strong>{tx(j.label)}</strong>
                  <small>
                    {tx(
                      j.error ||
                        (j.status === "pending"
                          ? "En attente de connexion ou de synchronisation."
                          : j.status === "synced"
                            ? "Copie confirmée par Google Drive."
                            : "À réessayer."),
                    )}
                  </small>
                </div>
                <span
                  className={`badge ${j.status === "synced" ? "green" : "orange"}`}
                >
                  {tx(
                    j.status === "synced"
                      ? "Synchronisé"
                      : j.status === "error"
                        ? "À réessayer"
                        : "En attente",
                  )}
                </span>
                {j.url && (
                  <a href={j.url} target="_blank" rel="noreferrer">
                    {tx("Voir")}
                    <ExternalLink size={14} />
                  </a>
                )}
              </article>
            ))}
          </div>
        ) : (
          <p>
            {tx(
              "Les prochains devoirs remis et corrigés apparaîtront dans cette file.",
            )}
          </p>
        )}
      </section>
      <section className="panel">
        <h2>
          {tx("Créer un lien de règlement")}
          {tx(" ")}
          <HelpTip>
            {tx(
              "Renseigne uniquement un montant convenu avec le client. Aucun tarif de formation n’est prérempli. Créer le lien ne prélève pas d’argent.",
            )}
          </HelpTip>
        </h2>
        <form
          className="checkout-form"
          onSubmit={(e) => {
            e.preventDefault();
            const d = new FormData(e.currentTarget);
            void run(() =>
              post("/api/checkout", "teacher", {
                amount: Number(d.get("amount")),
                currency: "XAF",
                email: d.get("email"),
                description: d.get("description"),
              }),
            );
          }}
        >
          <label>
            {tx("Montant convenu (FCFA)")}
            <input
              name="amount"
              type="number"
              min="1"
              max="10000000"
              step="1"
              required
            />
          </label>
          <label>
            {tx("Email du client")}
            <input name="email" type="email" required />
          </label>
          <label>
            {tx("Objet du règlement")}
            <input name="description" minLength={3} maxLength={200} required />
          </label>
          <Button disabled={!status.payment.configured || busy}>
            {tx("Créer le lien")}
            {tx(status.payment.mode === "test" ? "de test" : "")}
          </Button>
        </form>
        {!status.payment.configured && (
          <p className="footnote">
            {tx(
              "Création désactivée tant que la clé du compte marchand n’est pas configurée.",
            )}
          </p>
        )}
        {status.checkouts?.map((p) => (
          <article className="interest-row" key={p.reference}>
            <div>
              <strong>
                {tx(p.description)}
                {tx(" · ")}
                {tx(p.amount.toLocaleString(localeCode()))}
                {tx("FCFA")}
              </strong>
              <p>
                {p.email}
                {tx(" · ")}
                {tx(p.status)}
              </p>
              {p.url && (
                <a href={p.url} target="_blank" rel="noreferrer">
                  {tx("Ouvrir la page de paiement ↗")}
                </a>
              )}
            </div>
            <Button
              variant="outline"
              disabled={busy || !p.url}
              onClick={() =>
                void run(() =>
                  workspaceRequest(
                    "/api/checkout?reference=" +
                      encodeURIComponent(p.reference),
                    "teacher",
                  ),
                )
              }
            >
              {tx("Vérifier le règlement")}
            </Button>
          </article>
        ))}
      </section>
    </div>
  );
}
