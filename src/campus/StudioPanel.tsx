import { useCallback, useEffect, useRef, useState } from "react";
import {
  Bell,
  Search,
  Globe,
  Download,
  Link2,
  Video,
  Mail,
  ArrowUpRight,
  Sparkles,
} from "lucide-react";
import { Button } from "./components/ui/button";
import { useLanguage, tx } from "./lib/language";
import { workspaceRequest, post } from "./lib/workspace-api";
import {
  transcriptUrl,
  services,
  type ImportJob,
  type Transcript,
  type ServiceRequest,
} from "./lib/studio";
import type { Campus, Persona } from "./lib/model";
import type { Note, Media, Gallery } from "./lib/workspace";
import { practiceProjects, videos } from "./lib/resources";
import { HelpTip } from "./WorkspacePanel";
import { toast } from "sonner";
import "./studio.css";
import { ServiceIntakeFields, RequestBrief } from "./ServiceIntake";
import { serviceQuestions, type ServiceId } from "./lib/service-intake";

// Public form URL is verified after creation. No private Google credentials here.
const publicServiceForm =
  "https://docs.google.com/forms/d/e/1FAIpQLSeXMG4O9HBeEPy6rty_wLkPMXgmyz9lqpOhVdll3URqm4XKrg/viewform";
type StudioData = {
  ready: boolean | null;
  imports: ImportJob[];
  requests: ServiceRequest[];
};
function useStudio(persona: Persona) {
  const [data, setData] = useState<StudioData>({
    ready: null,
    imports: [],
    requests: [],
  });
  const [error, setError] = useState("");
  const load = useCallback(async () => {
    try {
      setData(await workspaceRequest<StudioData>("/api/studio", persona));
      setError("");
    } catch (e) {
      setError((e as Error).message);
    }
  }, [persona]);
  useEffect(() => {
    void load();
    const timer = setInterval(() => void load(), 4000);
    return () => clearInterval(timer);
  }, [load]);
  return { data, error, load };
}
const size = (bytes: number) => `${(bytes / 1024 / 1024).toFixed(1)} MB`;
export function LinkImport({
  persona,
  reload,
}: {
  persona: Persona;
  reload: () => Promise<void>;
}) {
  const { t } = useLanguage(),
    { data, error, load } = useStudio(persona);
  const [url, setUrl] = useState(""),
    [name, setName] = useState(""),
    [rights, setRights] = useState(false),
    [busy, setBusy] = useState(false),
    [problem, setProblem] = useState("");
  const done = data.imports.filter((j) => j.status === "done").length;
  const previous = useRef(done);
  useEffect(() => {
    if (done !== previous.current) {
      previous.current = done;
      void reload();
    }
  }, [done, reload]);
  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setBusy(true);
    setProblem("");
    try {
      await post("/api/studio/import", persona, { url, name, rights });
      setUrl("");
      setName("");
      setRights(false);
      await load();
    } catch (e) {
      setProblem((e as Error).message);
    } finally {
      setBusy(false);
    }
  };
  return (
    <section className="panel studio-import">
      <div className="studio-section-title">
        <span className="studio-icon orange">
          <Link2 />
        </span>
        <div>
          <h2>
            {t(
              "Save a file from a link",
              "Enregistrer un fichier depuis un lien",
            )}
          </h2>
          <p>
            {t(
              "Paste a direct download link. Your file will appear in this library.",
              "Collez un lien de téléchargement direct. Votre fichier apparaîtra dans cette bibliothèque.",
            )}
          </p>
        </div>
        <HelpTip>
          {t(
            "Public HTTPS files, up to 200 MB. Google search results and YouTube watch pages are not file links. Open the source and copy its download link.",
            "Fichiers HTTPS publics, jusqu’à 200 Mo. Les résultats Google et pages YouTube ne sont pas des fichiers. Ouvrez la source et copiez son lien de téléchargement.",
          )}
        </HelpTip>
      </div>
      <form onSubmit={submit} className="studio-form">
        <label>
          {t("File link", "Lien du fichier")}
          <input
            required
            type="url"
            value={url}
            maxLength={2000}
            placeholder="https://…/lesson.mp4"
            onChange={(e) => setUrl(e.target.value)}
          />
        </label>
        <label>
          {t("Save as (optional)", "Nom du fichier (facultatif)")}
          <input
            value={name}
            maxLength={180}
            onChange={(e) => setName(e.target.value)}
            placeholder={t("My lesson.mp4", "Mon cours.mp4")}
          />
        </label>
        <label className="studio-check">
          <input
            type="checkbox"
            required
            checked={rights}
            onChange={(e) => setRights(e.target.checked)}
          />
          {t(
            "I own this file or have permission to download it.",
            "Ce fichier m’appartient ou j’ai le droit de le télécharger.",
          )}
        </label>
        <Button disabled={busy || !rights}>
          <Download size={17} />
          {busy
            ? t("Starting…", "Démarrage…")
            : t("Import to my library", "Importer dans ma bibliothèque")}
        </Button>
      </form>
      {(problem || error) && (
        <p role="alert" className="error-box">
          {problem || error}
        </p>
      )}
      {data.imports
        .slice(-6)
        .reverse()
        .map((j) => (
          <div className="import-job" key={j.id}>
            <div>
              <strong>{j.name || t("Linked file", "Fichier lié")}</strong>
              <span>
                {t(
                  {
                    queued: "Waiting",
                    running: "Downloading",
                    done: "Saved",
                    error: "Needs attention",
                    cancelled: "Cancelled",
                  }[j.status],
                  {
                    queued: "En attente",
                    running: "Téléchargement",
                    done: "Enregistré",
                    error: "À vérifier",
                    cancelled: "Annulé",
                  }[j.status],
                )}{" "}
                · {size(j.received)}
                {j.total > 0 && ` / ${size(j.total)}`}
              </span>
              {j.error && <p>{j.error}</p>}
              {j.status === "running" && (
                <progress
                  aria-label={t(
                    "Download progress",
                    "Progression du téléchargement",
                  )}
                  max={j.total || undefined}
                  value={j.total ? j.received : undefined}
                />
              )}
            </div>
            {["queued", "running"].includes(j.status) && (
              <Button
                variant="outline"
                onClick={() =>
                  void post("/api/studio/cancel", persona, { id: j.id })
                    .then(load)
                    .catch((e) => toast.error(e.message))
                }
              >
                {t("Cancel", "Annuler")}
              </Button>
            )}
          </div>
        ))}
      <p className="studio-caption">
        <Sparkles size={15} />
        {data.ready === null
          ? t(
              "Checking local speech recognition…",
              "Vérification de la reconnaissance vocale…",
            )
          : data.ready
            ? t(
                "Automatic transcripts run on this computer. Your videos stay here.",
                "Les transcriptions automatiques sont réalisées sur cet ordinateur. Vos vidéos restent ici.",
              )
            : t(
                "Local speech recognition is not installed on this server yet.",
                "La reconnaissance vocale locale n’est pas encore installée sur ce serveur.",
              )}
      </p>
    </section>
  );
}
export function VideoTranscript({
  id,
  persona,
  seek,
  onReady,
}: {
  id: string;
  persona: Persona;
  seek: (time: number) => void;
  onReady: (ready: boolean) => void;
}) {
  const { t } = useLanguage();
  const [data, setData] = useState<{
      transcript: Transcript | null;
      ready: boolean;
    } | null>(null),
    [query, setQuery] = useState(""),
    [error, setError] = useState("");
  const load = useCallback(async () => {
    try {
      setData(
        await workspaceRequest(
          `/api/transcript?id=${encodeURIComponent(id)}`,
          persona,
        ),
      );
      setError("");
    } catch (e) {
      setError((e as Error).message);
    }
  }, [id, persona]);
  useEffect(() => {
    void load();
    const timer = setInterval(() => void load(), 5000);
    return () => clearInterval(timer);
  }, [load]);
  const tr = data?.transcript;
  useEffect(() => {
    onReady(tr?.status === "done");
  }, [tr?.status, onReady]);
  return (
    <details className="transcript">
      <summary>
        {t("Video transcript", "Transcription vidéo")}{" "}
        <span>
          {tr?.status === "done"
            ? "✓"
            : tr?.status === "running"
              ? t("Transcribing…", "Transcription…")
              : t("Automatic", "Automatique")}
        </span>
      </summary>
      {error && <p role="alert">{error}</p>}
      {!data?.ready && (
        <p>
          {t(
            "Local transcription is not ready on this server.",
            "La transcription locale n’est pas prête sur ce serveur.",
          )}
        </p>
      )}
      {data?.ready && (!tr || tr.status === "queued") && (
        <p role="status">
          {t(
            "Waiting for a free transcription slot. You can keep using the campus.",
            "En attente de transcription. Vous pouvez continuer à utiliser le campus.",
          )}
        </p>
      )}
      {tr?.status === "running" && (
        <p role="status">
          {t(
            "Listening to this video on your computer…",
            "Analyse de cette vidéo sur votre ordinateur…",
          )}
        </p>
      )}
      {tr?.status === "error" && (
        <>
          <p>{tr.error}</p>
          <Button
            variant="outline"
            onClick={() =>
              void post("/api/studio/transcribe", persona, { id })
                .then(load)
                .catch((e) => toast.error(e.message))
            }
          >
            {t("Retry", "Réessayer")}
          </Button>
        </>
      )}
      {tr?.status === "done" && (
        <>
          <p className="studio-caption">
            {t(
              "AI draft. Check important words before sharing.",
              "Brouillon IA. Vérifiez les mots importants avant de partager.",
            )}{" "}
            · {tr.language.toUpperCase()}
          </p>
          <input
            aria-label={t(
              "Search this transcript",
              "Chercher dans la transcription",
            )}
            placeholder={t("Find a word…", "Chercher un mot…")}
            value={query}
            onChange={(e) => setQuery(e.target.value)}
          />
          <div className="transcript-lines">
            {tr.segments
              .filter((s) => s.text.toLowerCase().includes(query.toLowerCase()))
              .map((s, i) => (
                <button key={i} onClick={() => seek(s.start)}>
                  <time>
                    {Math.floor(s.start / 60)}:
                    {String(Math.floor(s.start % 60)).padStart(2, "0")}
                  </time>
                  <span>{s.text}</span>
                </button>
              ))}
            {!tr.segments.length && (
              <p>
                {t(
                  "No speech was found in this video.",
                  "Aucune parole détectée dans cette vidéo.",
                )}
              </p>
            )}
          </div>
          <div className="studio-actions">
            <a download href={transcriptUrl(id, persona, "txt", true)}>
              TXT ↓
            </a>
            <a download href={transcriptUrl(id, persona, "vtt", true)}>
              {t("Captions", "Sous-titres")} VTT ↓
            </a>
          </div>
        </>
      )}
    </details>
  );
}

