import { workspaceRequest, post, uploadMedia } from "./lib/workspace-api";
import { useCallback, useEffect, useState, type ReactNode } from "react";
import {
  BookOpen,
  BriefcaseBusiness,
  Check,
  CloudUpload,
  Download,
  ExternalLink,
  FileText,
  FolderOpen,
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
import type { Campus, Lesson, Persona } from "./lib/model";
import { progress } from "./lib/model";
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
      aria-label="LESSGOOO — Accueil du campus"
    >
      <img
        src={`${import.meta.env.BASE_URL}logo-lessgooo.png`}
        alt="LESSGOOO Academy"
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
        aria-label={label}
        aria-expanded={open}
        onClick={() => setOpen(!open)}
        onKeyDown={(e) => {
          if (e.key === "Escape") setOpen(false);
        }}
      >
        !
      </button>
      {open && (
        <span className="help-popover" role="note">
          {children}
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
type WorkspaceData = {
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
        <span className="launch-label">LEARNING BY DOING</span>
        <h2>
          De la curiosité
          <br />
          aux <em>compétences.</em>
        </h2>
        <p>
          Apprends. Construis. Partage tes progrès.
          <br />
          Ton prochain déclic commence ici.
        </p>
        <button className="launch-cta" onClick={() => go("courses")}>
          Explorer {c.lessons.length} leçons <BookOpen size={18} />
        </button>
      </div>
      <div className="learning-orbit" aria-hidden="true">
        <span className="orbit-cloud">☁</span>
        <span className="orbit-bubble bubble-one">&lt;/&gt;</span>
        <span className="orbit-bubble bubble-two">💡</span>
        <span className="orbit-bubble bubble-three">🚀</span>
        <span className="orbit-label">LESSGOOO!</span>
        <div className="orbit-ring" />
      </div>
      <div className="launch-shortcuts">
        <button onClick={() => go("explore")}>
          <Rocket />
          <strong>
            {kids ? "Imaginer & construire" : "15 projets pour pratiquer"}
          </strong>
          <span>Des défis, des preuves, du concret →</span>
        </button>
        <button onClick={() => go("notebook")}>
          <FileText />
          <strong>Mon carnet d’idées</strong>
          <span>Notes, checklists & présentations →</span>
        </button>
        <button onClick={() => go(kids ? "library" : "career")}>
          <GraduationCap />
          <strong>{kids ? "Mes créations" : "Mon prochain entretien"}</strong>
          <span>
            {kids
              ? "Retrouve et partage ton travail →"
              : "Préparation & suivi des candidatures →"}
          </span>
        </button>
      </div>
    </section>
  );
}
export function HomeworkMap({
  c,
  openLesson,
}: {
  c: Campus;
  openLesson: (l: Lesson) => void;
}) {
  const [student, setStudent] = useState(c.students[0]?.id || "");
  const target = c.students.find((s) => s.id === student) || c.students[0];
  if (!target) return null;
  const lessons = c.lessons.filter((l) => l.track === target.track);
  const stateFor = (id: string) =>
    c.submissions.find((s) => s.student === target.id && s.lesson === id)
      ?.status || "missing";
  const counts = lessons.reduce(
    (out, l) => {
      out[stateFor(l.id)]++;
      return out;
    },
    { validated: 0, pending: 0, revise: 0, missing: 0 },
  );
  const labels = {
    validated: "Validés",
    pending: "À corriger",
    revise: "À reprendre",
    missing: "Non remis",
  };
  return (
    <section className="panel homework-map">
      <div className="workspace-heading">
        <div>
          <span className="eyebrow">CHAQUE ÉTAPE COMPTE</span>
          <h2>
            La progression par les devoirs{" "}
            <HelpTip>
              Une leçon augmente la progression après validation du formateur.
              Un devoir non remis n’est pas déclaré en retard sans échéance.
            </HelpTip>
          </h2>
        </div>
        <label>
          Élève
          <select
            value={target.id}
            onChange={(e) => setStudent(e.target.value)}
          >
            {c.students.map((s) => (
              <option key={s.id} value={s.id}>
                {s.name}
              </option>
            ))}
          </select>
        </label>
      </div>
      <div className="homework-summary">
        {Object.entries(counts).map(([s, n]) => (
          <span className={`homework-count ${s}`} key={s}>
            <b>{n}</b>
            {labels[s as keyof typeof labels]}
          </span>
        ))}
        <span className="homework-percent">
          {progress(c, target.id).percent}%<small>du parcours validé</small>
        </span>
      </div>
      <div className="homework-tiles">
        {lessons.map((l, i) => (
          <button
            key={l.id}
            className={`homework-tile ${stateFor(l.id)}`}
            aria-label={`${l.title} — ${labels[stateFor(l.id) as keyof typeof labels]}`}
            title={`${l.title} — ${labels[stateFor(l.id) as keyof typeof labels]}`}
            onClick={() => openLesson(l)}
          >
            {String(i + 1).padStart(2, "0")}
          </button>
        ))}
      </div>
      <p className="footnote">
        Cliquez sur une étape pour ouvrir sa leçon et son exercice.
      </p>
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
      toast.success("Enregistré dans le campus");
      return true;
    } catch (e) {
      toast.error((e as Error).message);
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
      <p>Ouvrez les intégrations depuis la vue formateur.</p>
    );
  if (error)
    return (
      <div className="error-box" role="alert">
        {error}
        <Button onClick={() => void load()}>Réessayer</Button>
      </div>
    );
  if (!ready)
    return (
      <p role="status">
        <Loader2 className="spin" /> Chargement de votre espace…
      </p>
    );
  if (page === "notebook")
    return <Notebook notes={data.notes} act={act} busy={busy} />;
  if (page === "library")
    return <Library media={data.media} persona={persona} reload={load} />;
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
      <p>Ce service est destiné aux adultes.</p>
    );
  return null;
}
function Explore({ kids }: { kids: boolean }) {
  const [query, setQuery] = useState(""),
    [topic, setTopic] = useState("Tous");
  const projects = practiceProjects.filter(
    (p) =>
      (topic === "Tous" || p.topic === topic) &&
      `${p.title} ${p.topic} ${p.mission}`
        .toLowerCase()
        .includes(query.toLowerCase()),
  );
  if (kids)
    return (
      <div className="workspace-stack">
        <div className="feature-banner yellow">
          <Lightbulb />
          <div>
            <h2>Du boîtier au cloud : à toi de créer !</h2>
            <p>
              Dessine ton ordinateur, construis un jeu, invente une page et
              présente ton projet. Tes missions et leurs exercices sont dans
              Parcours & leçons.
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
            <span className="project-number">0{i + 1}</span>
            <h3>{title}</h3>
            <p>
              {
                [
                  "Nomme les composants et explique ce que fait chaque pièce.",
                  "Ajoute un score, un bouton de départ et une fin de partie.",
                  "Crée une page lisible avec ton dessin et des textes courts.",
                  "Dessine les serveurs et les fichiers sans créer de compte payant.",
                ][i]
              }
            </p>
            <p>
              À remettre : ta création et une explication dans tes propres mots.
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
          <h2>Construis un portfolio dont tu peux parler.</h2>
          <p>
            15 briefs de projets, de Docker à la fiabilité. Commence en local,
            documente tes décisions et montre les preuves.
          </p>
        </div>
        <span className="stamp">
          BUILD
          <br />
          LEARN
          <br />
          REPEAT
        </span>
      </div>
      <div className="workspace-toolbar">
        <label className="search-label">
          <Search size={18} />
          <input
            placeholder="Chercher un projet, un outil…"
            aria-label="Rechercher un projet"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
          />
        </label>
        <label>
          Thème
          <select value={topic} onChange={(e) => setTopic(e.target.value)}>
            {["Tous", ...new Set(practiceProjects.map((p) => p.topic))].map(
              (t) => (
                <option key={t}>{t}</option>
              ),
            )}
          </select>
        </label>
      </div>
      <div className="project-catalog">
        {projects.map((p, i) => (
          <article className="panel project-card" key={p.id}>
            <div className="project-meta">
              <span>{p.topic}</span>
              <small>{p.level}</small>
            </div>
            <span className="project-number">
              {String(i + 1).padStart(2, "0")}
            </span>
            <h3>{p.title}</h3>
            <p>{p.mission}</p>
            <div className="deliverable">
              <strong>À livrer</strong>
              <p>{p.deliverable}</p>
            </div>
            <a href={p.repo} target="_blank" rel="noreferrer">
              <GitBranch size={17} /> Ouvrir le dépôt de référence{" "}
              <ExternalLink size={14} />
            </a>
          </article>
        ))}
      </div>
      {!projects.length && <p>Aucun projet ne correspond à cette recherche.</p>}
      <section className="video-shelf">
        <div className="workspace-heading">
          <h2>
            <Video /> La vidéothèque de départ
          </h2>
          <span>Ressources externes · anglais</span>
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
                <span>{v.topic.toUpperCase()}</span>
                <b>▶</b>
              </div>
              <div>
                <h3>{v.title}</h3>
                <strong>{v.author}</strong>
                <p>{v.note}</p>
              </div>
            </a>
          ))}
        </div>
        <p className="footnote">
          Sélection pédagogique vérifiée le {resourceChecked}. Liens vers leurs
          auteurs, sans partenariat implicite. Les versions des outils évoluent
          : consultez la documentation actuelle. Les dépôts de démonstration
          sont à utiliser en laboratoire.
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
          <span className="launch-label">LESSGOOO CAREER LAB</span>
          <h2>
            Ton savoir-faire mérite
            <br />
            d’être <em>bien présenté.</em>
          </h2>
          <p>
            Entretiens techniques, récit de tes projets, CV et organisation des
            candidatures : prépare ta prochaine étape.
          </p>
          <Button onClick={() => setRegister(true)}>
            <BriefcaseBusiness size={18} /> M’inscrire à la préparation
          </Button>
          <small>
            Demande d’intérêt enregistrée localement. Modalités et tarif à
            convenir ; aucun emploi garanti.
          </small>
        </div>
        <div className="career-stairs" aria-hidden="true">
          <span>01 · MON PROJET</span>
          <span>02 · MON HISTOIRE</span>
          <span>03 · MON ENTRETIEN</span>
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
            <h3>{t}</h3>
            <p>
              {
                [
                  "Relie chaque compétence à un résultat vérifiable et prépare un portfolio lisible.",
                  "Entraîne ton raisonnement technique et tes réponses avec la méthode STAR.",
                  "Suis les offres, les prochaines actions et les retours sans perdre le fil.",
                ][i]
              }
            </p>
          </article>
        ))}
      </div>
      <section className="panel interview-practice">
        <div className="workspace-heading">
          <h2>La question du moment</h2>
          <label>
            Thème
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
                  {topic}
                </option>
              ))}
            </select>
          </label>
        </div>
        <span className="badge orange">
          {practice + 1} / {interviewQuestions.length} · Entraînement
        </span>
        <h3>{interviewQuestions[practice][1]}</h3>
        <label>
          Ton raisonnement
          <textarea
            rows={4}
            value={answer}
            onChange={(e) => setAnswer(e.target.value)}
            placeholder="Explique tes hypothèses, tes vérifications et tes compromis…"
          />
        </label>
        <div className="workspace-toolbar">
          <Button variant="outline" onClick={() => setReveal(!reveal)}>
            {reveal ? "Masquer les pistes" : "Voir les pistes de réponse"}
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
            Garder ma réponse dans le carnet
          </Button>
        </div>
        {reveal && <p className="answer">{interviewQuestions[practice][2]}</p>}
      </section>
      <section className="panel">
        <div className="workspace-heading">
          <div>
            <h2>Mon tableau de candidatures</h2>
            <p>
              Le statut « Envoyée » est un suivi manuel. Le campus n’envoie pas
              de candidature à ta place.
            </p>
          </div>
          <Button onClick={createJob}>
            <Plus size={16} /> Ajouter une offre
          </Button>
        </div>
        <div className="application-board">
          {Object.entries(applicationLabels).map(([status, label]) => (
            <div className="application-column" key={status}>
              <h3>
                {label}{" "}
                <span>
                  {data.applications.filter((a) => a.status === status).length}
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
                    <small>{a.nextStep || "Définir la prochaine étape"}</small>
                    {a.date && <time>{a.date}</time>}
                  </button>
                ))}
              <p className="column-hint">
                {status === "saved"
                  ? "Les offres à explorer"
                  : "Tes étapes apparaîtront ici"}
              </p>
            </div>
          ))}
        </div>
      </section>
      <section className="panel">
        <h2>
          {teacher
            ? "Demandes pour le service carrière"
            : "Mes demandes de préparation"}
        </h2>
        {data.interests.length ? (
          data.interests.map((i) => (
            <article className="interest-row" key={i.id}>
              <div>
                <strong>
                  {i.name} · {serviceLabels[i.service]}
                </strong>
                <p>{i.goal}</p>
                <a href={`mailto:${i.email}`}>{i.email}</a>
                <small>
                  Enregistrée le{" "}
                  {new Date(i.created).toLocaleDateString("fr-FR")}
                </small>
              </div>
              {teacher ? (
                <label>
                  Suivi
                  <select
                    value={i.status}
                    onChange={(e) =>
                      void act("careerStatus", {
                        id: i.id,
                        status: e.target.value,
                      })
                    }
                  >
                    <option value="new">Nouvelle</option>
                    <option value="contacted">Contactée</option>
                    <option value="closed">Clôturée</option>
                  </select>
                </label>
              ) : (
                <span className="badge blue">
                  {i.status === "new"
                    ? "Demande enregistrée"
                    : i.status === "contacted"
                      ? "Prise de contact"
                      : "Clôturée"}
                </span>
              )}
            </article>
          ))
        ) : (
          <p>Les inscriptions à la préparation apparaîtront ici.</p>
        )}
      </section>
      <Dialog open={register} onOpenChange={setRegister}>
        <DialogContent className="editor-dialog">
          <DialogHeader>
            <BrandLogo className="dialog-logo" />
            <DialogTitle>Préparer ma prochaine étape</DialogTitle>
            <DialogDescription>
              Une demande d’intérêt pour la préparation aux entretiens et aux
              candidatures. Contact de référence : {ownerEmail}.
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
              Nom
              <input
                name="name"
                required
                maxLength={100}
                defaultValue={teacher ? "" : c.students[0]?.name}
              />
            </label>
            <label>
              Email de contact
              <input name="email" type="email" required maxLength={254} />
            </label>
            <label>
              Accompagnement souhaité{" "}
              <HelpTip>
                Choisis l’entretien technique, l’organisation des candidatures
                ou les deux.
              </HelpTip>
              <select name="service" aria-label="Accompagnement souhaité">
                {Object.entries(serviceLabels).map(([v, l]) => (
                  <option key={v} value={v}>
                    {l}
                  </option>
                ))}
              </select>
            </label>
            <label>
              Ton objectif
              <textarea
                name="goal"
                required
                minLength={10}
                maxLength={3000}
                rows={4}
              />
            </label>
            <label className="checkbox-label">
              <input name="consent" type="checkbox" required /> J’accepte
              l’enregistrement local de ma demande et une prise de contact
              concernant ce service.
            </label>
            <p className="footnote">
              Aucun règlement, email automatique ou candidature envoyé. Les
              données restent sur cet ordinateur.
            </p>
            <Button type="submit" disabled={busy}>
              Enregistrer ma demande
            </Button>
          </form>
        </DialogContent>
      </Dialog>
      <Dialog open={!!job} onOpenChange={(b) => !b && setJob(null)}>
        <DialogContent className="editor-dialog">
          <DialogHeader>
            <DialogTitle>Suivre une candidature</DialogTitle>
            <DialogDescription>
              Organise tes démarches et conserve une prochaine action précise.
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
                Entreprise
                <input
                  required
                  maxLength={120}
                  value={job.company}
                  onChange={(e) => setJob({ ...job, company: e.target.value })}
                />
              </label>
              <label>
                Poste
                <input
                  required
                  maxLength={150}
                  value={job.role}
                  onChange={(e) => setJob({ ...job, role: e.target.value })}
                />
              </label>
              <label>
                Lien HTTPS de l’offre
                <input
                  type="url"
                  value={job.url}
                  onChange={(e) => setJob({ ...job, url: e.target.value })}
                />
              </label>
              <label>
                Étape
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
                      {l}
                    </option>
                  ))}
                </select>
              </label>
              <label>
                Prochaine action
                <textarea
                  value={job.nextStep}
                  maxLength={1500}
                  onChange={(e) => setJob({ ...job, nextStep: e.target.value })}
                />
              </label>
              <label>
                Date de rappel visuelle{" "}
                <HelpTip>
                  Cette date apparaît sur ta carte ; elle ne crée pas de
                  notification automatique.
                </HelpTip>
                <input
                  type="date"
                  aria-label="Date de rappel visuelle"
                  value={job.date}
                  onChange={(e) => setJob({ ...job, date: e.target.value })}
                />
              </label>
              <Button disabled={busy} type="submit">
                Enregistrer l’offre
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
    text,
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
        !window.confirm("Quitter les modifications non enregistrées ?")
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
      !window.confirm("Quitter les modifications non enregistrées ?")
    )
      return;
    setDraft(structuredClone(note));
    setDirty(false);
  };
  const create = (template: "blank" | "lesson" | "project") => {
    if (
      dirty &&
      !window.confirm("Quitter les modifications non enregistrées ?")
    )
      return;
    setDraft({
      id: "",
      owner: "",
      title:
        template === "blank"
          ? "Mon nouveau carnet"
          : template === "lesson"
            ? "Mes notes de cours"
            : "Mon projet DevOps",
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
          <FileText /> LESSGOOO NOTES
        </div>
        <Button onClick={() => create("blank")}>
          <Plus size={16} /> Nouvelle page
        </Button>
        <p className="eyebrow">MES PAGES</p>
        {notes.map((n) => (
          <button
            className={draft?.id === n.id ? "selected" : ""}
            onClick={() => select(n)}
            key={n.id}
          >
            {n.icon} <span>{n.title}</span>
          </button>
        ))}
        {!notes.length && (
          <p>Ton espace pour réfléchir, noter et raconter tes projets.</p>
        )}
        <p className="eyebrow">PARTIR D’UN MODÈLE</p>
        <button onClick={() => create("lesson")}>📚 Notes de cours</button>
        <button onClick={() => create("project")}>
          🚀 Présentation de projet
        </button>
        <p className="footnote">
          Pages privées dans la vue actuelle. Sauvegarde locale, sans compte
          Notion.
        </p>
      </aside>
      <section className="notebook-editor">
        {draft ? (
          <>
            <div className="notebook-cover">
              <span>ÉCRIS TA PROCHAINE IDÉE.</span>
              <BrandLogo />
            </div>
            <div className="notebook-tools">
              <label>
                Icône{" "}
                <HelpTip>
                  L’icône sert à retrouver rapidement cette page.
                </HelpTip>
                <select
                  aria-label="Icône de la page"
                  value={draft.icon}
                  onChange={(e) =>
                    change({ ...draft, icon: e.target.value as Note["icon"] })
                  }
                >
                  {["📝", "🚀", "💡", "🎯", "☁️", "🌈"].map((icon) => (
                    <option key={icon}>{icon}</option>
                  ))}
                </select>
              </label>
              <span role="status">
                {dirty ? "Modifications à enregistrer" : "Page enregistrée"}
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
                <Download size={15} /> Exporter
              </Button>
              <Button
                variant="outline"
                onClick={() => {
                  setSlide(0);
                  setPresent(true);
                }}
              >
                <Presentation size={15} /> Présenter
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
                <Check size={15} /> Enregistrer
              </Button>
            </div>
            <label className="note-title-label">
              Titre de la page
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
                      Type du bloc {i + 1}
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
                          {l}
                        </option>
                      ))}
                    </select>
                    <button
                      aria-label={`Monter le bloc ${i + 1}`}
                      disabled={i === 0}
                      onClick={() => {
                        const blocks = [...draft.blocks];
                        [blocks[i - 1], blocks[i]] = [blocks[i], blocks[i - 1]];
                        change({ ...draft, blocks });
                      }}
                    >
                      ↑
                    </button>
                    <button
                      aria-label={`Supprimer le bloc ${i + 1}`}
                      onClick={() =>
                        change({
                          ...draft,
                          blocks: draft.blocks.filter((x) => x.id !== b.id),
                        })
                      }
                    >
                      ×
                    </button>
                  </div>
                  {b.type === "divider" ? (
                    <hr />
                  ) : (
                    <div className="block-content">
                      {b.type === "todo" && (
                        <input
                          aria-label={`Terminer : ${b.text || "tâche"}`}
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
                        aria-label={`Contenu du bloc ${i + 1}`}
                        placeholder={
                          b.type === "heading"
                            ? "Un titre pour ta prochaine idée…"
                            : b.type === "code"
                              ? "Colle ton code sans secret…"
                              : "Écris ici…"
                        }
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
                Ajouter un bloc{" "}
                <HelpTip>
                  Un titre ouvre une nouvelle diapositive en mode Présenter. Les
                  autres blocs suivent ce titre.
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
                  + {label}
                </button>
              ))}
            </div>
          </>
        ) : (
          <div className="notebook-welcome">
            <span>💡</span>
            <h2>
              Les grandes idées commencent
              <br />
              par une petite note.
            </h2>
            <p>
              Crée une page, ajoute des blocs, coche tes étapes et transforme
              tes titres en diapositives.
            </p>
            <Button onClick={() => create("lesson")}>
              Créer mon premier carnet
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
              {draft?.title} · Diapositive {slide + 1} sur {slides.length}
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
                  {b.type === "todo" ? (b.checked ? "☑ " : "☐ ") : ""}
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
              ← Précédente
            </Button>
            <span>
              {slide + 1} / {slides.length}
            </span>
            <Button
              disabled={slide >= slides.length - 1}
              onClick={() => setSlide(slide + 1)}
            >
              Suivante →
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
function Library({
  media,
  persona,
  reload,
}: {
  media: Media[];
  persona: Persona;
  reload: () => Promise<void>;
}) {
  const [busy, setBusy] = useState(false),
    [percent, setPercent] = useState(0),
    [filename, setFilename] = useState(""),
    [shared, setShared] = useState(true),
    [query, setQuery] = useState("");
  const upload = async (files: FileList | null) => {
    if (!files) return;
    setBusy(true);
    try {
      for (const file of Array.from(files)) {
        setFilename(file.name);
        setPercent(0);
        await uploadMedia(file, persona, setPercent, "", shared);
      }
      toast.success("Fichiers enregistrés");
      await reload();
    } catch (e) {
      toast.error((e as Error).message);
      await reload();
    } finally {
      setBusy(false);
    }
  };
  const download = async (m: Media) => {
    try {
      const r = await fetch(`/api/media?id=${encodeURIComponent(m.id)}`, {
        headers: { "x-campus-persona": persona },
      });
      if (!r.ok) throw new Error("Téléchargement impossible.");
      saveDownload(await r.blob(), m.name);
    } catch (e) {
      toast.error((e as Error).message);
    }
  };
  return (
    <div className="workspace-stack">
      <section className="library-uploader">
        <CloudUpload size={44} />
        <h2>Un espace pour toutes tes créations.</h2>
        <p>
          Vidéos, PDF, présentations, archives, code, images… Tous les formats,
          jusqu’à 200 Mo par fichier.
        </p>
        {persona !== "parent" && (
          <>
            <label className="upload-button">
              <input
                type="file"
                multiple
                disabled={busy}
                onChange={(e) => void upload(e.target.files)}
                aria-label="Téléverser des fichiers"
              />
              {busy ? "Transfert en cours…" : "Choisir mes fichiers"}{" "}
              <Plus size={18} />
            </label>
            {persona === "teacher" && (
              <label className="checkbox-label">
                <input
                  type="checkbox"
                  checked={shared}
                  onChange={(e) => setShared(e.target.checked)}
                  disabled={busy}
                />{" "}
                Partager ces ressources avec les vues élèves{" "}
                <HelpTip>
                  Les ressources partagées du formateur sont visibles dans les
                  deux parcours. Les fichiers d’un élève restent limités à cet
                  élève, à son parent de démonstration et au formateur.
                </HelpTip>
              </label>
            )}
          </>
        )}
        {busy && (
          <div role="status">
            <p>
              {filename} · {percent}%
            </p>
            <progress max="100" value={percent} />
          </div>
        )}
        <small>
          Les fichiers sont conservés et téléchargés tels quels. Leur format ne
          garantit pas qu’ils soient sûrs à ouvrir.
        </small>
      </section>
      <div className="workspace-heading">
        <h2>
          <FolderOpen /> Bibliothèque · {media.length} fichiers
        </h2>
        <label className="search-label">
          <Search size={18} />
          <input
            aria-label="Rechercher un fichier"
            placeholder="Retrouver un fichier…"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
          />
        </label>
      </div>
      <div className="file-grid">
        {media
          .filter((m) => m.name.toLowerCase().includes(query.toLowerCase()))
          .map((m) => (
            <article className="file-card" key={m.id}>
              <div
                className={`file-symbol ${m.type.startsWith("video/") ? "video" : ""}`}
              >
                {m.type.startsWith("video/") ? <Video /> : <FileText />}
              </div>
              <strong>{m.name}</strong>
              <span>
                {(m.size / 1024 / 1024).toFixed(2)} Mo ·{" "}
                {m.shared
                  ? "Ressource partagée"
                  : m.submission
                    ? "Pièce jointe de devoir"
                    : "Espace personnel"}
              </span>
              <small>{new Date(m.created).toLocaleDateString("fr-FR")}</small>
              <Button variant="outline" onClick={() => void download(m)}>
                <Download size={16} /> Télécharger
              </Button>
            </article>
          ))}
      </div>
      {!media.length && (
        <p>
          Ajoute une première ressource ou remets un fichier avec ton devoir.
        </p>
      )}
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
      toast.error((e as Error).message);
    } finally {
      setBusy(false);
    }
  };
  if (error)
    return (
      <div className="error-box">
        {error}
        <Button onClick={() => void load()}>Réessayer</Button>
      </div>
    );
  if (!status) return <p>Chargement des connexions…</p>;
  return (
    <div className="workspace-stack">
      <div className="feature-banner green">
        <CloudUpload />
        <div>
          <h2>Connecter le campus à tes outils.</h2>
          <p>
            Compte de référence : <strong>{status.email}</strong>. Chaque
            connexion affiche son état réel.
          </p>
        </div>
      </div>
      <div className="integration-grid">
        <section className="panel integration-card">
          <span className="integration-icon drive-icon">△</span>
          <h2>
            Google Drive{" "}
            <HelpTip>
              Les devoirs et leurs pièces jointes sont copiés dans un dossier
              privé du compte indiqué. Une modification de devoir relance sa
              synchronisation.
            </HelpTip>
          </h2>
          <span
            className={`badge ${status.drive.connected ? "green" : "orange"}`}
          >
            {status.drive.connected
              ? "Compte connecté"
              : "Connexion nécessaire"}
          </span>
          <p>
            {status.drive.connected
              ? status.drive.email
              : "Autorise le compte LESSGOOO pour conserver une copie des travaux dans Drive."}
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
            Connecter Google Drive
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
                Identifiant du client Google{" "}
                <HelpTip>
                  Le client OAuth Web créé dans Google Cloud pour ce campus.
                </HelpTip>
                <input
                  aria-label="Identifiant du client Google"
                  name="clientId"
                  required
                  autoComplete="off"
                  maxLength={1000}
                />
              </label>
              <label>
                Secret du client Google{" "}
                <HelpTip>
                  La valeur est chiffrée localement et ne sera pas réaffichée.
                </HelpTip>
                <input
                  aria-label="Secret du client Google"
                  name="clientSecret"
                  type="password"
                  required
                  autoComplete="off"
                  maxLength={4000}
                />
              </label>
              <Button disabled={busy}>
                Enregistrer la configuration Google
              </Button>
            </form>
          )}
          {!status.drive.configured && (
            <details className="setup-guide">
              <summary>! Activer la connexion OAuth</summary>
              <ol>
                <li>
                  Dans Google Cloud, activer Drive API et créer un client OAuth
                  de type application Web pour {ownerEmail}.
                </li>
                <li>
                  Ajouter le retour{" "}
                  <code>
                    http://127.0.0.1:4173/api/integrations/google/callback
                  </code>{" "}
                  (4174 en développement).
                </li>
                <li>
                  Renseigner l’identifiant et le secret du client dans les
                  champs ci-dessus. Ils restent sur cet ordinateur.
                </li>
                <li>
                  Utiliser ensuite le bouton de connexion. En mode test OAuth,
                  ajouter l’email comme utilisateur de test.
                </li>
              </ol>
              <a
                href="https://console.cloud.google.com/apis/credentials"
                target="_blank"
                rel="noreferrer"
              >
                Ouvrir Google Cloud <ExternalLink size={14} />
              </a>
            </details>
          )}
          {status.drive.folder && (
            <a
              href={`https://drive.google.com/drive/folders/${encodeURIComponent(status.drive.folder)}`}
              target="_blank"
              rel="noreferrer"
            >
              Ouvrir le dossier des devoirs <ExternalLink size={14} />
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
            Synchroniser / réessayer
          </Button>
          <small>
            Les devoirs restent disponibles localement en cas de coupure. Aucun
            partage public automatique.
          </small>
        </section>
        <section className="panel integration-card">
          <span className="integration-icon pay-icon">
            N<span>↗</span>
          </span>
          <h2>
            Notch Pay{" "}
            <HelpTip>
              Le paiement se termine sur la page hébergée du prestataire. Le
              statut est vérifié côté serveur avec le montant et la référence
              attendus.
            </HelpTip>
          </h2>
          <span
            className={`badge ${status.payment.configured ? "green" : "orange"}`}
          >
            {status.payment.configured
              ? `Clé configurée · ${status.payment.mode}`
              : "Compte marchand à activer"}
          </span>
          <p>
            Option retenue pour les paiements locaux :{" "}
            <strong>2 % à l’encaissement</strong>, avec{" "}
            <strong>1 % au retrait local</strong> selon le tarif consulté le 16
            septembre 2026.
          </p>
          <p className="footnote">
            Chariow Starter annonce 15 %, avec des fonctions de boutique
            incluses. Disponibilité, vérification du marchand et frais
            applicables à confirmer pour ton activité.
          </p>
          <div className="workspace-toolbar">
            <a
              href="https://business.notchpay.co/register"
              target="_blank"
              rel="noreferrer"
            >
              Configurer le compte marchand ↗
            </a>
            <a
              href="https://notchpay.co/pricing"
              target="_blank"
              rel="noreferrer"
            >
              Tarifs officiels ↗
            </a>
            <a
              href="https://chariow.com/en/pricing"
              target="_blank"
              rel="noreferrer"
            >
              Comparatif Chariow ↗
            </a>
          </div>
          <details className="setup-guide">
            <summary>! Configurer la clé de paiement</summary>
            <p>
              Après la création et la validation du marchand, ajouter
              NOTCHPAY_PUBLIC_KEY dans .env.local. Définir NOTCHPAY_MODE à test
              ou live selon la clé, puis redémarrer. Aucun mot de passe de
              compte n’est utilisé par le campus. Tester d’abord avec les moyens
              de test fournis par Notch Pay.
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
              Clé API publique Notch Pay{" "}
              <HelpTip>
                Copie la clé du tableau marchand. Il ne s’agit pas de ton mot de
                passe. Elle est conservée chiffrée sur cet ordinateur.
              </HelpTip>
              <input
                aria-label="Clé API publique Notch Pay"
                name="notchKey"
                type="password"
                required
                autoComplete="off"
                maxLength={4000}
              />
            </label>
            <label>
              Environnement{" "}
              <HelpTip>
                Ce choix doit correspondre à la clé fournie par Notch Pay. Une
                clé live permet de créer de vrais liens de règlement.
              </HelpTip>
              <select
                aria-label="Environnement Notch Pay"
                name="mode"
                defaultValue="test"
              >
                <option value="test">Test</option>
                <option value="live">Live — règlements réels</option>
              </select>
            </label>
            <Button disabled={busy}>
              Enregistrer la configuration Notch Pay
            </Button>
          </form>
        </section>
      </div>
      <section className="panel">
        <div className="workspace-heading">
          <h2>Les devoirs vers Drive</h2>
          <Button variant="outline" onClick={() => void load()}>
            Actualiser
          </Button>
        </div>
        {status.jobs.length ? (
          <div className="sync-list">
            {status.jobs.map((j) => (
              <article key={j.id}>
                <FileText />
                <div>
                  <strong>{j.label}</strong>
                  <small>
                    {j.error ||
                      (j.status === "pending"
                        ? "En attente de connexion ou de synchronisation."
                        : j.status === "synced"
                          ? "Copie confirmée par Google Drive."
                          : "À réessayer.")}
                  </small>
                </div>
                <span
                  className={`badge ${j.status === "synced" ? "green" : "orange"}`}
                >
                  {j.status === "synced"
                    ? "Synchronisé"
                    : j.status === "error"
                      ? "À réessayer"
                      : "En attente"}
                </span>
                {j.url && (
                  <a href={j.url} target="_blank" rel="noreferrer">
                    Voir <ExternalLink size={14} />
                  </a>
                )}
              </article>
            ))}
          </div>
        ) : (
          <p>
            Les prochains devoirs remis et corrigés apparaîtront dans cette
            file.
          </p>
        )}
      </section>
      <section className="panel">
        <h2>
          Créer un lien de règlement{" "}
          <HelpTip>
            Renseigne uniquement un montant convenu avec le client. Aucun tarif
            de formation n’est prérempli. Créer le lien ne prélève pas d’argent.
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
            Montant convenu (FCFA)
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
            Email du client
            <input name="email" type="email" required />
          </label>
          <label>
            Objet du règlement
            <input name="description" minLength={3} maxLength={200} required />
          </label>
          <Button disabled={!status.payment.configured || busy}>
            Créer le lien {status.payment.mode === "test" ? "de test" : ""}
          </Button>
        </form>
        {!status.payment.configured && (
          <p className="footnote">
            Création désactivée tant que la clé du compte marchand n’est pas
            configurée.
          </p>
        )}
        {status.checkouts?.map((p) => (
          <article className="interest-row" key={p.reference}>
            <div>
              <strong>
                {p.description} · {p.amount.toLocaleString("fr-FR")} FCFA
              </strong>
              <p>
                {p.email} · {p.status}
              </p>
              {p.url && (
                <a href={p.url} target="_blank" rel="noreferrer">
                  Ouvrir la page de paiement ↗
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
              Vérifier le règlement
            </Button>
          </article>
        ))}
      </section>
    </div>
  );
}
