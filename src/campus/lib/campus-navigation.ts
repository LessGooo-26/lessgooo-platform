import {
  LayoutDashboard,
  Search,
  BookOpen,
  Rocket,
  FolderCheck,
  CalendarDays,
  FileText,
  Video,
  Images,
  GraduationCap,
  Users,
  MessagesSquare,
  BriefcaseBusiness,
  Wallet,
  MessageCircle,
  Settings,
  Cloud,
  type LucideIcon,
} from "lucide-react";
import type { Persona } from "./model";
type Copy = { en: string; fr: string };
export type CampusTool = {
  id: string;
  label: string;
  description: Copy;
  icon: LucideIcon;
  group: "start" | "learn" | "create" | "support";
  tone: "blue" | "green" | "orange" | "purple";
};
export const campusTools: CampusTool[] = [
  {
    id: "school",
    label: "Soutien scolaire",
    description: {
      fr: "Classes, exercices, annales et orientation au Cameroun.",
      en: "Classes, practice, past papers and guidance in Cameroon.",
    },
    icon: GraduationCap,
    group: "learn",
    tone: "green",
  },
  {
    id: "dashboard",
    label: "Vue d’ensemble",
    description: {
      en: "Your shortcuts and next steps.",
      fr: "Vos raccourcis et prochaines étapes.",
    },
    icon: LayoutDashboard,
    group: "start",
    tone: "blue",
  },
  {
    id: "search",
    label: "Recherche",
    description: {
      en: "Find lessons, files and homework.",
      fr: "Retrouver les leçons, fichiers et devoirs.",
    },
    icon: Search,
    group: "start",
    tone: "blue",
  },
  {
    id: "courses",
    label: "Parcours & leçons",
    description: {
      en: "Explore courses and learn step by step.",
      fr: "Explorer les formations et apprendre pas à pas.",
    },
    icon: BookOpen,
    group: "learn",
    tone: "blue",
  },
  {
    id: "projects",
    label: "Travaux & corrections",
    description: {
      en: "Practise, submit work and read feedback.",
      fr: "Pratiquer, remettre un travail et lire les retours.",
    },
    icon: FolderCheck,
    group: "learn",
    tone: "green",
  },
  {
    id: "explore",
    label: "Projets & ressources",
    description: {
      en: "Build projects with useful references.",
      fr: "Construire des projets avec des ressources utiles.",
    },
    icon: Rocket,
    group: "learn",
    tone: "orange",
  },
  {
    id: "sessions",
    label: "Cours en direct",
    description: {
      en: "See upcoming classes and meeting links.",
      fr: "Voir les prochains cours et liens de réunion.",
    },
    icon: CalendarDays,
    group: "learn",
    tone: "purple",
  },
  {
    id: "notebook",
    label: "Notes & présentations",
    description: {
      en: "Keep ideas and turn notes into slides.",
      fr: "Garder vos idées et préparer des présentations.",
    },
    icon: FileText,
    group: "create",
    tone: "blue",
  },
  {
    id: "library",
    label: "Vidéos & fichiers",
    description: {
      en: "Organize documents and watch lessons.",
      fr: "Organiser les documents et regarder les vidéos.",
    },
    icon: Video,
    group: "create",
    tone: "orange",
  },
  {
    id: "galleries",
    label: "Galeries photo",
    description: {
      en: "Label photos and personalize your space.",
      fr: "Légender les photos et personnaliser votre espace.",
    },
    icon: Images,
    group: "create",
    tone: "green",
  },
  {
    id: "services",
    label: "Services & demandes",
    description: {
      en: "Discuss training or a company project.",
      fr: "Préparer une formation ou un projet d’entreprise.",
    },
    icon: BriefcaseBusiness,
    group: "support",
    tone: "blue",
  },
  {
    id: "career",
    label: "Entretiens & carrière",
    description: {
      en: "Prepare interviews and track applications.",
      fr: "Préparer les entretiens et suivre les candidatures.",
    },
    icon: GraduationCap,
    group: "support",
    tone: "purple",
  },
  {
    id: "students",
    label: "Mes élèves",
    description: {
      en: "Follow your demo learners and their progress.",
      fr: "Suivre les élèves de démonstration et leurs progrès.",
    },
    icon: Users,
    group: "support",
    tone: "green",
  },
  {
    id: "coaching",
    label: "One-on-one",
    description: {
      en: "Prepare individual support sessions.",
      fr: "Préparer les séances d’accompagnement individuel.",
    },
    icon: MessagesSquare,
    group: "support",
    tone: "blue",
  },
  {
    id: "stages",
    label: "Suivi des stages",
    description: {
      en: "Review the demonstration internship tracker.",
      fr: "Consulter le suivi des stages de démonstration.",
    },
    icon: BriefcaseBusiness,
    group: "support",
    tone: "orange",
  },
  {
    id: "payments",
    label: "Paiements",
    description: {
      en: "View the demonstration payment records.",
      fr: "Consulter le registre des paiements de démonstration.",
    },
    icon: Wallet,
    group: "support",
    tone: "green",
  },
  {
    id: "help",
    label: "Questions & réponses",
    description: {
      en: "Ask for help and find teacher replies.",
      fr: "Demander de l’aide et retrouver les réponses.",
    },
    icon: MessageCircle,
    group: "support",
    tone: "orange",
  },
  {
    id: "profile",
    label: "Mon profil",
    description: {
      en: "Personalize your picture and display details.",
      fr: "Personnaliser votre photo et votre présentation.",
    },
    icon: Users,
    group: "support",
    tone: "purple",
  },
  {
    id: "settings",
    label: "Réglages & guide",
    description: {
      en: "Understand the campus and local settings.",
      fr: "Comprendre le campus et ses réglages locaux.",
    },
    icon: Settings,
    group: "support",
    tone: "blue",
  },
  {
    id: "integrations",
    label: "Drive & paiements en ligne",
    description: {
      en: "Manage the existing optional connections.",
      fr: "Gérer les connexions facultatives existantes.",
    },
    icon: Cloud,
    group: "support",
    tone: "green",
  },
];
export const navigationGroups = [
  { id: "start", en: "Your workspace", fr: "Votre espace" },
  { id: "learn", en: "Learn & practise", fr: "Apprendre et pratiquer" },
  { id: "create", en: "Create & organize", fr: "Créer et organiser" },
  {
    id: "support",
    en: "Support & management",
    fr: "Accompagnement et gestion",
  },
] as const;
// Mirrors existing navigation visibility. Backend authorization remains authoritative.
export function visibleTools(persona: Persona) {
  return campusTools.filter(
    ({ id }) =>
      !(persona !== "teacher" && ["students", "integrations"].includes(id)) &&
      !(
        ["parent", "child"].includes(persona) &&
        ["stages", "coaching", "career"].includes(id)
      ) &&
      !(persona === "child" && ["payments", "services"].includes(id)),
  );
}
export type WorkspacePreferences = { pinned: string[]; recent: string[] };
export const workspaceKey = (persona: Persona) =>
  "lessgooo-workspace:" + persona;
