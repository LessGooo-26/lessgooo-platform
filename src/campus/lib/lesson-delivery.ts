import { c, step, type LessonGuide } from "./lesson-guide-model";
import { lesson } from "./lesson-recipes";
export const deliveryGuides: Record<string, LessonGuide> = {
  "dev-docker-build": lesson(
    "Docker · image lifecycle",
    "containers",
    c(
      "Package an application and its dependencies into a versioned artifact. Build stages may contain compilers; the runtime should contain only what the service uses. A container shares the host kernel and is not a complete virtual machine.",
      "Regroupez application et dépendances dans un artefact versionné. Les étapes de build peuvent contenir des compilateurs ; le runtime ne conserve que l’utile. Un conteneur partage le noyau hôte et n’est pas une VM complète.",
    ),
    c(
      "A build works on one laptop but fails in CI. Use the repository’s lockfile, multi-stage build and runtime smoke test to compare the same artifact.",
      "Un build fonctionne sur un portable mais échoue en CI. Utilisez lockfile, build multi-étapes et contrôle du runtime pour comparer le même artefact.",
    ),
    "Source + lockfile|Build stage|Runtime image|Health check",
    "Code + lockfile|Étape build|Image runtime|Contrôle santé",
    [
      step(
        c("Read the build contract", "Lire le contrat de build"),
        c(
          "In a separate clone, identify the base digest, build stage, runtime user and excluded files.",
          "Dans un clone séparé, identifiez digest de base, étape build, utilisateur et fichiers exclus.",
        ),
        "cat Dockerfile\ncat .dockerignore",
        c(
          "You explain why .env and local data must not enter the build context.",
          "Vous expliquez pourquoi .env et les données locales sont exclus.",
        ),
      ),
      step(
        c("Build the artifact", "Construire l’artefact"),
        c(
          "This repository runs its checks during the build. A failing check must stop the build.",
          "Ce dépôt exécute ses contrôles dans le build. Un échec doit l’arrêter.",
        ),
        'docker build -t lessgooo-campus:lesson .\ndocker image inspect lessgooo-campus:lesson --format "{{.Id}} {{.Config.User}}"',
        c(
          "One image ID is recorded and the runtime user is non-root.",
          "Un identifiant d’image est relevé et l’utilisateur est non-root.",
        ),
      ),
      step(
        c("Test the actual runtime", "Tester le runtime réel"),
        c(
          "The script uses an isolated temporary volume and removes its own test container afterwards.",
          "Le script utilise un volume temporaire isolé et retire ensuite son conteneur de test.",
        ),
        "bash scripts/container-smoke.sh lessgooo-campus:lesson",
        c(
          "Demonstrate startup, SQLite backup integrity and rejected foreign-origin requests on the built image.",
          "Démontrez démarrage, intégrité de sauvegarde SQLite et refus des requêtes d’origine étrangère sur l’image construite.",
        ),
      ),
    ],
    c(
      "Why use different build and runtime stages?",
      "Pourquoi séparer build et runtime ?",
    ),
    c(
      "Build tools help produce the artifact but enlarge the runtime attack surface. Copy only required outputs and production dependencies, then test the final image.",
      "Les outils de build produisent l’artefact mais agrandissent la surface du runtime. Copiez uniquement sorties et dépendances nécessaires puis testez l’image finale.",
    ),
    c(
      "Shipping all compilers and npm caches makes the service inherently more secure.",
      "Livrer compilateurs et caches npm rend le service plus sûr.",
    ),
  ),
  "dev-compose": lesson(
    "Docker Compose · persistence",
    "containers",
    c(
      "Compose defines services, networks and volumes as a local system. A named volume outlives a container, but it is not a backup. Publishing a port exposes an entry point; internal service discovery uses service names.",
      "Compose décrit services, réseaux et volumes. Un volume nommé survit au conteneur mais n’est pas une sauvegarde. Un port publié expose une entrée ; les services internes se trouvent par leur nom.",
    ),
    c(
      "A container is recreated during an update. Prove that your lab’s saved data and backup survive without exposing the database port.",
      "Un conteneur est recréé lors d’une mise à jour. Prouvez que données et sauvegarde survivent sans exposer un port de base de données.",
    ),
    "Compose file|Campus process|Named volume|Verified backup",
    "Fichier Compose|Processus campus|Volume nommé|Sauvegarde vérifiée",
    [
      step(
        c("Review before starting", "Vérifier avant démarrage"),
        c(
          "Use a fresh lab clone with no .env.local containing real credentials.",
          "Utilisez un clone neuf sans .env.local contenant de vrais identifiants.",
        ),
        "docker compose config --services\ndocker compose config --volumes",
        c(
          "The expected application and persistent volume are listed.",
          "L’application et le volume attendus sont listés.",
        ),
      ),
      step(
        c("Start and create a backup", "Démarrer et sauvegarder"),
        c(
          "Open the loopback URL and create only synthetic records. The backup uses SQLite’s online API.",
          "Ouvrez l’URL locale et créez uniquement des données fictives. La sauvegarde utilise l’API SQLite.",
        ),
        "docker compose up --build -d\ndocker compose ps\ncurl --fail http://127.0.0.1:4173/api/health\ndocker compose exec campus node scripts/backup.mjs",
        c(
          "The service is healthy and the backup path is reported.",
          "Le service est sain et le chemin de sauvegarde est indiqué.",
        ),
      ),
      step(
        c(
          "Recreate without deleting storage",
          "Recréer sans supprimer le stockage",
        ),
        c(
          "Check that your synthetic record remains. Inspect the backup directory, then follow the README restore exercise in a separate volume.",
          "Vérifiez la présence de votre donnée fictive. Inspectez la sauvegarde puis suivez la restauration du README dans un volume séparé.",
        ),
        "docker compose up -d --force-recreate\ndocker compose exec campus ls .local-data/backups",
        c(
          "Explain and demonstrate the difference between persistence and a tested restore.",
          "Expliquez et démontrez la différence entre persistance et restauration testée.",
        ),
      ),
    ],
    c(
      "Does a named volume protect you from every kind of data loss?",
      "Un volume nommé protège-t-il de toute perte ?",
    ),
    c(
      "No. It survives container replacement, but deletion, corruption or host failure can still destroy it. Keep an independent backup and test recovery.",
      "Non. Il survit au remplacement d’un conteneur, mais suppression, corruption ou panne hôte restent possibles. Gardez une sauvegarde indépendante et testez la restauration.",
    ),
    c(
      "Yes. A volume automatically keeps an independent historical backup.",
      "Oui. Un volume conserve automatiquement une sauvegarde historique indépendante.",
    ),
  ),
  "dev-registry": lesson(
    "Registry · tags and digests",
    "containers",
    c(
      "A registry distributes image manifests and layers. Tags are convenient names that can move; a content digest identifies specific bytes. Promotion should use a verified digest of the artifact that passed tests.",
      "Un registre distribue manifestes et couches. Les tags peuvent changer ; le digest identifie un contenu précis. La promotion utilise le digest vérifié de l’artefact testé.",
    ),
    c(
      "Staging and production both say “latest” but run different content. Diagnose the mismatch and define a traceable release identifier.",
      "Préproduction et production affichent « latest » mais exécutent des contenus différents. Identifiez l’écart et définissez une livraison traçable.",
    ),
    "Tested image|Tag|Registry manifest|Immutable digest",
    "Image testée|Tag|Manifeste registre|Digest immuable",
    [
      step(
        c("Build once", "Construire une fois"),
        c(
          "Use the image from the Docker lesson; do not rebuild it for this tagging exercise.",
          "Utilisez l’image de la leçon Docker sans la reconstruire.",
        ),
        'docker image inspect lessgooo-campus:lesson --format "{{.Id}}"',
        c(
          "You have the tested local image ID.",
          "Vous avez l’identifiant local testé.",
        ),
      ),
      step(
        c("Create a second label", "Créer une deuxième étiquette"),
        c(
          "Tagging changes a reference, not the image contents.",
          "Ajouter un tag change la référence, pas le contenu.",
        ),
        'docker tag lessgooo-campus:lesson lessgooo-campus:reviewed\ndocker image inspect lessgooo-campus:reviewed --format "{{.Id}}"',
        c(
          "Both local tags refer to the same image ID.",
          "Les deux tags locaux désignent le même identifiant.",
        ),
      ),
      step(
        c("Define a promotion record", "Définir une fiche de promotion"),
        c(
          "Record source commit, successful run URL, SBOM and the registry digest after an authorised publish. A local image ID is not automatically the registry manifest digest. Publishing is optional for this exercise.",
          "Consignez commit, lien du run, SBOM et digest du registre après publication autorisée. L’identifiant local n’est pas automatiquement le digest du manifeste. Publier est facultatif ici.",
        ),
        undefined,
        c(
          "Produce a release record that distinguishes tag, local image ID and registry digest.",
          "Produisez une fiche distinguant tag, identifiant local et digest du registre.",
        ),
      ),
    ],
    c(
      "Why deploy by digest instead of relying only on latest?",
      "Pourquoi déployer par digest plutôt qu’avec latest seul ?",
    ),
    c(
      "The digest fixes the reviewed content. A tag can be repointed, so two pulls of the same tag need not retrieve the same bytes.",
      "Le digest fixe le contenu revu. Un tag peut être déplacé ; deux téléchargements du même tag peuvent différer.",
    ),
    c(
      "A tag can never change once it has been created.",
      "Un tag ne peut jamais changer après sa création.",
    ),
  ),
  "dev-actions": lesson(
    "GitHub Actions · gates",
    "pipeline",
    c(
      "A workflow responds to an event; jobs run on runners and steps execute commands or actions. needs expresses a dependency: publishing must wait for successful quality and security checks.",
      "Un workflow répond à un événement ; les jobs utilisent des runners et les étapes exécutent des commandes ou actions. needs exprime une dépendance : publier attend la qualité et la sécurité.",
    ),
    c(
      "A test fails but an image is still published because the release job has no dependency on tests. Draw the graph and repair the missing dependency in a personal fork.",
      "Un test échoue mais l’image est publiée car le job de publication ne dépend pas des tests. Dessinez le graphe et corrigez-le dans un fork personnel.",
    ),
    "Pull request|Quality + security|Tested image|Protected publish",
    "Pull request|Qualité + sécurité|Image testée|Publication protégée",
    [
      step(
        c("Map the real workflow", "Cartographier le workflow"),
        c(
          "Read this repository’s ci.yml and label each needs edge, permission and branch condition.",
          "Lisez ci.yml et annotez chaque dépendance needs, permission et condition de branche.",
        ),
        "cat .github/workflows/ci.yml",
        c(
          "Your graph explains why main-only publication is skipped on a feature branch.",
          "Votre graphe explique pourquoi la publication réservée à main est ignorée sur une branche.",
        ),
      ),
      step(
        c("Run the first gate locally", "Exécuter la première barrière"),
        c(
          "Use the locked dependencies and the actual repository commands.",
          "Utilisez les dépendances verrouillées et les commandes du dépôt.",
        ),
        "npm ci\nnpm run lint\nnpm run typecheck\nnpm test\nnpm run build",
        c(
          "Every command returns success before a build can be promoted.",
          "Chaque commande doit réussir avant promotion.",
        ),
      ),
      step(
        c("Prove failure blocks delivery", "Prouver le blocage en cas d’échec"),
        c(
          "On a disposable branch in your fork, change one expected test result, push and inspect the failed job and skipped dependants. Restore the test and rerun. Do not weaken the assertion in the final branch.",
          "Dans une branche jetable de votre fork, modifiez un résultat attendu et observez l’échec et les jobs dépendants ignorés. Restaurez le test et relancez. Ne réduisez pas l’exigence finale.",
        ),
        undefined,
        c(
          "Show a failing run followed by a green run, with the same security gates enabled.",
          "Montrez un run en échec puis un run réussi avec les mêmes barrières de sécurité.",
        ),
      ),
    ],
    c(
      "What prevents a release job running after failed tests?",
      "Qu’est-ce qui empêche une publication après des tests échoués ?",
    ),
    c(
      "Make the release depend on the test/security jobs, keep failure exit codes and restrict publication events and permissions. A diagram alone does not enforce the dependency.",
      "Faites dépendre la publication des tests/scans, conservez les codes d’échec et limitez événements et permissions. Un diagramme ne suffit pas.",
    ),
    c(
      "Give the release job more token permissions so it ignores failed tests.",
      "Donner davantage de droits au jeton de publication pour ignorer les échecs.",
    ),
  ),
  "dev-jenkins": lesson(
    "Jenkins & GitLab · runners",
    "pipeline",
    c(
      "The syntax differs but both systems schedule work on execution agents. Treat the runner as a trust boundary: untrusted contributions must not receive deployment credentials or access to private build hosts.",
      "La syntaxe diffère mais les deux systèmes planifient le travail sur des agents. Le runner est une frontière de confiance : une contribution non fiable ne reçoit ni identifiants de déploiement ni accès aux hôtes privés.",
    ),
    c(
      "A team migrates from Jenkins to GitLab. Translate test stages and artifact flow without silently broadening permissions.",
      "Une équipe passe de Jenkins à GitLab. Traduisez étapes de test et artefacts sans élargir les permissions.",
    ),
    "Commit|Runner allocation|Tests|Artifacts",
    "Commit|Allocation runner|Tests|Artefacts",
    [
      step(
        c("Write a minimal Jenkinsfile", "Écrire un Jenkinsfile minimal"),
        c(
          "Use a local sandbox agent with Node installed. This example has no deployment credentials.",
          "Utilisez un agent de laboratoire avec Node installé. Cet exemple ne contient aucun identifiant de déploiement.",
        ),
        "pipeline {\n  agent any\n  stages {\n    stage('Test') { steps { sh 'npm ci && npm test' } }\n  }\n}",
        c(
          "A test exit code determines the stage result.",
          "Le code de sortie des tests détermine le résultat de l’étape.",
        ),
      ),
      step(
        c("Translate to GitLab", "Traduire vers GitLab"),
        c(
          "Save as .gitlab-ci.yml in a personal GitLab project. Pin the runner image by a reviewed digest before production use.",
          "Enregistrez dans .gitlab-ci.yml d’un projet personnel. Fixez l’image du runner par un digest revu avant tout usage de production.",
        ),
        "stages: [test]\nunit-tests:\n  image: node:22-alpine\n  stage: test\n  script:\n    - npm ci\n    - npm test",
        c(
          "You can map stage, runner image and script across systems.",
          "Vous pouvez comparer étape, image du runner et script.",
        ),
      ),
      step(
        c("Review the trust boundary", "Revoir la frontière de confiance"),
        c(
          "For each system, document who can modify the pipeline, where the runner executes, which credentials it receives and what a fork can trigger. Run only in your authorised sandbox.",
          "Pour chaque système, indiquez qui modifie le pipeline, où il tourne, quels identifiants il reçoit et ce qu’un fork peut déclencher. Exécutez uniquement dans votre laboratoire autorisé.",
        ),
        undefined,
        c(
          "Present equivalent pipelines and a runner-permission comparison.",
          "Présentez des pipelines équivalents et une comparaison des droits des runners.",
        ),
      ),
    ],
    c(
      "Why isolate untrusted pull-request builds from deployment agents?",
      "Pourquoi isoler les builds non fiables des agents de déploiement ?",
    ),
    c(
      "Pipeline code can execute arbitrary commands on its runner. Isolation and minimal permissions limit access to credentials, networks and persistent state.",
      "Le code du pipeline exécute des commandes sur le runner. Isolation et droits minimaux limitent l’accès aux identifiants, réseaux et données persistantes.",
    ),
    c(
      "A private repository guarantees that every future build script is harmless.",
      "Un dépôt privé garantit que tout futur script de build est inoffensif.",
    ),
  ),
};
