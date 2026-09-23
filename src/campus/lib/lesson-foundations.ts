import { c, step, type LessonGuide } from "./lesson-guide-model";
import { flow, guide } from "./lesson-guide-helpers";
export const foundationGuides: Record<string, LessonGuide> = {
  "linux-1": guide({
    topic: "Linux · filesystem",
    family: "linux",
    goal: c(
      "Locate a service file and explain its owner, path and permissions.",
      "Retrouver un fichier de service et expliquer son propriétaire, son chemin et ses permissions.",
    ),
    role: c(
      "A DevOps engineer must inspect the right host and directory before changing anything. A relative path depends on the current directory; an absolute path starts at the filesystem root.",
      "Un DevOps vérifie la machine et le dossier avant toute modification. Un chemin relatif dépend du dossier courant ; un chemin absolu part de la racine.",
    ),
    scenario: c(
      "A release appears to have lost its configuration. You discover the process starts in a different working directory. Reproduce the path issue in your own lab folder.",
      "Une livraison semble avoir perdu sa configuration. Le processus démarre en réalité dans un autre dossier. Reproduisez ce problème de chemin dans votre laboratoire.",
    ),
    takeaway: c(
      "Inspect first, change one thing, then verify. “File not found” can describe the wrong path rather than a missing file.",
      "Observer, changer un seul élément, puis vérifier. « Fichier introuvable » peut signaler un mauvais chemin plutôt qu’un fichier absent.",
    ),
    prerequisites: c(
      "Bash on Linux, macOS or WSL; a new writable lab folder. No administrator rights needed.",
      "Bash sur Linux, macOS ou WSL ; un nouveau dossier de travail. Aucun droit administrateur nécessaire.",
    ),
    flow: flow(
      "Terminal|Working directory|File path|Evidence",
      "Terminal|Dossier courant|Chemin|Preuve",
    ),
    steps: [
      step(
        c("Create a tiny workspace", "Créer un espace de travail"),
        c(
          "Work in a new folder, separate from system configuration.",
          "Travaillez dans un nouveau dossier, séparé de la configuration système.",
        ),
        'mkdir -p lessgooo-files-lab/config\ncd lessgooo-files-lab\nprintf "port=8080\\n" > config/app.conf',
        c(
          "A config directory contains app.conf.",
          "Le dossier config contient app.conf.",
        ),
      ),
      step(
        c("Inspect instead of guessing", "Observer sans deviner"),
        c(
          "Read the path, owner and contents. Compare the output with your diagram.",
          "Lisez le chemin, le propriétaire et le contenu. Comparez avec votre schéma.",
        ),
        "pwd\nls -la config\ncat config/app.conf\nfind . -name app.conf",
        c(
          "You can name the exact path and owner.",
          "Vous pouvez nommer le chemin exact et le propriétaire.",
        ),
      ),
      step(
        c("Reproduce the failure", "Reproduire l’erreur"),
        c(
          "From the parent folder, try the old relative path. Then use the correct one. Explain the different outcomes.",
          "Depuis le dossier parent, essayez l’ancien chemin relatif puis le bon. Expliquez les deux résultats.",
        ),
        "cd ..\ncat config/app.conf\ncat lessgooo-files-lab/config/app.conf",
        c(
          "One lookup fails; the correctly qualified path prints port=8080.",
          "Une lecture échoue ; le chemin correct affiche port=8080.",
        ),
      ),
    ],
    cleanup: c(
      "Keep only your lab folder as evidence; do not remove system files.",
      "Conservez votre dossier de laboratoire comme preuve ; ne supprimez aucun fichier système.",
    ),
    question: c(
      "A file exists but a script cannot find it. What do you check first?",
      "Un fichier existe mais un script ne le trouve pas. Que vérifier en premier ?",
    ),
    answer: c(
      "Check the process working directory and the exact path, then permissions and mounts. Reproduce with the same user before changing the file.",
      "Vérifier le dossier courant du processus et le chemin exact, puis les permissions et montages. Reproduire avec le même utilisateur avant de modifier le fichier.",
    ),
    misconception: c(
      "Create another copy of the file in every possible directory.",
      "Créer une copie du fichier dans tous les dossiers possibles.",
    ),
  }),
  "linux-2": guide({
    topic: "Linux · permissions",
    family: "linux",
    goal: c(
      "Explain read, write and execute permissions and apply the least access needed.",
      "Expliquer lecture, écriture et exécution et appliquer les droits nécessaires.",
    ),
    role: c(
      "Operators protect configuration from unintended readers. For a directory, execute means traversal; read means listing names. A file’s owner and its parent directory both affect access.",
      "Les opérateurs protègent la configuration des lecteurs non autorisés. Sur un dossier, exécution signifie traversée et lecture signifie liste des noms. Le propriétaire et le dossier parent influencent l’accès.",
    ),
    scenario: c(
      "An application needs a private configuration file. A colleague suggests chmod 777 to make a permission error disappear. Demonstrate a narrower solution.",
      "Une application a besoin d’une configuration privée. Un collègue propose chmod 777 pour supprimer une erreur. Démontrez une solution plus ciblée.",
    ),
    takeaway: c(
      "A permission error is evidence to investigate, not a reason to grant everyone write access.",
      "Une erreur de permission doit être étudiée ; elle ne justifie pas de donner l’écriture à tous.",
    ),
    prerequisites: c(
      "Your own Linux/WSL directory and a normal user account. Use dummy text, never a real secret.",
      "Votre propre dossier Linux/WSL et un compte normal. Utilisez un texte fictif, jamais un vrai secret.",
    ),
    flow: flow(
      "User|Directory traversal|File permissions|Allowed action",
      "Utilisateur|Traversée dossier|Permissions|Action permise",
    ),
    steps: [
      step(
        c("Set a restrictive default", "Définir un défaut restrictif"),
        c(
          "Run in a temporary shell so the umask does not affect other work.",
          "Utilisez un sous-shell pour ne pas changer le masque de vos autres travaux.",
        ),
        '(umask 077; mkdir -p lessgooo-permissions-lab; printf "demo=true\\n" > lessgooo-permissions-lab/config)',
        c(
          "A newly created file is private to its owner.",
          "Le nouveau fichier est privé pour son propriétaire.",
        ),
      ),
      step(
        c("Inspect and constrain", "Observer et limiter"),
        c(
          "Read the symbolic mode and explain each group of three bits.",
          "Lisez le mode symbolique et expliquez chaque groupe de trois bits.",
        ),
        "chmod 700 lessgooo-permissions-lab\nchmod 600 lessgooo-permissions-lab/config\nls -ld lessgooo-permissions-lab\nls -l lessgooo-permissions-lab/config",
        c(
          "The directory is 700 and the file is 600.",
          "Le dossier est en 700 et le fichier en 600.",
        ),
      ),
      step(
        c("Prove useful access remains", "Vérifier l’accès utile"),
        c(
          "Read the dummy file as its owner and describe which other users are excluded.",
          "Lisez le fichier fictif en tant que propriétaire et expliquez quels autres utilisateurs sont exclus.",
        ),
        "cat lessgooo-permissions-lab/config\nid",
        c(
          "The owner can read; the recorded modes grant no group/other access.",
          "Le propriétaire peut lire ; les modes n’accordent aucun accès au groupe ou aux autres.",
        ),
      ),
    ],
    cleanup: c(
      "Archive the permission listing, without private configuration contents.",
      "Conservez le relevé des permissions, sans contenu de configuration privé.",
    ),
    question: c(
      "Why is chmod 777 usually the wrong fix for an application configuration?",
      "Pourquoi chmod 777 est-il généralement inadapté à une configuration ?",
    ),
    answer: c(
      "It grants every local user read, write and execute. Check the service user and required access, then adjust ownership or a specific group without opening access to everyone.",
      "Il donne lecture, écriture et exécution à tous. Vérifiez l’utilisateur du service et le besoin réel, puis ajustez le propriétaire ou un groupe précis.",
    ),
    misconception: c(
      "It is safe because only the application knows the file name.",
      "C’est sans danger car seule l’application connaît le nom du fichier.",
    ),
  }),
  "dev-process": guide({
    topic: "Linux · service diagnosis",
    family: "linux",
    goal: c(
      "Build an evidence-based diagnosis of a failed service.",
      "Construire un diagnostic documenté d’un service en échec.",
    ),
    role: c(
      "DevOps connects process state, listeners and logs. A running process does not guarantee an available endpoint. systemd supervises units, while application logs explain their behaviour.",
      "Le DevOps relie état des processus, ports et journaux. Un processus actif ne garantit pas un service disponible. systemd supervise les unités ; les journaux expliquent leur comportement.",
    ),
    scenario: c(
      "After a release the health check fails. Before restarting, collect a timeline and compare the configured port with the listener.",
      "Après une livraison, le contrôle de santé échoue. Avant un redémarrage, relevez la chronologie et comparez le port configuré au port écouté.",
    ),
    takeaway: c(
      "Preserve evidence before restarting. A restart may hide a recurring failure.",
      "Conservez les preuves avant de redémarrer. Un redémarrage peut masquer une panne récurrente.",
    ),
    prerequisites: c(
      "Linux VM with systemd for the unit commands. macOS and minimal containers do not normally provide systemd.",
      "VM Linux avec systemd pour les commandes d’unités. macOS et les conteneurs minimaux n’en disposent généralement pas.",
    ),
    flow: flow(
      "Health check|Process|Listening port|Journal",
      "Santé|Processus|Port écouté|Journal",
    ),
    steps: [
      step(
        c("List the evidence", "Lister les preuves"),
        c(
          "These commands inspect the machine without restarting anything.",
          "Ces commandes observent la machine sans rien redémarrer.",
        ),
        "ps -eo pid,user,comm,%mem --sort=-%mem | head\nss -lnt\nsystemctl --failed",
        c(
          "A process list, listener list and failed-unit list are available.",
          "Les processus, ports et unités en échec sont listés.",
        ),
      ),
      step(
        c("Choose one lab unit", "Choisir une unité de laboratoire"),
        c(
          "Replace UNIT with the name of your own lab service from systemctl. A read-only query may require journal group access.",
          "Remplacez UNIT par votre service de laboratoire. La lecture des journaux peut nécessiter des droits de groupe.",
        ),
        'systemctl status UNIT --no-pager\njournalctl -u UNIT --since "15 minutes ago" --no-pager',
        c(
          "You can associate a timestamp and error with the chosen unit.",
          "Vous associez une heure et une erreur à l’unité choisie.",
        ),
      ),
      step(
        c("Write and test one hypothesis", "Tester une hypothèse"),
        c(
          "Choose a port/configuration/startup failure supported by the logs. Correct only your lab service, repeat the health check and record before/after evidence.",
          "Choisissez une panne de port, configuration ou démarrage confirmée par les journaux. Corrigez uniquement le service du laboratoire, puis vérifiez sa santé.",
        ),
        undefined,
        c(
          "The report distinguishes a symptom, a cause and a verified recovery.",
          "Le rapport distingue symptôme, cause et rétablissement vérifié.",
        ),
      ),
    ],
    cleanup: c(
      "Restore the lab service to its original configuration; retain a redacted incident timeline.",
      "Rétablissez la configuration initiale du laboratoire ; gardez une chronologie expurgée.",
    ),
    question: c(
      "Why inspect logs before restarting a failed service?",
      "Pourquoi lire les journaux avant de redémarrer un service ?",
    ),
    answer: c(
      "Logs preserve startup errors and timing. Correlate them with process and network evidence, form a hypothesis, change one cause and verify recovery.",
      "Les journaux conservent erreurs de démarrage et horaires. Croisez-les avec les processus et le réseau, formulez une hypothèse, corrigez une cause puis vérifiez.",
    ),
    misconception: c(
      "Keep restarting until one attempt succeeds, without recording the failure.",
      "Redémarrer jusqu’à obtenir un succès sans consigner la panne.",
    ),
  }),
  "dev-bash": guide({
    topic: "Bash · reliable automation",
    family: "linux",
    goal: c(
      "Write a small checker with quoted arguments and meaningful exit codes.",
      "Écrire un contrôle avec arguments protégés et codes de sortie utiles.",
    ),
    role: c(
      "A pipeline relies on exit status, not reassuring log text. Quote variable expansions, validate inputs and handle expected failures explicitly. set -e has context-dependent behaviour; it is not error handling by itself.",
      "Un pipeline se fie au code de sortie, pas à un message rassurant. Protégez les variables, validez les entrées et gérez les échecs attendus. set -e ne remplace pas cette gestion.",
    ),
    scenario: c(
      "A deployment should stop when an endpoint is unavailable. Build a check that also handles a missing argument and a URL containing query parameters.",
      "Un déploiement doit s’arrêter si un endpoint est indisponible. Gérez aussi un argument absent et une URL avec paramètres.",
    ),
    takeaway: c(
      "A useful script has a clear input contract, a bounded timeout and a tested failure path.",
      "Un script utile définit ses entrées, limite les délais et teste aussi les échecs.",
    ),
    prerequisites: c(
      "Bash and curl. Use an endpoint you own or a public documentation endpoint for a single read.",
      "Bash et curl. Utilisez un endpoint autorisé ou une page de documentation pour une simple lecture.",
    ),
    flow: flow(
      "Argument|Validation|HTTP check|Exit status",
      "Argument|Validation|Contrôle HTTP|Code de sortie",
    ),
    steps: [
      step(
        c("Write check.sh", "Écrire check.sh"),
        c(
          "Save this complete script in a new lab folder.",
          "Enregistrez ce script complet dans un nouveau dossier.",
        ),
        '#!/usr/bin/env bash\nset -u\nif [ "$#" -ne 1 ]; then echo "Usage: check.sh URL" >&2; exit 2; fi\nif curl --fail --silent --show-error --max-time 10 "$1" >/dev/null; then\n  echo "Healthy"\nelse\n  echo "Unavailable" >&2\n  exit 1\nfi',
        c(
          "The script returns 2 for invalid usage and 1 for an HTTP/connection failure.",
          "Le script renvoie 2 pour un usage invalide et 1 pour un échec HTTP ou réseau.",
        ),
      ),
      step(
        c("Check syntax and success", "Vérifier syntaxe et succès"),
        c(
          "No execution permission is necessary when invoking Bash directly.",
          "Il n’est pas nécessaire de rendre le fichier exécutable pour le lancer avec Bash.",
        ),
        'bash -n check.sh\nbash check.sh https://example.com\necho "$?"',
        c(
          "A successful request returns zero.",
          "Une requête réussie renvoie zéro.",
        ),
      ),
      step(
        c("Test negative cases", "Tester les échecs"),
        c(
          "Port 1 is deliberately used as a likely closed local endpoint. If something listens there, choose another confirmed unused port.",
          "Le port 1 sert d’endpoint local probablement fermé. Si un service l’utilise, choisissez un port confirmé libre.",
        ),
        'bash check.sh; echo "$?"\nbash check.sh http://127.0.0.1:1; echo "$?"',
        c(
          "The missing argument returns 2 and the unavailable service returns 1.",
          "L’argument absent donne 2 ; le service indisponible donne 1.",
        ),
      ),
    ],
    cleanup: c(
      "Keep the script and test transcript. It creates no cloud resources.",
      "Conservez script et résultats. Aucune ressource cloud n’est créée.",
    ),
    question: c(
      "What makes a shell health check usable in CI?",
      "Qu’est-ce qui rend un contrôle shell utilisable en CI ?",
    ),
    answer: c(
      "Validate arguments, quote expansions, enforce a timeout and return a non-zero status on failure. Test success and failure instead of checking only printed text.",
      "Valider les arguments, protéger les variables, limiter le délai et renvoyer un code non nul en cas d’échec. Tester succès et échec.",
    ),
    misconception: c(
      "Print “failed” but always return zero so the pipeline continues.",
      "Afficher « échec » mais toujours renvoyer zéro pour continuer le pipeline.",
    ),
  }),
  "dev-python": guide({
    topic: "Python · operations",
    family: "linux",
    goal: c(
      "Transform an inventory into a validated report with predictable failures.",
      "Transformer un inventaire en rapport validé avec des erreurs prévisibles.",
    ),
    role: c(
      "Python is useful when operational data has structure. Parse JSON rather than splitting arbitrary text, validate required fields and keep secrets out of exceptions and reports.",
      "Python est utile pour les données opérationnelles structurées. Analysez le JSON plutôt que du texte découpé, validez les champs et gardez les secrets hors des rapports.",
    ),
    scenario: c(
      "Your team receives machine inventories from several environments. Reject a malformed inventory before using it to configure hosts.",
      "Votre équipe reçoit des inventaires de plusieurs environnements. Refusez un inventaire mal formé avant de configurer les machines.",
    ),
    takeaway: c(
      "Separate parsing, validation and reporting so each can be tested independently.",
      "Séparez lecture, validation et rapport pour les tester indépendamment.",
    ),
    prerequisites: c(
      "Python 3 and a text editor; use a fresh directory and fictional machine names.",
      "Python 3 et un éditeur ; utilisez un nouveau dossier et des noms de machines fictifs.",
    ),
    flow: flow(
      "JSON inventory|Parser|Validation|Report",
      "Inventaire JSON|Analyse|Validation|Rapport",
    ),
    steps: [
      step(
        c("Prepare an isolated workspace", "Préparer un espace isolé"),
        c(
          "No third-party package is required for this exercise.",
          "Cet exercice ne nécessite aucune bibliothèque externe.",
        ),
        'python3 -m venv .venv\nprintf \'[{"name":"lab-web","port":8080}]\\n\' > hosts.json',
        c(
          "A virtual environment and a one-host inventory exist.",
          "Un environnement virtuel et un inventaire d’une machine existent.",
        ),
      ),
      step(
        c("Create report.py", "Créer report.py"),
        c(
          "Keep reporting logic simple and fail clearly if the contract is wrong.",
          "Gardez un rapport simple et signalez clairement un contrat invalide.",
        ),
        'import csv\nimport json\nfrom pathlib import Path\n\nhosts = json.loads(Path("hosts.json").read_text(encoding="utf-8"))\nif not isinstance(hosts, list):\n    raise ValueError("Expected a list")\nfor host in hosts:\n    if not isinstance(host, dict):\n        raise ValueError("Each host must be an object")\n    if not isinstance(host.get("name"), str) or not host["name"].strip():\n        raise ValueError("Each host needs a name")\n    if type(host.get("port")) is not int or not 1 <= host["port"] <= 65535:\n        raise ValueError("Each port must be an integer from 1 to 65535")\nwith Path("report.csv").open("w", newline="", encoding="utf-8") as output:\n    writer = csv.DictWriter(output, fieldnames=["name", "port"], extrasaction="ignore")\n    writer.writeheader()\n    writer.writerows(hosts)\nprint(f"Wrote {len(hosts)} hosts to report.csv")',
        c(
          "The report uses validated names and integer ports.",
          "Le rapport utilise des noms et des ports entiers validés.",
        ),
      ),
      step(
        c("Run three cases", "Exécuter trois cas"),
        c(
          "Run once and inspect report.csv. Then test invalid JSON, an empty file and a quoted port in separate copies of hosts.json. Confirm each fails without overwriting the prior report. Restore valid input afterwards.",
          "Exécutez et inspectez report.csv. Testez ensuite JSON invalide, fichier vide et port entre guillemets dans des copies de hosts.json. Vérifiez le refus sans écrasement du rapport précédent. Restaurez ensuite une entrée valide.",
        ),
        'python3 report.py\necho "$?"',
        c(
          "Valid input creates report.csv with name,port and lab-web,8080. Invalid input exits non-zero before opening the output.",
          "L’entrée valide crée report.csv avec name,port et lab-web,8080. Une entrée invalide renvoie un code non nul avant ouverture du rapport.",
        ),
      ),
    ],
    cleanup: c(
      "Keep the report and fixtures. Do not commit .venv or machine credentials.",
      "Conservez rapport et données de test. Ne commitez pas .venv ou des identifiants machines.",
    ),
    question: c(
      "Why validate an inventory before using it to run remote operations?",
      "Pourquoi valider un inventaire avant des opérations à distance ?",
    ),
    answer: c(
      "A syntactically valid file may still contain wrong types or missing fields. Validation stops ambiguous inputs before they affect hosts; tests prove both acceptance and rejection.",
      "Un fichier syntaxiquement valide peut contenir des types incorrects ou des champs absents. La validation les bloque avant qu’ils affectent les machines.",
    ),
    misconception: c(
      "If the JSON parses, all of its values must be safe and correct.",
      "Si le JSON se lit, toutes ses valeurs sont forcément sûres et correctes.",
    ),
  }),
};