export function LiveClassTools() {
  const { t } = useLanguage();
  return (
    <section className="panel live-tools">
      <span className="studio-icon green">
        <Video />
      </span>
      <div>
        <h2>{t("Your live classroom", "Votre classe en direct")}</h2>
        <p>
          {t(
            "Create a Google Meet room, then paste its participant link when you add or edit a class. Learners join from their class card.",
            "Créez une réunion Google Meet, puis collez son lien lors de la création ou modification du cours. Les élèves rejoignent le cours depuis sa fiche.",
          )}
        </p>
        <div className="studio-actions">
          <a
            className="download-link"
            href="https://meet.google.com/"
            target="_blank"
            rel="noreferrer"
          >
            Google Meet <ArrowUpRight size={16} />
          </a>
          <a
            href="https://zoom.us/meeting/schedule"
            target="_blank"
            rel="noreferrer"
          >
            Zoom <ArrowUpRight size={16} />
          </a>
        </div>
      </div>
      <HelpTip>
        {t(
          "The call opens with the provider. Camera, microphone, screen sharing and meeting controls are handled there. A Google account is needed to host a Meet call.",
          "L’appel s’ouvre chez le fournisseur. La caméra, le micro, le partage d’écran et les commandes y sont gérés. Un compte Google est nécessaire pour organiser une réunion Meet.",
        )}
      </HelpTip>
    </section>
  );
}

