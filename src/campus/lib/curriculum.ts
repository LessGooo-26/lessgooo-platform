import type { Lesson } from "./model";

// Original teaching material. Estimates are exercise lengths, not advertised teaching hours.
type Topic = [
  id: string,
  title: string,
  concept: string,
  task: string,
  proof: string,
];
type Module = { name: string; level: string; source: string; topics: Topic[] };
const devops: Module[] = [
  {
    name: "02 · Réseaux & Web",
    level: "Fondations",
    source: "https://developer.mozilla.org/en-US/docs/Web/HTTP",
    topics: [
      [
        "network",
        "TCP/IP, DNS et diagnostic réseau",
        "Une adresse IP identifie une interface ; un port désigne un service. DNS transforme un nom en adresse. Une connexion peut échouer avant même que le serveur HTTP soit contacté. Diagnostiquer par couches évite de modifier au hasard le code applicatif.",
        "Dessine le trajet navigateur → DNS → serveur. Dans un laboratoire, relève une résolution DNS et les en-têtes d’une requête avec curl -I. Compare connexion refusée et délai expiré.",
        "Un schéma annoté, les sorties anonymisées et une hypothèse par type d’erreur.",
      ],
      [
        "http",
        "HTTP, TLS et reverse proxy",
        "HTTP transporte une méthode, une cible, des en-têtes et parfois un corps. Les codes 4xx signalent une demande rejetée ; les 5xx un échec serveur. TLS protège le transport et vérifie l’identité du serveur grâce aux certificats. Un reverse proxy distribue les requêtes vers les applications.",
        "Configure un proxy local devant une application de test. Observe 200, 404 et un 502 en arrêtant uniquement le service du laboratoire. Explique où terminer TLS.",
        "Configuration, trois observations et différence entre chiffrement et authentification.",
      ],
    ],
  },
  {
    name: "03 · Linux & automatisation",
    level: "Fondations",
    source: "https://www.gnu.org/software/bash/manual/",
    topics: [
      [
        "process",
        "Processus, services et journaux Linux",
        "Un processus a un identifiant, un utilisateur et des ressources. Un gestionnaire de services redémarre des applications et collecte leur état. Un journal explique souvent pourquoi un service a échoué ; une utilisation élevée de mémoire seule ne prouve pas une fuite.",
        "Sur une VM de laboratoire, compare ps, top et les journaux d’un service. Arrête puis relance ton propre service. Rédige une procédure de diagnostic.",
        "Chronologie, commandes de lecture et preuve du rétablissement.",
      ],
      [
        "bash",
        "Bash : scripts fiables et codes de sortie",
        "Un script automatise une séquence reproductible. Les variables doivent être protégées par des guillemets pour conserver les espaces. Un code de sortie non nul exprime un échec. Valider les paramètres avant toute écriture réduit les erreurs ; un mode simulation rend les opérations vérifiables.",
        "Écris un script qui vérifie trois URL de laboratoire, produit un rapport horodaté et termine en erreur si un contrôle échoue. Teste un argument absent et une URL indisponible.",
        "Script, commandes de test et résultats attendus des cas d’erreur.",
      ],
      [
        "python",
        "Python pour les opérations",
        "Python est utile pour traiter des données structurées et appeler des API. Séparer lecture, transformation et écriture rend un script testable. Les exceptions doivent expliquer un problème exploitable ; une relance sans limite peut aggraver une panne.",
        "Crée un programme qui lit un inventaire JSON, valide les champs requis et génère un rapport CSV. Ajoute un test avec JSON invalide et un fichier vide.",
        "Code sans secret, jeu de données fictif et tests.",
      ],
    ],
  },
  {
    name: "04 · Git & collaboration",
    level: "Fondations",
    source: "https://docs.github.com/en/get-started",
    topics: [
      [
        "git-team",
        "Branches, pull requests et conflits",
        "Un commit est un état identifié de l’historique. Une branche nomme une ligne de travail ; une pull request permet la discussion et les contrôles avant intégration. Résoudre un conflit demande de préserver le sens des deux changements, puis de tester le résultat.",
        "Dans ton dépôt de pratique, crée deux branches modifiant la même ligne, fusionne-les et explique ta résolution. Ouvre une pull request avec problème, solution et validation.",
        "Historique lisible, diff et résultat du test après fusion.",
      ],
      [
        "git-secrets",
        "Secrets, .gitignore et revue de code",
        "Ignorer un fichier évite de l’ajouter à l’avenir mais ne l’efface pas de l’historique. Un secret divulgué doit être révoqué. Les exemples de configuration contiennent des valeurs factices. Une revue évalue comportement, risque, lisibilité et preuves de validation.",
        "Ajoute un .env.example sans identifiants, vérifie les fichiers suivis et rédige une checklist de revue. Simule une fuite avec une chaîne explicitement factice.",
        "Checklist et procédure de révocation sans vrai identifiant.",
      ],
    ],
  },
  {
    name: "05 · Docker & conteneurs",
    level: "Intermédiaire",
    source: "https://docs.docker.com/get-started/",
    topics: [
      [
        "docker-build",
        "Dockerfile et images reproductibles",
        "Une image contient les couches nécessaires à une application ; un conteneur est son exécution isolée. Un build multi-stage sépare compilation et exécution. Un utilisateur non privilégié limite les capacités. Épingler une base aide à reproduire un build mais impose de suivre ses mises à jour.",
        "Conteneurise une petite application avec .dockerignore, build multi-stage et utilisateur non root. Compare taille et fonctionnement avec une image de départ.",
        "Dockerfile, taille des images et requête de santé réussie.",
      ],
      [
        "compose",
        "Docker Compose : réseau et persistance",
        "Compose décrit plusieurs services et leurs dépendances. Sur son réseau, les services se trouvent par leur nom. Un volume conserve les données au-delà du conteneur ; ce n’est pas une sauvegarde. Une base ne doit pas être exposée publiquement pour communiquer avec l’application.",
        "Démarre une application et une base avec un exemple Docker officiel. Persiste un enregistrement, recrée le conteneur puis restaure une sauvegarde dans un volume de test.",
        "compose.yaml, preuve de persistance et procédure de restauration.",
      ],
      [
        "registry",
        "Registres, tags et chaîne de livraison",
        "Un tag est un nom susceptible de changer, tandis qu’un digest identifie un contenu. Un registre stocke des images. La provenance relie une image à son code et à son build. Promouvoir le même artefact entre environnements réduit les différences inattendues.",
        "Construis deux versions locales, compare leurs digests et documente un plan de promotion et retour arrière. Utilise un registre de test si disponible.",
        "Table commit → image → digest et procédure de rollback.",
      ],
    ],
  },
  {
    name: "06 · CI/CD",
    level: "Intermédiaire",
    source: "https://docs.github.com/en/actions",
    topics: [
      [
        "actions",
        "GitHub Actions : tests, build et artefacts",
        "Un workflow réagit à un événement. Un job s’exécute sur un runner avec des permissions définies. Le pipeline doit échouer lorsque les tests échouent. Les artefacts servent à conserver le résultat exact du build ; les caches accélèrent les dépendances sans remplacer le build.",
        "Écris un workflow sur pull request avec installation reproductible, lint, tests et build. Introduis un test volontairement défaillant puis corrige-le.",
        "Fichier YAML et liens vers une exécution rouge puis verte.",
      ],
      [
        "jenkins",
        "Jenkins, GitLab CI et agents de build",
        "Les moteurs de CI partagent des étapes, artefacts et règles de déclenchement, mais diffèrent par leur configuration et leurs runners. Un agent exécute du code du dépôt : son isolation et ses permissions comptent. Les secrets ne doivent jamais être affichés dans les logs.",
        "Traduis un pipeline test/build en Jenkinsfile et en .gitlab-ci.yml. Compare déclencheurs, artefacts et stratégie de secrets. Exécute une variante dans ton laboratoire.",
        "Deux configurations commentées et sortie expurgée du pipeline choisi.",
      ],
      [
        "delivery",
        "Déploiement progressif et rollback",
        "Une stratégie rolling remplace progressivement les instances. Blue/green conserve deux versions et commute le trafic. Canary expose d’abord une petite part des demandes. Un retour arrière applicatif ne corrige pas forcément une migration de données incompatible.",
        "Sur une application locale, prépare deux versions. Définis un seuil d’erreur, un contrôle de santé et une procédure de retour à la version précédente.",
        "Chronologie du déploiement, critère d’arrêt et preuve du rollback.",
      ],
    ],
  },
  {
    name: "07 · AWS & architecture cloud",
    level: "Intermédiaire",
    source: "https://docs.aws.amazon.com/",
    topics: [
      [
        "aws-iam",
        "AWS : régions, IAM et responsabilité partagée",
        "Une région contient des zones de disponibilité. IAM décide quelles actions un principal peut effectuer sur quelles ressources. Le fournisseur et le client partagent les responsabilités selon le service choisi. Les rôles temporaires sont préférables aux clés permanentes dans un pipeline.",
        "Dessine une architecture sur deux zones. Rédige une politique de lecture limitée à un bucket fictif et explique pourquoi elle ne permet pas d’écrire. Aucun compte payant requis.",
        "Schéma, politique JSON fictive et analyse du moindre privilège.",
      ],
      [
        "aws-vpc",
        "VPC, sous-réseaux et groupes de sécurité",
        "Un VPC isole un réseau logique. Les tables de routage indiquent la prochaine destination ; les groupes de sécurité contrôlent les flux autorisés. Une IP publique ne remplace pas une route et un port autorisé. Les passerelles et transferts peuvent engendrer des frais.",
        "Conçois un réseau application/base, distingue sous-réseaux publics et privés et liste les seuls flux nécessaires. Commence par un schéma hors ligne.",
        "Plan d’adressage sans chevauchement, routes et matrice source/port/destination.",
      ],
      [
        "aws-compute",
        "EC2, équilibrage et autoscaling",
        "EC2 propose des machines virtuelles. Un load balancer répartit des requêtes et écarte les cibles malsaines. L’autoscaling ajoute ou retire de la capacité à partir de signaux ; il ne résout pas tous les goulots d’étranglement. Le stockage doit être traité séparément des instances.",
        "Compare une VM unique et un groupe multi-zone pour une API fictive. Simule une panne de cible dans un laboratoire local et estime les catégories de coût AWS.",
        "Schéma, résultat du test de panne et hypothèses de dimensionnement.",
      ],
      [
        "aws-storage",
        "S3, RDS et stratégie de sauvegarde",
        "S3 stocke des objets ; une base relationnelle gère des relations et transactions. Le versionnement aide à retrouver un état d’objet sans constituer à lui seul une stratégie complète de reprise. Une sauvegarde n’est utile que si sa restauration est vérifiée.",
        "Classe images, factures et commandes selon leur mode de stockage. Définis rétention, accès privé, RPO et RTO, puis restaure une base locale fictive.",
        "Choix argumentés, script et durée mesurée de restauration.",
      ],
      [
        "serverless",
        "Lambda, événements et files de messages",
        "Une fonction répond à un événement sans serveur à gérer directement. Les événements peuvent être livrés plusieurs fois : rendre le traitement idempotent empêche les doublons. Une file absorbe les pointes de charge ; une file d’échecs conserve les messages non traités.",
        "Programme localement un consommateur qui traite deux fois le même événement sans doubler son effet. Ajoute un cas invalide et un nombre de tentatives maximal.",
        "Code, clé d’idempotence et tests de doublon/échec.",
      ],
    ],
  },
  {
    name: "08 · Infrastructure as Code",
    level: "Intermédiaire",
    source: "https://developer.hashicorp.com/terraform/tutorials",
    topics: [
      [
        "terraform",
        "Terraform : plan, état et cycle de vie",
        "La configuration décrit un état souhaité ; le plan compare cet état à l’existant. L’état Terraform associe ressources et identifiants et peut contenir des informations sensibles. Un backend partagé avec verrouillage évite des modifications concurrentes incohérentes.",
        "Avec des ressources locales de pratique, exécute init, validate et plan. Lis chaque changement proposé avant apply. Explique comment gérer un état partagé et sa sauvegarde.",
        "Configuration, plan expurgé et procédure d’approbation.",
      ],
      [
        "tf-modules",
        "Modules Terraform et environnements",
        "Un module regroupe une configuration avec des entrées et sorties explicites. Séparer développement et production réduit les erreurs de cible. Une variable n’est pas un coffre de secrets. La détection de dérive compare ce qui existe à ce qui était déclaré.",
        "Transforme une configuration répétée en module. Crée deux environnements fictifs, valide leurs valeurs et rédige un scénario de dérive.",
        "Module, exemples d’utilisation et séparation documentée des états.",
      ],
      [
        "ansible",
        "Ansible : inventaires, rôles et idempotence",
        "Ansible applique des tâches à un inventaire. Un module décrit une intention comme installer un paquet ou écrire un fichier. L’idempotence signifie que répéter une tâche conserve le résultat attendu sans produire d’effets supplémentaires. Les variables sensibles nécessitent un mécanisme dédié.",
        "Configure un service dans une VM de laboratoire avec un playbook. Exécute-le deux fois et observe les changements. Extrais les tâches dans un rôle.",
        "Playbook, inventaire factice et deuxième exécution sans changement inattendu.",
      ],
    ],
  },
  {
    name: "09 · Kubernetes & GitOps",
    level: "Avancé",
    source: "https://kubernetes.io/docs/tutorials/",
    topics: [
      [
        "k8s-core",
        "Pods, Deployments, Services et namespaces",
        "Un Pod exécute un ou plusieurs conteneurs partageant réseau et volumes. Un Deployment maintient des réplicas et pilote leur remplacement. Un Service offre une adresse stable aux Pods sélectionnés par des labels. Un namespace organise les ressources sans être une frontière de sécurité suffisante seul.",
        "Sur un cluster local, déploie une application en deux réplicas et un Service. Supprime un Pod puis observe sa recréation. Compare accès Pod et Service.",
        "Manifestes, événements et preuve du maintien des réplicas.",
      ],
      [
        "k8s-health",
        "Probes, ressources et dépannage Kubernetes",
        "Readiness décide si une instance peut recevoir du trafic ; liveness indique si elle doit redémarrer. Des probes trop agressives peuvent aggraver une surcharge. Requests et limits servent au placement et aux limites de ressources. Les événements complètent les logs applicatifs.",
        "Ajoute readiness, liveness et requests/limits. Simule une mauvaise configuration de port puis diagnostique avec describe, events et logs.",
        "Diagnostic écrit, correction minimale et retour à un état sain.",
      ],
      [
        "k8s-security",
        "RBAC, Secrets, NetworkPolicy et stockage",
        "RBAC attribue des verbes sur des ressources à une identité. Un Secret encodé en base64 n’est pas chiffré par cet encodage. Les politiques réseau demandent un plugin qui les applique. Un volume persistant dissocie la durée de vie des données de celle d’un Pod.",
        "Écris un Role en lecture limitée, une NetworkPolicy et une demande de volume. Explique comment vérifier leur effet dans un cluster compatible.",
        "Manifestes sans secret réel et matrice des accès attendus/refusés.",
      ],
      [
        "helm",
        "Helm et configuration par environnement",
        "Un chart assemble des modèles et valeurs. Les valeurs spécifiques à un environnement ne doivent pas masquer ce qui sera déployé. Rendre puis valider les manifestes avant installation permet d’inspecter le résultat. Conserver une version de chart facilite le retour arrière.",
        "Crée un petit chart avec image, replicas et ressources configurables. Rends deux variantes et compare les manifestes.",
        "Chart, sorties de rendu et justification des valeurs par environnement.",
      ],
      [
        "gitops",
        "Argo CD et réconciliation GitOps",
        "GitOps utilise Git comme état souhaité et un contrôleur pour rapprocher le cluster de cet état. Une dérive devient observable. Le dépôt peut être relu et audité, mais les accès du contrôleur doivent rester limités. La suppression automatique exige des garde-fous.",
        "Sur un cluster local, synchronise une application de démonstration, modifie son nombre de réplicas dans Git et observe la réconciliation.",
        "Commit, états avant/après et procédure pour suspendre une synchronisation.",
      ],
    ],
  },
  {
    name: "10 · Observabilité & SRE",
    level: "Avancé",
    source: "https://opentelemetry.io/docs/",
    topics: [
      [
        "metrics",
        "Prometheus, Grafana et signaux utiles",
        "Les métriques résument des mesures dans le temps. Les compteurs augmentent, les jauges montent ou descendent et les histogrammes décrivent une distribution. Une forte cardinalité multiplie les séries et le coût. Un tableau utile répond à une question opérationnelle précise.",
        "Instrumente taux de requêtes, erreurs et latence d’une API de laboratoire. Affiche-les dans Grafana et déclenche une panne contrôlée.",
        "Tableau exporté, requêtes et interprétation des signaux.",
      ],
      [
        "traces",
        "Logs structurés et traces distribuées",
        "Les logs racontent des événements ; les traces relient les étapes d’une requête entre services. Un identifiant de corrélation aide à suivre le même problème. L’échantillonnage limite le volume. Les données personnelles et secrets doivent être exclus des journaux.",
        "À partir de la démo OpenTelemetry, suis une requête lente sur plusieurs services. Rédige une hypothèse et distingue preuve de corrélation et preuve de cause.",
        "Trace anonymisée, chronologie et prochain test discriminant.",
      ],
      [
        "slo",
        "SLI, SLO et budgets d’erreur",
        "Un SLI mesure une expérience, par exemple la part de requêtes réussies. Un SLO fixe une cible sur une fenêtre. Le budget d’erreur correspond à la marge d’échec autorisée par cet objectif. Une alerte doit demander une action utile plutôt que signaler chaque variation.",
        "Définis un SLI et un SLO pour une API fictive. Calcule le budget d’erreur et rédige une alerte accompagnée d’un runbook.",
        "Formule, fenêtre de mesure, calcul et action attendue.",
      ],
      [
        "incident",
        "Incidents, postmortems et reprise",
        "Pendant un incident, priorité à l’impact et au rétablissement. Une chronologie sépare observations et hypothèses. Un postmortem cherche les facteurs du système et des actions vérifiables, sans accuser une personne. Un plan de reprise doit être exercé.",
        "Organise une panne locale limitée, restaure le service et écris un postmortem avec impact fictif, chronologie et trois actions suivables.",
        "Runbook testé, durée réelle et actions avec critère de réussite.",
      ],
    ],
  },
  {
    name: "11 · DevSecOps & FinOps",
    level: "Avancé",
    source: "https://owasp.org/www-project-devsecops-guideline/",
    topics: [
      [
        "supply-chain",
        "SBOM, vulnérabilités et provenance",
        "Un SBOM inventorie les composants. Un scanner repère des vulnérabilités connues, sans prouver à lui seul la sécurité du produit. Prioriser demande de considérer exposition, exploitabilité et correctif. La signature et la provenance renseignent l’origine d’un artefact.",
        "Analyse une image de pratique, exporte un SBOM et compare avant/après mise à jour. Documente une vulnérabilité et sa décision de traitement.",
        "Rapport, diff de dépendances et justification sans masquer les résultats.",
      ],
      [
        "cloud-secrets",
        "Secrets, OIDC et moindre privilège",
        "Un secret ne doit pas être versionné ni transmis au navigateur. OIDC permet à un pipeline d’obtenir une identité temporaire selon des conditions vérifiées. Une politique trop large annule ce bénéfice. La rotation et l’audit font partie du cycle de vie des identifiants.",
        "Dessine le flux pipeline → identité temporaire → ressource. Restreins un exemple de confiance au dépôt et à la branche fictifs choisis.",
        "Diagramme, politique fictive et test négatif prévu.",
      ],
      [
        "finops",
        "Coûts cloud, budgets et nettoyage",
        "Le coût dépend du temps, des ressources, du stockage et des transferts. Une alerte budgétaire avertit mais ne garantit pas un arrêt automatique. Étiqueter les ressources aide à attribuer les coûts. Un laboratoire doit inclure une liste de nettoyage et une vérification finale.",
        "Compare deux architectures sur un calculateur officiel, en indiquant région et hypothèses. Écris une procédure de nettoyage qui ne cible que les ressources du laboratoire.",
        "Estimation datée, hypothèses et checklist de vérification de suppression.",
      ],
      [
        "platform",
        "Platform engineering, Azure, GCP et MLOps",
        "Une plateforme interne propose des chemins simples et contrôlés pour livrer. Les concepts réseau, identité, calcul et stockage se retrouvent chez différents clouds mais leurs règles diffèrent. MLOps ajoute jeux de données, modèles, évaluations et dérive aux problèmes de livraison.",
        "Compare IAM, compute et stockage entre AWS, Azure et GCP. Dessine un pipeline de modèle avec validation des données, évaluation et rollback, sans entraîner de modèle coûteux.",
        "Table de correspondance sourcée et architecture avec points de contrôle.",
      ],
    ],
  },
];
const kids: Module[] = [
  {
    name: "00 · Dans mon ordinateur",
    level: "Découverte accompagnée",
    source: "https://edu.gcfglobal.org/en/computerbasics/",
    topics: [
      [
        "hardware",
        "Explorer les composants de l’unité centrale",
        "Le boîtier protège les composants. La carte mère les relie. Le processeur exécute les instructions, la mémoire RAM garde temporairement le travail et le SSD conserve les fichiers. L’alimentation fournit l’énergie. On découvre sur une image ou un appareil débranché avec un adulte ; on n’ouvre jamais une alimentation.",
        "Dessine une unité centrale et place carte mère, processeur, RAM, SSD, alimentation et ventilateur. Associe chaque pièce à son rôle.",
        "Six composants légendés et une explication avec tes mots.",
      ],
      [
        "peripherals",
        "Entrées, sorties et périphériques",
        "Le clavier et la souris envoient des informations à l’ordinateur. L’écran et les haut-parleurs nous en restituent. Certains appareils, comme un écran tactile, font les deux. Les ports relient les appareils avec différents types de câbles.",
        "Classe huit objets en entrée, sortie ou les deux. Repère USB, audio et écran sur une photo, sans forcer un branchement.",
        "Tableau illustré et explication d’un appareil qui fait les deux.",
      ],
      [
        "os-files",
        "Système, fichiers et dossiers",
        "Le système d’exploitation fait travailler les composants et les applications ensemble. Un fichier contient une information ; un dossier organise les fichiers. Une extension donne un indice sur leur format. Une copie de sauvegarde protège contre une perte accidentelle.",
        "Crée un dossier Mon premier projet avec Images et Notes. Écris une note, renomme-la et copie le dossier vers un emplacement de sauvegarde autorisé.",
        "Capture sans informations privées et chemin permettant de retrouver la copie.",
      ],
      [
        "binary",
        "Bits, images et logique",
        "Un bit représente deux états, souvent écrits 0 et 1. Plusieurs bits peuvent représenter des nombres, du texte ou des couleurs. Une image en pixels est une grille de points. Une condition choisit une action selon une réponse vraie ou fausse.",
        "Dessine une image 8 × 8 en noir et blanc et écris ses lignes avec des 0 et des 1. Fais décoder ton image par un camarade.",
        "Grille, code de 64 bits et image reconstruite.",
      ],
    ],
  },
  {
    name: "02 · Internet & création",
    level: "Exploration",
    source: "https://www.raspberrypi.org/learn/",
    topics: [
      [
        "web-safety",
        "Internet, navigateur et sécurité numérique",
        "Internet relie des réseaux ; le Web est un service qui utilise Internet. Un navigateur demande des pages à un serveur. Une adresse peut imiter un site connu. Pour un lien inconnu, un téléchargement ou une demande d’information personnelle, on demande l’aide d’un adulte.",
        "Dessine le voyage d’une page du navigateur au serveur. Compare deux adresses fictives et invente une affiche de trois réflexes de sécurité.",
        "Schéma et affiche sans mot de passe ni information personnelle.",
      ],
      [
        "scratch-game",
        "Scratch : construire un jeu et le tester",
        "Un programme suit des instructions. Un événement lance une action, une boucle répète et une variable mémorise une valeur comme le score. Tester signifie essayer aussi ce qui pourrait mal se passer, pas seulement gagner une partie.",
        "Crée un jeu Scratch avec score, condition de victoire et bouton de redémarrage. Demande à un camarade de trouver un bug puis corrige-le.",
        "Fichier SB3, règles du jeu et un bug expliqué.",
      ],
      [
        "kids-python",
        "Mes premiers programmes Python",
        "Une variable donne un nom à une valeur. Une condition permet de choisir une réponse et une boucle de répéter un travail. Un programme peut rencontrer une entrée inattendue : expliquer son erreur aide à le corriger.",
        "Crée un quiz de trois questions avec score. Teste une bonne réponse, une mauvaise et une réponse vide. Utilise uniquement des prénoms fictifs.",
        "Programme, trois essais et explication du calcul du score.",
      ],
      [
        "kids-web",
        "Créer ma première page Web",
        "HTML structure le contenu et CSS choisit son apparence. Les titres décrivent la page ; un lien conduit à une autre ressource. Une bonne page reste lisible sur petit écran et ses images ont une description. Publier demande de vérifier ce que tout le monde pourra voir.",
        "Crée une page sur un animal imaginaire avec titre, trois paragraphes, image dessinée et lien. Vérifie le contraste et la largeur sur téléphone.",
        "HTML/CSS, description de l’image et capture du test mobile.",
      ],
      [
        "kids-git",
        "Versions, collaboration et mini-projet",
        "Garder des versions aide à voir comment un projet évolue. On explique ce qui change pour que les autres puissent comprendre. Partager un fichier ne signifie pas partager des identifiants. La présentation raconte problème, solution et apprentissage.",
        "Conserve trois versions de ta page et écris ce qui change à chaque étape. Prépare trois diapositives dans le carnet du campus.",
        "Trois versions et une présentation avec une difficulté surmontée.",
      ],
    ],
  },
  {
    name: "03 · Du serveur au cloud AWS",
    level: "Découverte encadrée",
    source: "https://aws.amazon.com/what-is-cloud-computing/",
    topics: [
      [
        "kids-server",
        "Mon ordinateur devient un serveur",
        "Un serveur répond aux demandes d’autres programmes. Client et serveur sont des rôles, pas forcément deux types de machines. Dans un atelier, on peut ouvrir un site uniquement sur son ordinateur. Le rendre visible sur Internet est une autre décision.",
        "Avec le formateur, ouvre une page locale et dessine client, requête, serveur et réponse. Arrête le serveur puis observe le résultat.",
        "Schéma et différence entre page ouverte avec et sans serveur.",
      ],
      [
        "kids-cloud",
        "Le cloud et les centres de données",
        "Le cloud utilise des ordinateurs dans des centres de données. On loue des services au lieu de posséder toutes les machines. Un service peut consommer de l’électricité et coûter de l’argent même si personne ne regarde la page. Les fichiers privés doivent rester privés.",
        "Construis une maquette papier reliant maison, Internet et centre de données. Compare trois choses à garder sur ton ordinateur ou dans un espace cloud privé.",
        "Maquette et trois choix expliqués avec l’aide d’un adulte.",
      ],
      [
        "kids-aws",
        "Découvrir AWS : calcul, stockage et accès",
        "AWS propose différents services. EC2 représente des machines virtuelles et S3 des objets stockés. IAM gère les droits. Pour cette découverte, le formateur montre des schémas ou un environnement encadré ; l’enfant ne crée pas de compte et ne saisit pas de carte bancaire.",
        "Associe des cartes fictives à EC2, S3 et IAM. Dessine un petit site, ses images et les personnes autorisées à les modifier. Aucun déploiement nécessaire.",
        "Schéma et distinction entre consulter, modifier et administrer.",
      ],
      [
        "kids-cloud-project",
        "Mission finale : de la pièce au cloud",
        "Un projet complet relie composants, système, programme, réseau et service cloud. Savoir expliquer ces liens montre ce que tu as compris. Une démonstration peut rester entièrement locale. Finir comprend aussi sauvegarder et ranger son travail.",
        "Présente ton site ou jeu en cinq étapes : matériel, fichiers, code, réseau et hébergement imaginé sur AWS. Ajoute ce que tu veux apprendre ensuite.",
        "Projet téléversé, cinq diapositives et retour du formateur.",
      ],
    ],
  },
];

