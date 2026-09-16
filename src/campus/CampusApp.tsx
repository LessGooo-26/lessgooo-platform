"use client";
import {
  useState,
  useEffect,
  useCallback,
  useRef,
  type ReactNode,
} from "react";
import {
  LayoutDashboard,
  BookOpen,
  CalendarDays,
  Users,
  FolderCheck,
  BriefcaseBusiness,
  MessagesSquare,
  Settings,
  ArrowUpRight,
  ArrowRight,
  Plus,
  Video,
  Clock,
  Cloud,
  Terminal,
  Blocks,
  Check,
  ChevronRight,
  Download,
  GraduationCap,
  Wallet,
  Globe,
  ShieldCheck,
  CheckCircle2,
  FileText,
  MessageCircle,
  Search,
  Loader2,
  ExternalLink,
  Paperclip,
  LifeBuoy,
  Rocket,
} from "lucide-react";
import {
  SidebarProvider,
  Sidebar,
  SidebarHeader,
  SidebarContent,
  SidebarFooter,
  SidebarMenu,
  SidebarMenuItem,
  SidebarMenuButton,
  SidebarInset,
  SidebarTrigger,
  useSidebar,
} from "@/components/ui/sidebar";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
} from "@/components/ui/select";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Progress } from "@/components/ui/progress";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Table,
  TableHeader,
  TableHead,
  TableBody,
  TableRow,
  TableCell,
} from "@/components/ui/table";
import { Skeleton } from "@/components/ui/skeleton";
import { Toaster, toast } from "sonner";
import {
  BrandLogo,
  HelpTip,
  HomeworkMap,
  Launchpad,
  WorkspacePanel,
} from "./WorkspacePanel";
import "./workspace.css";
import { uploadMedia } from "./lib/workspace-api";
import {
  personas,
  trackLabel,
  stageLabels,
  progress,
  type Snapshot,
  type Student,
  type Persona,
  type Lesson,
  type Session,
  type Submission,
  type Stage,
} from "@/lib/model";
const navItems = [
  ["dashboard", "Vue d’ensemble", LayoutDashboard],
  ["courses", "Parcours & leçons", BookOpen],
  ["explore", "Projets & ressources", Rocket],
  ["notebook", "Notes & présentations", FileText],
  ["library", "Vidéos & fichiers", Video],
  ["career", "Entretiens & carrière", GraduationCap],
  ["sessions", "Cours Zoom", CalendarDays],
  ["projects", "Travaux & corrections", FolderCheck],
  ["students", "Mes élèves", Users],
  ["coaching", "One-on-one", MessagesSquare],
  ["stages", "Suivi des stages", BriefcaseBusiness],
  ["payments", "Paiements", Wallet],
  ["help", "Questions & réponses", MessageCircle],
  ["settings", "Réglages & guide", Settings],
  ["integrations", "Drive & paiements en ligne", Cloud],
] as const;
const zones = [
  ["Africa/Douala", "Douala · WAT"],
  ["America/Toronto", "Toronto / Montréal"],
  ["America/New_York", "New York"],
  ["America/Chicago", "Chicago"],
  ["America/Los_Angeles", "Los Angeles"],
  ["Europe/Paris", "Paris"],
  ["Etc/UTC", "UTC"],
];
const fieldHelp: Record<string, string> = {
  name: "Nom affiché dans le dossier et le suivi des travaux.",
  email:
    "Adresse de contact. Aucun email automatique n’est envoyé par ce formulaire.",
  track:
    "Le parcours détermine les leçons visibles. Le parcours d’un dossier existant ne peut pas être changé.",
  parent: "Contact parental associé au dossier Kids de démonstration.",
  credits:
    "Crédits de coaching de démonstration disponibles. Une réservation en consomme un ; son annulation le restitue.",
  title: "Titre affiché dans les listes et le détail de cette ressource.",
  module: "Regroupe les leçons dans une étape du parcours.",
  minutes:
    "Estimation de temps pour cette activité, sans engagement de durée de formation.",
  level: "Niveau pédagogique ou autonomie observée selon le formulaire.",
  explanation:
    "Le contenu du cours : notions, exemples et démarche à comprendre.",
  task: "Travail concret que l’élève doit réaliser puis remettre.",
  criteria:
    "Éléments attendus pour que le formateur puisse valider le travail.",
  resource:
    "Lien HTTPS vers une documentation ou ressource pédagogique complémentaire.",
  start: "Début du créneau ; vérifiez le fuseau horaire affiché.",
  duration: "Durée du créneau en minutes. Les chevauchements sont refusés.",
  zoom: "Lien participant Zoom. Ne partagez pas le lien réservé à l’hôte.",
  replay:
    "Lien HTTPS vers un enregistrement que vous êtes autorisé à partager.",
  student: "Dossier élève concerné par cette opération.",
  status:
    "État de suivi. Un paiement du registre reste une saisie manuelle, distincte de la vérification Notch Pay.",
  goal: "Objectif concret de l’accompagnement pour préparer la séance.",
  amount:
    "Montant du registre de démonstration. Il ne déclenche aucun encaissement.",
  currency: "Devise du montant saisi. Aucun taux de conversion n’est appliqué.",
  reference:
    "Référence permettant de rapprocher le paiement avec une preuve externe.",
  feedback:
    "Expliquez ce qui est réussi et ce qu’il faut améliorer. Seule une validation augmente la progression.",
  question:
    "Décrivez votre blocage et les essais déjà effectués, sans identifiant secret.",
  notes:
    "Informations utiles au suivi, sans donnée personnelle inutile ni mot de passe.",
};
const money = (amount: number, currency: string) =>
  new Intl.NumberFormat("fr-FR", { style: "currency", currency }).format(
    amount / (currency === "XAF" ? 1 : 100),
  );
