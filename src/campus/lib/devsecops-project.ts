export type ProjectCopy = { en: string; fr: string };
const copy = (en: string, fr: string): ProjectCopy => ({ en, fr });
export const devsecopsProjectId = "campus-devsecops";
export const devsecopsGuide =
  "https://github.com/LessGooo-26/lessgooo-platform/blob/codex/campus-local/README.md";
export const devsecopsPhases = [
  {
    id: "architecture-and-service-count",
    title: copy("Understand the architecture", "Comprendre l’architecture"),
    goal: copy(
      "Trace a request from the browser to SQLite.",
      "Suivre une requête du navigateur à SQLite.",
    ),
    tasks: [
      copy(
        "Run the campus with fictional data and draw every connection.",
        "Démarrer le campus avec des données fictives et dessiner chaque connexion.",
      ),
      copy(
        "Explain one application service, zero independent business microservices, and optional external providers.",
        "Expliquer le service applicatif unique, l’absence de microservices métier indépendants et les fournisseurs facultatifs.",
      ),
    ],
    evidence: copy(
      "Architecture diagram, dependency table and a short threat model.",
      "Schéma d’architecture, tableau des dépendances et modèle de menaces.",
    ),
    check: copy(
      "Identify where data lives and why a demo persona is not authentication.",
      "Identifier le stockage et expliquer pourquoi une vue de démonstration n’est pas une authentification.",
    ),
  },
  {
    id: "docker-compose-step-by-step",
    title: copy(
      "Containerize and preserve data",
      "Conteneuriser et conserver les données",
    ),
    goal: copy(
      "Build a repeatable local environment with Docker Compose.",
      "Construire un environnement local reproductible avec Docker Compose.",
    ),
    tasks: [
      copy(
        "Build the image, check health and inspect the non-root runtime.",
        "Construire l’image, vérifier la santé et le processus sans privilèges.",
      ),
      copy(
        "Create a fictional note, restart the container and restore a backup into a separate volume.",
        "Créer une note fictive, redémarrer le conteneur et restaurer une sauvegarde dans un volume distinct.",
      ),
    ],
    evidence: copy(
      "Compose commands, health output and restoration evidence.",
      "Commandes Compose, résultat du contrôle de santé et preuve de restauration.",
    ),
    check: copy(
      "The note survives replacement; credentials and data are absent from the image.",
      "La note survit au remplacement ; l’image ne contient ni secrets ni données.",
    ),
  },
  {
    id: "shift-left-security",
    title: copy(
      "Move security checks earlier",
      "Vérifier la sécurité dès le début",
    ),
    goal: copy(
      "Find problems before building or releasing an image.",
      "Trouver les problèmes avant de construire ou publier une image.",
    ),
    tasks: [
      copy(
        "Run Gitleaks, Semgrep, Trivy, actionlint and Kubernetes schema checks.",
        "Exécuter Gitleaks, Semgrep, Trivy, actionlint et la validation Kubernetes.",
      ),
      copy(
        "On a throwaway branch, trigger a safe test finding, observe failure, then fix it.",
        "Dans une branche de test, déclencher une détection sans danger, observer l’échec puis la corriger.",
      ),
    ],
    evidence: copy(
      "Redacted reports and a failed-then-passing pipeline.",
      "Rapports expurgés et pipeline en échec puis réussi.",
    ),
    check: copy(
      "A failing gate prevents image publication; do not use a real credential as a test.",
      "Un contrôle en échec bloque la publication ; ne jamais tester avec un vrai secret.",
    ),
  },
  {
    id: "github-actions-pipeline",
    title: copy(
      "Build once and produce an SBOM",
      "Construire une fois et produire une SBOM",
    ),
    goal: copy(
      "Connect tests, security, image scanning and artifact evidence.",
      "Relier tests, sécurité, analyse d’image et preuves.",
    ),
    tasks: [
      copy(
        "Run the pull-request workflow and inspect the immutable action references.",
        "Exécuter le workflow de demande de fusion et examiner les références immuables.",
      ),
      copy(
        "Find a package in the SPDX SBOM and connect the scanned image to its source commit.",
        "Retrouver un paquet dans la SBOM SPDX et relier l’image analysée à son commit.",
      ),
    ],
    evidence: copy(
      "Workflow graph, scan report, SBOM and commit identifier.",
      "Schéma du workflow, rapport d’analyse, SBOM et identifiant du commit.",
    ),
    check: copy(
      "Explain why an SBOM is an inventory and does not prove that software is safe.",
      "Expliquer pourquoi une SBOM est un inventaire et ne prouve pas la sécurité.",
    ),
  },
  {
    id: "secrets-and-supply-chain",
    title: copy(
      "Protect secrets and verify signatures",
      "Protéger les secrets et vérifier les signatures",
    ),
    goal: copy(
      "Publish only verified artifacts with narrowly scoped credentials.",
      "Publier des artefacts vérifiés avec des droits limités.",
    ),
    tasks: [
      copy(
        "Configure a protected publication environment in your authorized repository.",
        "Configurer un environnement de publication protégé dans votre dépôt autorisé.",
      ),
      copy(
        "Verify the image signature and SBOM attestation against the expected workflow identity.",
        "Vérifier la signature et l’attestation SBOM avec l’identité attendue du workflow.",
      ),
    ],
    evidence: copy(
      "Secret ownership/rotation table and sanitized verification output.",
      "Tableau de gestion/rotation des secrets et vérification expurgée.",
    ),
    check: copy(
      "No plaintext secrets in Git, screenshots, reports or browser bundles.",
      "Aucun secret en clair dans Git, les captures, rapports ou fichiers du navigateur.",
    ),
  },
  {
    id: "aws-eks-in-a-few-commands",
    title: copy(
      "Plan and create the AWS lab",
      "Planifier et créer le laboratoire AWS",
    ),
    goal: copy(
      "Understand cost, identity and networking before provisioning.",
      "Comprendre coûts, identité et réseau avant la création.",
    ),
    tasks: [
      copy(
        "Prepare a dated cost estimate and cleanup plan. AWS is optional and costs money.",
        "Préparer une estimation datée et un plan de nettoyage. AWS est facultatif et payant.",
      ),
      copy(
        "After budget approval, use SSO, restrict the API address and create the EKS lab.",
        "Après accord sur le budget, utiliser SSO, restreindre l’adresse de l’API et créer le cluster.",
      ),
    ],
    evidence: copy(
      "Approved lab budget, cluster configuration and Ready node output; or an offline plan.",
      "Budget approuvé, configuration et nœuds Ready ; ou plan hors ligne.",
    ),
    check: copy(
      "Never create paid resources without account-owner approval.",
      "Ne jamais créer de ressources payantes sans l’accord du propriétaire.",
    ),
  },
  {
    id: "kubernetes-and-traefik",
    title: copy("Deploy through Traefik", "Déployer avec Traefik"),
    goal: copy(
      "Connect Ingress, Service, Pod and persistent storage.",
      "Relier Ingress, Service, Pod et stockage persistant.",
    ),
    tasks: [
      copy(
        "Render the manifests, set a verified image digest and deploy one replica.",
        "Générer les manifestes, définir un digest vérifié et déployer un seul réplica.",
      ),
      copy(
        "Forward localhost port 4173 through private Traefik and test rejected Host/Origin values.",
        "Transférer le port local 4173 via Traefik privé et tester les Host/Origin refusés.",
      ),
    ],
    evidence: copy(
      "Rendered YAML, traffic diagram, health result and access-denial checks.",
      "YAML généré, schéma de trafic, santé et tests de refus d’accès.",
    ),
    check: copy(
      "No public load balancer; the SQLite volume is preserved during replacement.",
      "Aucun load balancer public ; le volume SQLite est conservé lors du remplacement.",
    ),
  },
  {
    id: "argocd-gitops",
    title: copy(
      "Let Git describe the deployment",
      "Décrire le déploiement dans Git",
    ),
    goal: copy(
      "Use Argo CD to reconcile a reviewed image digest.",
      "Utiliser Argo CD pour appliquer un digest d’image relu.",
    ),
    tasks: [
      copy(
        "Connect the authorized repository and apply the restricted AppProject/Application.",
        "Connecter le dépôt autorisé et appliquer AppProject/Application avec droits limités.",
      ),
      copy(
        "Promote through a pull request, inspect drift and roll back by reverting the Git change.",
        "Promouvoir par demande de fusion, observer la dérive et revenir en arrière via Git.",
      ),
    ],
    evidence: copy(
      "Promotion diff, Healthy/Synced state and rollback history.",
      "Diff de promotion, état Healthy/Synced et historique du retour arrière.",
    ),
    check: copy(
      "The running image digest matches reviewed Git; Argo CD has no publication credential.",
      "Le digest actif correspond à Git relu ; Argo CD ne possède aucun secret de publication.",
    ),
  },
  {
    id: "prometheus-and-grafana",
    title: copy(
      "Measure health and investigate failures",
      "Mesurer la santé et diagnostiquer les pannes",
    ),
    goal: copy(
      "Read useful signals in Prometheus and Grafana.",
      "Lire des signaux utiles dans Prometheus et Grafana.",
    ),
    tasks: [
      copy(
        "Inspect health probes, HTTP duration, ingress errors, memory and restarts.",
        "Examiner santé, durée HTTP, erreurs ingress, mémoire et redémarrages.",
      ),
      copy(
        "In your isolated lab, stop the app briefly and observe an alert and recovery.",
        "Dans votre laboratoire isolé, arrêter brièvement l’app puis observer l’alerte et la reprise.",
      ),
    ],
    evidence: copy(
      "Dashboard export, PromQL queries and an incident timeline.",
      "Export du tableau de bord, requêtes PromQL et chronologie d’incident.",
    ),
    check: copy(
      "Explain missing metrics versus healthy metrics and how alert delivery is configured.",
      "Distinguer métriques absentes et service sain, et expliquer l’envoi des alertes.",
    ),
  },
  {
    id: "recovery-cleanup-and-troubleshooting",
    title: copy(
      "Recover, clean up and present",
      "Restaurer, nettoyer et présenter",
    ),
    goal: copy(
      "Prove recovery and leave no forgotten paid resources.",
      "Prouver la restauration et ne laisser aucune ressource payante oubliée.",
    ),
    tasks: [
      copy(
        "Restore synthetic data into an isolated volume and record observed recovery time.",
        "Restaurer des données fictives dans un volume isolé et mesurer le délai.",
      ),
      copy(
        "Review retained disks/logs, complete authorized cleanup and present your decisions.",
        "Vérifier disques/journaux conservés, nettoyer avec autorisation et présenter vos décisions.",
      ),
    ],
    evidence: copy(
      "Restore proof, cost/resource inventory and a five-minute demonstration.",
      "Preuve de restauration, inventaire coûts/ressources et démonstration de cinq minutes.",
    ),
    check: copy(
      "Document remaining limitations without claiming production readiness or certification.",
      "Documenter les limites sans prétendre à une mise en production ou une certification.",
    ),
  },
];
