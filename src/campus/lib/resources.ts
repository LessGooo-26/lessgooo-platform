export const resourceChecked = "2026-09-16";
export const videos = [
  {
    title: "Git et GitHub : les bases en pratique",
    author: "Gwen Faraday · freeCodeCamp.org",
    url: "https://www.youtube.com/watch?v=RGOj5yH7evk",
    topic: "Git",
    note: "Anglais · 2020 · comprendre commits, branches et collaboration.",
  },
  {
    title: "Terraform : un cours pour démarrer",
    author: "Sanjeev Thiyagarajan · freeCodeCamp.org",
    url: "https://www.youtube.com/watch?v=SLB_c_ayRMo",
    topic: "Terraform",
    note: "Anglais · 2020 · vérifier les providers et coûts avant tout apply dans le cloud.",
  },
  {
    title: "Docker : cours complet avec démonstrations",
    author: "TechWorld with Nana",
    url: "https://www.youtube.com/watch?v=3c-iBn73dDE",
    topic: "Docker",
    note: "Anglais · 2020 · utiliser les commandes actuelles de la documentation Docker.",
  },
  {
    title: "Docker : démarrage rapide",
    author: "TechWorld with Nana",
    url: "https://www.youtube.com/watch?v=pg19Z8LL06w",
    topic: "Docker",
    note: "Anglais · 2023 · utile avant le premier laboratoire Compose.",
  },
  {
    title: "Kubernetes : cours complet pour débuter",
    author: "TechWorld with Nana",
    url: "https://www.youtube.com/watch?v=X48VuDVv0do",
    topic: "Kubernetes",
    note: "Anglais · 2020 · vérifier les versions des API dans la documentation Kubernetes.",
  },
];
export const practiceProjects = [
  {
    id: "campus-devsecops",
    title: "LESSGOOO DevSecOps capstone",
    topic: "DevSecOps",
    level: "Avancé",
    repo: "https://github.com/LessGooo-26/lessgooo-platform",
    mission:
      "Docker Compose, GitHub Actions, SBOM, secrets, AWS EKS, Kubernetes, Traefik, Argo CD, Prometheus and Grafana: ten practical phases with evidence.",
    deliverable:
      "Architecture, secured pipeline, private deployment, monitoring and recovery evidence.",
  },
  {
    id: "compose-web",
    title: "Une application et sa base",
    topic: "Docker",
    level: "Débutant",
    repo: "https://github.com/docker/awesome-compose",
    mission:
      "Choisir un exemple application/base, isoler la base sur le réseau interne et vérifier sa persistance.",
    deliverable: "Compose, README reproductible et test de restauration.",
  },
  {
    id: "proxy",
    title: "Un reverse proxy observable",
    topic: "Réseau",
    level: "Intermédiaire",
    repo: "https://github.com/docker/awesome-compose",
    mission:
      "Ajouter une route, vérifier les en-têtes puis diagnostiquer un upstream indisponible.",
    deliverable: "Configuration, résultats curl et procédure pour un 502.",
  },
  {
    id: "ci",
    title: "Du commit à l’image testée",
    topic: "CI/CD",
    level: "Intermédiaire",
    repo: "https://github.com/docker/awesome-compose",
    mission:
      "Sur une copie personnelle autorisée, ajouter tests, build et publication optionnelle d’une image de laboratoire.",
    deliverable:
      "Workflow, exécution en échec puis réussie et association commit/digest.",
  },
  {
    id: "monitor",
    title: "Le tableau de bord de mon service",
    topic: "Observabilité",
    level: "Intermédiaire",
    repo: "https://github.com/docker/awesome-compose",
    mission:
      "Utiliser le laboratoire Prometheus/Grafana et définir trois signaux opérationnels utiles.",
    deliverable: "Dashboard exporté, alerte et runbook.",
  },
  {
    id: "ansible",
    title: "Configurer une VM automatiquement",
    topic: "Ansible",
    level: "Intermédiaire",
    repo: "https://github.com/ansible/ansible-examples",
    mission:
      "Adapter un playbook à une VM de test et observer deux exécutions successives.",
    deliverable: "Inventaire fictif, rôle et preuve d’idempotence.",
  },
  {
    id: "k8s",
    title: "Ma première application Kubernetes",
    topic: "Kubernetes",
    level: "Intermédiaire",
    repo: "https://github.com/kubernetes/examples",
    mission:
      "Déployer un exemple dans un cluster local et exposer uniquement le service nécessaire.",
    deliverable: "Manifestes, diagramme et vérification du Service.",
  },
  {
    id: "resilience",
    title: "Résister à la disparition d’un Pod",
    topic: "Kubernetes",
    level: "Intermédiaire",
    repo: "https://github.com/kubernetes/examples",
    mission:
      "Ajouter réplicas et probes puis supprimer un Pod du laboratoire en observant le service.",
    deliverable: "Journal d’expérience et compromis de disponibilité.",
  },
  {
    id: "helm-lab",
    title: "Deux environnements, un chart",
    topic: "Helm",
    level: "Avancé",
    repo: "https://github.com/argoproj/argocd-example-apps",
    mission:
      "Étudier un exemple Helm et produire deux jeux de valeurs sans secrets.",
    deliverable: "Valeurs, rendu des manifestes et comparaison.",
  },
  {
    id: "gitops-lab",
    title: "Git devient le tableau de commande",
    topic: "GitOps",
    level: "Avancé",
    repo: "https://github.com/argoproj/argocd-example-apps",
    mission:
      "Synchroniser une application locale avec Argo CD et documenter la dérive puis sa correction.",
    deliverable: "Historique Git et procédure de retour arrière.",
  },
  {
    id: "microservices",
    title: "Une boutique en microservices",
    topic: "Architecture",
    level: "Avancé",
    repo: "https://github.com/GoogleCloudPlatform/microservices-demo",
    mission:
      "Cartographier les échanges entre services et déployer uniquement dans un laboratoire avec ressources suffisantes.",
    deliverable: "Schéma, dépendances et budget de ressources.",
  },
  {
    id: "otel",
    title: "Retrouver une requête lente",
    topic: "Observabilité",
    level: "Avancé",
    repo: "https://github.com/open-telemetry/opentelemetry-demo",
    mission:
      "Suivre une trace distribuée et formuler une hypothèse vérifiable sur la latence.",
    deliverable: "Trace expurgée, analyse et test de confirmation.",
  },
  {
    id: "sre",
    title: "Un incident, un runbook, une amélioration",
    topic: "SRE",
    level: "Avancé",
    repo: "https://github.com/open-telemetry/opentelemetry-demo",
    mission:
      "Provoquer une panne contrôlée dans le laboratoire, mesurer l’impact et rétablir le service.",
    deliverable: "Chronologie, SLO de laboratoire et postmortem sans blâme.",
  },
  {
    id: "security",
    title: "Auditer une chaîne de conteneurs",
    topic: "DevSecOps",
    level: "Avancé",
    repo: "https://github.com/docker/awesome-compose",
    mission:
      "Inventorier les composants d’une image, repérer les secrets fictifs et durcir son exécution.",
    deliverable: "SBOM, rapport avant/après et limites de l’analyse.",
  },
  {
    id: "aws-plan",
    title: "Concevoir le passage vers AWS",
    topic: "AWS",
    level: "Avancé",
    repo: "https://github.com/kubernetes/examples",
    mission:
      "À partir d’une application de laboratoire, concevoir réseau, identité et stockage AWS. La première étape reste un plan hors ligne.",
    deliverable:
      "Architecture, estimation datée et plan de nettoyage avant tout déploiement payant.",
  },
  {
    id: "portfolio",
    title: "Le projet fil rouge de mon portfolio",
    topic: "Carrière",
    level: "Avancé",
    repo: "https://github.com/GoogleCloudPlatform/microservices-demo",
    mission:
      "Documenter une adaptation de laboratoire avec pipeline, observabilité et procédure de reprise, puis préparer sa présentation.",
    deliverable:
      "README, décisions, preuves, limites et présentation de cinq minutes.",
  },
];
