import {
  c,
  type Copy,
  type LabStep,
  type LessonGuide,
} from "./lesson-guide-model";
import { flow, guide } from "./lesson-guide-helpers";
const setup: Record<LessonGuide["family"], Copy> = {
  linux: c(
    "Linux or WSL with Bash and the named tool installed from its official documentation. Use a separate lab directory.",
    "Linux ou WSL avec Bash et l’outil installé depuis sa documentation. Utilisez un dossier de laboratoire séparé.",
  ),
  git: c(
    "Git and your own repository or fork, with a clean working tree.",
    "Git et votre dépôt ou fork, avec un dossier de travail propre.",
  ),
  containers: c(
    "A running Linux Docker engine and Docker Compose v2. For campus examples, use an isolated clone of this repository and synthetic data; port 4173 must be free.",
    "Un moteur Docker Linux actif et Docker Compose v2. Pour les exemples campus, utilisez un clone isolé de ce dépôt et des données fictives ; le port 4173 doit être libre.",
  ),
  pipeline: c(
    "Your own GitHub/GitLab repository or local Jenkins sandbox. Read the chosen runner’s billing/usage limits; no publishing credential is needed for the first test.",
    "Votre dépôt GitHub/GitLab ou laboratoire Jenkins. Vérifiez les limites d’usage du runner ; aucun identifiant de publication n’est requis pour le premier test.",
  ),
  cloud: c(
    "AWS CLI v2, an authorised sandbox account and a known region. The listed CLI exercises inspect existing resources and do not provision them. Use SSO/temporary access, never root credentials.",
    "AWS CLI v2, un compte de laboratoire autorisé et une région connue. Les commandes lisent les ressources existantes sans en créer. Utilisez SSO/un accès temporaire, jamais le compte racine.",
  ),
  iac: c(
    "The named CLI installed from official docs; a new lab folder. Terraform exercises use local terraform_data resources unless stated otherwise.",
    "L’outil installé depuis sa documentation et un nouveau dossier. Les exercices Terraform utilisent terraform_data en local sauf indication contraire.",
  ),
  kubernetes: c(
    "Docker, kind and kubectl for a local cluster. Start with the Kubernetes basics lab to create the cluster. Later lessons reuse it; confirm the kind-lessgooo-lab context and lesson-lab namespace before each change.",
    "Docker, kind et kubectl pour un cluster local. Commencez par les bases Kubernetes pour créer le cluster. Les leçons suivantes le réutilisent ; confirmez le contexte kind-lessgooo-lab et le namespace lesson-lab avant chaque changement.",
  ),
  observe: c(
    "Use synthetic metrics/logs or an authorised lab monitoring stack. No real customer logs or production incident is needed.",
    "Utilisez des métriques/journaux fictifs ou un laboratoire autorisé. Aucun journal client ou incident de production nécessaire.",
  ),
  security: c(
    "An isolated copy of the project, a terminal and the named security tool. Use only dummy values and read the official installation instructions.",
    "Une copie isolée du projet, un terminal et l’outil de sécurité indiqué. Utilisez des valeurs fictives et les instructions officielles d’installation.",
  ),
  kids: c(
    "A computer or paper, and an adult to help. No cloud account or payment card is needed.",
    "Un ordinateur ou du papier et un adulte pour accompagner. Aucun compte cloud ni carte bancaire nécessaire.",
  ),
};
const clean: Record<LessonGuide["family"], Copy> = {
  linux: c(
    "Stop only your lab process and keep a redacted report with the commands used.",
    "Arrêtez uniquement votre processus de laboratoire et conservez un rapport expurgé avec les commandes.",
  ),
  git: c(
    "Keep the reviewed branch as evidence; do not rewrite shared history.",
    "Conservez la branche relue comme preuve ; ne réécrivez pas l’historique partagé.",
  ),
  containers: c(
    "Stop this lab with docker compose down. Do not add -v unless you intentionally want to remove its data volumes after verifying the backup.",
    "Arrêtez ce laboratoire avec docker compose down. N’ajoutez pas -v sauf si vous voulez supprimer ses volumes après vérification de la sauvegarde.",
  ),
  pipeline: c(
    "Keep the run URL and test evidence. Remove only temporary lab resources; never leave a public runner with private credentials.",
    "Conservez le lien d’exécution et les preuves. Retirez uniquement les ressources temporaires ; ne laissez pas de runner public avec des identifiants privés.",
  ),
  cloud: c(
    "These read-only commands create no resources. If you extend the lab, inventory and remove only the tagged lab resources with account-owner approval and verify subsequent billing.",
    "Ces lectures ne créent aucune ressource. Si vous prolongez le laboratoire, inventoriez et retirez uniquement ses ressources identifiées avec l’accord du responsable du compte, puis vérifiez la facturation.",
  ),
  iac: c(
    "For the local terraform_data lab, inspect terraform plan -destroy before terraform destroy. Never reuse this cleanup against another state or a cloud account.",
    "Pour terraform_data local, lisez terraform plan -destroy avant terraform destroy. N’utilisez jamais ce nettoyage avec un autre état ou un compte cloud.",
  ),
  kubernetes: c(
    "When all local exercises are complete, remove only your disposable cluster with kind delete cluster --name lessgooo-lab. Never run this cleanup against EKS or a shared cluster.",
    "Après tous les exercices locaux, retirez uniquement votre cluster jetable avec kind delete cluster --name lessgooo-lab. Ne transposez pas ce nettoyage à EKS ou à un cluster partagé.",
  ),
  observe: c(
    "Stop the lab exporters and save only anonymised evidence; delete temporary customer-like fixture data if no longer needed.",
    "Arrêtez les exporters du laboratoire et conservez uniquement des preuves anonymisées ; retirez les données fictives inutiles.",
  ),
  security: c(
    "Keep redacted reports and tool versions. Remove temporary dummy files; do not retain tokens in logs or screenshots.",
    "Conservez rapports expurgés et versions. Retirez les fichiers fictifs temporaires ; aucun jeton dans les journaux ou captures.",
  ),
  kids: c(
    "Save your project with an adult, close the tools and explain where your backup is.",
    "Sauvegardez le projet avec un adulte, fermez les outils et expliquez où se trouve la copie.",
  ),
};
export function lesson(
  topic: string,
  family: LessonGuide["family"],
  role: Copy,
  scenario: Copy,
  flowEn: string,
  flowFr: string,
  steps: LabStep[],
  question: Copy,
  answer: Copy,
  misconception: Copy,
  cleanup?: Copy,
): LessonGuide {
  return guide({
    topic,
    family,
    role,
    scenario,
    flow: flow(flowEn, flowFr),
    steps,
    question,
    answer,
    misconception,
    goal: steps[steps.length - 1].expected,
    takeaway: answer,
    prerequisites: setup[family],
    cleanup: cleanup || clean[family],
  });
}
