// Scope: docs/programs/course-service-catalog.md. Preparation guidance is not an admissions rule.
export type CourseText = { en: string; fr: string };
const text = (en: string, fr: string): CourseText => ({ en, fr });
export const courseIds = [
  "devops",
  "cloud",
  "cybersecurity",
  "linux",
  "ai-web",
  "secretariat",
  "ai-infographics",
  "ai-design",
  "ai-automation",
] as const;
export type CourseId = (typeof courseIds)[number];
export type CourseInquiry = {
  service: "training" | "company";
  course: CourseId;
};
export type CourseArea = {
  id: CourseId;
  title: CourseText;
  description: CourseText;
  audience: CourseText;
  role: CourseText;
  prerequisites: CourseText[];
  phases: { title: CourseText; practice: CourseText }[];
  project: CourseText;
  evidence: CourseText[];
  company: CourseText;
  deliverables: CourseText[];
  companyNeeds: CourseText;
  brief: { id: string; label: CourseText; hint: CourseText }[];
  lessons: string[];
  documentation: { label: string; url: string };
};
export const startingChecklist = [
  text(
    "A laptop or desktop, keyboard, current browser and storage for your exercises. A phone helps you read, but is not enough for practical work.",
    "Un ordinateur, un clavier, un navigateur à jour et de l’espace pour vos exercices. Un téléphone permet de lire, mais ne suffit pas pour la pratique.",
  ),
  text(
    "Be able to type, open a browser, create folders, save files and send an email. If these are new, begin with guided computer practice.",
    "Savoir saisir du texte, ouvrir un navigateur, créer des dossiers, enregistrer des fichiers et envoyer un email. Sinon, commencer par une prise en main accompagnée.",
  ),
  text(
    "Internet for documentation and downloads, permission to install tools, and a separate practice folder with fictional data.",
    "Internet pour la documentation et les téléchargements, l’autorisation d’installer les outils et un dossier d’exercice séparé contenant des données fictives.",
  ),
  text(
    "You can start reading and planning without paid accounts. Check software requirements before installing; cloud and AI usage may cost money. Account setup comes when needed.",
    "La lecture et la préparation peuvent commencer sans compte payant. Vérifiez les exigences des logiciels avant installation ; le cloud et l’IA peuvent entraîner des frais. Les comptes sont créés au moment utile.",
  ),
];
export const courseCatalog: CourseArea[] = [
  {
    id: "devops",
    title: text("DevOps", "DevOps"),
    description: text(
      "Help the people who build an application and those who run it work together. Automate checks and releases so changes reach users reliably.",
      "Faire travailler ensemble les personnes qui créent une application et celles qui la font fonctionner. Automatiser les vérifications et mises en ligne pour livrer des changements fiables.",
    ),
    audience: text(
      "Aspiring DevOps practitioners, developers and IT support teams.",
      "Futurs professionnels DevOps, développeurs et équipes de support informatique.",
    ),
    role: text(
      "Connect development, testing, deployment and monitoring. For example, help a team publish a website update and recover if it fails.",
      "Relier développement, tests, déploiement et surveillance. Par exemple, aider une équipe à publier une mise à jour et à rétablir le site en cas d’échec.",
    ),
    prerequisites: [
      text(
        "Start with basic computer use. Before delivery labs, learn Linux commands, Git and what a server and an HTTP request are. Advanced coding is not needed to begin.",
        "Commencez avec les bases informatiques. Avant les exercices de livraison, apprenez les commandes Linux, Git et les notions de serveur et de requête HTTP. Aucun niveau avancé en code n’est requis pour débuter.",
      ),
      text(
        "A terminal, code editor and local container runtime. Check its memory, storage and virtualization requirements before installation.",
        "Un terminal, un éditeur de code et un moteur de conteneurs local. Vérifiez ses besoins en mémoire, stockage et virtualisation avant installation.",
      ),
      text(
        "A sample web project for local practice; a GitHub account for the online pipeline exercise. Keep credentials outside the code.",
        "Un projet web d’exemple pour la pratique locale ; un compte GitHub pour l’exercice de chaîne automatisée en ligne. Gardez les identifiants hors du code.",
      ),
    ],
    phases: [
      {
        title: text("Understand delivery", "Comprendre la livraison"),
        practice: text(
          "Draw how a website change moves from code to tests, release and user feedback.",
          "Dessinez le trajet d’un changement : code, tests, publication et retour utilisateur.",
        ),
      },
      {
        title: text("Version and package", "Versionner et préparer"),
        practice: text(
          "Save a sample page in Git, change its title and package it in a local container.",
          "Enregistrez une page dans Git, modifiez son titre et préparez-la dans un conteneur local.",
        ),
      },
      {
        title: text("Automate checks", "Automatiser les contrôles"),
        practice: text(
          "Create a workflow that checks before building. Break a check and explain why delivery must stop.",
          "Créez un processus qui vérifie avant de compiler. Faites échouer un contrôle et expliquez pourquoi la livraison doit s’arrêter.",
        ),
      },
      {
        title: text("Release and recover", "Publier et rétablir"),
        practice: text(
          "Deploy locally, check the page responds and restore the previous version. Record each recovery step.",
          "Déployez localement, vérifiez la réponse de la page et rétablissez la version précédente. Notez les étapes de reprise.",
        ),
      },
    ],
    project: text(
      "Build a small website delivery pipeline with a test gate and a rollback procedure.",
      "Construire une chaîne de livraison d’un petit site avec un contrôle bloquant et une procédure de retour arrière.",
    ),
    evidence: [
      text(
        "A repeatable build from a readable repository.",
        "Une compilation reproductible depuis un dépôt lisible.",
      ),
      text(
        "One passing check, one failing check and a demonstrated rollback.",
        "Un contrôle réussi, un contrôle échoué et un retour arrière démontré.",
      ),
    ],
    company: text(
      "We help teams make software releases repeatable, with automated checks, deployment steps and a recovery plan.",
      "Nous aidons les équipes à rendre leurs livraisons reproductibles avec des contrôles automatisés, des étapes de déploiement et un plan de reprise.",
    ),
    deliverables: [
      text(
        "Delivery review and a pilot pipeline.",
        "Revue de la livraison et chaîne pilote.",
      ),
      text(
        "Release checklist and team handover.",
        "Liste de contrôle et transmission à l’équipe.",
      ),
    ],
    companyNeeds: text(
      "Prepare the application’s purpose, current release steps, test environments and release approver. Access is arranged securely after scoping.",
      "Préparez l’objectif de l’application, les étapes actuelles, les environnements de test et le responsable des validations. Les accès seront organisés après cadrage.",
    ),
    brief: [
      {
        id: "delivery",
        label: text(
          "How do you release your application today?",
          "Comment livrez-vous votre application aujourd’hui ?",
        ),
        hint: text(
          "Describe manual steps, testing, hosting and recurring failures. No repository secrets.",
          "Décrivez les étapes manuelles, tests, hébergement et échecs récurrents. Aucun secret du dépôt.",
        ),
      },
      {
        id: "releaseGoal",
        label: text(
          "What would make releases more reliable?",
          "Qu’est-ce qui rendrait les livraisons plus fiables ?",
        ),
        hint: text(
          "For example: required tests, approval before production or a recovery procedure.",
          "Exemples : tests obligatoires, validation avant production ou procédure de reprise.",
        ),
      },
    ],
    lessons: ["linux-1", "dev-docker-build", "dev-actions", "dev-delivery"],
    documentation: {
      label: "Docker",
      url: "https://docs.docker.com/get-started/",
    },
  },
  {
    id: "cloud",
    title: text("Cloud computing", "Cloud"),
    description: text(
      "Use computing power and storage over the internet instead of owning every server. Understand where applications live, who can access them and how to control costs.",
      "Utiliser de la puissance informatique et du stockage sur internet sans posséder chaque serveur. Comprendre où fonctionnent les applications, qui y accède et comment maîtriser les coûts.",
    ),
    audience: text(
      "Cloud beginners, IT teams and people planning an online application.",
      "Débutants du cloud, équipes informatiques et porteurs d’applications en ligne.",
    ),
    role: text(
      "Connect hosting, storage, networks and access controls. A real use case is hosting a business website with backups and cost monitoring.",
      "Relier hébergement, stockage, réseaux et accès. Exemple : héberger un site d’entreprise avec sauvegardes et suivi des coûts.",
    ),
    prerequisites: [
      text(
        "No cloud experience is needed for the introduction. Learn what files, servers, networks and databases do before deployment practice.",
        "Aucune expérience du cloud n’est nécessaire pour l’introduction. Découvrez le rôle des fichiers, serveurs, réseaux et bases de données avant de déployer.",
      ),
      text(
        "A browser and drawing tool for architecture exercises. Practise Linux and networking basics before managing virtual servers.",
        "Un navigateur et un outil de dessin pour les exercices d’architecture. Travaillez les bases Linux et réseau avant d’administrer des serveurs virtuels.",
      ),
      text(
        "Planning needs no cloud account. Live labs need an authorized test account, multi-factor authentication, a budget and a cleanup plan; resources may be billed.",
        "La préparation ne nécessite aucun compte cloud. Les manipulations en ligne demandent un compte de test autorisé, une authentification renforcée, un budget et un plan de suppression ; les ressources peuvent être facturées.",
      ),
    ],
    phases: [
      {
        title: text("Choose the building blocks", "Choisir les composants"),
        practice: text(
          "List the computing, storage and database needs of a fictional shop. Explain each choice simply.",
          "Listez les besoins en calcul, stockage et base de données d’une boutique fictive. Expliquez chaque choix simplement.",
        ),
      },
      {
        title: text("Design access", "Concevoir les accès"),
        practice: text(
          "Draw public and private areas. Give fictional team members only the permissions their jobs need.",
          "Dessinez les zones publiques et privées. Donnez aux membres fictifs uniquement les droits utiles à leur travail.",
        ),
      },
      {
        title: text("Plan deployment", "Préparer le déploiement"),
        practice: text(
          "Compare local and cloud hosting. List resources, usage assumptions and removal steps before creating anything billable.",
          "Comparez hébergement local et cloud. Listez ressources, hypothèses d’usage et étapes de suppression avant toute création facturable.",
        ),
      },
      {
        title: text("Operate and protect", "Exploiter et protéger"),
        practice: text(
          "Write a backup and cost-review checklist. Restore a sample file from a local backup.",
          "Rédigez une liste de sauvegarde et de suivi des coûts. Restaurez un fichier d’exemple depuis une copie locale.",
        ),
      },
    ],
    project: text(
      "Design a small business hosting plan with access, backup, budget and teardown.",
      "Concevoir un plan d’hébergement avec accès, sauvegarde, budget et suppression des ressources.",
    ),
    evidence: [
      text(
        "A diagram explaining every connection and a resource list.",
        "Un schéma expliquant chaque connexion et une liste des ressources.",
      ),
      text(
        "Cost assumptions, a tested restoration and a cleanup checklist.",
        "Des hypothèses de coût, une restauration testée et une liste de nettoyage.",
      ),
    ],
    company: text(
      "We help companies plan cloud hosting, migrations and operation around their access, reliability and budget needs.",
      "Nous aidons les entreprises à préparer hébergement cloud, migrations et exploitation selon leurs besoins d’accès, de fiabilité et de budget.",
    ),
    deliverables: [
      text(
        "Architecture proposal and migration sequence.",
        "Proposition d’architecture et étapes de migration.",
      ),
      text(
        "Access, backup and cost-monitoring recommendations.",
        "Recommandations d’accès, de sauvegarde et de suivi des coûts.",
      ),
    ],
    companyNeeds: text(
      "Prepare an application inventory, current hosting, data-location constraints and budget expectations.",
      "Préparez l’inventaire des applications, l’hébergement actuel, les contraintes de localisation des données et le budget envisagé.",
    ),
    brief: [
      {
        id: "hosting",
        label: text(
          "What should run in the cloud?",
          "Que souhaitez-vous faire fonctionner dans le cloud ?",
        ),
        hint: text(
          "List applications, approximate data sizes, current hosting and any preferred provider.",
          "Listez applications, volumes approximatifs, hébergement actuel et fournisseur souhaité, le cas échéant.",
        ),
      },
      {
        id: "constraints",
        label: text(
          "Which operating constraints matter?",
          "Quelles contraintes d’exploitation sont importantes ?",
        ),
        hint: text(
          "Describe budget, data location, acceptable interruptions and backup needs.",
          "Décrivez budget, localisation des données, interruptions acceptables et besoins de sauvegarde.",
        ),
      },
    ],
    lessons: ["dev-network", "dev-aws-iam", "dev-aws-vpc", "dev-aws-storage"],
    documentation: {
      label: "AWS",
      url: "https://docs.aws.amazon.com/whitepapers/latest/aws-overview/introduction.html",
    },
  },
  {
    id: "cybersecurity",
    title: text("Cybersecurity", "Cybersécurité"),
    description: text(
      "Protect accounts, devices and information from misuse. Recognise common risks, reduce them and respond methodically when something goes wrong.",
      "Protéger les comptes, appareils et informations contre les usages malveillants. Reconnaître les risques courants, les réduire et réagir avec méthode en cas de problème.",
    ),
    audience: text(
      "Security beginners and teams responsible for everyday digital safety.",
      "Débutants en sécurité et équipes responsables de la protection numérique au quotidien.",
    ),
    role: text(
      "Identify weaknesses, improve protection and document incidents. For example, protect email accounts and help a team respond to a suspicious message.",
      "Repérer les faiblesses, améliorer la protection et documenter les incidents. Par exemple, protéger les comptes email et aider une équipe face à un message suspect.",
    ),
    prerequisites: [
      text(
        "Start with browser and email skills. Learn basic networking, operating systems and permissions before technical labs; no hacking experience is expected.",
        "Commencez avec le navigateur et l’email. Apprenez les bases des réseaux, systèmes et permissions avant les exercices techniques ; aucune expérience du piratage n’est attendue.",
      ),
      text(
        "Use fictional examples and an isolated local lab with authorized tools. Keep intentionally vulnerable applications off public networks.",
        "Utilisez des exemples fictifs et un laboratoire local isolé avec des outils autorisés. Ne publiez pas d’applications volontairement vulnérables sur internet.",
      ),
      text(
        "Only test systems you own or are explicitly authorized to test. Use test accounts and remove personal data from reports.",
        "Testez uniquement vos systèmes ou ceux pour lesquels vous avez une autorisation explicite. Utilisez des comptes de test et retirez les données personnelles des rapports.",
      ),
    ],
    phases: [
      {
        title: text("Recognise risks", "Reconnaître les risques"),
        practice: text(
          "Review a fictional suspicious email. Mark the unusual sender, request and link without opening it.",
          "Examinez un email suspect fictif. Repérez l’expéditeur, la demande et le lien inhabituels sans ouvrir ce dernier.",
        ),
      },
      {
        title: text("Strengthen protection", "Renforcer la protection"),
        practice: text(
          "Make a checklist for unique passwords, multi-factor authentication, updates and recovery options.",
          "Créez une liste de contrôle : mots de passe uniques, authentification renforcée, mises à jour et récupération.",
        ),
      },
      {
        title: text("Investigate safely", "Examiner sans risque"),
        practice: text(
          "Read sample login logs. Identify an unusual event and list the evidence needed before drawing a conclusion.",
          "Lisez des journaux de connexion d’exemple. Repérez un événement inhabituel et listez les preuves nécessaires avant de conclure.",
        ),
      },
      {
        title: text("Respond and report", "Réagir et documenter"),
        practice: text(
          "Plan a response to a fictional compromised account: report, limit access, preserve evidence and restore.",
          "Préparez la réponse à un compte fictif compromis : signaler, limiter les accès, conserver les preuves et rétablir.",
        ),
      },
    ],
    project: text(
      "Prepare a small-office security review and incident playbook using fictional systems.",
      "Préparer une revue de sécurité d’un petit bureau et un guide d’incident sur des systèmes fictifs.",
    ),
    evidence: [
      text(
        "Risks ranked with reasons and practical protections.",
        "Des risques classés, justifiés et associés à des protections concrètes.",
      ),
      text(
        "Evidence separated from assumptions and a clear response checklist.",
        "Des preuves distinguées des hypothèses et une procédure de réponse claire.",
      ),
    ],
    company: text(
      "We help teams understand security risks, improve everyday protection and prepare response procedures within an agreed scope.",
      "Nous aidons les équipes à comprendre leurs risques, renforcer leur protection quotidienne et préparer des procédures de réponse dans un périmètre convenu.",
    ),
    deliverables: [
      text(
        "A scoped security review and prioritised improvement plan.",
        "Une revue de sécurité cadrée et un plan d’amélioration priorisé.",
      ),
      text(
        "Awareness materials and incident procedures.",
        "Des supports de sensibilisation et des procédures d’incident.",
      ),
    ],
    companyNeeds: text(
      "Identify the authorized sponsor, systems, permitted activities and existing policies. Keep credentials and private incident records out of this form.",
      "Identifiez le responsable autorisant la mission, les systèmes, les activités permises et les règles existantes. N’incluez ni identifiants ni dossiers d’incident privés dans ce formulaire.",
    ),
    brief: [
      {
        id: "securityScope",
        label: text(
          "What needs protection, and who authorizes the work?",
          "Que faut-il protéger et qui autorise la mission ?",
        ),
        hint: text(
          "Describe accounts, devices or applications and the responsible team. Testing needs an agreed, authorized scope.",
          "Décrivez comptes, appareils ou applications et équipe responsable. Tout test nécessite un périmètre convenu et autorisé.",
        ),
      },
      {
        id: "securityGoal",
        label: text(
          "Which concern should we address first?",
          "Quel sujet faut-il traiter en premier ?",
        ),
        hint: text(
          "For example: awareness, account protection, updates, backups or incident procedures. Avoid confidential details.",
          "Exemples : sensibilisation, protection des comptes, mises à jour, sauvegardes ou procédures d’incident. Évitez les détails confidentiels.",
        ),
      },
    ],
    lessons: [
      "dev-network",
      "dev-git-secrets",
      "dev-cloud-secrets",
      "dev-incident",
    ],
    documentation: {
      label: "OWASP WebGoat",
      url: "https://owasp.org/projects/webgoat",
    },
  },

  {
    id: "linux",
    title: text("Linux system administration", "Administration système Linux"),
    description: text(
      "Look after the operating system that runs many servers. Manage files, users, software and services, and discover why something has stopped working.",
      "Entretenir le système d’exploitation qui fait fonctionner de nombreux serveurs. Gérer les fichiers, utilisateurs, logiciels et services, puis comprendre pourquoi un problème survient.",
    ),
    audience: text(
      "Beginners exploring system administration, IT support or a foundation for DevOps and cloud.",
      "Débutants découvrant l’administration système, le support informatique ou les bases du DevOps et du cloud.",
    ),
    role: text(
      "Keep systems usable, updated and recoverable. A common task is restoring a stopped web service after checking its configuration and logs.",
      "Maintenir des systèmes utilisables, à jour et récupérables. Exemple : rétablir un service web arrêté après avoir vérifié sa configuration et ses journaux.",
    ),
    prerequisites: [
      text(
        "Know how to use folders and a keyboard. No terminal experience is required at the start; commands are introduced progressively.",
        "Sachez utiliser les dossiers et le clavier. Aucune expérience du terminal n’est requise au départ ; les commandes sont introduites progressivement.",
      ),
      text(
        "A practice Linux system, virtual machine or WSL where appropriate. Check hardware and storage requirements and back up your everyday system before installation.",
        "Un système Linux de test, une machine virtuelle ou WSL si adapté. Vérifiez les exigences matérielles et sauvegardez votre système habituel avant installation.",
      ),
      text(
        "A separate test account with administrator rights only inside the lab. Internet is needed to download packages; no cloud account is required.",
        "Un compte de test séparé avec des droits d’administration limités au laboratoire. Internet est nécessaire pour télécharger les paquets ; aucun compte cloud n’est requis.",
      ),
    ],
    phases: [
      {
        title: text("Find your way around", "Se repérer"),
        practice: text(
          "Open a terminal, locate your home folder and create a practice directory. List its contents and explain the path.",
          "Ouvrez un terminal, repérez votre dossier personnel et créez un dossier d’exercice. Listez son contenu et expliquez le chemin.",
        ),
      },
      {
        title: text("Manage access", "Gérer les accès"),
        practice: text(
          "Compare two sample files’ owners and permissions. Explain who should read or edit them before changing anything.",
          "Comparez les propriétaires et permissions de deux fichiers. Expliquez qui devrait les lire ou les modifier avant tout changement.",
        ),
      },
      {
        title: text("Troubleshoot services", "Diagnostiquer les services"),
        practice: text(
          "Inspect a sample service’s status and logs. Record the error, proposed fix and the result of your next check.",
          "Examinez l’état et les journaux d’un service. Notez l’erreur, la correction proposée et le résultat du contrôle suivant.",
        ),
      },
      {
        title: text("Back up and automate", "Sauvegarder et automatiser"),
        practice: text(
          "Back up the practice folder, restore it elsewhere and compare the files. Write a script that reports disk space.",
          "Sauvegardez le dossier d’exercice, restaurez-le ailleurs et comparez les fichiers. Écrivez un script qui affiche l’espace disque.",
        ),
      },
    ],
    project: text(
      "Operate a local Linux test server and write a guide another learner can use to check and restore it.",
      "Administrer un serveur Linux local de test et rédiger un guide pour qu’un autre apprenant puisse le vérifier et le restaurer.",
    ),
    evidence: [
      text(
        "Explained permissions and a troubleshooting record based on logs.",
        "Des permissions expliquées et un diagnostic fondé sur les journaux.",
      ),
      text(
        "A successful backup restoration and reusable instructions.",
        "Une restauration réussie et des instructions réutilisables.",
      ),
    ],
    company: text(
      "We help companies set up, maintain and document Linux systems, including access, updates, backups and troubleshooting.",
      "Nous aidons les entreprises à configurer, entretenir et documenter leurs systèmes Linux : accès, mises à jour, sauvegardes et diagnostic.",
    ),
    deliverables: [
      text(
        "System inventory and maintenance plan.",
        "Inventaire des systèmes et plan de maintenance.",
      ),
      text(
        "Configuration notes, backup checks and operating procedures.",
        "Configuration documentée, contrôles des sauvegardes et procédures d’exploitation.",
      ),
    ],
    companyNeeds: text(
      "Prepare system versions, server roles, maintenance windows, backup status and the technical contact.",
      "Préparez les versions des systèmes, rôles des serveurs, créneaux de maintenance, état des sauvegardes et contact technique.",
    ),
    brief: [
      {
        id: "linuxEstate",
        label: text(
          "Which Linux systems need attention?",
          "Quels systèmes Linux nécessitent une intervention ?",
        ),
        hint: text(
          "Give distributions, approximate server count, roles and main symptoms. No credentials.",
          "Indiquez distributions, nombre approximatif de serveurs, rôles et symptômes principaux. Aucun identifiant.",
        ),
      },
      {
        id: "maintenance",
        label: text(
          "What are the maintenance constraints?",
          "Quelles sont les contraintes de maintenance ?",
        ),
        hint: text(
          "Describe acceptable interruptions, existing backups and who approves changes.",
          "Décrivez les interruptions acceptables, sauvegardes existantes et responsables des validations.",
        ),
      },
    ],
    lessons: ["linux-1", "linux-2", "dev-process", "dev-bash"],
    documentation: {
      label: "Ubuntu",
      url: "https://ubuntu.com/tutorials/command-line-for-beginners",
    },
  },
  {
    id: "ai-web",
    title: text("Website development with AI", "Développement web avec l’IA"),
    description: text(
      "Create useful websites with AI as a drafting assistant. Learn HTML, CSS and JavaScript so you can understand, improve and test the suggested code.",
      "Créer des sites utiles avec l’IA comme aide à la rédaction. Apprendre HTML, CSS et JavaScript pour comprendre, améliorer et tester le code proposé.",
    ),
    audience: text(
      "First-time website builders, entrepreneurs and people combining web fundamentals with AI assistance.",
      "Débutants en création de sites, entrepreneurs et personnes associant les bases du web à l’aide de l’IA.",
    ),
    role: text(
      "Turn a business need into accessible pages that work on different screens. AI drafts code; the developer remains responsible for checking it.",
      "Transformer un besoin en pages accessibles adaptées aux différents écrans. L’IA propose du code ; le développeur reste responsable de sa vérification.",
    ),
    prerequisites: [
      text(
        "No coding experience is needed to begin. Be comfortable typing, managing files and describing what a website visitor should be able to do.",
        "Aucune expérience en code n’est nécessaire pour débuter. Soyez à l’aise avec la saisie, les fichiers et l’explication de ce qu’un visiteur doit pouvoir faire.",
      ),
      text(
        "A code editor and a browser with developer tools. Start with local HTML files; Git and a development server come later.",
        "Un éditeur de code et un navigateur avec outils de développement. Commencez par des fichiers HTML locaux ; Git et un serveur de développement viennent ensuite.",
      ),
      text(
        "An approved AI assistant or sample AI outputs for review. Check account limits and use fictional information, never passwords or customer data.",
        "Un assistant IA autorisé ou des réponses d’exemple à examiner. Vérifiez les limites du compte et utilisez des informations fictives, jamais de mots de passe ou données clients.",
      ),
    ],
    phases: [
      {
        title: text(
          "Define the visitor’s task",
          "Définir le besoin du visiteur",
        ),
        practice: text(
          "Sketch a one-page site for a fictional repair shop. Choose one main action and list the information a visitor needs.",
          "Dessinez un site d’une page pour un réparateur fictif. Choisissez une action principale et listez les informations nécessaires.",
        ),
      },
      {
        title: text("Build the foundations", "Construire les bases"),
        practice: text(
          "Create headings, links and labelled fields in HTML. Add CSS so the page fits a narrow screen.",
          "Créez titres, liens et champs nommés en HTML. Ajoutez du CSS pour adapter la page à un petit écran.",
        ),
      },
      {
        title: text(
          "Review AI suggestions",
          "Vérifier les propositions de l’IA",
        ),
        practice: text(
          "Ask AI to improve one section, or review a sample draft. Compare the changes and explain every line you keep.",
          "Demandez à l’IA d’améliorer une section, ou examinez un brouillon d’exemple. Comparez les changements et expliquez chaque ligne conservée.",
        ),
      },
      {
        title: text("Test before publication", "Tester avant publication"),
        practice: text(
          "Test keyboard navigation, links, mobile layout and empty fields. Check that no secret appears in browser code.",
          "Testez clavier, liens, mise en page mobile et champs vides. Vérifiez qu’aucun secret n’apparaît dans le code du navigateur.",
        ),
      },
    ],
    project: text(
      "Build a responsive brochure website for a fictional company and record which AI suggestions you accepted or corrected.",
      "Construire un site vitrine adaptatif pour une entreprise fictive et documenter les propositions d’IA acceptées ou corrigées.",
    ),
    evidence: [
      text(
        "Pages usable on a phone and by keyboard, with working links.",
        "Des pages utilisables sur téléphone et au clavier, avec des liens fonctionnels.",
      ),
      text(
        "A test checklist and an explanation of the code and AI corrections.",
        "Une liste de tests et une explication du code et des corrections de l’IA.",
      ),
    ],
    company: text(
      "We design and build company websites with AI-assisted workflows, human review and attention to content, accessibility and maintenance.",
      "Nous concevons et réalisons des sites d’entreprise avec l’aide de l’IA, une vérification humaine et une attention au contenu, à l’accessibilité et à la maintenance.",
    ),
    deliverables: [
      text(
        "Page plan, responsive prototype and scoped website implementation.",
        "Plan des pages, maquette adaptative et réalisation selon le périmètre convenu.",
      ),
      text(
        "Testing checklist and content-update handover.",
        "Liste de tests et transmission pour les mises à jour du contenu.",
      ),
    ],
    companyNeeds: text(
      "Prepare the audience, main visitor action, page list, approved content, domain and hosting situation, and content owner.",
      "Préparez le public, l’action principale, les pages, les contenus validés, la situation du domaine et de l’hébergement et le responsable du contenu.",
    ),
    brief: [
      {
        id: "websiteGoal",
        label: text(
          "What should visitors be able to do?",
          "Que doivent pouvoir faire les visiteurs ?",
        ),
        hint: text(
          "Describe the audience, pages and main action: contact, quote request or information.",
          "Décrivez le public, les pages et l’action principale : contact, devis ou information.",
        ),
      },
      {
        id: "websiteAssets",
        label: text(
          "What content and setup do you already have?",
          "Quels contenus et éléments techniques avez-vous déjà ?",
        ),
        hint: text(
          "Mention branding, text, images, existing site, domain and hosting. No login details.",
          "Précisez identité visuelle, textes, images, site existant, domaine et hébergement. Aucun identifiant.",
        ),
      },
    ],
    lessons: [],
    documentation: {
      label: "MDN",
      url: "https://developer.mozilla.org/en-US/docs/Learn_web_development",
    },
  },
  {
    id: "secretariat",
    title: text("Modern secretarial practice", "Secrétariat moderne"),
    description: text(
      "Keep an office organised with clear documents, appointments, professional communication and digital tools. Use AI for drafts that you check yourself.",
      "Organiser un bureau avec des documents clairs, des rendez-vous, une communication professionnelle et des outils numériques. Utiliser l’IA pour des brouillons que vous vérifiez.",
    ),
    audience: text(
      "Aspiring administrative assistants, secretaries, office coordinators and small-business owners.",
      "Futurs assistants administratifs, secrétaires, responsables de bureau et dirigeants de petites entreprises.",
    ),
    role: text(
      "Help information reach the right person on time: prepare meetings, write minutes, file documents and track follow-up actions.",
      "Transmettre la bonne information au bon moment : préparer les réunions, rédiger les comptes rendus, classer les documents et suivre les actions.",
    ),
    prerequisites: [
      text(
        "Be able to write a short message in your working language and do basic arithmetic. No prior office experience or programming is required.",
        "Sachez écrire un message court dans votre langue de travail et effectuer des calculs simples. Aucune expérience préalable de bureau ou de programmation n’est requise.",
      ),
      text(
        "A word processor, spreadsheet, email and calendar. A local office suite supports early exercises; shared-work exercises need authorized test accounts.",
        "Un traitement de texte, un tableur, un email et un agenda. Une suite locale suffit aux premiers exercices ; le travail partagé nécessite des comptes de test autorisés.",
      ),
      text(
        "Fictional contacts and documents. For AI drafts, use an approved assistant or sample output and check every name, date and amount.",
        "Des contacts et documents fictifs. Pour les brouillons d’IA, utilisez un assistant autorisé ou un exemple fourni et vérifiez chaque nom, date et montant.",
      ),
    ],
    phases: [
      {
        title: text("Organise information", "Organiser l’information"),
        practice: text(
          "Create folders and a naming rule for letters and meeting notes. Retrieve a sample document using that rule.",
          "Créez des dossiers et une règle de nommage pour courriers et notes de réunion. Retrouvez un document grâce à cette règle.",
        ),
      },
      {
        title: text("Communicate clearly", "Communiquer clairement"),
        practice: text(
          "Draft an invitation with purpose, date, time zone and agenda. Correct missing or invented details in a sample AI draft.",
          "Rédigez une invitation avec objectif, date, fuseau horaire et ordre du jour. Corrigez les omissions ou inventions d’un brouillon d’IA.",
        ),
      },
      {
        title: text("Coordinate and track", "Coordonner et suivre"),
        practice: text(
          "Create five fictional actions in a spreadsheet with owner, deadline and status. Count completed items with a formula.",
          "Créez cinq actions fictives dans un tableur avec responsable, échéance et état. Comptez les actions terminées avec une formule.",
        ),
      },
      {
        title: text("Share responsibly", "Partager avec discernement"),
        practice: text(
          "Prepare meeting minutes, separate private notes from the shared version and define who may edit each file.",
          "Préparez un compte rendu, séparez les notes privées de la version partagée et définissez qui peut modifier chaque fichier.",
        ),
      },
    ],
    project: text(
      "Create a meeting pack: invitation, agenda, minutes, action tracker and organised filing folder.",
      "Créer un dossier de réunion : invitation, ordre du jour, compte rendu, suivi des actions et classement organisé.",
    ),
    evidence: [
      text(
        "Consistent names, dates and clear writing.",
        "Des noms et dates cohérents et une rédaction claire.",
      ),
      text(
        "Correct spreadsheet totals and a sensible sharing plan.",
        "Des totaux corrects dans le tableur et un plan de partage pertinent.",
      ),
    ],
    company: text(
      "We help companies organise administrative work with document templates, shared filing, meeting workflows and responsible office AI use.",
      "Nous aidons les entreprises à organiser leur travail administratif : modèles, classement partagé, réunions et usage responsable de l’IA bureautique.",
    ),
    deliverables: [
      text(
        "Document templates and a filing structure.",
        "Modèles de documents et structure de classement.",
      ),
      text(
        "Meeting and action-tracking workflows with staff guidance.",
        "Procédures de réunion et de suivi des actions avec accompagnement de l’équipe.",
      ),
    ],
    companyNeeds: text(
      "Prepare anonymised examples, office tools, recurring tasks, document owners and sharing rules.",
      "Préparez des exemples anonymisés, les outils, tâches récurrentes, responsables des documents et règles de partage.",
    ),
    brief: [
      {
        id: "officeTasks",
        label: text(
          "Which office tasks need organising?",
          "Quelles tâches administratives faut-il organiser ?",
        ),
        hint: text(
          "For example: correspondence, calendars, minutes, filing or follow-up. Explain the current difficulty.",
          "Exemples : courriers, agendas, comptes rendus, classement ou suivi. Expliquez la difficulté actuelle.",
        ),
      },
      {
        id: "officeTools",
        label: text(
          "Which tools and document rules do you use?",
          "Quels outils et règles documentaires utilisez-vous ?",
        ),
        hint: text(
          "Mention office software, shared folders, team size and approvers. Do not paste confidential documents.",
          "Précisez logiciels, dossiers partagés, effectifs et responsables de validation. Ne copiez pas de documents confidentiels.",
        ),
      },
    ],
    lessons: [],
    documentation: {
      label: "LibreOffice",
      url: "https://documentation.libreoffice.org/en/english-documentation/",
    },
  },

  {
    id: "ai-infographics",
    title: text("AI infographics", "Infographie avec l’IA"),
    description: text(
      "Turn facts, numbers or a complicated process into a visual explanation. Use AI to explore layouts and wording while keeping the information accurate and easy to read.",
      "Transformer des faits, chiffres ou processus complexes en explication visuelle. Utiliser l’IA pour explorer les mises en page et formulations en gardant une information exacte et lisible.",
    ),
    audience: text(
      "Communicators, teachers, analysts and beginners who want to explain information visually.",
      "Communicants, enseignants, analystes et débutants souhaitant expliquer des informations visuellement.",
    ),
    role: text(
      "Make information understandable at a glance. For example, turn a company procedure into a visual guide or explain a report with an honest chart.",
      "Rendre l’information compréhensible rapidement. Par exemple, transformer une procédure en guide visuel ou expliquer un rapport avec un graphique fidèle.",
    ),
    prerequisites: [
      text(
        "No design experience is needed to begin. Be able to read a simple table and compare quantities; basic percentages help with data graphics.",
        "Aucune expérience en design n’est nécessaire pour débuter. Sachez lire un tableau et comparer des quantités ; les pourcentages aident à représenter les données.",
      ),
      text(
        "A spreadsheet and layout editor that exports images or PDFs. A mouse is helpful. Use icons and fonts with suitable reuse rights.",
        "Un tableur et un éditeur visuel exportant images ou PDF. Une souris est utile. Utilisez des icônes et polices dont la réutilisation est autorisée.",
      ),
      text(
        "A small non-sensitive dataset with its source. Use an approved AI assistant or sample outputs for layout ideas, never as a source of invented figures.",
        "Un petit jeu de données non sensibles avec sa source. Utilisez un assistant IA autorisé ou des exemples pour les idées de composition, jamais pour inventer des chiffres.",
      ),
    ],
    phases: [
      {
        title: text("Find the message", "Trouver le message"),
        practice: text(
          "Take a fictional table of monthly enquiries. Write one sentence explaining what the reader should learn.",
          "Prenez un tableau fictif de demandes mensuelles. Écrivez une phrase expliquant ce que le lecteur doit retenir.",
        ),
      },
      {
        title: text(
          "Choose an honest visual",
          "Choisir une représentation fidèle",
        ),
        practice: text(
          "Use bars for a comparison or a flow diagram for a process. Label units and sources without distorting scale.",
          "Utilisez des barres pour comparer ou un schéma pour un processus. Indiquez unités et sources sans déformer l’échelle.",
        ),
      },
      {
        title: text("Draft and verify", "Proposer et vérifier"),
        practice: text(
          "Compare two AI-assisted layouts. Keep the clearer one, check each figure against the table and write the final labels.",
          "Comparez deux compositions assistées par IA. Gardez la plus claire, vérifiez chaque chiffre dans le tableau et rédigez les libellés définitifs.",
        ),
      },
      {
        title: text("Make it readable", "Rendre le résultat lisible"),
        practice: text(
          "Check contrast and text size at phone width. Add a text alternative and export a shareable version.",
          "Vérifiez contraste et taille du texte sur petit écran. Ajoutez une alternative textuelle et exportez une version à partager.",
        ),
      },
    ],
    project: text(
      "Create a one-page infographic about a fictional company’s monthly enquiries, with a source and text summary.",
      "Créer une infographie d’une page sur les demandes mensuelles d’une entreprise fictive, avec source et résumé textuel.",
    ),
    evidence: [
      text(
        "Figures match the source, with clear units and an honest scale.",
        "Des chiffres conformes à la source, avec unités claires et échelle fidèle.",
      ),
      text(
        "An editable file, readable export and text alternative.",
        "Un fichier modifiable, un export lisible et une alternative textuelle.",
      ),
    ],
    company: text(
      "We turn approved business information into clear infographics, process diagrams and visual reports, using AI assistance with human fact-checking.",
      "Nous transformons les informations validées en infographies, schémas et rapports visuels clairs, avec l’aide de l’IA et une vérification humaine.",
    ),
    deliverables: [
      text(
        "Information outline and visual concept.",
        "Structure de l’information et concept visuel.",
      ),
      text(
        "Agreed infographic formats with sources and editable files.",
        "Formats d’infographie convenus, avec sources et fichiers modifiables.",
      ),
    ],
    companyNeeds: text(
      "Prepare approved data or process steps, sources, audience, brand assets and intended publishing formats.",
      "Préparez les données ou étapes validées, sources, public, éléments de marque et formats de diffusion prévus.",
    ),
    brief: [
      {
        id: "information",
        label: text(
          "What information should the visual explain?",
          "Quelle information le visuel doit-il expliquer ?",
        ),
        hint: text(
          "Describe the message, data or process, its source and intended reader. Use non-confidential examples.",
          "Décrivez le message, les données ou le processus, leur source et le lecteur visé. Utilisez des exemples non confidentiels.",
        ),
      },
      {
        id: "visualFormat",
        label: text(
          "Where will the infographic be used?",
          "Où l’infographie sera-t-elle utilisée ?",
        ),
        hint: text(
          "Report, social post, poster or presentation? Include language, size and brand requirements.",
          "Rapport, publication sociale, affiche ou présentation ? Précisez langue, format et exigences de marque.",
        ),
      },
    ],
    lessons: [],
    documentation: {
      label: "Inkscape",
      url: "https://inkscape.org/learn/tutorials/",
    },
  },
  {
    id: "ai-design",
    title: text("AI graphic design", "Design graphique avec l’IA"),
    description: text(
      "Create posters, social posts and presentation visuals. Use AI to explore ideas, then refine layout, colours and typography for a clear, consistent result.",
      "Créer affiches, publications sociales et visuels de présentation. Utiliser l’IA pour explorer des idées, puis affiner composition, couleurs et typographie pour un résultat clair et cohérent.",
    ),
    audience: text(
      "Creative beginners, communication teams and entrepreneurs needing everyday business visuals.",
      "Débutants créatifs, équipes de communication et entrepreneurs ayant besoin de visuels professionnels.",
    ),
    role: text(
      "Turn a communication brief into visuals suited to a brand and audience. Unlike an infographic, the main aim may be promotion rather than explaining data.",
      "Transformer une demande de communication en visuels adaptés à une marque et à son public. Contrairement à une infographie, l’objectif peut être la promotion plutôt que l’explication de données.",
    ),
    prerequisites: [
      text(
        "No professional drawing skills are needed. Be ready to compare layouts, receive feedback and describe the audience for your design.",
        "Aucune compétence professionnelle en dessin n’est requise. Soyez prêt à comparer des compositions, recevoir des retours et décrire le public visé.",
      ),
      text(
        "An image or vector editor, a mouse and storage for editable project files. Image dimensions and file formats are introduced in the first exercises.",
        "Un éditeur d’images ou vectoriel, une souris et de l’espace pour les fichiers modifiables. Dimensions et formats sont abordés dans les premiers exercices.",
      ),
      text(
        "An authorized AI tool or sample assets with known usage rights. Check licensing, image permissions and brand rules before publishing; keep private client files out of prompts.",
        "Un outil IA autorisé ou des ressources d’exemple aux droits connus. Vérifiez licences, autorisations d’image et règles de marque avant publication ; évitez les fichiers clients privés dans les demandes à l’IA.",
      ),
    ],
    phases: [
      {
        title: text("Write the creative brief", "Rédiger la demande créative"),
        practice: text(
          "For a fictional event, define the audience, message, required text and two output sizes.",
          "Pour un événement fictif, définissez le public, le message, les textes obligatoires et deux formats.",
        ),
      },
      {
        title: text("Build a visual hierarchy", "Hiérarchiser le visuel"),
        practice: text(
          "Arrange a headline, supporting text and one image. Use spacing and contrast to guide the reader.",
          "Disposez un titre, un texte secondaire et une image. Utilisez l’espace et le contraste pour guider le lecteur.",
        ),
      },
      {
        title: text(
          "Explore and refine with AI",
          "Explorer et affiner avec l’IA",
        ),
        practice: text(
          "Compare two concepts or sample drafts. Correct distorted details, retype image text and keep brand colours consistent.",
          "Comparez deux concepts ou brouillons. Corrigez les détails déformés, ressaisissez le texte des images et harmonisez les couleurs de marque.",
        ),
      },
      {
        title: text("Prepare the handover", "Préparer la livraison"),
        practice: text(
          "Adapt the design to a poster and a social post. Check readability, export settings and source-file organisation.",
          "Adaptez le visuel à une affiche et une publication sociale. Vérifiez lisibilité, réglages d’export et organisation des fichiers sources.",
        ),
      },
    ],
    project: text(
      "Design a matching poster and social post for a fictional event, with editable files and an explanation of your choices.",
      "Créer une affiche et une publication sociale cohérentes pour un événement fictif, avec fichiers modifiables et explication des choix.",
    ),
    evidence: [
      text(
        "A clear message, consistent style and readable text.",
        "Un message clair, un style cohérent et des textes lisibles.",
      ),
      text(
        "Correct exports, editable sources and an asset-rights record.",
        "Des exports adaptés, sources modifiables et un relevé des droits des ressources.",
      ),
    ],
    company: text(
      "We create coherent company communication visuals with AI-assisted exploration, careful editing and respect for brand identity.",
      "Nous créons des supports de communication cohérents avec l’exploration assistée par IA, une retouche soignée et le respect de l’identité de marque.",
    ),
    deliverables: [
      text(
        "Creative concepts and agreed campaign or presentation assets.",
        "Concepts créatifs et supports de campagne ou de présentation convenus.",
      ),
      text(
        "Exports for selected channels and organised editable files.",
        "Exports pour les canaux choisis et fichiers modifiables organisés.",
      ),
    ],
    companyNeeds: text(
      "Prepare the communication goal, audience, approved brand rules, required copy, output formats and design approver.",
      "Préparez l’objectif, le public, les règles de marque validées, les textes, formats et responsable de validation.",
    ),
    brief: [
      {
        id: "designBrief",
        label: text(
          "What should the design communicate?",
          "Que doit communiquer la création ?",
        ),
        hint: text(
          "Describe audience, campaign, message and desired action. Mention visual references.",
          "Décrivez public, campagne, message et action attendue. Précisez vos références visuelles.",
        ),
      },
      {
        id: "designAssets",
        label: text(
          "Which assets and formats are required?",
          "Quels éléments et formats sont nécessaires ?",
        ),
        hint: text(
          "List brand rules, approved text, licensed images, dimensions and publishing channels.",
          "Listez règles de marque, textes validés, images autorisées, dimensions et supports de diffusion.",
        ),
      },
    ],
    lessons: [],
    documentation: { label: "GIMP", url: "https://docs.gimp.org/3.0/en/" },
  },
  {
    id: "ai-automation",
    title: text("AI automation", "Automatisation avec l’IA"),
    description: text(
      "Connect everyday tools so repetitive work needs less manual copying. Use AI to draft or sort, with clear rules and human approval when needed.",
      "Relier les outils du quotidien pour limiter les tâches répétitives et les recopies. Utiliser l’IA pour rédiger ou classer, avec des règles claires et une validation humaine quand nécessaire.",
    ),
    audience: text(
      "Office teams, entrepreneurs and beginners improving repetitive processes without starting as expert programmers.",
      "Équipes administratives, entrepreneurs et débutants améliorant des processus répétitifs sans être experts en programmation.",
    ),
    role: text(
      "Map a process, connect its steps and handle failures. For example, sort enquiries, prepare reply drafts and ask a person to approve them.",
      "Décrire un processus, relier ses étapes et gérer les échecs. Par exemple, classer des demandes, préparer des réponses et demander une validation humaine.",
    ),
    prerequisites: [
      text(
        "Basic spreadsheet use and the ability to describe a task as steps. Programming is not required for the introduction; conditions and data formats are taught progressively.",
        "Les bases du tableur et la capacité à décrire une tâche par étapes. La programmation n’est pas requise pour l’introduction ; conditions et formats de données sont abordés progressivement.",
      ),
      text(
        "A browser and workflow tool in an authorized practice environment. Begin with sample rows and manual triggers before connecting real apps.",
        "Un navigateur et un outil de processus dans un environnement de test autorisé. Commencez par des lignes fictives et déclenchements manuels avant de connecter de vraies applications.",
      ),
      text(
        "Live integrations need authorized test accounts and sometimes API access or paid plans. Start with sample AI responses; use the tool’s credential manager and check quotas before live calls.",
        "Les intégrations réelles demandent des comptes de test autorisés et parfois un accès API ou un abonnement. Commencez avec des réponses d’IA d’exemple ; utilisez le gestionnaire d’identifiants et vérifiez les quotas avant les appels réels.",
      ),
    ],
    phases: [
      {
        title: text("Map the task", "Décrire la tâche"),
        practice: text(
          "Draw how an enquiry is received, categorised, assigned and answered. Mark the decisions that need a person.",
          "Dessinez comment une demande est reçue, classée, attribuée et traitée. Repérez les décisions nécessitant une personne.",
        ),
      },
      {
        title: text(
          "Build a simple workflow",
          "Construire un processus simple",
        ),
        practice: text(
          "Use five sample rows, a manual trigger and a category rule to route requests. Record each result.",
          "Utilisez cinq lignes fictives, un déclenchement manuel et une règle de catégorie pour orienter les demandes. Notez chaque résultat.",
        ),
      },
      {
        title: text("Add AI with review", "Ajouter l’IA avec validation"),
        practice: text(
          "Use sample AI replies or an approved assistant. Add human approval before any message could be sent.",
          "Utilisez des réponses d’IA d’exemple ou un assistant autorisé. Ajoutez une validation humaine avant tout envoi possible.",
        ),
      },
      {
        title: text("Test failures", "Tester les échecs"),
        practice: text(
          "Try a blank request, a repeated row and an unavailable tool. Define retries, stop conditions and who handles failures.",
          "Essayez une demande vide, une ligne répétée et un outil indisponible. Définissez nouvelles tentatives, conditions d’arrêt et responsable des échecs.",
        ),
      },
    ],
    project: text(
      "Build a demo enquiry workflow that classifies requests and drafts replies for human approval, without contacting real customers.",
      "Construire un processus de démonstration qui classe les demandes et prépare des réponses à valider, sans contacter de vrais clients.",
    ),
    evidence: [
      text(
        "A clear process diagram and sample input/output.",
        "Un schéma clair et des exemples d’entrée et de sortie.",
      ),
      text(
        "Duplicate and failure checks, an approval step and a handover guide.",
        "Des contrôles des doublons et échecs, une validation et un guide de transmission.",
      ),
    ],
    company: text(
      "We help companies automate repetitive workflows and add useful AI assistance, with approvals, error handling and operating instructions.",
      "Nous aidons les entreprises à automatiser les tâches répétitives et intégrer l’IA utilement, avec validations, gestion des erreurs et consignes d’exploitation.",
    ),
    deliverables: [
      text(
        "Process map and scoped automation pilot.",
        "Cartographie du processus et automatisation pilote cadrée.",
      ),
      text(
        "Approval rules, failure handling, tests and team handover.",
        "Règles de validation, gestion des échecs, tests et transmission à l’équipe.",
      ),
    ],
    companyNeeds: text(
      "Prepare current steps, tools, task volume, non-sensitive examples, approval owners and permitted integrations.",
      "Préparez étapes actuelles, outils, volumes, exemples non sensibles, responsables des validations et intégrations autorisées.",
    ),
    brief: [
      {
        id: "workflow",
        label: text(
          "Which repetitive process should be automated?",
          "Quel processus répétitif faut-il automatiser ?",
        ),
        hint: text(
          "Describe trigger, steps, tools, volume and time spent. Give a fictional example from input to result.",
          "Décrivez déclencheur, étapes, outils, volumes et temps passé. Donnez un exemple fictif de l’entrée au résultat.",
        ),
      },
      {
        id: "approvals",
        label: text(
          "What must stay under human control?",
          "Que faut-il conserver sous contrôle humain ?",
        ),
        hint: text(
          "List approvals, sensitive data, actions that must not run automatically and failure reporting needs.",
          "Listez validations, données sensibles, actions à ne pas automatiser et besoins de signalement des échecs.",
        ),
      },
    ],
    lessons: ["dev-python", "dev-bash"],
    documentation: { label: "n8n", url: "https://docs.n8n.io/learning-path/" },
  },
];
export function findCourse(id: string | undefined) {
  return courseCatalog.find((course) => course.id === id);
}