export const curriculum: Lesson[] = [
  ...devops.flatMap((m) =>
    m.topics.map(([id, title, explanation, task, criteria]) => ({
      id: `dev-${id}`,
      title,
      explanation,
      task,
      criteria,
      module: m.name,
      resource: m.source,
      level: m.level,
      minutes: 60,
      track: "devops" as const,
    })),
  ),
  ...kids.flatMap((m) =>
    m.topics.map(([id, title, explanation, task, criteria]) => ({
      id: id.startsWith("kids-") ? id : `kids-${id}`,
      title,
      explanation,
      task,
      criteria,
      module: m.name,
      resource: m.source,
      level: m.level,
      minutes: 35,
      track: "kids" as const,
    })),
  ),
];

export const interviewQuestions = [
  [
    "Linux",
    "Le disque est plein mais du semble indiquer le contraire. Comment enquêter ?",
    "Compare df et du, vérifie les montages et fichiers supprimés encore ouverts. Identifie le processus avant toute action, puis vérifie le retour à la normale.",
  ],
  [
    "Réseau",
    "Le navigateur affiche un 502. Que vérifies-tu en premier ?",
    "Situe le proxy et son upstream. Contrôle DNS, connexion, port, santé de la cible et logs corrélés. Propose un test pour chaque hypothèse.",
  ],
  [
    "Docker",
    "Quelle différence entre image, conteneur et volume ?",
    "Explique artefact, processus et données persistantes. Montre un exemple de recréation sans perte et distingue volume de sauvegarde.",
  ],
  [
    "CI/CD",
    "Comment rends-tu un pipeline sûr et reproductible ?",
    "Versionne les dépendances et artefacts, limite les permissions, isole les runners, vérifie les tests et évite les secrets permanents.",
  ],
  [
    "AWS",
    "Comment héberger une API disponible sur plusieurs zones ?",
    "Décris équilibrage, instances sans état, stockage approprié, santé, observabilité et reprise. Discute explicitement le coût et les compromis.",
  ],
  [
    "Terraform",
    "Pourquoi protéger et verrouiller l’état ?",
    "Il relie les objets distants à la configuration et peut contenir des secrets. Le verrou évite des écritures concurrentes ; sauvegarde et droits restent nécessaires.",
  ],
  [
    "Kubernetes",
    "Un Pod est en CrashLoopBackOff : ton raisonnement ?",
    "Regarde événements, logs et logs précédents, commande de démarrage, configuration, ressources et probes. Ne redémarre pas sans comprendre.",
  ],
  [
    "SRE",
    "Comment choisir un SLO utile ?",
    "Pars de l’expérience utilisateur, définis un SLI et sa fenêtre, justifie la cible et relie le budget d’erreur aux décisions de livraison.",
  ],
  [
    "Sécurité",
    "Une clé a été poussée dans Git. Que fais-tu ?",
    "Révoque-la, analyse les usages, remplace-la et traite l’historique avec coordination. Un simple ajout à .gitignore ne suffit pas.",
  ],
  [
    "Comportemental",
    "Raconte un incident ou un désaccord technique.",
    "Utilise situation, tâche, actions et résultat. Sépare ton rôle de celui de l’équipe, donne des preuves et explique ce que tu as appris.",
  ],
  [
    "Candidature",
    "Comment adapter ton CV à une offre sans exagérer ?",
    "Relie chaque exigence à une expérience vérifiable ou un projet. Décris les résultats réels et précise les compétences encore en apprentissage.",
  ],
  [
    "Architecture",
    "Quand éviter Kubernetes ?",
    "Compare complexité opérationnelle, taille de l’équipe, coûts et besoins. Une VM, un PaaS ou un service managé peut suffire selon les contraintes.",
  ],
];
