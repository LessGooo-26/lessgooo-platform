import { c, step, type LessonGuide } from "./lesson-guide-model";
import { activity, young } from "./lesson-kids";
export const kidsDiscoveryGuides: Record<string, LessonGuide> = {
  "kids-git": young(
    "Projects · explain versions",
    c(
      "You and a friend improve a page. Keep a clear record of what changed so you can find an earlier idea.",
      "Avec un camarade, tu améliores une page. Garde une trace des changements pour retrouver une idée précédente.",
    ),
    "Version one|Explain change|Version two|Review together",
    "Version un|Expliquer changement|Version deux|Relire ensemble",
    [
      activity(
        c("Keep a first version", "Garder une première version"),
        c(
          "Make a local copy called version-1 and write what already works.",
          "Crée une copie locale version-1 et note ce qui fonctionne.",
        ),
        c(
          "The original version can still be opened.",
          "La version initiale reste accessible.",
        ),
      ),
      activity(
        c("Change one thing", "Changer un élément"),
        c(
          "In version-2, improve one heading or game rule. Write why you changed it and ask a friend to test it.",
          "Dans version-2, améliore un titre ou une règle. Écris pourquoi et fais tester par un camarade.",
        ),
        c(
          "The change has a clear purpose and feedback.",
          "Le changement a un but clair et un retour.",
        ),
      ),
      activity(
        c("Present the history", "Présenter l’historique"),
        c(
          "Show before and after with three sentences: what changed, why, and how you checked it. Ask an adult to demonstrate Git only if appropriate.",
          "Présente avant/après en trois phrases : changement, raison et vérification. Un adulte peut montrer Git si c’est adapté.",
        ),
        c(
          "Explain a project improvement using two preserved versions and a test.",
          "Explique une amélioration avec deux versions conservées et un test.",
        ),
      ),
    ],
    c(
      "Why keep a small explanation with each version?",
      "Pourquoi garder une explication avec chaque version ?",
    ),
    c(
      "It helps other people understand the reason for a change and find a useful earlier version.",
      "Elle aide à comprendre la raison du changement et à retrouver une ancienne version utile.",
    ),
    c(
      "Because the biggest filename always means the best version.",
      "Parce que le nom de fichier le plus long désigne toujours la meilleure version.",
    ),
  ),
  "kids-server": young(
    "Web · client and server",
    c(
      "Your browser asks a local server for a page. Both roles can run on one computer.",
      "Ton navigateur demande une page à un serveur local. Les deux rôles peuvent être sur le même ordinateur.",
    ),
    "Browser|Request|Local server|Page response",
    "Navigateur|Requête|Serveur local|Page reçue",
    [
      activity(
        c("Prepare a safe folder", "Préparer un dossier adapté"),
        c(
          "With an adult, make a new folder containing only a fictional index.html page. Do not use a folder with private documents.",
          "Avec un adulte, crée un dossier contenant seulement une page index.html fictive. Aucun document privé dans ce dossier.",
        ),
        c(
          "Only the intended page is in the served folder.",
          "Seule la page voulue se trouve dans le dossier servi.",
        ),
      ),
      step(
        c("Start a loopback server", "Démarrer un serveur local"),
        c(
          "An adult runs this from that folder, then opens http://127.0.0.1:8000 in the browser.",
          "Un adulte lance ceci depuis ce dossier puis ouvre http://127.0.0.1:8000 dans le navigateur.",
        ),
        "python3 -m http.server 8000 --bind 127.0.0.1",
        c(
          "The page is available only from this computer’s loopback address.",
          "La page est disponible sur l’adresse locale de cet ordinateur.",
        ),
      ),
      activity(
        c("Observe a stopped server", "Observer l’arrêt du serveur"),
        c(
          "Stop with Ctrl+C, then reload the page. Explain the difference between the saved file and the process answering requests.",
          "Arrête avec Ctrl+C puis recharge. Explique la différence entre fichier enregistré et processus qui répond.",
        ),
        c(
          "Draw client, request, server and response, then explain why stopping the server affects access.",
          "Dessine client, requête, serveur et réponse puis explique l’effet de l’arrêt.",
        ),
      ),
    ],
    c(
      "Must a client and server always be two different physical computers?",
      "Client et serveur doivent-ils toujours être deux machines physiques ?",
    ),
    c(
      "No. They are roles that can run as programs on the same computer.",
      "Non. Ce sont des rôles que des programmes peuvent jouer sur le même ordinateur.",
    ),
    c(
      "Yes. A computer can never ask a program on itself for a page.",
      "Oui. Un ordinateur ne peut jamais demander une page à un programme sur lui-même.",
    ),
  ),
  "kids-cloud": young(
    "Cloud · real computers",
    c(
      "A file in the cloud still lives on equipment somewhere. Decide when a local copy or an authorised private online copy is useful.",
      "Un fichier dans le cloud se trouve sur du matériel quelque part. Réfléchis à l’utilité d’une copie locale ou d’une copie privée autorisée.",
    ),
    "Your device|Internet|Data centre|Private file access",
    "Ton appareil|Internet|Centre de données|Accès privé",
    [
      activity(
        c("Build a paper map", "Construire une carte papier"),
        c(
          "Draw your device, a network and a data centre. Use arrows to show a file being sent and requested.",
          "Dessine appareil, réseau et centre de données. Montre l’envoi et la demande d’un fichier.",
        ),
        c(
          "The cloud is represented by real computers, not an unexplained magic cloud.",
          "Le cloud est représenté par de vrais ordinateurs, pas une magie inexpliquée.",
        ),
      ),
      activity(
        c("Choose what stays private", "Choisir ce qui reste privé"),
        c(
          "Compare a fictional drawing, a homework file and a password. Discuss with an adult why they need different sharing choices.",
          "Compare dessin fictif, devoir et mot de passe. Discute avec un adulte de leurs partages différents.",
        ),
        c(
          "Private information is not treated as public project material.",
          "Les informations privées ne deviennent pas du contenu public.",
        ),
      ),
      activity(
        c("Explain costs and copies", "Expliquer coûts et copies"),
        c(
          "Explain that storage and running servers use resources even when a page is not open. Make a plan for an approved backup without creating any account.",
          "Explique que stockage et serveurs consomment même sans page ouverte. Prévois une sauvegarde autorisée sans créer de compte.",
        ),
        c(
          "Explain one advantage, one privacy choice and one cost consideration of the cloud.",
          "Explique un avantage, un choix de confidentialité et un aspect du coût du cloud.",
        ),
      ),
    ],
    c(
      "Does closing your browser switch off every server your website uses?",
      "Fermer le navigateur arrête-t-il tous les serveurs du site ?",
    ),
    c(
      "No. Remote services can keep running and using resources.",
      "Non. Les services distants peuvent continuer à fonctionner et consommer.",
    ),
    c(
      "Yes. The internet automatically turns every server off when a visitor leaves.",
      "Oui. Internet éteint automatiquement chaque serveur quand un visiteur part.",
    ),
  ),
  "kids-aws": young(
    "AWS · compute, storage and access",
    c(
      "Build a pretend website using paper cards. Assign a place for computation, a place for pictures and rules for who may change them.",
      "Construis un site imaginaire avec des cartes. Prévois calcul, images et règles pour les personnes qui les modifient.",
    ),
    "Visitor|Compute / EC2|Objects / S3|Access / IAM",
    "Visiteur|Calcul / EC2|Objets / S3|Accès / IAM",
    [
      activity(
        c("Make service cards", "Créer des cartes de services"),
        c(
          "Label one card EC2: virtual computer, one S3: object storage, and one IAM: identities and permissions.",
          "Nomme une carte EC2 : ordinateur virtuel, une S3 : stockage objet, une IAM : identités et permissions.",
        ),
        c(
          "The three cards describe different responsibilities.",
          "Les trois cartes ont des responsabilités distinctes.",
        ),
      ),
      activity(
        c("Design access on paper", "Dessiner les accès"),
        c(
          "Use fictional visitor and editor roles. Draw who reads a picture and who may replace it; never write a real password.",
          "Utilise des rôles fictifs visiteur et éditeur. Montre qui lit une image et qui la remplace ; aucun vrai mot de passe.",
        ),
        c(
          "Reading and changing a file are distinct permissions.",
          "Lire et modifier un fichier sont des permissions distinctes.",
        ),
      ),
      activity(
        c("Present without deploying", "Présenter sans déployer"),
        c(
          "Explain your model to an adult. No account, payment card or actual AWS resource is required.",
          "Présente ton modèle à un adulte. Aucun compte, carte bancaire ou ressource AWS nécessaire.",
        ),
        c(
          "Match compute, storage and access to the correct service role in a paper architecture.",
          "Relie calcul, stockage et accès au bon rôle de service dans une architecture papier.",
        ),
      ),
    ],
    c(
      "Does storing a picture mean everyone should be allowed to replace it?",
      "Stocker une image signifie-t-il que tout le monde peut la remplacer ?",
    ),
    c(
      "No. Reading, editing and administering are different permissions.",
      "Non. Lire, modifier et administrer sont des permissions distinctes.",
    ),
    c(
      "Yes. Anyone who sees a file automatically owns it.",
      "Oui. Voir un fichier en rend automatiquement propriétaire.",
    ),
  ),
  "kids-cloud-project": young(
    "Final project · from parts to a service",
    c(
      "Tell the whole story of your game or website: the machine, its files, the program, the network and an imagined hosting plan.",
      "Raconte toute l’histoire de ton jeu ou site : machine, fichiers, programme, réseau et hébergement imaginé.",
    ),
    "Hardware + files|Program|Network|Demonstration",
    "Matériel + fichiers|Programme|Réseau|Démonstration",
    [
      activity(
        c("Choose one completed project", "Choisir un projet terminé"),
        c(
          "Use your own Scratch game or local web page. Write who it is for and what it does.",
          "Utilise ton jeu Scratch ou ta page locale. Écris pour qui et pour quel usage.",
        ),
        c(
          "The audience and purpose are clear.",
          "Le public et l’objectif sont clairs.",
        ),
      ),
      activity(
        c("Connect the layers", "Relier les couches"),
        c(
          "Make five annotated pictures: hardware, file organisation, code, client/server and pretend cloud hosting. Keep private details out.",
          "Fais cinq dessins annotés : matériel, fichiers, code, client/serveur et cloud imaginaire. Aucun détail privé.",
        ),
        c(
          "Each picture explains a connection to the next layer.",
          "Chaque dessin explique un lien avec la couche suivante.",
        ),
      ),
      activity(
        c("Demonstrate and reflect", "Démontrer et réfléchir"),
        c(
          "Show one successful test and one bug you fixed. Save the project, make a backup and state what you want to learn next.",
          "Montre un test réussi et un bug corrigé. Sauvegarde, fais une copie et dis ce que tu souhaites apprendre ensuite.",
        ),
        c(
          "Present a saved project, five explanations and evidence of testing.",
          "Présente un projet sauvegardé, cinq explications et une preuve de test.",
        ),
      ),
    ],
    c(
      "What is stronger evidence of understanding than a screenshot alone?",
      "Quelle preuve est plus forte qu’une capture seule ?",
    ),
    c(
      "Explaining what you built, demonstrating it and showing how you tested and corrected it.",
      "Expliquer la création, la démontrer et montrer tests et corrections.",
    ),
    c(
      "Copying a project title without being able to explain how it works.",
      "Copier un titre sans expliquer comment le projet fonctionne.",
    ),
  ),
  "kids-design": young(
    "Design · explain a project",
    c(
      "A presentation helps an audience follow your idea. Make each slide do one job, using your own drawings and readable text.",
      "Une présentation aide à suivre ton idée. Donne un rôle à chaque diapositive, avec dessins personnels et texte lisible.",
    ),
    "Audience|One message|Illustration|Feedback",
    "Public|Un message|Illustration|Retour",
    [
      activity(
        c("Plan three slides", "Prévoir trois diapositives"),
        c(
          "Choose: the problem, your solution and what you learned. Sketch on paper before opening a design tool.",
          "Choisis : problème, solution et apprentissage. Dessine sur papier avant l’outil.",
        ),
        c(
          "Each slide has one main message.",
          "Chaque diapositive a un message principal.",
        ),
      ),
      activity(
        c("Create with restraint", "Créer avec simplicité"),
        c(
          "Use the campus notebook or an adult-approved design tool. Use large text, strong contrast and images you made or have permission to use.",
          "Utilise le carnet du campus ou un outil approuvé. Texte grand, contraste et images personnelles ou autorisées.",
        ),
        c(
          "The slides remain legible from a distance.",
          "Les diapositives restent lisibles à distance.",
        ),
      ),
      activity(
        c("Rehearse with a listener", "Répéter avec quelqu’un"),
        c(
          "Present without reading every word. Ask which part was unclear, then improve that slide. Keep a local export.",
          "Présente sans lire chaque mot. Demande ce qui était flou, améliore et conserve un export local.",
        ),
        c(
          "Deliver a three-slide explanation improved using feedback.",
          "Présente trois diapositives améliorées grâce à un retour.",
        ),
      ),
    ],
    c(
      "Does adding more animation always make a presentation clearer?",
      "Ajouter des animations rend-il toujours une présentation plus claire ?",
    ),
    c(
      "No. Motion should help explain an idea; excessive movement can distract or make reading difficult.",
      "Non. Le mouvement doit expliquer ; trop d’animation distrait et gêne la lecture.",
    ),
    c(
      "Yes. Every line should move continuously to keep attention.",
      "Oui. Chaque ligne doit bouger sans arrêt pour attirer l’attention.",
    ),
  ),
  "kids-ai": young(
    "AI · ask, check, decide",
    c(
      "An AI can suggest ideas but can also be wrong. Practise a fictional game-design request on paper, then verify whether the proposed idea is possible.",
      "Une IA peut proposer des idées mais se tromper. Prépare sur papier une demande de jeu fictif puis vérifie si la proposition est réalisable.",
    ),
    "Clear question|Suggested answer|Check evidence|Your decision",
    "Question claire|Proposition|Vérification|Ta décision",
    [
      activity(
        c("Write a useful request", "Écrire une demande utile"),
        c(
          "Describe the game, characters, rules and what kind of help you want. Do not include personal names, passwords or school information.",
          "Décris jeu, personnages, règles et aide souhaitée. Aucun nom personnel, mot de passe ou renseignement scolaire.",
        ),
        c(
          "The request has enough context without private information.",
          "La demande donne du contexte sans information privée.",
        ),
      ),
      activity(
        c("Check a sample answer", "Vérifier une réponse d’exemple"),
        c(
          "Ask an adult to invent one plausible suggestion and one mistake. Check both against what Scratch can actually do; no live AI connection is required.",
          "Demande à un adulte une idée plausible et une erreur. Compare aux possibilités de Scratch ; aucune connexion IA requise.",
        ),
        c(
          "You distinguish an idea from a verified fact.",
          "Tu distingues idée et fait vérifié.",
        ),
      ),
      activity(
        c("Make your own decision", "Décider toi-même"),
        c(
          "Choose an idea you understand, explain your changes and name how you verified it. The final project remains your responsibility.",
          "Choisis une idée comprise, explique tes changements et ta vérification. Tu restes responsable du projet final.",
        ),
        c(
          "Show a clear request, one checked claim and your own justified choice.",
          "Montre une demande claire, une affirmation vérifiée et ton choix expliqué.",
        ),
      ),
    ],
    c(
      "Should you trust an AI answer just because it sounds confident?",
      "Faut-il croire une réponse IA parce qu’elle paraît sûre ?",
    ),
    c(
      "No. Check important claims with a trusted source or an adult and test the idea where possible.",
      "Non. Vérifie les points importants auprès d’une source fiable ou d’un adulte, puis teste si possible.",
    ),
    c(
      "Yes. Confident language guarantees an answer is correct.",
      "Oui. Un ton sûr garantit une réponse juste.",
    ),
  ),
};