const statusText: Record<string, string> = {
  pending: "À vérifier",
  validated: "Validé",
  revise: "À retravailler",
  verified: "Vérifié",
  refunded: "Remboursé",
  present: "Présent",
  absent: "Absent",
  excused: "Excusé",
  scheduled: "Planifié",
  cancelled: "Annulé",
  booked: "Réservé",
  open: "Disponible",
  completed: "Terminé",
};
const download = (
  content: Blob | string,
  name: string,
  type = "application/json",
) => {
  const blob =
    typeof content === "string" ? new Blob([content], { type }) : content;
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = name;
  a.click();
  setTimeout(() => URL.revokeObjectURL(url), 1000);
};
function Choice({
  value,
  onChange,
  options,
  label,
  id,
}: {
  value: string;
  onChange: (v: string) => void;
  options: string[][];
  label: string;
  id?: string;
}) {
  return (
    <Select value={value} onValueChange={onChange}>
      <SelectTrigger id={id} aria-label={label} className="choice">
        <SelectValue />
      </SelectTrigger>
      <SelectContent>
        {options.map(([v, l]) => (
          <SelectItem key={v} value={v}>
            {l}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
}
function Badge({
  children,
  tone = "neutral",
}: {
  children: ReactNode;
  tone?: string;
}) {
  return <span className={`badge ${tone}`}>{children}</span>;
}
function Empty({ title, children }: { title: string; children?: ReactNode }) {
  return (
    <div className="empty">
      <FolderCheck size={30} />
      <h3>{title}</h3>
      {children && <p>{children}</p>}
    </div>
  );
}
function SideNav({
  page,
  go,
  persona,
}: {
  page: string;
  go: (p: string) => void;
  persona: Persona;
}) {
  const { setOpenMobile } = useSidebar();
  return (
    <SidebarMenu>
      {navItems
        .filter(
          ([id]) =>
            !(persona !== "teacher" && id === "students") &&
            !(
              ["parent", "child"].includes(persona) &&
              ["stages", "coaching", "career"].includes(id)
            ) &&
            !(persona !== "teacher" && id === "integrations") &&
            !(persona === "child" && id === "payments"),
        )
        .map(([id, label, Icon]) => (
          <SidebarMenuItem key={id}>
            <SidebarMenuButton
              className="nav-button"
              isActive={page === id}
              onClick={() => {
                go(id);
                setOpenMobile(false);
              }}
            >
              <Icon />
              <span>{label}</span>
            </SidebarMenuButton>
          </SidebarMenuItem>
        ))}
    </SidebarMenu>
  );
}
async function readSnapshot(response: Response) {
  if (!response.headers.get("content-type")?.includes("application/json"))
    throw new Error(
      "Le campus nécessite le serveur local. Ouvrez-le depuis votre ordinateur.",
    );
  return response.json() as Promise<Snapshot & { error: string }>;
}
type CampusTool = {
  name: string;
  description: string;
  inputSchema: Record<string, unknown>;
  annotations: Record<string, boolean>;
  execute: (input: Record<string, string>) => unknown;
};
type Field = {
  key: string;
  label: string;
  type?: string;
  required?: boolean;
  options?: string[][];
  hint?: string;
};
type FormConfig = {
  title: string;
  description?: string;
  action: string;
  values: Record<string, unknown>;
  fields: Field[];
  transform?: (v: Record<string, unknown>) => unknown;
};
function Editor({
  config,
  onClose,
  onSave,
  busy,
}: {
  config: FormConfig;
  onClose: () => void;
  onSave: (action: string, data: unknown) => Promise<boolean>;
  busy: boolean;
}) {
  const [v, setV] = useState(config.values);
  return (
    <Dialog open onOpenChange={(b) => !b && onClose()}>
      <DialogContent className="editor-dialog">
        <DialogHeader>
          <BrandLogo className="dialog-logo" />
          <DialogTitle>{config.title}</DialogTitle>
          <DialogDescription>
            {config.description ||
              "Complétez les informations puis enregistrez."}
          </DialogDescription>
        </DialogHeader>
        <form
          onSubmit={async (e) => {
            e.preventDefault();
            const data = config.transform ? config.transform(v) : v;
            if (await onSave(config.action, data)) onClose();
          }}
          className="form-stack"
        >
          {config.fields.map((f) => (
            <label key={f.key} htmlFor={`field-${f.key}`} className="field">
              <span>
                {f.label}
                {f.required ? " *" : ""}
                <HelpTip label={`Aide : ${f.label}`}>
                  {f.hint ||
                    fieldHelp[f.key] ||
                    `Renseignez ${f.label.toLowerCase()}. Cette valeur sera enregistrée dans le campus local.`}
                </HelpTip>
              </span>
              {f.options ? (
                <Choice
                  id={`field-${f.key}`}
                  label={f.label}
                  value={String(v[f.key] ?? "")}
                  onChange={(value) => setV({ ...v, [f.key]: value })}
                  options={f.options}
                />
              ) : f.type === "textarea" ? (
                <Textarea
                  id={`field-${f.key}`}
                  value={String(v[f.key] ?? "")}
                  required={f.required}
                  rows={5}
                  maxLength={12000}
                  onChange={(e) => setV({ ...v, [f.key]: e.target.value })}
                />
              ) : (
                <Input
                  id={`field-${f.key}`}
                  type={f.type || "text"}
                  step={f.type === "number" ? "any" : undefined}
                  value={String(v[f.key] ?? "")}
                  required={f.required}
                  min={f.type === "number" ? 0 : undefined}
                  maxLength={f.type === "number" ? undefined : 2000}
                  onChange={(e) =>
                    setV({
                      ...v,
                      [f.key]:
                        f.type === "number"
                          ? Number(e.target.value)
                          : e.target.value,
                    })
                  }
                />
              )}{" "}
              {f.hint && <small>{f.hint}</small>}
            </label>
          ))}
          <div className="form-actions">
            <Button type="button" variant="outline" onClick={onClose}>
              Annuler
            </Button>
            <Button disabled={busy} type="submit">
              {busy ? (
                <Loader2 className="spin" size={16} />
              ) : (
                <Check size={16} />
              )}
              Enregistrer
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
export default function CampusApp() {
  const [snapshot, setSnapshot] = useState<Snapshot | null>(null),
    [persona, setPersona] = useState<Persona>("teacher"),
    [page, setPage] = useState(() =>
      navItems.some(([id]) => id === location.hash.slice(1))
        ? location.hash.slice(1)
        : "dashboard",
    ),
    [zone, setZone] = useState("Africa/Douala"),
    [error, setError] = useState(""),
    [loading, setLoading] = useState(true),
    [busy, setBusy] = useState(false),
    [filter, setFilter] = useState("all"),
    [query, setQuery] = useState(""),
    [editor, setEditor] = useState<FormConfig | null>(null),
    [lesson, setLesson] = useState<Lesson | null>(null),
    [session, setSession] = useState<Session | null>(null),
    [submission, setSubmission] = useState<Submission | null>(null),
    [stage, setStage] = useState<Stage | null>(null);
  const snapRef = useRef(snapshot);
  const pageRef = useRef(page);
  pageRef.current = page;
  snapRef.current = snapshot;
  const personaRef = useRef(persona);
  personaRef.current = persona;
  const reload = useCallback(async (p: Persona = personaRef.current) => {
    setLoading(true);
    setError("");
    try {
      const r = await fetch("/api/campus", {
        headers: { "x-campus-persona": p },
      });
      const d = await readSnapshot(r);
      if (!r.ok)
        throw new Error(
          d.error || "Démarrez le serveur local pour accéder au campus.",
        );
      if (p === personaRef.current) setSnapshot(d);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Connexion impossible.");
    } finally {
      setLoading(false);
    }
  }, []);
  useEffect(() => {
    const stored = localStorage.getItem("lessgooo-timezone");
    if (stored && zones.some((z) => z[0] === stored)) setZone(stored);
    reload();
  }, [reload]);
  useEffect(() => {
    const navigate = () => {
      const section = location.hash.slice(1);
      if (!navItems.some(([id]) => id === section)) return;
      if (
        !window.dispatchEvent(
          new Event("campus-before-navigate", { cancelable: true }),
        )
      ) {
        history.replaceState(null, "", `#${pageRef.current}`);
        return;
      }
      setPage(section);
      setQuery("");
      setFilter("all");
      window.scrollTo({ top: 0 });
    };
    window.addEventListener("hashchange", navigate);
    return () => window.removeEventListener("hashchange", navigate);
  }, []);
  const act = async (action: string, data: unknown) => {
    if (busy) return false;
    setBusy(true);
    try {
      const r = await fetch("/api/campus", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "x-campus-persona": persona,
        },
        body: JSON.stringify({
          action,
          data,
          version: snapRef.current?.version,
        }),
      });
      const d = await readSnapshot(r);
      if (!r.ok) {
        if (r.status === 409) await reload();
        throw new Error(d.error);
      }
      setSnapshot(d);
      toast.success("Modification enregistrée");
      return true;
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Impossible d’enregistrer.");
      return false;
    } finally {
      setBusy(false);
    }
  };
  const go = (p: string) => {
    if (
      !window.dispatchEvent(
        new Event("campus-before-navigate", { cancelable: true }),
      )
    )
      return;
    setPage(p);
    history.replaceState(null, "", `#${p}`);
    setQuery("");
    setFilter("all");
    window.scrollTo({ top: 0 });
  };
  const switchPersona = (p: Persona) => {
    if (busy) return;
    if (
      !window.dispatchEvent(
        new Event("campus-before-navigate", { cancelable: true }),
      )
    )
      return;
    personaRef.current = p;
    setPersona(p);
    setSnapshot(null);
    setPage("dashboard");
    setLesson(null);
    setSession(null);
    setSubmission(null);
    setStage(null);
    setEditor(null);
    reload(p);
  };
  useEffect(() => {
    const ctx = (
      document as Document & {
        modelContext?: {
          registerTool: (
            tool: CampusTool,
            options: { signal: AbortSignal },
          ) => unknown;
        };
      }
    ).modelContext;
    if (!ctx?.registerTool) return;
    const ctl = new AbortController();
    const register = (t: CampusTool) =>
      Promise.resolve(ctx.registerTool(t, { signal: ctl.signal })).catch(
        () => {},
      );
    register({
      name: "campus_overview",
      description:
        "Read the visible LessGooo demonstration campus summary for the current view.",
      inputSchema: {
        type: "object",
        properties: {},
        additionalProperties: false,
      },
      annotations: { readOnlyHint: true, untrustedContentHint: true },
      execute: () => {
        const s = snapRef.current;
        if (!s) throw new Error("Campus unavailable");
        return {
          demo: true,
          view: s.persona,
          students: s.state.students.length,
          lessons: s.state.lessons.length,
          pending: s.state.submissions.filter((x) => x.status === "pending")
            .length,
        };
      },
    });
    register({
      name: "open_campus_section",
      description:
        "Navigate to a LessGooo section. Does not create or modify records.",
      inputSchema: {
        type: "object",
        properties: {
          section: {
            type: "string",
            enum: [
              "dashboard",
              "courses",
              "sessions",
              "projects",
              "help",
              "settings",
            ],
          },
        },
        required: ["section"],
        additionalProperties: false,
      },
      annotations: { readOnlyHint: true },
      execute: (input: Record<string, string>) => {
        if (
          !input ||
          ![
            "dashboard",
            "courses",
            "sessions",
            "projects",
            "help",
            "settings",
          ].includes(input.section)
        )
          throw new Error("Invalid section");
        go(input.section);
        return { opened: input.section };
      },
    });
    return () => ctl.abort();
  }, []);
  const c = snapshot?.state,
    teacher = persona === "teacher",
    user = personas.find((x) => x.value === persona)!,
    studentId = user.student || (persona === "parent" ? "maya" : undefined);
  const date = (value: string, short = false) =>
    new Intl.DateTimeFormat("fr-FR", {
      timeZone: zone,
      ...(short
        ? { day: "numeric", month: "short" }
        : {
            weekday: "short",
            day: "numeric",
            month: "short",
            hour: "2-digit",
            minute: "2-digit",
          }),
    } as Intl.DateTimeFormatOptions).format(new Date(value));
  const hour = (value: string) =>
    new Intl.DateTimeFormat("fr-FR", {
      timeZone: zone,
      hour: "2-digit",
      minute: "2-digit",
    }).format(new Date(value));
  const name = (id: string) =>
    c?.students.find((x) => x.id === id)?.name || "Élève";
  const title = (id: string) =>
    c?.lessons.find((x) => x.id === id)?.title || "Travail";
  const fields = {
    track: {
      key: "track",
      label: "Parcours",
      options: [
        ["devops", "DevOps & Cloud"],
        ["kids", "LessGooo Kids"],
      ],
    },
    start: {
      key: "start",
      label: "Début (date et heure avec fuseau)",
      required: true,
      hint: "Exemple : 2026-10-02T18:00:00+01:00 pour Douala.",
    },
    zoom: {
      key: "zoom",
      label: "Lien participant Zoom",
      type: "url",
      hint: "Laissez vide si la réunion n’est pas encore créée.",
    },
  };
  const openStudent = (s?: Student) =>
    setEditor({
      title: s ? "Modifier le dossier" : "Ajouter un élève de test",
      description: "Version d’essai : utilisez des coordonnées fictives.",
      action: "student",
      values: s || {
        name: "",
        track: "devops",
        email: "",
        parent: "",
        credits: 0,
        active: true,
      },
      fields: [
        { key: "name", label: "Nom", required: true },
        fields.track,
        { key: "email", label: "Email adulte", type: "email" },
        { key: "parent", label: "Parent (obligatoire pour Kids)" },
        {
          key: "credits",
          label: "Crédits one-on-one disponibles",
          type: "number",
          required: true,
        },
      ],
    });
  const openLesson = (l?: Lesson) =>
    setEditor({
      title: l ? "Modifier la leçon" : "Créer une leçon",
      action: "lesson",
      values: l || {
        title: "",
        track: "devops",
        module: "01 · Fondations",
        minutes: 30,
        level: "Débutant",
        explanation: "",
        task: "",
        criteria: "",
        resource: "",
      },
      fields: [
        { key: "title", label: "Titre", required: true },
        fields.track,
        { key: "module", label: "Module", required: true },
        {
          key: "minutes",
          label: "Durée estimée (minutes)",
          type: "number",
          required: true,
        },
        { key: "level", label: "Niveau", required: true },
        {
          key: "explanation",
          label: "Explication simple",
          type: "textarea",
          required: true,
        },
        {
          key: "task",
          label: "Exercice pratique",
          type: "textarea",
          required: true,
        },
        {
          key: "criteria",
          label: "Critères de réussite",
          type: "textarea",
          required: true,
        },
        { key: "resource", label: "Ressource HTTPS", type: "url" },
      ],
    });
  const openSession = (s?: Session) =>
    setEditor({
      title: s ? "Modifier le cours Zoom" : "Planifier un cours Zoom",
      description:
        "Les dates saisies avec un fuseau seront adaptées à chaque affichage.",
      action: "session",
      values: s || {
        title: "",
        track: "devops",
        start: new Date(Date.now() + 86400000).toISOString(),
        duration: 60,
        zoom: "",
        replay: "",
        status: "scheduled",
      },
      fields: [
        { key: "title", label: "Titre", required: true },
        fields.track,
        fields.start,
        {
          key: "duration",
          label: "Durée (minutes)",
          type: "number",
          required: true,
        },
        fields.zoom,
        { key: "replay", label: "Lien du replay autorisé", type: "url" },
        {
          key: "status",
          label: "État",
          options: [
            ["scheduled", "Planifié"],
            ["cancelled", "Annulé"],
          ],
        },
      ],
    });
  const openStage = (s?: Stage) =>
    setEditor({
      title: s ? "Mettre à jour le stage" : "Ouvrir un dossier de stage",
      description:
        "Dossier fictif de suivi de stage. Aucun engagement de placement.",
      action: "stage",
      values: s || {
        student: c?.students.find((s) => s.track === "devops")?.id || "",
        status: "preparation",
        mentor: "",
        start: "",
        end: "",
        notes: "",
      },
      fields: [
        {
          key: "student",
          label: "Élève",
          options:
            c?.students
              .filter((x) => x.track === "devops")
              .map((x) => [x.id, x.name]) || [],
        },
        { key: "status", label: "Étape", options: Object.entries(stageLabels) },
        { key: "mentor", label: "Tuteur" },
        { key: "start", label: "Début", type: "date" },
        { key: "end", label: "Fin", type: "date" },
        {
          key: "notes",
          label: "Objectifs et prochaines étapes",
          type: "textarea",
        },
      ],
    });
  const addHelp = () =>
    setEditor({
      title: "Poser une question",
      action: "help",
      description:
        "La question sera visible par le formateur et le parent dans le parcours Kids.",
      values: { question: "" },
      fields: [
        {
          key: "question",
          label: "Où bloques-tu ?",
          type: "textarea",
          required: true,
        },
      ],
    });
  const addPayment = () =>
    setEditor({
      title: "Enregistrer un paiement de test",
      description:
        "Le registre ne prélève aucun argent. Vérifiez le paiement avant de le confirmer.",
      action: "payment",
      values: {
        student: c?.students[0]?.id || "",
        amount: 150,
        currency: "USD",
        date: new Date().toISOString().slice(0, 10),
        reference: "",
        description: "Formation",
        status: "pending",
      },
      fields: [
        {
          key: "student",
          label: "Élève",
          options: c?.students.map((s) => [s.id, s.name]) || [],
        },
        { key: "amount", label: "Montant", type: "number", required: true },
        {
          key: "currency",
          label: "Devise",
          options: [
            ["USD", "USD"],
            ["CAD", "CAD"],
            ["XAF", "FCFA (XAF)"],
          ],
        },
        { key: "date", label: "Date", type: "date", required: true },
        { key: "reference", label: "Référence unique", required: true },
        { key: "description", label: "Objet", required: true },
        {
          key: "status",
          label: "Vérification",
          options: [
            ["pending", "À vérifier"],
            ["verified", "Vérifié manuellement"],
          ],
        },
      ],
      transform: (v) => ({
        ...v,
        amount: Math.round(Number(v.amount) * (v.currency === "XAF" ? 1 : 100)),
      }),
    });
  const csvExport = () => {
    if (!c) return;
    const cells = (v: unknown) =>
      '"' +
      String(v ?? "")
        .replace(/^[=+@-]/, "'")
        .replaceAll('"', '""') +
      '"';
    const rows = [
      ["Élève", "Montant", "Devise", "Date", "Référence", "Statut"],
      ...c.payments.map((p) => [
        name(p.student),
        p.amount / (p.currency === "XAF" ? 1 : 100),
        p.currency,
        p.date,
        p.reference,
        p.status,
      ]),
    ];
    download(
      "\uFEFF" + rows.map((r) => r.map(cells).join(";")).join("\r\n"),
      "lessgooo-paiements.csv",
      "text/csv;charset=utf-8",
    );
  };
  const attach = async (sub: Submission, file: File) => {
    setBusy(true);
    try {
      await uploadMedia(file, persona, () => {}, sub.id);
      const r = await fetch("/api/campus", {
        headers: { "x-campus-persona": persona },
      });
      const d = await readSnapshot(r);
      if (!r.ok) throw new Error(d.error);
      setSnapshot(d);
      setSubmission(
        d.state.submissions.find((s: Submission) => s.id === sub.id) || null,
      );
      toast.success("Fichier enregistré");
    } catch (e) {
      toast.error((e as Error).message);
    } finally {
      setBusy(false);
    }
  };
  const getFile = async (sub: Submission) => {
    const r = await fetch("/api/files?id=" + sub.file?.id, {
      headers: { "x-campus-persona": persona },
    });
    if (!r.ok) {
      toast.error("Fichier indisponible");
      return;
    }
    download(await r.blob(), sub.file!.name);
  };
  const calendar = (s: Session) => {
    const clean = (v: string) =>
      v.replace(/[\r\n]/g, " ").replace(/[;,]/g, " ");
    const stamp = (d: Date) =>
      d
        .toISOString()
        .replace(/[-:]/g, "")
        .replace(/\.\d{3}/, "");
    download(
      [
        "BEGIN:VCALENDAR",
        "VERSION:2.0",
        "PRODID:-//LessGooo//Campus//FR",
        "BEGIN:VEVENT",
        `UID:${s.id}@lessgooo`,
        `DTSTAMP:${stamp(new Date())}`,
        `DTSTART:${stamp(new Date(s.start))}`,
        `DTEND:${stamp(new Date(Date.parse(s.start) + s.duration * 60000))}`,
        `SUMMARY:${clean(s.title)}`,
        `DESCRIPTION:Cours LessGooo sur Zoom ${s.zoom}`,
        `STATUS:${s.status === "cancelled" ? "CANCELLED" : "CONFIRMED"}`,
        "END:VEVENT",
        "END:VCALENDAR",
      ].join("\r\n"),
      "lessgooo-cours.ics",
      "text/calendar",
    );
  };
  const upcoming =
    c?.sessions
      .filter(
        (s) =>
          s.status === "scheduled" &&
          Date.parse(s.start) + s.duration * 60000 > Date.now(),
      )
      .sort((a, b) => a.start.localeCompare(b.start)) || [];
  const pending = c?.submissions.filter((s) => s.status === "pending") || [];
  const visibleLessons =
    c?.lessons.filter(
      (l) =>
        (filter === "all" || l.track === filter) &&
        (l.title + " " + l.module).toLowerCase().includes(query.toLowerCase()),
    ) || [];
  const sectionTitle = navItems.find((n) => n[0] === page)?.[1] || "Campus";
  const actionButton =
    page === "courses" && teacher ? (
      <Button onClick={() => openLesson()}>
        <Plus />
        Créer une leçon
      </Button>
    ) : page === "sessions" && teacher ? (
      <Button onClick={() => openSession()}>
        <Plus />
        Planifier un cours
      </Button>
    ) : page === "students" && teacher ? (
      <Button onClick={() => openStudent()}>
        <Plus />
        Ajouter un élève
      </Button>
    ) : page === "payments" && teacher ? (
      <Button onClick={addPayment}>
        <Plus />
        Enregistrer un paiement
      </Button>
    ) : page === "stages" && teacher ? (
      <Button onClick={() => openStage()}>
        <Plus />
        Nouveau dossier
      </Button>
    ) : page === "coaching" && teacher ? (
      <Button
        onClick={() =>
          setEditor({
            title: "Publier un créneau one-on-one",
            action: "slot",
            values: {
              start: new Date(Date.now() + 86400000).toISOString(),
              duration: 50,
              zoom: "",
            },
            fields: [
              fields.start,
              {
                key: "duration",
                label: "Durée (minutes)",
                type: "number",
                required: true,
              },
              fields.zoom,
            ],
          })
        }
      >
        <Plus />
        Ajouter un créneau
      </Button>
    ) : page === "help" && !teacher ? (
      <Button onClick={addHelp}>
        <Plus />
        Poser une question
      </Button>
    ) : null;
  return (
    <SidebarProvider
      style={{ "--sidebar-width": "254px" } as React.CSSProperties}
    >
      <a className="skip-link" href="#campus-main">
        Aller au contenu
      </a>
      <Toaster richColors position="bottom-right" />
      <Sidebar className="campus-sidebar">
        <SidebarHeader className="brand">
          <BrandLogo />
          <span>CAMPUS · APPRENDRE & PRATIQUER</span>
        </SidebarHeader>
        <SidebarContent className="side-content">
          <div className="workspace-label">MON ESPACE</div>
          <SideNav page={page} go={go} persona={persona} />
          <div className="side-note">
            <Cloud size={23} />
            <strong>Le savoir ouvre des portes.</strong>
            <p>
              Un cours. Un projet.
              <br />
              Une compétence de plus.
            </p>
          </div>
        </SidebarContent>
        <SidebarFooter className="side-footer">
          <div className="avatar">{user.name.slice(0, 1)}</div>
          <div>
            <strong>{user.name}</strong>
            <small>{user.label} · Démonstration</small>
          </div>
        </SidebarFooter>
      </Sidebar>
      <SidebarInset>
        <header className="topbar">
          <div className="breadcrumb">
            <SidebarTrigger aria-label="Ouvrir le menu" />
            <span>Campus</span>
            <ChevronRight size={14} />
            <strong>{sectionTitle}</strong>
          </div>
          <BrandLogo className="top-logo" />
          <div className="top-controls">
            <Choice
              value={zone}
              onChange={(v) => {
                setZone(v);
                localStorage.setItem("lessgooo-timezone", v);
              }}
              options={zones}
              label="Fuseau horaire"
            />
            <HelpTip label="Aide : fuseau horaire">
              Ce réglage change l’affichage des horaires, sans déplacer les
              séances enregistrées.
            </HelpTip>
            <div className="top-avatar">{user.name[0]}</div>
          </div>
        </header>
        <div className="demo-bar">
          <div>
            <span className="demo-pill">DÉMO LOCALE</span>
            <span>Données fictives · Sauvegarde sur cet ordinateur</span>
          </div>
          <Choice
            value={persona}
            onChange={(v) => switchPersona(v as Persona)}
            options={personas.map((p) => [p.value, "Vue " + p.label])}
            label="Choisir une vue de test"
          />
          <HelpTip label="Aide : vues de démonstration">
            Teste le parcours du formateur, de l’adulte, du parent ou de
            l’enfant. Ces vues locales ne remplacent pas une connexion
            individuelle sécurisée.
          </HelpTip>
        </div>
        <main id="campus-main" className="content">
          <div className="page-head">
            <div>
              <div className="eyebrow">LESSGOOO ACADEMY</div>
              <h1>
                {page === "dashboard" ? `Bonjour ${user.name}` : sectionTitle}
                {page === "dashboard" && (
                  <span className="greeting-dot">.</span>
                )}
              </h1>
              <p>
                {page === "dashboard"
                  ? teacher
                    ? "Une vue claire sur les cours, les élèves et leurs prochaines étapes."
                    : persona === "parent"
                      ? "Les petits progrès de Maya font les grandes réussites."
                      : "Prêt à apprendre quelque chose et à le mettre en pratique ?"
                  : (
                      {
                        courses:
                          "Comprendre d’abord. Pratiquer ensuite. Expliquer pour maîtriser.",
                        sessions:
                          "Tous vos cours en direct sur Zoom, à votre heure locale.",
                        projects:
                          "Des réalisations concrètes et des retours pour avancer.",
                        students:
                          "Chaque élève, son parcours et sa progression.",
                        coaching:
                          "Un objectif précis. Une séance rien que pour vous.",
                        stages:
                          "De la préparation au bilan : suivez vos dossiers de démonstration.",
                        payments:
                          "Un registre clair, avec une vérification humaine.",
                        help: "Un blocage ? La discussion continue entre les cours.",
                        settings:
                          "Les repères pour tester et prendre en main votre campus.",
                        explore:
                          "Des défis concrets, des dépôts de référence et des vidéos pour passer à l’action.",
                        notebook:
                          "Un endroit pour tes idées, tes notes de cours et tes présentations.",
                        library:
                          "Tes vidéos, fichiers et ressources, réunis au même endroit.",
                        career:
                          "Transforme tes projets en réponses convaincantes et organise tes candidatures.",
                        integrations:
                          "Relie les devoirs à Google Drive et prépare les règlements en ligne.",
                      } as Record<string, string>
                    )[page]}
              </p>
            </div>
            {actionButton}
          </div>
          {error ? (
            <div className="error-box">
              <h2>Le campus n’a pas pu être chargé</h2>
              <p>{error}</p>
              <Button onClick={() => reload()}>Réessayer</Button>
              <a href={`${import.meta.env.BASE_URL}index.html`}>
                Ouvrir le site public
              </a>
            </div>
          ) : loading && !c ? (
            <div className="loading-grid">
              {[1, 2, 3, 4].map((n) => (
                <Skeleton className="h-36 rounded-xl" key={n} />
              ))}
            </div>
          ) : (
            c && (
              <>
                {page === "dashboard" && (
                  <>
                    <Launchpad c={c} go={go} />
                    <HomeworkMap c={c} openLesson={setLesson} />
                    <div className="stats-grid">
                      {[
                        [
                          teacher ? "Élèves accompagnés" : "Leçons du parcours",
                          teacher ? c.students.length : c.lessons.length,
                          Users,
                          "blue",
                          teacher ? "Adultes & enfants" : "À votre rythme",
                        ],
                        [
                          "Cours à venir",
                          upcoming.length,
                          CalendarDays,
                          "orange",
                          "100 % sur Zoom",
                        ],
                        [
                          teacher
                            ? "Travaux à corriger"
                            : "Compétences validées",
                          teacher
                            ? pending.length
                            : c.submissions.filter(
                                (x) => x.status === "validated",
                              ).length,
                          FolderCheck,
                          "green",
                          teacher
                            ? "Votre retour fait avancer"
                            : "Validées par le formateur",
                        ],
                        [
                          teacher
                            ? "Dossiers de stage"
                            : persona === "parent" || persona === "child"
                              ? "Projets remis"
                              : "Crédits coaching",
                          teacher
                            ? c.stages.length
                            : persona === "parent" || persona === "child"
                              ? c.submissions.length
                              : c.students[0]?.credits || 0,
                          teacher ? BriefcaseBusiness : GraduationCap,
                          "purple",
                          teacher
                            ? "Dossiers fictifs"
                            : "Une étape après l’autre",
                        ],
                      ].map((row) => {
                        const [label, value, Icon, tone, note] = row as [
                          string,
                          number,
                          typeof Users,
                          string,
                          string,
                        ];
                        return (
                          <div className="stat" key={label}>
                            <div>
                              <span>{label}</span>
                              <strong>{value}</strong>
                              <small>{note}</small>
                            </div>
                            <span className={`stat-icon ${tone}`}>
                              <Icon size={21} />
                            </span>
                          </div>
                        );
                      })}
                    </div>
                    <div className="dashboard-grid">
                      <section>
                        <div className="next-class">
                          <div className="next-top">
                            <span className="light-tag">
                              <Video size={15} />
                              PROCHAIN RENDEZ-VOUS
                            </span>
                            <span>ZOOM</span>
                          </div>
                          {upcoming[0] ? (
                            <>
                              <h2>{upcoming[0].title}</h2>
                              <p>
                                <CalendarDays size={16} />
                                {date(upcoming[0].start)}
                                <span>·</span>
                                {upcoming[0].duration} min
                              </p>
                              <div className="next-bottom">
                                <span>
                                  {trackLabel(upcoming[0].track)}{" "}
                                  <span className="dot-sep">/</span> Avec Eddy
                                </span>
                                <Button
                                  variant="secondary"
                                  onClick={() => setSession(upcoming[0])}
                                >
                                  Voir la séance <ArrowUpRight size={17} />
                                </Button>
                              </div>
                            </>
                          ) : (
                            <>
                              <h2>Votre prochain cours se prépare.</h2>
                              <p>Les séances planifiées apparaîtront ici.</p>
                            </>
                          )}
                        </div>
                        <div className="section-heading">
                          <h2>
                            {teacher
                              ? "À vous de jouer"
                              : "Continuer mon parcours"}
                          </h2>
                          <button
                            onClick={() => go(teacher ? "projects" : "courses")}
                          >
                            Tout voir <ArrowRight size={16} />
                          </button>
                        </div>
                        <div className="panel action-panel">
                          {teacher ? (
                            pending.length ? (
                              pending.slice(0, 3).map((s) => (
                                <button
                                  className="action-row"
                                  key={s.id}
                                  onClick={() => setSubmission(s)}
                                >
                                  <span className="tile-icon orange">
                                    <FileText />
                                  </span>
                                  <span>
                                    <strong>{title(s.lesson)}</strong>
                                    <small>
                                      {name(s.student)} · Travail à corriger
                                    </small>
                                  </span>
                                  <ChevronRight size={18} />
                                </button>
                              ))
                            ) : (
                              <Empty title="Les corrections sont à jour" />
                            )
                          ) : (
                            c.lessons
                              .filter(
                                (l) =>
                                  !c.submissions.some(
                                    (s) =>
                                      s.lesson === l.id &&
                                      s.status === "validated",
                                  ),
                              )
                              .slice(0, 3)
                              .map((l) => (
                                <button
                                  className="action-row"
                                  key={l.id}
                                  onClick={() => setLesson(l)}
                                >
                                  <span
                                    className={`tile-icon ${l.track === "kids" ? "orange" : "blue"}`}
                                  >
                                    {l.track === "kids" ? (
                                      <Blocks />
                                    ) : (
                                      <Terminal />
                                    )}
                                  </span>
                                  <span>
                                    <strong>{l.title}</strong>
                                    <small>
                                      {l.module} · {l.minutes} min
                                    </small>
                                  </span>
                                  <ChevronRight size={18} />
                                </button>
                              ))
                          )}
                        </div>
                        <div className="section-heading">
                          <h2>
                            {teacher
                              ? "Des parcours, des progrès"
                              : "Ma progression"}
                          </h2>
                          <button
                            onClick={() =>
                              go(teacher ? "students" : "projects")
                            }
                          >
                            Voir le suivi <ArrowRight size={16} />
                          </button>
                        </div>
                        <div className="panel progress-panel">
                          {c.students.slice(0, teacher ? 4 : 2).map((s) => {
                            const p = progress(c, s.id);
                            return (
                              <div className="student-progress" key={s.id}>
                                <div
                                  className={`avatar ${s.track === "kids" ? "orange" : "blue"}`}
                                >
                                  {s.name
                                    .split(" ")
                                    .map((x) => x[0])
                                    .join("")}
                                </div>
                                <div className="progress-info">
                                  <div>
                                    <strong>{s.name}</strong>
                                    <span>
                                      {p.done}/{p.total} compétences
                                    </span>
                                  </div>
                                  <Progress value={p.percent} />
                                </div>
                                <span className="percent">{p.percent}%</span>
                              </div>
                            );
                          })}
                        </div>
                      </section>
                      <aside className="right-column">
                        <div className="section-heading">
                          <h2>À l’agenda</h2>
                          <button
                            aria-label="Voir tous les cours"
                            onClick={() => go("sessions")}
                          >
                            <ArrowUpRight size={20} />
                          </button>
                        </div>
                        <div className="panel agenda">
                          {upcoming.slice(0, 3).map((s) => (
                            <button
                              className="agenda-item"
                              key={s.id}
                              onClick={() => setSession(s)}
                            >
                              <div className="date-block">
                                <strong>
                                  {new Intl.DateTimeFormat("fr", {
                                    day: "numeric",
                                    timeZone: zone,
                                  }).format(new Date(s.start))}
                                </strong>
                                <span>
                                  {new Intl.DateTimeFormat("fr", {
                                    month: "short",
                                    timeZone: zone,
                                  }).format(new Date(s.start))}
                                </span>
                              </div>
                              <div>
                                <small>
                                  {hour(s.start)} · {s.duration} min
                                </small>
                                <strong>{s.title}</strong>
                                <Badge
                                  tone={s.track === "kids" ? "orange" : "blue"}
                                >
                                  {trackLabel(s.track)}
                                </Badge>
                              </div>
                            </button>
                          ))}
                          {!upcoming.length && <p>Aucune séance planifiée.</p>}
                        </div>
                        <div className="partner-card">
                          <span className="tile-icon blue">
                            <BriefcaseBusiness />
                          </span>
                          <div className="eyebrow">
                            L’APPRENTISSAGE CONTINUE
                          </div>
                          <h2>
                            La pratique ouvre
                            <br />
                            de nouvelles perspectives.
                          </h2>
                          <p>
                            Organisez les objectifs, les réalisations et les
                            prochaines étapes.
                          </p>
                          {!["parent", "child"].includes(persona) && (
                            <button onClick={() => go("stages")}>
                              Voir les dossiers <ArrowUpRight size={18} />
                            </button>
                          )}
                          <div className="partner-names">
                            <BrandLogo className="partner-logo" />
                            <span>Comprendre. Pratiquer. Progresser.</span>
                          </div>
                        </div>
                        <div className="learning-partner">
                          <GraduationCap size={25} />
                          <div>
                            <strong>DevOps Easy Learning</strong>
                            <small>Partenaire de LessGooo</small>
                          </div>
                        </div>
                      </aside>
                    </div>
                  </>
                )}
                {page === "courses" && (
                  <>
                    <div className="toolbar">
                      <Tabs value={filter} onValueChange={setFilter}>
                        <TabsList>
                          <TabsTrigger value="all">
                            Tous les parcours
                          </TabsTrigger>
                          {teacher && (
                            <>
                              <TabsTrigger value="devops">
                                DevOps & Cloud
                              </TabsTrigger>
                              <TabsTrigger value="kids">Kids</TabsTrigger>
                            </>
                          )}
                        </TabsList>
                      </Tabs>
                      <label className="search">
                        <Search size={17} />
                        <Input
                          aria-label="Rechercher une leçon"
                          placeholder="Rechercher une leçon"
                          value={query}
                          onChange={(e) => setQuery(e.target.value)}
                        />
                      </label>
                    </div>
                    <div className="course-grid">
                      {visibleLessons.map((l) => {
                        const validated = c.submissions.some(
                          (s) =>
                            s.lesson === l.id &&
                            s.student === studentId &&
                            s.status === "validated",
                        );
                        return (
                          <article
                            className={`course-card ${l.track}`}
                            key={l.id}
                          >
                            <div className="course-top">
                              <span
                                className={`tile-icon ${l.track === "kids" ? "orange" : "blue"}`}
                              >
                                {l.track === "kids" ? <Blocks /> : <Terminal />}
                              </span>
                              <Badge
                                tone={l.track === "kids" ? "orange" : "blue"}
                              >
                                {trackLabel(l.track)}
                              </Badge>
                            </div>
                            <div className="eyebrow">{l.module}</div>
                            <h2>{l.title}</h2>
                            <p>{l.explanation.split("\n")[0]}</p>
                            <div className="course-meta">
                              <span>
                                <Clock size={14} />
                                {l.minutes} min
                              </span>
                              <span>{l.level}</span>
                              {validated && (
                                <span className="success">
                                  <Check size={14} />
                                  Validé
                                </span>
                              )}
                            </div>
                            <div className="course-actions">
                              <Button
                                variant="outline"
                                onClick={() => setLesson(l)}
                              >
                                Ouvrir la leçon <ArrowRight size={16} />
                              </Button>
                              {teacher && (
                                <button onClick={() => openLesson(l)}>
                                  Modifier
                                </button>
                              )}
                            </div>
                          </article>
                        );
                      })}
                    </div>
                    {!visibleLessons.length && (
                      <Empty title="Aucune leçon trouvée">
                        Essayez un autre mot ou créez une leçon.
                      </Empty>
                    )}
                  </>
                )}
                {page === "sessions" && (
                  <>
                    <div className="info-line">
                      <Globe size={17} />
                      Horaires affichés pour{" "}
                      {zones.find((z) => z[0] === zone)?.[1]}. Le passage à
                      l’heure d’été est pris en compte.
                    </div>
                    <div className="session-list">
                      {[...c.sessions]
                        .sort((a, b) => b.start.localeCompare(a.start))
                        .map((s) => (
                          <div className="session-card" key={s.id}>
                            <div
                              className={`session-icon ${s.track === "kids" ? "orange" : "blue"}`}
                            >
                              <Video />
                            </div>
                            <div className="session-copy">
                              <div className="inline-badges">
                                <Badge
                                  tone={s.track === "kids" ? "orange" : "blue"}
                                >
                                  {trackLabel(s.track)}
                                </Badge>
                                <Badge
                                  tone={
                                    s.status === "cancelled"
                                      ? "red"
                                      : Date.parse(s.start) < Date.now()
                                        ? "neutral"
                                        : "green"
                                  }
                                >
                                  {s.status === "cancelled"
                                    ? "Annulé"
                                    : Date.parse(s.start) < Date.now()
                                      ? "Séance passée"
                                      : "À venir"}
                                </Badge>
                              </div>
                              <h2>{s.title}</h2>
                              <p>
                                {date(s.start)} · {s.duration} min
                              </p>
                            </div>
                            <div className="row-actions">
                              <Button
                                variant="outline"
                                onClick={() => setSession(s)}
                              >
                                Ouvrir
                              </Button>
                              {teacher && (
                                <Button
                                  variant="ghost"
                                  onClick={() => openSession(s)}
                                >
                                  Modifier
                                </Button>
                              )}
                            </div>
                          </div>
                        ))}
                    </div>
                  </>
                )}
                {page === "projects" && (
                  <>
                    <div className="toolbar">
                      <Tabs value={filter} onValueChange={setFilter}>
                        <TabsList>
                          {[
                            ["all", "Tous"],
                            ["pending", "À corriger"],
                            ["validated", "Validés"],
                            ["revise", "À retravailler"],
                          ].map(([v, l]) => (
                            <TabsTrigger key={v} value={v}>
                              {l}
                            </TabsTrigger>
                          ))}
                        </TabsList>
                      </Tabs>
                    </div>
                    <div className="panel">
                      <Table>
                        <TableHeader>
                          <TableRow>
                            <TableHead>Travail remis</TableHead>
                            {teacher && <TableHead>Élève</TableHead>}
                            <TableHead>État</TableHead>
                            <TableHead>Date</TableHead>
                            <TableHead />
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {c.submissions
                            .filter(
                              (s) => filter === "all" || s.status === filter,
                            )
                            .map((s) => (
                              <TableRow key={s.id}>
                                <TableCell>
                                  <strong>{title(s.lesson)}</strong>
                                  {s.file && (
                                    <small>
                                      <Paperclip size={12} />
                                      {s.file.name}
                                    </small>
                                  )}
                                </TableCell>
                                {teacher && (
                                  <TableCell>{name(s.student)}</TableCell>
                                )}
                                <TableCell>
                                  <Badge
                                    tone={
                                      s.status === "validated"
                                        ? "green"
                                        : s.status === "revise"
                                          ? "red"
                                          : "orange"
                                    }
                                  >
                                    {s.status === "pending"
                                      ? "À corriger"
                                      : statusText[s.status]}
                                  </Badge>
                                </TableCell>
                                <TableCell>{date(s.created, true)}</TableCell>
                                <TableCell>
                                  <Button
                                    variant="ghost"
                                    onClick={() => setSubmission(s)}
                                  >
                                    {teacher ? "Examiner" : "Voir le retour"}
                                    <ChevronRight size={16} />
                                  </Button>
                                </TableCell>
                              </TableRow>
                            ))}
                        </TableBody>
                      </Table>
                      {!c.submissions.filter(
                        (s) => filter === "all" || s.status === filter,
                      ).length && (
                        <Empty title="Aucun travail dans cette catégorie">
                          Les travaux remis depuis une leçon apparaîtront ici.
                        </Empty>
                      )}
                    </div>
                  </>
                )}
                {page === "students" && teacher && (
                  <div className="panel">
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Élève</TableHead>
                          <TableHead>Parcours</TableHead>
                          <TableHead>Progression</TableHead>
                          <TableHead>Contact</TableHead>
                          <TableHead />
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {c.students.map((s) => {
                          const p = progress(c, s.id);
                          return (
                            <TableRow key={s.id}>
                              <TableCell>
                                <div className="person-cell">
                                  <span
                                    className={`avatar ${s.track === "kids" ? "orange" : "blue"}`}
                                  >
                                    {s.name[0]}
                                  </span>
                                  <strong>{s.name}</strong>
                                </div>
                              </TableCell>
                              <TableCell>
                                <Badge
                                  tone={s.track === "kids" ? "orange" : "blue"}
                                >
                                  {trackLabel(s.track)}
                                </Badge>
                              </TableCell>
                              <TableCell>
                                <div className="table-progress">
                                  <Progress value={p.percent} />
                                  <span>
                                    {p.done}/{p.total}
                                  </span>
                                </div>
                              </TableCell>
                              <TableCell>
                                {s.parent || s.email || "—"}
                              </TableCell>
                              <TableCell>
                                <Button
                                  variant="ghost"
                                  onClick={() => openStudent(s)}
                                >
                                  Modifier
                                </Button>
                              </TableCell>
                            </TableRow>
                          );
                        })}
                      </TableBody>
                    </Table>
                  </div>
                )}
                {page === "coaching" && (
                  <>
                    <div className="info-line">
                      <MessagesSquare size={18} />
                      {teacher
                        ? "Un créneau réservé consomme un crédit ; son annulation avant la séance le restitue."
                        : `Vous disposez de ${c.students[0]?.credits || 0} crédit(s). Une réservation utilise un crédit.`}
                    </div>
                    <div className="course-grid">
                      {[...c.slots]
                        .sort((a, b) => a.start.localeCompare(b.start))
                        .map((s) => (
                          <article className="panel slot-card" key={s.id}>
                            <div className="inline-badges">
                              <Badge
                                tone={s.status === "open" ? "green" : "blue"}
                              >
                                {statusText[s.status]}
                              </Badge>
                              <span>{s.duration} minutes</span>
                            </div>
                            <h2>{date(s.start)}</h2>
                            <p>
                              {s.student
                                ? name(s.student)
                                : "Séance individuelle avec Eddy"}
                            </p>
                            {s.goal && <blockquote>{s.goal}</blockquote>}
                            {s.status === "open" ? (
                              <Button
                                onClick={() =>
                                  setEditor({
                                    title: "Réserver cette séance",
                                    description: date(s.start),
                                    action: "book",
                                    values: {
                                      id: s.id,
                                      goal: "",
                                      student:
                                        studentId ||
                                        c.students.find(
                                          (x) => x.track === "devops",
                                        )?.id ||
                                        "",
                                    },
                                    fields: [
                                      ...(teacher
                                        ? [
                                            {
                                              key: "student",
                                              label: "Élève",
                                              options: c.students
                                                .filter(
                                                  (x) => x.track === "devops",
                                                )
                                                .map((x) => [x.id, x.name]),
                                            },
                                          ]
                                        : []),
                                      {
                                        key: "goal",
                                        label: "Objectif de la séance",
                                        type: "textarea",
                                        required: true,
                                      },
                                    ],
                                  })
                                }
                              >
                                Réserver <ArrowRight size={16} />
                              </Button>
                            ) : s.status === "booked" ? (
                              <div className="slot-actions">
                                {s.zoom ? (
                                  <a
                                    className="button-link"
                                    href={s.zoom}
                                    target="_blank"
                                    rel="noreferrer"
                                  >
                                    Rejoindre Zoom
                                  </a>
                                ) : (
                                  <small>
                                    Lien Zoom à renseigner par le formateur.
                                  </small>
                                )}
                                <Button
                                  variant="outline"
                                  disabled={busy}
                                  onClick={() =>
                                    setEditor({
                                      title: "Annuler la réservation",
                                      description:
                                        "Le crédit sera restitué à l’élève. Le créneau redeviendra disponible.",
                                      action: "cancel",
                                      values: { id: s.id },
                                      fields: [],
                                    })
                                  }
                                >
                                  Annuler la réservation
                                </Button>
                                {teacher && (
                                  <Button
                                    variant="ghost"
                                    disabled={busy}
                                    onClick={() =>
                                      act("complete", { id: s.id })
                                    }
                                  >
                                    Marquer terminée
                                  </Button>
                                )}
                              </div>
                            ) : (
                              <Badge tone="green">Séance effectuée</Badge>
                            )}
                            {teacher && s.status !== "completed" && (
                              <Button
                                variant="ghost"
                                onClick={() =>
                                  setEditor({
                                    title: "Modifier le créneau",
                                    action: "slot",
                                    values: s,
                                    fields: [
                                      fields.start,
                                      {
                                        key: "duration",
                                        label: "Durée (minutes)",
                                        type: "number",
                                        required: true,
                                      },
                                      fields.zoom,
                                    ],
                                  })
                                }
                              >
                                Modifier le créneau / Zoom
                              </Button>
                            )}
                          </article>
                        ))}
                    </div>
                  </>
                )}
                {page === "stages" && (
                  <>
                    <div className="stage-intro">
                      <div>
                        <span className="eyebrow">
                          LESSGOOO · SUIVI PÉDAGOGIQUE
                        </span>
                        <h2>Du projet aux compétences.</h2>
                        <p>
                          Chaque dossier relie les acquis de formation, les
                          objectifs et le suivi du stage.
                        </p>
                      </div>
                      <BriefcaseBusiness size={48} />
                    </div>
                    <div className="stage-grid">
                      {Object.entries(stageLabels).map(([key, label]) => (
                        <section className="stage-column" key={key}>
                          <h3>
                            {label}
                            <span>
                              {c.stages.filter((s) => s.status === key).length}
                            </span>
                          </h3>
                          {c.stages
                            .filter((s) => s.status === key)
                            .map((s) => (
                              <button
                                className="stage-card"
                                key={s.id}
                                onClick={() => setStage(s)}
                              >
                                <span className="avatar blue">
                                  {name(s.student)[0]}
                                </span>
                                <strong>{name(s.student)}</strong>
                                <small>Dossier de démonstration</small>
                                <p>{s.notes || "Objectifs à compléter"}</p>
                                <span className="stage-open">
                                  Ouvrir le dossier <ArrowUpRight size={16} />
                                </span>
                              </button>
                            ))}
                          {!c.stages.filter((s) => s.status === key).length && (
                            <div className="stage-empty">Aucun dossier</div>
                          )}
                        </section>
                      ))}
                    </div>
                    <p className="footnote">
                      Les dossiers de démonstration ne correspondent à aucune
                      affectation réelle dans une entreprise.
                    </p>
                  </>
                )}
                {page === "payments" && (
                  <>
                    <div className="payment-summary">
                      {["USD", "CAD", "XAF"].map((currency) => (
                        <div className="panel" key={currency}>
                          <small>Total vérifié · {currency}</small>
                          <strong>
                            {money(
                              c.payments
                                .filter(
                                  (p) =>
                                    p.currency === currency &&
                                    p.status === "verified",
                                )
                                .reduce((a, p) => a + p.amount, 0),
                              currency,
                            )}
                          </strong>
                        </div>
                      ))}
                    </div>
                    <div className="section-heading">
                      <p>Registre manuel · Aucun prélèvement bancaire</p>
                      <Button variant="outline" onClick={csvExport}>
                        <Download size={16} />
                        Exporter CSV
                      </Button>
                    </div>
                    <div className="panel">
                      <Table>
                        <TableHeader>
                          <TableRow>
                            <TableHead>Élève / Objet</TableHead>
                            <TableHead>Montant</TableHead>
                            <TableHead>Référence</TableHead>
                            <TableHead>Statut</TableHead>
                            <TableHead />
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {c.payments.map((p) => (
                            <TableRow key={p.id}>
                              <TableCell>
                                <strong>{name(p.student)}</strong>
                                <small>{p.description}</small>
                              </TableCell>
                              <TableCell>
                                {money(p.amount, p.currency)}
                              </TableCell>
                              <TableCell>
                                {p.reference}
                                <small>{p.date}</small>
                              </TableCell>
                              <TableCell>
                                <Badge
                                  tone={
                                    p.status === "verified"
                                      ? "green"
                                      : p.status === "refunded"
                                        ? "red"
                                        : "orange"
                                  }
                                >
                                  {statusText[p.status]}
                                </Badge>
                              </TableCell>
                              <TableCell>
                                <div className="row-actions">
                                  {teacher && p.status === "pending" && (
                                    <Button
                                      variant="outline"
                                      onClick={() =>
                                        setEditor({
                                          title: "Confirmer le paiement",
                                          description: `Confirmez uniquement après vérification de ${p.reference}. Aucun encaissement n’est effectué par ce bouton.`,
                                          action: "paymentStatus",
                                          values: {
                                            id: p.id,
                                            status: "verified",
                                          },
                                          fields: [],
                                        })
                                      }
                                    >
                                      Vérifier
                                    </Button>
                                  )}
                                  {teacher && p.status === "verified" && (
                                    <Button
                                      variant="ghost"
                                      onClick={() =>
                                        setEditor({
                                          title: "Enregistrer un remboursement",
                                          description:
                                            "Marque un remboursement réalisé en dehors de l’application ; aucun transfert d’argent ne sera effectué.",
                                          action: "paymentStatus",
                                          values: {
                                            id: p.id,
                                            status: "refunded",
                                          },
                                          fields: [],
                                        })
                                      }
                                    >
                                      Remboursé
                                    </Button>
                                  )}
                                  {p.status === "verified" && (
                                    <Button
                                      variant="ghost"
                                      onClick={() =>
                                        download(
                                          `LESSGOOO ACADEMY — REÇU DE DÉMONSTRATION\nSans valeur de justificatif de paiement réel\n\nÉlève : ${name(p.student)}\nObjet : ${p.description}\nMontant : ${money(p.amount, p.currency)}\nDate : ${p.date}\nRéférence : ${p.reference}\nVérifié manuellement dans le registre.\n`,
                                          "recu-" +
                                            p.reference.replace(
                                              /[^a-z0-9-]/gi,
                                              "_",
                                            ) +
                                            ".txt",
                                          "text/plain;charset=utf-8",
                                        )
                                      }
                                    >
                                      <Download size={16} />
                                      Reçu
                                    </Button>
                                  )}
                                </div>
                              </TableCell>
                            </TableRow>
                          ))}
                        </TableBody>
                      </Table>
                    </div>
                  </>
                )}
                {page === "help" && (
                  <div className="help-list">
                    {c.help.map((h) => (
                      <article className="panel help-card" key={h.id}>
                        <div className="section-heading">
                          <span className="person-cell">
                            <span className="avatar blue">
                              {name(h.student)[0]}
                            </span>
                            <strong>{name(h.student)}</strong>
                          </span>
                          <Badge tone={h.answer ? "green" : "orange"}>
                            {h.answer ? "Réponse disponible" : "En attente"}
                          </Badge>
                        </div>
                        <h2>{h.question}</h2>
                        {h.answer && (
                          <div className="answer">
                            <strong>Réponse du formateur</strong>
                            <p>{h.answer}</p>
                          </div>
                        )}
                        {teacher && (
                          <Button
                            variant="outline"
                            onClick={() =>
                              setEditor({
                                title: "Répondre à la question",
                                description: h.question,
                                action: "answer",
                                values: { id: h.id, answer: h.answer },
                                fields: [
                                  {
                                    key: "answer",
                                    label: "Votre réponse",
                                    type: "textarea",
                                    required: true,
                                  },
                                ],
                              })
                            }
                          >
                            {h.answer ? "Modifier la réponse" : "Répondre"}
                          </Button>
                        )}
                      </article>
                    ))}
                    {!c.help.length && (
                      <Empty title="Aucune question pour le moment">
                        Le formateur répondra ici à vos questions.
                      </Empty>
                    )}
                  </div>
                )}
                {[
                  "explore",
                  "notebook",
                  "library",
                  "career",
                  "integrations",
                ].includes(page) && (
                  <WorkspacePanel
                    key={`${persona}-${page}`}
                    page={page}
                    persona={persona}
                    c={c}
                  />
                )}
                {page === "settings" && (
                  <div className="settings-grid">
                    <section className="panel settings-card">
                      <span className="tile-icon blue">
                        <LifeBuoy />
                      </span>
                      <h2>
                        Notre premier test, ensemble{" "}
                        <HelpTip>
                          Le changement de vue sert à tester les parcours de
                          démonstration. Il ne connecte pas de vrais comptes
                          élèves.
                        </HelpTip>
                      </h2>
                      <Button
                        variant="outline"
                        onClick={() => go("integrations")}
                      >
                        Configurer Drive et Notch Pay
                      </Button>
                      <ol className="steps">
                        <li>
                          <strong>Remettre un travail</strong>
                          <p>
                            Passez en vue Élève DevOps, ouvrez une leçon et
                            envoyez une réponse.
                          </p>
                        </li>
                        <li>
                          <strong>Faire une correction</strong>
                          <p>
                            Revenez en vue Formateur, ouvrez Travaux &
                            corrections, puis validez ou demandez une
                            amélioration.
                          </p>
                        </li>
                        <li>
                          <strong>Vérifier la progression</strong>
                          <p>
                            Revenez dans la vue élève et actualisez : le retour
                            et la progression restent enregistrés.
                          </p>
                        </li>
                        <li>
                          <strong>Tester une réservation</strong>
                          <p>
                            Réservez un one-on-one depuis la vue adulte, puis
                            annulez-le pour retrouver votre crédit.
                          </p>
                        </li>
                        <li>
                          <strong>Voir le suivi parental</strong>
                          <p>
                            Ouvrez la vue Parent pour consulter les travaux, les
                            cours et les paiements de Maya.
                          </p>
                        </li>
                      </ol>
                    </section>
                    <section>
                      <div className="panel settings-card">
                        <ShieldCheck size={26} />
                        <h2>Votre espace de démonstration</h2>
                        <p>
                          Cette version locale sert à tester avec des profils
                          fictifs. Le changement de vue simule les rôles dans
                          votre espace d’essai. Il ne crée pas des comptes
                          élèves indépendants.
                        </p>
                        <p>
                          Les modifications et pièces jointes sont sauvegardées
                          sur cet ordinateur. L’export contient les dossiers
                          visibles et les noms des pièces jointes ; les fichiers
                          joints se téléchargent séparément.
                        </p>
                        <Button
                          variant="outline"
                          onClick={() =>
                            download(
                              JSON.stringify(
                                {
                                  exported: new Date().toISOString(),
                                  ...snapshot,
                                },
                                null,
                                2,
                              ),
                              "lessgooo-campus-export.json",
                            )
                          }
                        >
                          <Download size={16} />
                          Exporter mes données de test
                        </Button>
                      </div>
                      <div className="panel settings-card">
                        <h2>Avant les vrais élèves</h2>
                        <ul className="checklist">
                          <li>
                            Configurer l’accès individuel des élèves, parents et
                            tuteurs.
                          </li>
                          <li>Ajouter vos liens Zoom et replays autorisés.</li>
                          <li>
                            Valider les tarifs, horaires et conditions des
                            stages.
                          </li>
                          <li>
                            Configurer les emails et le prestataire de paiement
                            si souhaité.
                          </li>
                          <li>
                            Valider le parcours parental et la restauration des
                            sauvegardes.
                          </li>
                        </ul>
                        <p className="footnote">
                          Aucun email n’est envoyé et aucun compte AWS n’est
                          créé depuis cette version.
                        </p>
                      </div>
                      <div className="panel settings-card">
                        <h2>Partenaires</h2>
                        <p>
                          <strong>DevOps Easy Learning</strong>
                          <br />
                          Partenaire de formation de LessGooo.
                        </p>
                        <a
                          href="https://www.devopseasylearning.com/"
                          target="_blank"
                          rel="noreferrer"
                        >
                          Visiter le site <ExternalLink size={14} />
                        </a>
                        <p>
                          Les autres accords et modalités des stages restent à
                          confirmer.
                        </p>
                      </div>
                    </section>
                  </div>
                )}
              </>
            )
          )}
          <footer className="page-footer">
            <BrandLogo />
            <span>LessGooo Academy · Apprendre pour aller plus loin.</span>
            <span>Zoom · DevOps · Kids</span>
          </footer>
        </main>
      </SidebarInset>
      {editor && (
        <Editor
          key={editor.title + JSON.stringify(editor.values)}
          config={editor}
          onClose={() => setEditor(null)}
          onSave={act}
          busy={busy}
        />
      )}
      {lesson && (
        <Dialog open onOpenChange={(b) => !b && setLesson(null)}>
          <DialogContent className="detail-dialog">
            <DialogHeader>
              <BrandLogo className="dialog-logo" />
              <DialogDescription>
                {trackLabel(lesson.track)} · {lesson.module} · {lesson.minutes}{" "}
                min
              </DialogDescription>
              <DialogTitle>{lesson.title}</DialogTitle>
            </DialogHeader>
            <div className="lesson-body">
              <section>
                <h3>
                  <BookOpen size={19} />
                  Comprendre
                </h3>
                <p>{lesson.explanation}</p>
              </section>
              <section className="practice">
                <h3>
                  <Terminal size={19} />À toi de pratiquer
                </h3>
                <p>{lesson.task}</p>
              </section>
              <section>
                <h3>
                  <CheckCircle2 size={19} />
                  Comment réussir
                </h3>
                <p>{lesson.criteria}</p>
              </section>
              {lesson.resource && (
                <a
                  className="button-link"
                  href={lesson.resource}
                  target="_blank"
                  rel="noreferrer"
                >
                  Ouvrir la ressource <ExternalLink size={16} />
                </a>
              )}
              <p className="footnote">
                Les travaux pratiques Linux, AWS et DevOps nécessitent un
                ordinateur et un environnement autorisé.
              </p>
              {["adult", "child"].includes(persona) ? (
                <Button
                  onClick={() => {
                    setLesson(null);
                    setEditor({
                      title: "Remettre mon travail",
                      description: lesson.title,
                      action: "submit",
                      values: { lesson: lesson.id, text: "", url: "" },
                      fields: [
                        {
                          key: "text",
                          label: "Ce que j’ai fait et compris",
                          type: "textarea",
                          required: true,
                        },
                        {
                          key: "url",
                          label: "Lien du projet (facultatif)",
                          type: "url",
                          hint: "Vous pourrez joindre un fichier après l’envoi, dans Travaux & corrections.",
                        },
                      ],
                    });
                  }}
                >
                  Remettre mon travail <ArrowRight size={17} />
                </Button>
              ) : teacher ? (
                <Button
                  onClick={() => {
                    setLesson(null);
                    openLesson(lesson);
                  }}
                >
                  Modifier cette leçon
                </Button>
              ) : null}
            </div>
          </DialogContent>
        </Dialog>
      )}
      {session && c && (
        <Dialog open onOpenChange={(b) => !b && setSession(null)}>
          <DialogContent className="detail-dialog">
            <DialogHeader>
              <BrandLogo className="dialog-logo" />
              <DialogDescription>
                {trackLabel(session.track)} · {date(session.start)} ·{" "}
                {session.duration} min
              </DialogDescription>
              <DialogTitle>{session.title}</DialogTitle>
            </DialogHeader>
            <div className="form-stack">
              {session.status === "cancelled" ? (
                <Badge tone="red">Cette séance est annulée</Badge>
              ) : session.zoom ? (
                <a
                  className="button-link primary"
                  href={session.zoom}
                  target="_blank"
                  rel="noreferrer"
                >
                  <Video size={18} />
                  Rejoindre Zoom
                </a>
              ) : (
                <div className="notice">
                  <Video size={21} />
                  <p>
                    Le lien Zoom n’a pas encore été renseigné.
                    {teacher
                      ? " Ajoutez votre lien participant dans Modifier le cours."
                      : " Le formateur l’ajoutera avant la séance."}
                  </p>
                </div>
              )}
              {session.replay && (
                <a href={session.replay} target="_blank" rel="noreferrer">
                  Consulter le replay <ExternalLink size={16} />
                </a>
              )}
              {!teacher && (
                <p className="info-line">
                  {persona === "parent" ? "Présence de Maya" : "Votre présence"}{" "}
                  :{" "}
                  {statusText[
                    c.sessions.find((x) => x.id === session.id)?.attendance[
                      studentId || ""
                    ] || ""
                  ] || "Non renseignée"}
                </p>
              )}
              <Button variant="outline" onClick={() => calendar(session)}>
                <CalendarDays size={17} />
                Ajouter à mon calendrier
              </Button>
              {teacher && (
                <>
                  <Button
                    variant="outline"
                    onClick={() => {
                      setSession(null);
                      openSession(session);
                    }}
                  >
                    Modifier le cours
                  </Button>
                  <h3>Présences</h3>
                  <p className="footnote">
                    Rejoindre Zoom ne marque pas automatiquement présent.
                  </p>
                  {c.students
                    .filter((s) => s.track === session.track)
                    .map((s) => (
                      <div className="attendance-row" key={s.id}>
                        <span>{s.name}</span>
                        <Choice
                          label={`Présence de ${s.name}`}
                          value={
                            c.sessions.find((x) => x.id === session.id)
                              ?.attendance[s.id] || "unmarked"
                          }
                          options={[
                            ["unmarked", "Non renseignée"],
                            ["present", "Présent"],
                            ["absent", "Absent"],
                            ["excused", "Excusé"],
                          ]}
                          onChange={(v) => {
                            if (v !== "unmarked")
                              act("attendance", {
                                session: session.id,
                                student: s.id,
                                status: v,
                              });
                          }}
                        />
                      </div>
                    ))}
                </>
              )}
            </div>
          </DialogContent>
        </Dialog>
      )}
      {submission &&
        c &&
        (() => {
          const s =
            c.submissions.find((x) => x.id === submission.id) || submission;
          return (
            <Dialog open onOpenChange={(b) => !b && setSubmission(null)}>
              <DialogContent className="detail-dialog">
                <DialogHeader>
                  <BrandLogo className="dialog-logo" />
                  <DialogDescription>
                    {name(s.student)} · {date(s.created)}
                  </DialogDescription>
                  <DialogTitle>{title(s.lesson)}</DialogTitle>
                </DialogHeader>
                <Badge tone={s.status === "validated" ? "green" : "orange"}>
                  {s.status === "pending" ? "À corriger" : statusText[s.status]}
                </Badge>
                <div className="submission-text">{s.text}</div>
                {s.url && (
                  <a href={s.url} target="_blank" rel="noreferrer">
                    Ouvrir le projet <ExternalLink size={16} />
                  </a>
                )}
                {s.file && (
                  <Button variant="outline" onClick={() => getFile(s)}>
                    <Download size={16} />
                    {s.file.name}
                  </Button>
                )}
                {["adult", "child"].includes(persona) &&
                  s.status === "pending" && (
                    <label className="file-input">
                      <Paperclip size={18} />
                      {busy
                        ? "Envoi en cours…"
                        : "Joindre un fichier (tous formats · 200 Mo maximum)"}
                      <input
                        aria-label="Joindre un fichier"
                        disabled={busy}
                        type="file"
                        onChange={(e) => {
                          if (e.target.files?.[0]) attach(s, e.target.files[0]);
                        }}
                      />
                    </label>
                  )}
                {s.feedback && (
                  <div className="answer">
                    <strong>Retour du formateur · {s.level}</strong>
                    <p>{s.feedback}</p>
                  </div>
                )}
                {teacher && (
                  <Button
                    onClick={() => {
                      setSubmission(null);
                      setEditor({
                        title: "Évaluer le travail",
                        description: name(s.student) + " · " + title(s.lesson),
                        action: "review",
                        values: {
                          id: s.id,
                          status:
                            s.status === "validated" ? "validated" : "revise",
                          feedback: s.feedback,
                          level: s.level || "avec aide",
                        },
                        fields: [
                          {
                            key: "status",
                            label: "Décision",
                            options: [
                              ["revise", "À retravailler"],
                              ["validated", "Validé"],
                            ],
                          },
                          {
                            key: "level",
                            label: "Niveau d’autonomie observé",
                            options: [
                              ["avec aide", "Avec aide"],
                              ["autonome", "Autonome"],
                              ["réutilisé ailleurs", "Réutilisé ailleurs"],
                            ],
                          },
                          {
                            key: "feedback",
                            label: "Retour et prochaine étape",
                            type: "textarea",
                            required: true,
                          },
                        ],
                      });
                    }}
                  >
                    Évaluer ce travail <ArrowRight size={16} />
                  </Button>
                )}
              </DialogContent>
            </Dialog>
          );
        })()}
      {stage &&
        c &&
        (() => {
          const s = c.stages.find((x) => x.id === stage.id) || stage;
          return (
            <Dialog open onOpenChange={(b) => !b && setStage(null)}>
              <DialogContent className="detail-dialog">
                <DialogHeader>
                  <BrandLogo className="dialog-logo" />
                  <DialogDescription>
                    Suivi de stage · Démonstration
                  </DialogDescription>
                  <DialogTitle>Dossier de {name(s.student)}</DialogTitle>
                </DialogHeader>
                <Badge tone="blue">{stageLabels[s.status]}</Badge>
                <p className="submission-text">{s.notes}</p>
                <div className="stage-facts">
                  <p>
                    <strong>Tuteur</strong>
                    {s.mentor || "Non affecté"}
                  </p>
                  <p>
                    <strong>Période</strong>
                    {s.start ? `${s.start} au ${s.end}` : "À définir"}
                  </p>
                </div>
                <div className="row-actions">
                  {teacher && (
                    <Button
                      variant="outline"
                      onClick={() => {
                        setStage(null);
                        openStage(s);
                      }}
                    >
                      Mettre à jour le dossier
                    </Button>
                  )}
                  <Button
                    onClick={() => {
                      setStage(null);
                      setEditor({
                        title: "Ajouter une activité",
                        action: "activity",
                        values: { id: s.id, text: "" },
                        fields: [
                          {
                            key: "text",
                            label:
                              "Travail réalisé, résultat et prochaine étape",
                            type: "textarea",
                            required: true,
                          },
                        ],
                      });
                    }}
                  >
                    Ajouter une activité
                  </Button>
                </div>
                <h3>Journal de suivi</h3>
                {s.activities.length ? (
                  s.activities.map((a) => (
                    <div className="activity" key={a.id}>
                      <small>{date(a.date)}</small>
                      <p>{a.text}</p>
                    </div>
                  ))
                ) : (
                  <p className="footnote">Aucune activité enregistrée.</p>
                )}
              </DialogContent>
            </Dialog>
          );
        })()}
    </SidebarProvider>
  );
}