type SearchResult = {
  id: string;
  title: string;
  text: string;
  page: string;
  type: string;
  url?: string;
};
export function CampusSearch({
  persona,
  campus,
  go,
}: {
  persona: Persona;
  campus: Campus;
  go: (page: string) => void;
}) {
  const { t, locale } = useLanguage();
  const [query, setQuery] = useState(""),
    [filter, setFilter] = useState("all"),
    [personal, setPersonal] = useState<SearchResult[]>([]),
    [error, setError] = useState("");
  useEffect(() => {
    let active = true;
    Promise.all([
      workspaceRequest<{ notes: Note[]; media: Media[]; galleries: Gallery[] }>(
        "/api/workspace",
        persona,
      ),
      workspaceRequest<{ id: string; text: string }[]>(
        "/api/studio/search",
        persona,
      ),
    ])
      .then(([d, transcripts]) => {
        if (active)
          setPersonal([
            ...d.notes.map((n) => ({
              id: n.id,
              title: n.title,
              text: n.blocks.map((b) => b.text).join(" "),
              page: "notebook",
              type: "notes",
            })),
            ...d.media.map((m) => ({
              id: m.id,
              title: m.name,
              text: `${m.type} ${transcripts.find((t) => t.id === `transcript:${m.id}`)?.text || ""}`,
              page: "library",
              type: "files",
            })),
            ...d.galleries.map((g) => ({
              id: g.id,
              title: g.name,
              text: g.purpose,
              page: "galleries",
              type: "photos",
            })),
          ]);
      })
      .catch((e) => {
        if (active) setError(e.message);
      });
    return () => {
      active = false;
    };
  }, [persona]);
  const all: SearchResult[] = [
    ...campus.lessons.map((l) => ({
      id: l.id,
      title: tx(l.title),
      text: `${tx(l.module)} ${tx(l.explanation)} ${tx(l.task)}`,
      page: "courses",
      type: "lessons",
    })),
    ...campus.sessions.map((s) => ({
      id: s.id,
      title: s.title,
      text: `${s.start} ${s.status}`,
      page: "sessions",
      type: "classes",
    })),
    ...campus.submissions.map((s) => ({
      id: s.id,
      title: tx(
        campus.lessons.find((l) => l.id === s.lesson)?.title || s.lesson,
      ),
      text: `${s.text} ${s.feedback}`,
      page: "projects",
      type: "homework",
    })),
    ...campus.help.map((h) => ({
      id: h.id,
      title: h.question,
      text: h.answer,
      page: "help",
      type: "help",
    })),
    ...(["adult", "teacher"].includes(persona)
      ? [
          ...practiceProjects.map((p) => ({
            id: p.id,
            title: tx(p.title),
            text: `${p.topic} ${tx(p.mission)}`,
            page: "explore",
            type: "resources",
            url: p.repo,
          })),
          ...videos.map((v) => ({
            id: v.url,
            title: tx(v.title),
            text: `${v.author} ${tx(v.note)}`,
            page: "explore",
            type: "resources",
            url: v.url,
          })),
        ]
      : []),
    ...personal,
  ];
  const words = query.toLocaleLowerCase().trim().split(/\s+/).filter(Boolean);
  const results = all.filter(
    (r) =>
      (filter === "all" || r.type === filter) &&
      words.every((word) =>
        `${r.title} ${r.text}`.toLocaleLowerCase().includes(word),
      ),
  );
  const web = (images = false) =>
    `https://www.google.com/search?q=${encodeURIComponent(query)}&hl=${locale}${images ? "&udm=2" : ""}`;
  const types = [
    ["all", "Everything", "Tout"],
    ["lessons", "Lessons", "Leçons"],
    ["files", "Files", "Fichiers"],
    ["notes", "Notes", "Notes"],
    ["photos", "Galleries", "Galeries"],
    ["classes", "Live classes", "Cours en direct"],
    ["homework", "Homework", "Devoirs"],
    ["resources", "Resources", "Ressources"],
    ["help", "Help", "Aide"],
  ];
  return (
    <div className="studio-stack">
      <section className="search-hero">
        <span className="studio-icon yellow">
          <Search />
        </span>
        <h2>
          {t("What would you like to find?", "Que souhaitez-vous trouver ?")}
        </h2>
        <p>
          {t(
            "Search your lessons, notes, homework and files in one place.",
            "Cherchez vos leçons, notes, devoirs et fichiers au même endroit.",
          )}
        </p>
        <label className="global-search">
          <Search />
          <input
            autoFocus
            aria-label={t("Search the campus", "Chercher dans le campus")}
            placeholder={t(
              "Try Docker, cloud, homework…",
              "Essayez Docker, cloud, devoir…",
            )}
            value={query}
            onChange={(e) => setQuery(e.target.value)}
          />
        </label>
        <div className="search-filters">
          {types.map(([id, en, fr]) => (
            <button
              key={id}
              aria-pressed={filter === id}
              onClick={() => setFilter(id)}
            >
              {t(en, fr)}
            </button>
          ))}
        </div>
      </section>
      <section className="panel web-search">
        <Globe />
        <div>
          <h3>{t("Search the web too", "Cherchez aussi sur le web")}</h3>
          <p>
            {t(
              "Only the words you enter are sent to Google when you choose Search Google. Results open in a new tab.",
              "Seuls les mots saisis sont envoyés à Google lorsque vous choisissez Chercher sur Google. Les résultats s’ouvrent dans un nouvel onglet.",
            )}
          </p>
          <div className="studio-actions">
            {query.trim() ? (
              <>
                <a href={web()} target="_blank" rel="noreferrer">
                  {t("Search Google", "Chercher sur Google")} ↗
                </a>
                <a href={web(true)} target="_blank" rel="noreferrer">
                  Google Images ↗
                </a>
              </>
            ) : (
              <span>
                {t(
                  "Enter a few words above to search online.",
                  "Saisissez quelques mots ci-dessus pour chercher en ligne.",
                )}
              </span>
            )}
            <Button variant="outline" onClick={() => go("library")}>
              <Link2 size={16} />
              {t(
                "Import a download link",
                "Importer un lien de téléchargement",
              )}
            </Button>
          </div>
        </div>
      </section>
      {error && <p role="alert">{error}</p>}
      <p role="status">
        {results.length} {t("campus results", "résultats dans le campus")}
      </p>
      <div className="search-results">
        {results.slice(0, 80).map((r) => (
          <article className="panel search-result" key={`${r.type}-${r.id}`}>
            <span className="badge">
              {t(
                ...((types.find(([id]) => id === r.type)?.slice(1) as [
                  string,
                  string,
                ]) || [r.type, r.type]),
              )}
            </span>
            <h3>{r.title}</h3>
            <p>
              {r.text.slice(0, 240)}
              {r.text.length > 240 ? "…" : ""}
            </p>
            <Button variant="outline" onClick={() => go(r.page)}>
              {t("Open section", "Ouvrir la rubrique")}{" "}
              <ArrowUpRight size={16} />
            </Button>
            {r.url && (
              <a href={r.url} target="_blank" rel="noreferrer">
                {t("Open resource", "Ouvrir la ressource")} ↗
              </a>
            )}
          </article>
        ))}
      </div>
      {!results.length && (
        <p className="friendly-empty">
          {t(
            "No match yet. Try a shorter word or search Google.",
            "Aucun résultat. Essayez un mot plus court ou cherchez sur Google.",
          )}
        </p>
      )}
    </div>
  );
}

