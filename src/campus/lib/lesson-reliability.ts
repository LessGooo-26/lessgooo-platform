import { c, step, type LessonGuide } from "./lesson-guide-model";
import { lesson } from "./lesson-recipes";
export const reliabilityGuides: Record<string, LessonGuide> = {
  "dev-metrics": lesson(
    "Observability · metrics",
    "observe",
    c(
      "Prometheus samples numeric time series; Grafana visualises queries. Choose metrics that describe user-visible health, not just server activity. Labels define dimensions, and unbounded user IDs or request IDs can create excessive cardinality.",
      "Prometheus collecte des séries numériques ; Grafana visualise des requêtes. Mesurez la santé vécue par l’utilisateur, pas seulement l’activité serveur. Les labels définissent des dimensions ; identifiants utilisateur ou requête peuvent créer une cardinalité excessive.",
    ),
    c(
      "CPU looks normal while requests fail. Add availability and request outcomes to the investigation instead of declaring the service healthy from CPU alone.",
      "Le CPU est normal mais les requêtes échouent. Examinez disponibilité et résultats des requêtes plutôt que de conclure sur le CPU seul.",
    ),
    "Target / exporter|Prometheus scrape|PromQL|Grafana / alert",
    "Cible / exporter|Collecte Prometheus|PromQL|Grafana / alerte",
    [
      step(
        c("Identify what is actually measured", "Identifier la mesure réelle"),
        c(
          "Read the lab dashboard and alert rules. The campus uses a blackbox exporter; do not assume that the Node app exposes /metrics.",
          "Lisez dashboard et alertes. Le campus utilise un exporter blackbox ; ne supposez pas une route /metrics sur Node.",
        ),
        "cat deploy/monitoring/alerts.yaml\ncat deploy/monitoring/dashboard.yaml",
        c(
          "You distinguish scrape health from the probed application’s health.",
          "Vous distinguez la santé de collecte de celle de l’application testée.",
        ),
      ),
      step(
        c("Explore two signals", "Explorer deux signaux"),
        c(
          "In the authorised Prometheus lab UI, run each query separately. up tests exporter scraping; probe_success tests the configured endpoint probe. Inspect the labels before adding filters.",
          "Dans l’UI Prometheus du laboratoire, lancez chaque requête séparément. up mesure la collecte de l’exporter ; probe_success la cible testée. Inspectez les labels avant filtrage.",
        ),
        "up\nprobe_success",
        c(
          "You can explain a case where up is 1 while probe_success is 0.",
          "Vous expliquez un cas où up vaut 1 et probe_success vaut 0.",
        ),
      ),
      step(
        c("Build an actionable dashboard", "Construire un dashboard utile"),
        c(
          "Add panels for probe success and latency using the labels observed in the lab. Associate a failed probe with a runbook and a controlled local outage. If the monitoring stack is unavailable, submit annotated queries and expected outcomes.",
          "Ajoutez disponibilité et latence avec les labels observés. Reliez un échec à un runbook et à une panne locale contrôlée. Sans stack disponible, rendez les requêtes annotées et résultats attendus.",
        ),
        undefined,
        c(
          "Present a dashboard or reviewed design that connects each panel to a diagnostic action.",
          "Présentez un dashboard ou un plan revu reliant chaque panneau à une action de diagnostic.",
        ),
      ),
    ],
    c(
      "Does up = 1 prove that the user-facing app is healthy?",
      "up = 1 prouve-t-il que l’application utilisateur fonctionne ?",
    ),
    c(
      "No. It proves Prometheus successfully scraped that target. A blackbox exporter can be scraped successfully while its application probe fails.",
      "Non. Cela prouve la collecte de la cible. Un exporter blackbox peut être collecté correctement alors que sa probe applicative échoue.",
    ),
    c(
      "Yes. Every successful scrape guarantees every user request succeeds.",
      "Oui. Une collecte réussie garantit la réussite de toutes les requêtes.",
    ),
  ),
  "dev-traces": lesson(
    "Observability · traces and logs",
    "observe",
    c(
      "Logs record events; metrics aggregate measurements; traces relate spans within a request. Propagate context across service boundaries and use duration plus parent-child relationships to locate a bottleneck. Redact personal data and credentials before exporting telemetry.",
      "Les logs décrivent des événements, les métriques agrègent des mesures et les traces relient des spans d’une requête. Propagez le contexte et exploitez durées et parentés pour localiser un blocage. Retirez données personnelles et identifiants.",
    ),
    c(
      "A checkout request is slow but only one dependency contributes most of the delay. Read a synthetic trace and test the hypothesis before blaming the frontend.",
      "Une requête est lente mais une dépendance concentre le délai. Lisez une trace fictive et testez l’hypothèse avant d’accuser le frontend.",
    ),
    "Request context|Application span|Dependency span|Correlated evidence",
    "Contexte requête|Span application|Span dépendance|Preuves corrélées",
    [
      step(
        c("Build a synthetic timeline", "Construire une chronologie fictive"),
        c(
          "Draw a root request from 0–500 ms, a database call from 30–430 ms and a render span from 440–490 ms. Spans may overlap in real traces; do not sum them blindly.",
          "Dessinez requête 0–500 ms, base 30–430 ms et rendu 440–490 ms. Les spans peuvent se chevaucher : ne les additionnez pas aveuglément.",
        ),
        undefined,
        c(
          "The database call dominates this example’s critical path.",
          "L’appel base domine le chemin critique de cet exemple.",
        ),
      ),
      step(
        c("Correlate without leaking data", "Corréler sans fuite"),
        c(
          "Create logs.jsonl with two fictional events sharing a trace_id. Include operation, timestamp and outcome, not passwords or request bodies.",
          "Créez logs.jsonl avec deux événements fictifs partageant trace_id. Ajoutez opération, heure et résultat, sans mots de passe ni corps de requête.",
        ),
        '{"trace_id":"lab-001","operation":"checkout","outcome":"started"}\n{"trace_id":"lab-001","operation":"database","duration_ms":400,"outcome":"ok"}',
        c(
          "Events can be joined by trace ID without personal data.",
          "Les événements se relient par trace ID sans données personnelles.",
        ),
      ),
      step(
        c("Form a measurable hypothesis", "Formuler une hypothèse mesurable"),
        c(
          "Propose one change, such as indexing a lab query, and specify the before/after spans you would compare. Explain sampling limitations and why one trace is not a population-wide latency statistic.",
          "Proposez un changement, comme un index sur une requête de laboratoire, puis les spans à comparer. Expliquez l’échantillonnage et pourquoi une trace n’est pas une statistique globale.",
        ),
        undefined,
        c(
          "Submit a trace diagram, correlated logs and a falsifiable latency hypothesis.",
          "Rendez schéma de trace, logs corrélés et hypothèse de latence vérifiable.",
        ),
      ),
    ],
    c(
      "Why combine traces with metrics when investigating slowness?",
      "Pourquoi combiner traces et métriques pour une lenteur ?",
    ),
    c(
      "A trace explains the path of selected requests; metrics show aggregate behaviour and frequency. Together they distinguish an isolated slow request from a widespread regression.",
      "Une trace explique le trajet de requêtes sélectionnées ; les métriques montrent fréquence et comportement global. Ensemble elles distinguent cas isolé et régression généralisée.",
    ),
    c(
      "A single slow trace proves all users experienced the same delay.",
      "Une seule trace lente prouve que tous les utilisateurs ont subi le même délai.",
    ),
  ),
  "dev-slo": lesson(
    "SRE · service objectives",
    "observe",
    c(
      "A service-level indicator measures user experience. An objective sets a target over an explicit window, and the error budget quantifies acceptable unreliability. The definition of a valid request matters as much as the percentage.",
      "Un indicateur mesure l’expérience utilisateur. Un objectif fixe une cible sur une fenêtre et le budget d’erreur quantifie l’indisponibilité acceptée. La définition des requêtes éligibles compte autant que le pourcentage.",
    ),
    c(
      "An example API targets 99.9% successful eligible requests over 30 days. Calculate its budget from request counts instead of confusing request-based availability with minutes of uptime.",
      "Une API fictive vise 99,9 % de requêtes éligibles réussies sur 30 jours. Calculez le budget par requêtes sans le confondre avec des minutes de disponibilité.",
    ),
    "Eligible requests|Good events|SLO window|Error-budget decision",
    "Requêtes éligibles|Événements réussis|Fenêtre SLO|Décision budget",
    [
      step(
        c("Define the measurement contract", "Définir le contrat de mesure"),
        c(
          "Specify endpoint, eligible traffic, what counts as success and where measurement occurs. Decide how to treat client errors and missing telemetry.",
          "Précisez endpoint, trafic éligible, succès et point de mesure. Définissez le traitement des erreurs client et de la télémétrie absente.",
        ),
        undefined,
        c(
          "Two reviewers would classify the same events consistently.",
          "Deux relecteurs classeraient les mêmes événements de façon cohérente.",
        ),
      ),
      step(
        c("Calculate a sample budget", "Calculer un budget fictif"),
        c(
          "With 100,000 eligible requests and a 99.9% target, 100 failures are allowed. If 40 failed, 60 remain. These are teaching numbers, not an institutional commitment.",
          "Avec 100 000 requêtes et une cible de 99,9 %, 100 échecs sont permis. Après 40 échecs, il en reste 60. Ces nombres illustrent le cours, sans engagement institutionnel.",
        ),
        'python3 -c "total=100000; allowed=total*(1-0.999); print(round(allowed), round(allowed-40))"',
        c(
          "The sample budget is 100 failures, with 60 remaining.",
          "Le budget fictif est de 100 échecs, dont 60 restants.",
        ),
      ),
      step(
        c("Connect measurement to a decision", "Relier mesure et décision"),
        c(
          "Write an example policy for a fast-burning budget: investigate, slow risky releases and prioritise reliability. Define who reviews exceptions rather than hiding failures from the denominator.",
          "Écrivez une politique d’exemple : enquêter, ralentir les livraisons risquées et prioriser la fiabilité si le budget se consomme vite. Définissez la revue des exceptions sans masquer les échecs.",
        ),
        undefined,
        c(
          "Present an SLI formula, time window, budget calculation and operational response.",
          "Présentez formule SLI, fenêtre, calcul du budget et réponse opérationnelle.",
        ),
      ),
    ],
    c(
      "Why is “99.9% reliable” incomplete as an SLO?",
      "Pourquoi « fiable à 99,9 % » est-il un SLO incomplet ?",
    ),
    c(
      "It lacks the measured user journey, eligible population, success criterion and time window. Without those, the percentage is not reproducible.",
      "Il manque parcours utilisateur, population éligible, critère de succès et fenêtre. Sans eux le pourcentage n’est pas reproductible.",
    ),
    c(
      "Because a percentage is enough and adding a time window would reduce accuracy.",
      "Parce qu’un pourcentage suffit et qu’une fenêtre réduirait la précision.",
    ),
  ),
  "dev-incident": lesson(
    "SRE · incident response",
    "observe",
    c(
      "Incident response prioritises user impact, coordination and safe mitigation. A postmortem distinguishes contributing conditions from individual blame and turns findings into owned, verifiable follow-up work.",
      "La réponse à incident priorise impact utilisateur, coordination et mitigation sûre. Le postmortem distingue facteurs contributifs et culpabilisation puis produit des actions attribuées et vérifiables.",
    ),
    c(
      "A release causes elevated errors. Decide when to rollback, what evidence to preserve and how to tell teammates what is known versus still uncertain.",
      "Une livraison augmente les erreurs. Décidez quand revenir, quelles preuves conserver et comment distinguer faits établis et incertitudes.",
    ),
    "Detect impact|Stabilise|Verify recovery|Learn and prevent",
    "Détecter impact|Stabiliser|Vérifier reprise|Apprendre et prévenir",
    [
      step(
        c("Create a fictional timeline", "Créer une chronologie fictive"),
        c(
          "Record deployment time, first symptom, impact assessment and the first safe mitigation. Assign an incident coordinator and a communications owner for the exercise.",
          "Consignez livraison, premier symptôme, impact et première mitigation sûre. Attribuez coordination et communication pour l’exercice.",
        ),
        undefined,
        c(
          "The timeline separates observation from hypothesis.",
          "La chronologie sépare observation et hypothèse.",
        ),
      ),
      step(
        c(
          "Choose a reversible mitigation",
          "Choisir une mitigation réversible",
        ),
        c(
          "Use the failed-image rollout from the delivery lab or a paper scenario. List the rollback preconditions, including data compatibility, and define a user-visible recovery check.",
          "Utilisez le rollout d’image échoué ou un scénario papier. Listez les prérequis du retour arrière, dont compatibilité des données, et un contrôle de reprise visible utilisateur.",
        ),
        undefined,
        c(
          "The mitigation has an owner, a risk assessment and a success signal.",
          "La mitigation a un responsable, des risques évalués et un signal de réussite.",
        ),
      ),
      step(
        c("Write a useful postmortem", "Rédiger un postmortem utile"),
        c(
          "Include impact, detection, timeline, contributing factors, what helped and two follow-ups with an owner and verification method. Avoid invented blame or unsupported root-cause certainty.",
          "Incluez impact, détection, chronologie, facteurs, points utiles et deux actions avec responsable et vérification. Évitez accusation inventée et certitude sans preuve.",
        ),
        undefined,
        c(
          "Submit a blameless report with two testable prevention or detection improvements.",
          "Rendez un rapport sans culpabilisation avec deux améliorations de prévention ou détection testables.",
        ),
      ),
    ],
    c(
      "Why is restarting everything usually a poor first incident response?",
      "Pourquoi tout redémarrer est-il souvent une mauvaise première réponse ?",
    ),
    c(
      "It can destroy evidence and widen the outage. Assess impact, preserve useful signals, choose a scoped mitigation and verify user-visible recovery.",
      "Cela peut détruire des preuves et étendre la panne. Évaluez l’impact, préservez les signaux, choisissez une action ciblée puis vérifiez la reprise.",
    ),
    c(
      "It always identifies the root cause and is guaranteed to preserve all data.",
      "Cela identifie toujours la cause et garantit la préservation des données.",
    ),
  ),
  "dev-platform": lesson(
    "Platform engineering · usable paths",
    "iac",
    c(
      "An internal platform offers a supported path through common delivery tasks. Treat developers as users: define the interface, feedback and escape hatches. Cloud services are not interchangeable merely because they have similar names; MLOps also tracks data, model versions and drift.",
      "Une plateforme interne fournit un parcours accompagné pour livrer. Traitez les développeurs comme des utilisateurs : interface, retours et possibilités de sortie. Des services cloud aux noms proches ne sont pas équivalents ; MLOps suit aussi données, modèles et dérive.",
    ),
    c(
      "A team wants a one-command service template across AWS, Azure and GCP. First define which responsibilities remain portable and which require provider-specific implementation.",
      "Une équipe veut un modèle de service utilisable sur AWS, Azure et GCP. Distinguez d’abord responsabilités portables et adaptations spécifiques.",
    ),
    "Developer need|Supported template|Provider adapter|Feedback",
    "Besoin développeur|Modèle accompagné|Adaptateur cloud|Retour utilisateur",
    [
      step(
        c(
          "Specify the platform user journey",
          "Définir le parcours utilisateur",
        ),
        c(
          "Choose one small task: create a service with tests, a health endpoint and an owner. Write its required inputs and the evidence returned after creation.",
          "Choisissez une tâche simple : créer un service avec tests, santé et responsable. Écrivez ses entrées et les preuves retournées.",
        ),
        undefined,
        c(
          "The interface solves a concrete developer problem.",
          "L’interface répond à un besoin concret du développeur.",
        ),
      ),
      step(
        c(
          "Map responsibilities across clouds",
          "Comparer les responsabilités cloud",
        ),
        c(
          "Using the linked official architectures, compare identity, container runtime, network entry and monitoring. Mark differences in permissions, operations and billing instead of declaring equivalence.",
          "Avec les architectures officielles liées, comparez identité, runtime, entrée réseau et monitoring. Notez différences de droits, exploitation et facturation sans déclarer d’équivalence.",
        ),
        undefined,
        c(
          "A comparison table names both portable concepts and provider-specific decisions.",
          "Un tableau distingue concepts portables et décisions propres aux fournisseurs.",
        ),
      ),
      step(
        c("Extend the design to a model", "Étendre la conception à un modèle"),
        c(
          "Add data version, training artifact, evaluation threshold, deployment approval and rollback. Explain how a model can degrade even when the service health endpoint stays green.",
          "Ajoutez version des données, artefact entraîné, seuil d’évaluation, approbation et retour arrière. Expliquez la dégradation possible malgré une santé technique verte.",
        ),
        undefined,
        c(
          "Present a simple platform contract and distinguish service reliability from model quality.",
          "Présentez un contrat de plateforme simple et distinguez fiabilité du service et qualité du modèle.",
        ),
      ),
    ],
    c(
      "Is a platform successful just because it hides every infrastructure detail?",
      "Une plateforme réussit-elle simplement en cachant toute l’infrastructure ?",
    ),
    c(
      "No. It must improve a real user workflow, provide useful feedback and support exceptions. Hidden complexity without ownership makes diagnosis harder.",
      "Non. Elle doit améliorer un vrai parcours, fournir des retours utiles et gérer les exceptions. Cacher la complexité sans responsable complique le diagnostic.",
    ),
    c(
      "Yes. More automation always removes the need for observability and support.",
      "Oui. Plus d’automatisation supprime le besoin d’observabilité et de support.",
    ),
    c(
      "Keep the design and feedback. This design exercise creates no cloud or model-training resources.",
      "Conservez conception et retours. Cet exercice ne crée aucune ressource cloud ou d’entraînement.",
    ),
  ),
};
