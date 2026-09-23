import { c, type Copy, type LessonGuide } from "./lesson-guide-model";
export type LabEnvironment = {
  id: string;
  title: Copy;
  intro: Copy;
  checks: Copy[];
  offline?: boolean;
};
export function lessonEnvironments(guide: LessonGuide): LabEnvironment[] {
  if (guide.family === "kids")
    return [
      {
        id: "supervised",
        title: c("Supervised activity", "Activité accompagnée"),
        intro: c(
          "Use paper or your own computer with an adult. Keep projects local.",
          "Utilise du papier ou ton ordinateur avec un adulte. Garde les projets en local.",
        ),
        checks: [
          c(
            "Choose a new folder or blank sheet; do not modify someone else’s work.",
            "Choisis un nouveau dossier ou une feuille ; ne modifie pas le travail d’autrui.",
          ),
          c(
            "Save only fictional information and your own drawings.",
            "Conserve uniquement des informations fictives et tes dessins.",
          ),
          c(
            "Ask an adult before visiting an external site or installing a tool.",
            "Demande à un adulte avant un site externe ou une installation.",
          ),
        ],
      },
    ];
  if (guide.family === "cloud")
    return [
      {
        id: "offline",
        title: c("Without an AWS account", "Sans compte AWS"),
        intro: c(
          "Complete the architecture and decision exercises with fictional values. Commands below are references only; do not run them without authorised access.",
          "Réalise architecture et décisions avec des valeurs fictives. Les commandes sont des références ; ne les lance pas sans accès autorisé.",
        ),
        offline: true,
        checks: [
          c(
            "Read the linked service guide and draw the resources involved.",
            "Lis le guide du service et dessine les ressources.",
          ),
          c(
            "Make a fictional inventory using the fields shown in the lesson.",
            "Crée un inventaire fictif avec les champs du cours.",
          ),
          c(
            "Explain expected results; mark them as predicted, not executed.",
            "Explique les résultats attendus en les marquant comme prévus, pas exécutés.",
          ),
        ],
      },
      {
        id: "aws",
        title: c("Authorised AWS sandbox", "Laboratoire AWS autorisé"),
        intro: c(
          "Use the account owner’s sandbox, selected region and temporary identity. The core CLI exercise is read-only.",
          "Utilise le laboratoire du responsable du compte, la région choisie et une identité temporaire. Les commandes du cours sont en lecture seule.",
        ),
        checks: [
          c(
            "Authenticate with your approved SSO/profile and confirm aws sts get-caller-identity.",
            "Connecte le profil/SSO autorisé puis vérifie aws sts get-caller-identity.",
          ),
          c(
            "Confirm region, allowed read permissions and an agreed budget before extending the exercise.",
            "Confirme région, droits de lecture et budget avant toute extension.",
          ),
          c(
            "Use only sandbox metadata; redact identifiers in the submitted evidence.",
            "Utilise uniquement les métadonnées du laboratoire ; masque les identifiants dans le rendu.",
          ),
        ],
      },
    ];
  const cluster = guide.family === "kubernetes";
  return [
    {
      id: "local",
      title: c("Local lab", "Laboratoire local"),
      intro: cluster
        ? c(
            "Use a disposable kind cluster; keep the Service private and reach it with localhost port-forward.",
            "Utilise un cluster kind jetable ; Service privé et port-forward local.",
          )
        : c(
            "Start on your own machine with a separate copy and synthetic data. CLI examples use Bash; on Windows use WSL or adapt quoting deliberately.",
            "Commence sur ta machine dans une copie séparée avec données fictives. Les exemples utilisent Bash ; sur Windows, utilise WSL ou adapte les guillemets.",
          ),
      checks: [
        c(
          "Read the prerequisites and install the named tools from the official links.",
          "Lis les prérequis et installe les outils depuis les liens officiels.",
        ),
        c(
          "Check your current directory/context before running a command.",
          "Vérifie dossier/contexte avant toute commande.",
        ),
        c(
          "Follow the steps below, then repeat the negative test and save evidence.",
          "Suis les étapes, répète le test négatif et conserve les preuves.",
        ),
      ],
    },
    {
      id: "vm",
      title: c("Linux virtual machine", "Machine virtuelle Linux"),
      intro: c(
        "Use a disposable Linux VM with the same tool versions. Keep its inbound network private; a snapshot helps reset a lab but does not replace application backups.",
        "Utilise une VM Linux jetable avec les mêmes versions. Garde son réseau entrant privé ; un snapshot aide à réinitialiser mais ne remplace pas les sauvegardes applicatives.",
      ),
      checks: [
        c(
          "Record VM OS, CPU/RAM and installed tool versions; verify the lab fits its capacity.",
          "Note OS, CPU/RAM et versions ; vérifie la capacité du laboratoire.",
        ),
        c(
          "Copy only source/configuration into a separate lab folder; do not copy personal .env files.",
          "Copie uniquement sources/configuration dans un dossier séparé ; aucun .env personnel.",
        ),
        cluster
          ? c(
              "Install Docker, kind and kubectl in the VM, then use the local lab context. Reach the forwarded service through an SSH tunnel if browsing from your host.",
              "Installe Docker, kind et kubectl dans la VM puis utilise le contexte local. Passe par un tunnel SSH pour le navigateur hôte.",
            )
          : c(
              "Repeat the same lab steps inside the VM. For HTTP tests use its terminal, or an SSH local tunnel; do not open public firewall ports just to view the exercise.",
              "Répète les étapes dans la VM. Pour HTTP, utilise son terminal ou un tunnel SSH local ; pas de port public pour visualiser l’exercice.",
            ),
      ],
    },
    {
      id: "cloud",
      title: c(
        "Cloud / staging adaptation",
        "Adaptation cloud / préproduction",
      ),
      intro: c(
        "This is an adaptation checklist for an already authorised sandbox, not permission to deploy to production. Keep the core learning steps and explicitly review the differences.",
        "Cette checklist adapte un laboratoire déjà autorisé ; elle n’autorise pas un déploiement en production. Conserve les étapes et examine les différences.",
      ),
      checks: [
        c(
          "Confirm account, identity, region, resource owner and budget. Use a dedicated environment and temporary credentials.",
          "Confirme compte, identité, région, responsable et budget. Utilise un environnement dédié et des identifiants temporaires.",
        ),
        cluster
          ? c(
              "Replace kind with the approved cluster context and namespace. Review storage classes, ingress and CNI enforcement before applying; never reuse the kind deletion command in the cloud.",
              "Remplace kind par le contexte et namespace approuvés. Revois stockage, ingress et CNI avant application ; ne transpose jamais le nettoyage kind au cloud.",
            )
          : c(
              "Replace local paths/runner settings with reviewed environment configuration. Keep data and credentials outside the image and source repository.",
              "Adapte chemins/runners à la configuration revue. Garde données et identifiants hors image et dépôt.",
            ),
        c(
          "Repeat health and negative-access checks, collect evidence, then follow the approved rollback and resource-cleanup plan.",
          "Répète santé et refus d’accès, conserve les preuves puis suis le plan approuvé de retour arrière et nettoyage.",
        ),
      ],
    },
  ];
}
