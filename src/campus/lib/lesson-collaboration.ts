import { c, step, type LessonGuide } from "./lesson-guide-model";
import { flow, guide } from "./lesson-guide-helpers";
export const collaborationGuides: Record<string, LessonGuide> = {
  "dev-network": guide({
    topic: "Networking · DNS and TCP",
    family: "linux",
    goal: c(
      "Identify whether an outage is DNS, connection or HTTP related.",
      "Distinguer une panne DNS, connexion ou HTTP.",
    ),
    role: c(
      "A DevOps engineer narrows the failing layer before changing configuration. DNS resolves a name, TCP connects to an address and port, then the application exchanges HTTP. A successful ping does not prove a web application is healthy.",
      "Le DevOps identifie la couche en panne avant de modifier une configuration. DNS résout le nom, TCP rejoint une adresse et un port, puis HTTP transporte la requête. Un ping réussi ne prouve pas la santé du site.",
    ),
    scenario: c(
      "A user says “the site is down”. Build a timeline that distinguishes an unknown host, a refused connection and an HTTP error.",
      "Un utilisateur dit « le site est en panne ». Distinguez nom introuvable, connexion refusée et erreur HTTP.",
    ),
    takeaway: c(
      "An HTTP status proves you reached an HTTP-speaking service. A DNS error happens before that exchange.",
      "Un statut HTTP prouve que vous avez atteint un service HTTP. Une erreur DNS se produit avant cet échange.",
    ),
    prerequisites: c(
      "Bash, curl and nslookup or dig. These exercises only make read requests.",
      "Bash, curl et nslookup ou dig. Ces exercices effectuent uniquement des lectures.",
    ),
    flow: flow(
      "Browser|DNS lookup|TCP connection|HTTP response",
      "Navigateur|Résolution DNS|Connexion TCP|Réponse HTTP",
    ),
    steps: [
      step(
        c("Resolve a known domain", "Résoudre un domaine connu"),
        c(
          "Record the resolver and returned addresses; public results can vary.",
          "Relevez le résolveur et les adresses ; les résultats publics peuvent varier.",
        ),
        "nslookup example.com",
        c(
          "You identify a DNS answer without assuming a fixed IP.",
          "Vous identifiez la réponse DNS sans supposer une IP fixe.",
        ),
      ),
      step(
        c("Measure a request", "Mesurer une requête"),
        c(
          "Read headers and timing. A larger TLS time is not itself proof of an application bug.",
          "Lisez en-têtes et durées. Un temps TLS élevé ne prouve pas à lui seul un défaut applicatif.",
        ),
        'curl -I --max-time 10 https://example.com\ncurl -o /dev/null -s -w "dns=%{time_namelookup} connect=%{time_connect} total=%{time_total}\\n" https://example.com',
        c(
          "The report separates name resolution, connection and total request time.",
          "Le rapport sépare résolution, connexion et durée totale.",
        ),
      ),
      step(
        c("Compare failures", "Comparer les échecs"),
        c(
          "The .invalid domain is reserved for deliberately invalid names. Compare its failure with a confirmed unused local port.",
          "Le domaine .invalid sert aux noms volontairement invalides. Comparez avec un port local confirmé libre.",
        ),
        "curl --max-time 5 https://lab.invalid\ncurl --max-time 5 http://127.0.0.1:1",
        c(
          "Your diagram places each failure at its correct layer.",
          "Votre schéma place chaque erreur à la bonne couche.",
        ),
      ),
    ],
    cleanup: c(
      "Keep only redacted timings and the diagram; no resources were provisioned.",
      "Conservez durées expurgées et schéma ; aucune ressource créée.",
    ),
    question: c(
      "The client cannot resolve a hostname. Should you first change the application port?",
      "Le client ne résout pas un nom. Faut-il d’abord modifier le port applicatif ?",
    ),
    answer: c(
      "No. Inspect the name, DNS configuration and resolver answer first. A port change cannot repair a DNS resolution failure.",
      "Non. Vérifiez d’abord le nom, la configuration DNS et la réponse du résolveur. Un changement de port ne répare pas DNS.",
    ),
    misconception: c(
      "Yes. Changing the port refreshes the DNS record automatically.",
      "Oui. Changer de port actualise automatiquement DNS.",
    ),
  }),
  "dev-http": guide({
    topic: "HTTP · reverse proxy",
    family: "linux",
    goal: c(
      "Trace a request through a proxy and explain 404 versus 502.",
      "Suivre une requête à travers un proxy et expliquer 404 et 502.",
    ),
    role: c(
      "A reverse proxy chooses an upstream from routing rules. TLS termination and application authentication solve different problems. Inspect request method, host, path, status and timing at each boundary.",
      "Un reverse proxy choisit une cible selon ses routes. Terminaison TLS et authentification applicative répondent à des besoins distincts. Inspectez méthode, hôte, chemin, statut et durée à chaque frontière.",
    ),
    scenario: c(
      "Your route exists but the upstream process stops. The proxy returns a gateway error even though its own process is alive. Contrast this with a missing application path.",
      "La route existe mais le processus cible s’arrête. Le proxy renvoie une erreur de passerelle tout en restant actif. Comparez avec un chemin applicatif absent.",
    ),
    takeaway: c(
      "Do not “fix” TLS by disabling certificate verification. Find the failing certificate chain, hostname or trust configuration.",
      "Ne « corrigez » pas TLS en désactivant la vérification. Identifiez la chaîne, le nom ou la configuration de confiance en cause.",
    ),
    prerequisites: c(
      "Use this repository’s local campus with npm run dev on 5173 and its API on 4174. curl is required.",
      "Utilisez le campus de ce dépôt avec npm run dev sur 5173 et l’API sur 4174. curl est nécessaire.",
    ),
    flow: flow(
      "Browser :5173|Vite proxy /api|Node :4174|SQLite health",
      "Navigateur :5173|Proxy Vite /api|Node :4174|Santé SQLite",
    ),
    steps: [
      step(
        c("Inspect the route", "Observer la route"),
        c(
          "Start the existing app, then read the API proxy rule in vite.config.ts.",
          "Démarrez l’application puis lisez la règle du proxy API dans vite.config.ts.",
        ),
        "npm run dev",
        c(
          "The frontend listens on 5173 and forwards /api to 4174.",
          "Le frontend écoute sur 5173 et transmet /api à 4174.",
        ),
      ),
      step(
        c(
          "Compare direct and proxied responses",
          "Comparer réponse directe et proxy",
        ),
        c(
          "Use a second terminal while the app is running.",
          "Utilisez un deuxième terminal pendant que l’application tourne.",
        ),
        "curl -i http://127.0.0.1:5173/api/health\ncurl -i http://127.0.0.1:4174/api/health\ncurl -i http://127.0.0.1:5173/api/missing",
        c(
          "Health requests succeed; the missing API route returns an error rather than a valid health response.",
          "La santé répond ; la route API absente renvoie une erreur plutôt qu’une réponse de santé.",
        ),
      ),
      step(
        c("Explain the gateway boundary", "Expliquer la frontière du proxy"),
        c(
          "In a separate lab copy, point the proxy at an unused port and repeat the health request. Record the actual proxy error; implementations need not all return 502. Restore the configuration.",
          "Dans une copie de laboratoire, dirigez le proxy vers un port libre et recommencez. Relevez l’erreur réelle : tous les proxys ne renvoient pas 502. Restaurez la configuration.",
        ),
        undefined,
        c(
          "You distinguish a routing/application error from an unreachable upstream.",
          "Vous distinguez une erreur de route/application d’une cible inaccessible.",
        ),
      ),
    ],
    cleanup: c(
      "Restore vite.config.ts and stop only the lab server with Ctrl+C.",
      "Restaurez vite.config.ts et arrêtez uniquement le serveur de laboratoire avec Ctrl+C.",
    ),
    question: c(
      "A reverse proxy reports 502. What is a useful first investigation?",
      "Un reverse proxy renvoie 502. Quelle première investigation est utile ?",
    ),
    answer: c(
      "Check the selected upstream address, port and health, then correlate proxy and application logs. A live proxy cannot compensate for an unreachable upstream.",
      "Vérifiez adresse, port et santé de la cible, puis croisez journaux du proxy et de l’application. Un proxy actif ne compense pas une cible inaccessible.",
    ),
    misconception: c(
      "Repeatedly clear the browser cache without inspecting the upstream.",
      "Vider sans cesse le cache du navigateur sans vérifier la cible.",
    ),
  }),
  "git-1": guide({
    topic: "Git · evidence and history",
    family: "git",
    goal: c(
      "Create two meaningful commits and explain what each records.",
      "Créer deux commits utiles et expliquer ce que chacun conserve.",
    ),
    role: c(
      "Git stores snapshots. The working tree contains edits, the index selects the next snapshot, and a commit records it. A remote adds collaboration; it is not required for local history.",
      "Git conserve des instantanés. Le dossier de travail contient les modifications, l’index sélectionne le prochain instantané et le commit l’enregistre. Un dépôt distant permet de collaborer mais n’est pas nécessaire à l’historique local.",
    ),
    scenario: c(
      "A teammate asks which change introduced a regression. A small, well-described commit makes the investigation and rollback easier.",
      "Un collègue cherche quel changement a introduit une régression. Un petit commit bien décrit facilite diagnostic et retour arrière.",
    ),
    takeaway: c(
      "Review the staged diff before committing. Commit messages should explain the outcome or reason, not just “update”.",
      "Relisez le diff indexé avant le commit. Le message explique le résultat ou la raison, pas seulement « mise à jour ».",
    ),
    prerequisites: c(
      "Git installed. Use a new directory; the local demo identity below applies only to that repository.",
      "Git installé. Utilisez un nouveau dossier ; l’identité fictive reste locale à ce dépôt.",
    ),
    flow: flow(
      "Working tree|Staging area|Commit|History",
      "Modifications|Index|Commit|Historique",
    ),
    steps: [
      step(
        c("Create a local-only lab", "Créer un laboratoire local"),
        c(
          "Do not publish this fictional identity as a real contributor.",
          "Ne publiez pas cette identité fictive comme un vrai contributeur.",
        ),
        'mkdir lessgooo-git-lab\ncd lessgooo-git-lab\ngit init\ngit config user.name "Lab learner"\ngit config user.email "learner@example.test"',
        c("A separate repository is ready.", "Un dépôt séparé est prêt."),
      ),
      step(
        c("Stage and commit a note", "Indexer et commiter une note"),
        c(
          "Inspect precisely what will enter the commit.",
          "Vérifiez exactement ce qui entrera dans le commit.",
        ),
        'printf "# Deployment notes\\n" > README.md\ngit add README.md\ngit diff --cached\ngit commit -m "Start deployment notes"',
        c(
          "The initial commit contains only README.md.",
          "Le premier commit contient uniquement README.md.",
        ),
      ),
      step(
        c("Explain a second version", "Expliquer une deuxième version"),
        c(
          "Compare before and after, then describe what changed.",
          "Comparez avant et après puis décrivez le changement.",
        ),
        'printf "\\nHealth check before release.\\n" >> README.md\ngit diff\ngit add README.md\ngit commit -m "Document release health check"\ngit log --oneline -2',
        c(
          "Two commits show a clear progression and no credentials.",
          "Deux commits montrent une progression claire, sans identifiants.",
        ),
      ),
    ],
    cleanup: c(
      "Keep the repository as your project evidence; no remote push is required.",
      "Conservez le dépôt comme preuve ; aucun push distant requis.",
    ),
    question: c(
      "Why inspect git diff --cached before a commit?",
      "Pourquoi lire git diff --cached avant un commit ?",
    ),
    answer: c(
      "It shows the exact staged changes that will enter the next commit, which can differ from all working-tree edits.",
      "Il montre exactement les changements indexés du prochain commit, qui peuvent différer des modifications du dossier de travail.",
    ),
    misconception: c(
      "It uploads the current working directory to GitHub for review.",
      "Il envoie le dossier de travail sur GitHub pour relecture.",
    ),
  }),
  "dev-git-team": guide({
    topic: "Git · branches and review",
    family: "git",
    goal: c(
      "Prepare a focused branch, inspect its changes and explain safe conflict resolution.",
      "Préparer une branche ciblée, relire ses changements et résoudre un conflit proprement.",
    ),
    role: c(
      "A branch names a line of development. A pull request adds review and checks, while a merge combines histories. A textual conflict requires understanding both intentions; choosing “ours” blindly can discard valid work.",
      "Une branche nomme une ligne de développement. La pull request ajoute revue et contrôles ; la fusion combine les historiques. Un conflit exige de comprendre les deux intentions.",
    ),
    scenario: c(
      "Two teammates edit the same deployment setting. Preserve both requirements and verify the resulting behaviour instead of treating a resolved conflict as a passed test.",
      "Deux collègues modifient le même paramètre de déploiement. Préservez les deux besoins et testez le comportement ; un conflit résolu n’est pas un test réussi.",
    ),
    takeaway: c(
      "Keep commits focused and run checks on the merged result.",
      "Gardez des commits ciblés et testez le résultat de la fusion.",
    ),
    prerequisites: c(
      "A personal repository with an initial commit. Use a fork or lab copy, never another person’s protected branch.",
      "Un dépôt personnel avec un premier commit. Utilisez une copie de laboratoire ou un fork, jamais la branche protégée d’autrui.",
    ),
    flow: flow(
      "Feature branch|Focused change|Review and CI|Merged result",
      "Branche|Changement ciblé|Revue et CI|Résultat fusionné",
    ),
    steps: [
      step(
        c("Record your starting point", "Noter le point de départ"),
        c(
          "Start only with a clean working tree and remember the original branch.",
          "Commencez uniquement avec un dossier propre et notez la branche initiale.",
        ),
        "git status --short\ngit branch --show-current\ngit switch -c lesson/review-lab",
        c(
          "The new branch starts from the intended commit.",
          "La nouvelle branche part du commit voulu.",
        ),
      ),
      step(
        c("Make one reviewable change", "Faire un changement relisible"),
        c(
          "Add one deployment note, inspect it, then commit.",
          "Ajoutez une note de déploiement, relisez-la puis commitez.",
        ),
        'printf "\\nVerify health after deployment.\\n" >> README.md\ngit diff\ngit add README.md\ngit commit -m "Document post-deployment health check"',
        c(
          "The diff expresses one purpose.",
          "Le diff exprime un seul objectif.",
        ),
      ),
      step(
        c("Practise a review", "Pratiquer la revue"),
        c(
          "In your personal fork, open a PR if you want peer feedback. Explain the problem, solution and validation. For a local exercise, use git show and ask a peer to review the patch.",
          "Dans votre fork, ouvrez une PR si vous souhaitez un avis. Expliquez problème, solution et validation. Localement, faites relire le patch affiché par git show.",
        ),
        "git show --stat HEAD\ngit show HEAD",
        c(
          "A reviewer can tell what changed and how it was checked.",
          "Un relecteur comprend le changement et sa vérification.",
        ),
      ),
    ],
    cleanup: c(
      "Keep the feature branch until review is complete. Do not force-push shared history.",
      "Conservez la branche jusqu’à la fin de la revue. Ne forcez pas l’historique partagé.",
    ),
    question: c(
      "Does removing conflict markers prove that a merge is correct?",
      "Retirer les marqueurs de conflit prouve-t-il que la fusion est correcte ?",
    ),
    answer: c(
      "No. Preserve both intended behaviours and rerun relevant tests against the merged result. A syntactically valid merge can still be logically wrong.",
      "Non. Préservez les intentions et relancez les tests sur le résultat fusionné. Une fusion syntaxiquement valide peut rester incorrecte.",
    ),
    misconception: c(
      "Yes. Git checks the application’s business behaviour automatically.",
      "Oui. Git vérifie automatiquement le comportement métier.",
    ),
  }),
  "dev-git-secrets": guide({
    topic: "Git · secret hygiene",
    family: "security",
    goal: c(
      "Keep local configuration out of Git and respond correctly to a leaked credential.",
      "Garder la configuration locale hors de Git et réagir correctement à une fuite.",
    ),
    role: c(
      "A .gitignore rule only affects untracked paths. It neither removes existing commits nor revokes an exposed credential. Review, scanning and short-lived credentials address different points in the lifecycle.",
      "Une règle .gitignore ne concerne que les chemins non suivis. Elle ne supprime pas les commits existants et ne révoque pas un identifiant exposé. Revue, scan et identifiants temporaires sont complémentaires.",
    ),
    scenario: c(
      "A teammate accidentally commits a test credential. Rehearse the response with a clearly fictional value; do not create or expose a real secret.",
      "Un collègue commite accidentellement un identifiant de test. Répétez la réponse avec une valeur clairement fictive, sans créer de vrai secret.",
    ),
    takeaway: c(
      "Revoke exposed credentials first. Coordinated history cleanup does not make a previously exposed key safe again.",
      "Révoquez d’abord les identifiants exposés. Nettoyer l’historique ne rend pas une clé déjà exposée sûre.",
    ),
    prerequisites: c(
      "An isolated Git lab and a dummy .env file containing no usable credential.",
      "Un dépôt de laboratoire isolé et un fichier .env sans aucun identifiant utilisable.",
    ),
    flow: flow(
      "Local config|Ignore and review|Secret scan|Short-lived access",
      "Config locale|Exclusion et revue|Scan de secrets|Accès temporaire",
    ),
    steps: [
      step(
        c(
          "Separate template and local values",
          "Séparer modèle et valeurs locales",
        ),
        c(
          "Use a public template to describe required names, not to hold working credentials.",
          "Le modèle décrit les noms attendus, sans identifiants utilisables.",
        ),
        'printf "APP_MODE=demo\\n" > .env.example\nprintf ".env\\n" >> .gitignore\nprintf "APP_MODE=local\\n" > .env',
        c(
          "The example is shareable and the local file is excluded.",
          "Le modèle est partageable et le fichier local est exclu.",
        ),
      ),
      step(
        c("Prove the exclusion", "Prouver l’exclusion"),
        c(
          "Check both ignored and tracked paths; this distinction matters.",
          "Vérifiez les chemins ignorés et suivis : la distinction est importante.",
        ),
        "git check-ignore -v .env\ngit ls-files .env\ngit diff --cached",
        c(
          "The ignore rule matches and .env is absent from tracked files.",
          "La règle correspond et .env n’est pas suivi.",
        ),
      ),
      step(
        c("Write an incident runbook", "Rédiger une procédure d’incident"),
        c(
          "List revoke, investigate use, replace securely, coordinate history cleanup and add prevention. Explain why deleting a file alone is insufficient.",
          "Listez révocation, analyse des usages, remplacement sécurisé, nettoyage coordonné et prévention. Expliquez pourquoi supprimer le fichier ne suffit pas.",
        ),
        undefined,
        c(
          "The runbook prioritises stopping access before cosmetic history cleanup.",
          "La procédure arrête l’accès avant le nettoyage de l’historique.",
        ),
      ),
    ],
    cleanup: c(
      "Retain only fictional examples and remove temporary local configuration when finished.",
      "Ne conservez que des exemples fictifs et retirez la configuration locale temporaire après l’exercice.",
    ),
    question: c(
      "A credential was pushed yesterday. Is adding it to .gitignore enough?",
      "Un identifiant a été poussé hier. L’ajouter à .gitignore suffit-il ?",
    ),
    answer: c(
      "No. Revoke or rotate it, investigate access, then coordinate cleanup. .gitignore cannot remove earlier exposure or invalidate the credential.",
      "Non. Révoquez ou renouvelez-le, analysez les accès puis coordonnez le nettoyage. .gitignore n’annule ni l’exposition ni l’identifiant.",
    ),
    misconception: c(
      "Yes. Ignored files immediately disappear from all previous commits.",
      "Oui. Les fichiers ignorés disparaissent aussitôt de tous les anciens commits.",
    ),
  }),
};