const defaults: Record<Persona, string[]> = {
  teacher: ["projects", "sessions", "students", "notebook"],
  adult: ["courses", "projects", "notebook", "library"],
  parent: ["projects", "sessions", "galleries", "help"],
  child: ["courses", "projects", "notebook", "galleries"],
};
export function cleanPreferences(
  value: unknown,
  persona: Persona,
): WorkspacePreferences {
  const allowed = new Set(visibleTools(persona).map((t) => t.id));
  const select = (value: unknown, limit: number) =>
    Array.isArray(value)
      ? [
          ...new Set(
            value.filter(
              (id): id is string =>
                typeof id === "string" &&
                allowed.has(id) &&
                !["dashboard", "search"].includes(id),
            ),
          ),
        ].slice(0, limit)
      : [];
  const object =
    typeof value === "object" && value !== null
      ? (value as Record<string, unknown>)
      : {};
  return {
    pinned: select(
      Array.isArray(object.pinned) ? object.pinned : defaults[persona],
      6,
    ),
    recent: select(object.recent, 4),
  };
}
export function loadPreferences(persona: Persona): WorkspacePreferences {
  try {
    return cleanPreferences(
      JSON.parse(localStorage.getItem(workspaceKey(persona)) || "null"),
      persona,
    );
  } catch {
    return cleanPreferences(null, persona);
  }
}
export const normalizeSearch = (text: string) =>
  text
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .trim();