export function ServiceDesk({ persona }: { persona: Persona }) {
  const { t } = useLanguage(),
    { data, error, load } = useStudio(persona);
  const [service, setService] = useState<ServiceId>("training"),
    [busy, setBusy] = useState(false),
    [receipt, setReceipt] = useState(""),
    [problem, setProblem] = useState(""),
    [view, setView] = useState(
      () => sessionStorage.getItem("lessgooo-service-view") || "request",
    );
  useEffect(() => {
    const show = () => setView("inbox");
    window.addEventListener("campus-service-inbox", show);
    return () => window.removeEventListener("campus-service-inbox", show);
  }, []);
  const send = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const form = e.currentTarget,
      fields = new FormData(form);
    setBusy(true);
    setProblem("");
    try {
      const result = await post<{ id: string }>(
        "/api/studio/request",
        persona,
        {
          service,
          name: fields.get("name"),
          email: fields.get("email"),
          phone: fields.get("phone"),
          message: fields.get("message"),
          consent: fields.get("consent") === "on",
          language: fields.get("language"),
          country: fields.get("country"),
          city: fields.get("city"),
          timezone: fields.get("timezone"),
          contact: fields.get("contact"),
          timeframe: fields.get("timeframe"),
          answers: Object.fromEntries(
            serviceQuestions[service].map((question) => [
              question.id,
              fields.get(`answer:${question.id}`) || "",
            ]),
          ),
        },
      );
      setReceipt(result.id);
      form.reset();
      await load();
    } catch (e) {
      setProblem((e as Error).message);
    } finally {
      setBusy(false);
    }
  };
  if (persona === "child")
    return (
      <p>
        {t(
          "Ask a parent to help you send a service request.",
          "Demande à un parent de t’aider à envoyer une demande.",
        )}
      </p>
    );
  return (
    <div className="studio-stack">
      <section className="service-hero">
        <span className="eyebrow">
          LESSGOOO · {t("LET’S WORK TOGETHER", "AVANÇONS ENSEMBLE")}
        </span>
        <h2>
          {t(
            "A little help. A new possibility.",
            "Un coup de main. Une nouvelle possibilité.",
          )}
        </h2>
        <p>
          {t(
            "Choose what you need. Tell us a little about your goal. We will review your request and contact you.",
            "Choisissez votre besoin. Décrivez votre objectif. Nous étudierons votre demande et vous contacterons.",
          )}
        </p>
        {publicServiceForm && (
          <div className="studio-actions">
            <a href={publicServiceForm} target="_blank" rel="noreferrer">
              {t("Open the public request form", "Ouvrir le formulaire public")}{" "}
              ↗
            </a>
            <Button
              variant="outline"
              onClick={() =>
                void navigator.clipboard
                  .writeText(publicServiceForm)
                  .then(() => toast.success(t("Link copied", "Lien copié")))
                  .catch(() =>
                    toast.error(
                      t(
                        "Open the form and copy its address.",
                        "Ouvrez le formulaire et copiez son adresse.",
                      ),
                    ),
                  )
              }
            >
              {t("Copy link for a client", "Copier le lien pour un client")}
            </Button>
          </div>
        )}
      </section>
      {persona === "teacher" && (
        <div className="search-filters">
          <button
            aria-pressed={view === "request"}
            onClick={() => setView("request")}
          >
            {t("Request a service", "Demander un service")}
          </button>
          <button
            aria-pressed={view === "inbox"}
            onClick={() => setView("inbox")}
          >
            {t("Local inbox", "Boîte de réception locale")} (
            {data.requests.filter((r) => r.status === "new").length})
          </button>
          {publicServiceForm && (
            <a
              href="https://docs.google.com/forms/d/16qZ7nKK1rQa1AB8q0AtDg1B1bJVo3fV3xARjdiyhUT0/edit#responses"
              target="_blank"
              rel="noreferrer"
            >
              {t(
                "Public responses & email alerts",
                "Réponses publiques et alertes email",
              )}{" "}
              ↗
            </a>
          )}
        </div>
      )}
      {view === "inbox" && persona === "teacher" ? (
        <>
          <p>
            {t(
              "Local demo requests appear here. Public form responses are stored in Google Forms and send email alerts.",
              "Les demandes de la démo locale apparaissent ici. Les réponses publiques sont dans Google Forms avec des alertes email.",
            )}
          </p>
          {data.requests
            .slice()
            .reverse()
            .map((r) => (
              <RequestCard key={r.id} request={r} reload={load} />
            ))}
          {!data.requests.length && (
            <div className="friendly-empty">
              <Mail />
              <h3>
                {t("Your inbox is ready", "Votre boîte de réception est prête")}
              </h3>
              <p>
                {t(
                  "New local requests will appear here.",
                  "Les nouvelles demandes locales apparaîtront ici.",
                )}
              </p>
            </div>
          )}
        </>
      ) : (
        <>
          <section className="panel service-intake">
            <h2>
              {t("Tell us about your goal", "Parlez-nous de votre objectif")}
            </h2>
            <p className="studio-caption">
              {t(
                "Local demo form — use test details. For a real request, use the public form above.",
                "Formulaire de démo locale — utilisez des données de test. Pour une vraie demande, utilisez le formulaire public ci-dessus.",
              )}
            </p>
            {receipt ? (
              <div role="status" className="request-success">
                <h3>{t("Request saved ✓", "Demande enregistrée ✓")}</h3>
                <p>
                  {t(
                    "The request is in the local inbox.",
                    "La demande est dans la boîte de réception locale.",
                  )}
                </p>
                <code>{receipt.slice(0, 8).toUpperCase()}</code>
                <Button variant="outline" onClick={() => setReceipt("")}>
                  {t("Send another request", "Envoyer une autre demande")}
                </Button>
              </div>
            ) : (
              <form className="studio-form" onSubmit={send}>
                <ServiceIntakeFields
                  service={service}
                  changeService={setService}
                  busy={busy}
                />
              </form>
            )}
          </section>
        </>
      )}
      {(error || problem) && (
        <p role="alert" className="error-box">
          {problem || error}
        </p>
      )}
    </div>
  );
}
function RequestCard({
  request: r,
  reload,
}: {
  request: ServiceRequest;
  reload: () => Promise<void>;
}) {
  const { t } = useLanguage(),
    [notes, setNotes] = useState(r.notes),
    [status, setStatus] = useState(r.status),
    [busy, setBusy] = useState(false);
  const service = services.find((s) => s.id === r.service)!;
  return (
    <article className="panel request-card">
      <span className={`badge ${r.status === "new" ? "orange" : "green"}`}>
        {t(service.en, service.fr)}
      </span>
      <h3>{r.name}</h3>
      <p>{r.message}</p>
      <p>
        {r.email} {r.phone && `· ${r.phone}`}
      </p>
      <small>
        {new Date(r.created).toLocaleString()} · {r.language.toUpperCase()}
      </small>
      <RequestBrief request={r} />
      <div className="studio-form">
        <label>
          {t("Status", "Statut")}
          <select
            value={status}
            onChange={(e) =>
              setStatus(e.target.value as ServiceRequest["status"])
            }
          >
            <option value="new">{t("New", "Nouveau")}</option>
            <option value="contacted">{t("Contacted", "Contacté")}</option>
            <option value="closed">{t("Closed", "Clôturé")}</option>
          </select>
        </label>
        <label>
          {t("Private follow-up notes", "Notes privées de suivi")}
          <textarea
            value={notes}
            maxLength={3000}
            onChange={(e) => setNotes(e.target.value)}
          />
        </label>
        <Button
          disabled={busy}
          onClick={async () => {
            setBusy(true);
            try {
              await post("/api/studio/request-status", "teacher", {
                id: r.id,
                status,
                notes,
              });
              await reload();
              toast.success(t("Saved", "Enregistré"));
            } catch (e) {
              toast.error((e as Error).message);
            } finally {
              setBusy(false);
            }
          }}
        >
          {t("Save follow-up", "Enregistrer le suivi")}
        </Button>
        <a
          className="download-link"
          href={`mailto:${encodeURIComponent(r.email)}?subject=${encodeURIComponent(`LESSGOOO — ${t(service.en, service.fr)}`)}`}
        >
          {t("Write an email", "Écrire un email")} ↗
        </a>
      </div>
    </article>
  );
}
export function ServiceAlerts({ go }: { go: (page: string) => void }) {
  const { t } = useLanguage(),
    { data, error } = useStudio("teacher"),
    previous = useRef<Set<string> | null>(null);
  const fresh = data.requests.filter((r) => r.status === "new");
  useEffect(() => {
    const ids = new Set(data.requests.map((r) => r.id));
    if (
      previous.current &&
      data.requests.some((r) => !previous.current!.has(r.id))
    )
      toast.info(
        t(
          "A new service request is waiting.",
          "Une nouvelle demande de service vous attend.",
        ),
      );
    previous.current = ids;
  }, [data.requests, t]);
  return (
    <button
      className="service-alert"
      onClick={() => {
        sessionStorage.setItem("lessgooo-service-view", "inbox");
        go("services");
        window.dispatchEvent(new Event("campus-service-inbox"));
      }}
      aria-label={
        error
          ? t("Service alerts unavailable", "Alertes indisponibles")
          : `${t("Service requests", "Demandes de service")}: ${fresh.length}`
      }
    >
      <Bell size={19} />
      <span>{error ? "!" : fresh.length}</span>
    </button>
  );
}
