import { c, step, type LessonGuide } from "./lesson-guide-model";
import { lesson } from "./lesson-recipes";
export const kubernetesGuides: Record<string, LessonGuide> = {
  "dev-k8s-core": lesson(
    "Kubernetes · reconciliation",
    "kubernetes",
    c(
      "A Deployment declares the desired replica count; controllers reconcile actual state toward it. Pods are replaceable. A Service provides stable discovery over ready endpoints, not a permanent identity for a particular Pod.",
      "Un Deployment déclare le nombre de réplicas ; les contrôleurs rapprochent l’état réel de cet objectif. Les Pods sont remplaçables. Un Service fournit une découverte stable des endpoints prêts.",
    ),
    c(
      "A web Pod disappears during maintenance. Observe the controller replace it and distinguish desired state from a manually started process.",
      "Un Pod web disparaît pendant une maintenance. Observez son remplacement et distinguez état désiré et processus manuel.",
    ),
    "Deployment|ReplicaSet|Pods|Service",
    "Deployment|ReplicaSet|Pods|Service",
    [
      step(
        c(
          "Create a disposable local cluster",
          "Créer un cluster local jetable",
        ),
        c(
          "Run kind get clusters first. Create lessgooo-lab only if it does not exist; never delete an existing shared cluster to reuse the name.",
          "Lancez d’abord kind get clusters. Créez lessgooo-lab seulement s’il n’existe pas ; ne supprimez jamais un cluster partagé pour reprendre son nom.",
        ),
        "kind get clusters\nkind create cluster --name lessgooo-lab\nkubectl config use-context kind-lessgooo-lab\nkubectl create namespace lesson-lab",
        c(
          "The context is kind-lessgooo-lab and lesson-lab is isolated.",
          "Le contexte est kind-lessgooo-lab et lesson-lab est isolé.",
        ),
      ),
      step(
        c(
          "Declare and expose a lab workload",
          "Déclarer et exposer un service de laboratoire",
        ),
        c(
          "This basic nginx image is a disposable teaching workload, not the campus. It has no private data. The Service remains ClusterIP.",
          "Cette image nginx est un exemple jetable, pas le campus. Aucune donnée privée. Le Service reste ClusterIP.",
        ),
        "kubectl -n lesson-lab create deployment web --image=nginx:stable-alpine --replicas=2\nkubectl -n lesson-lab expose deployment web --port=80\nkubectl -n lesson-lab rollout status deployment/web\nkubectl -n lesson-lab get pods,services",
        c(
          "Two Pods become ready behind one Service.",
          "Deux Pods deviennent prêts derrière un Service.",
        ),
      ),
      step(
        c("Observe reconciliation", "Observer la réconciliation"),
        c(
          "In the lab only, delete one named Pod from the listing and watch a replacement. Use a second terminal to open the local port-forward URL.",
          "Dans ce laboratoire uniquement, supprimez un Pod nommé dans la liste et observez son remplacement. Utilisez un autre terminal pour ouvrir le port-forward local.",
        ),
        "kubectl -n lesson-lab get pods -w\n# In another terminal, replace POD_NAME with one lab Pod:\n# kubectl -n lesson-lab delete pod POD_NAME\n# kubectl -n lesson-lab port-forward service/web 8080:80",
        c(
          "Explain why a new Pod appears and why its name differs while the Service persists.",
          "Expliquez pourquoi un nouveau Pod apparaît avec un autre nom alors que le Service persiste.",
        ),
      ),
    ],
    c(
      "Does deleting a Pod managed by a Deployment change the desired replica count?",
      "Supprimer un Pod géré par un Deployment change-t-il le nombre de réplicas souhaité ?",
    ),
    c(
      "No. The controller still sees the desired count and creates a replacement. Change the Deployment to change the desired state.",
      "Non. Le contrôleur conserve l’objectif et crée un remplaçant. Modifiez le Deployment pour changer l’état désiré.",
    ),
    c(
      "Yes. The Deployment permanently forgets that replica.",
      "Oui. Le Deployment oublie définitivement ce réplica.",
    ),
  ),
  "dev-k8s-health": lesson(
    "Kubernetes · probes",
    "kubernetes",
    c(
      "Readiness controls traffic eligibility. Liveness restarts a stuck container. Startup probes protect slow initialisation. Requests guide placement; limits constrain consumption. A badly chosen probe can create an outage instead of detecting one.",
      "Readiness décide du trafic, liveness redémarre un conteneur bloqué et startup protège une initialisation lente. Requests guident le placement ; limits limitent la consommation. Une mauvaise probe peut créer une panne.",
    ),
    c(
      "A healthy process is marked unready because its probe checks the wrong port. Diagnose the configuration without increasing restart frequency.",
      "Un processus sain est déclaré non prêt car la probe vise un mauvais port. Diagnostiquez sans multiplier les redémarrages.",
    ),
    "Process starts|Startup|Readiness|Traffic",
    "Démarrage|Startup|Readiness|Trafic",
    [
      step(
        c("Read the current health state", "Lire l’état de santé"),
        c(
          "Use the web Deployment from the Kubernetes basics lesson.",
          "Utilisez le Deployment web de la leçon de base.",
        ),
        "kubectl config current-context\nkubectl -n lesson-lab describe deployment web\nkubectl -n lesson-lab get events --sort-by=.metadata.creationTimestamp",
        c(
          "You can separate scheduling, startup and readiness events.",
          "Vous distinguez placement, démarrage et disponibilité.",
        ),
      ),
      step(
        c("Add a readiness probe", "Ajouter une readiness probe"),
        c(
          "Edit the lab Deployment. Under the first container add readinessProbe.httpGet with path / and port 80; set initialDelaySeconds to 3 and periodSeconds to 5. Add requests cpu: 50m and memory: 32Mi, and limits cpu: 250m and memory: 128Mi.",
          "Éditez le Deployment du laboratoire. Dans le premier conteneur ajoutez readinessProbe.httpGet : path /, port 80, initialDelaySeconds 3, periodSeconds 5. Ajoutez requests cpu: 50m, memory: 32Mi et limits cpu: 250m, memory: 128Mi.",
        ),
        "kubectl -n lesson-lab edit deployment web\nkubectl -n lesson-lab rollout status deployment/web",
        c(
          "Ready Pods are selected as service endpoints.",
          "Les Pods prêts deviennent endpoints du Service.",
        ),
      ),
      step(
        c(
          "Inject and repair a wrong port",
          "Introduire puis corriger un mauvais port",
        ),
        c(
          "Change only the readiness probe port to 81, inspect events and EndpointSlices, then restore 80. Do not add an aggressive liveness probe to “solve” readiness.",
          "Changez uniquement le port readiness en 81, observez événements et EndpointSlices puis restaurez 80. N’ajoutez pas une liveness agressive pour « résoudre » readiness.",
        ),
        "kubectl -n lesson-lab get endpointslices\nkubectl -n lesson-lab describe pods\nkubectl -n lesson-lab rollout status deployment/web --timeout=30s",
        c(
          "Explain the failed rollout from probe evidence and prove recovery after restoring port 80.",
          "Expliquez le rollout échoué grâce aux probes et prouvez le retour sain après restauration du port 80.",
        ),
      ),
    ],
    c(
      "Should a readiness failure automatically restart the container?",
      "Un échec readiness doit-il automatiquement redémarrer le conteneur ?",
    ),
    c(
      "No. Readiness removes an endpoint from traffic. Restart decisions belong to liveness and should reflect an unrecoverable process condition, not every downstream outage.",
      "Non. Readiness retire un endpoint du trafic. Liveness décide du redémarrage et doit refléter un blocage du processus, pas toute panne d’une dépendance.",
    ),
    c(
      "Yes. Restarting every unready Pod always improves availability.",
      "Oui. Redémarrer tout Pod non prêt améliore toujours la disponibilité.",
    ),
  ),
  "dev-k8s-security": lesson(
    "Kubernetes · access boundaries",
    "kubernetes",
    c(
      "RBAC controls API actions, NetworkPolicy controls supported network paths and securityContext restricts process privileges. These controls solve different problems. A namespace name alone is not a complete isolation boundary; NetworkPolicy needs an enforcing CNI.",
      "RBAC contrôle les actions API, NetworkPolicy les flux réseau pris en charge, et securityContext les privilèges du processus. Ces contrôles sont distincts. Un namespace seul ne suffit pas ; NetworkPolicy nécessite un CNI qui l’applique.",
    ),
    c(
      "A diagnostic bot should inspect Pods but must not read Secrets. Prove both the allowed and denied action without using a privileged application token.",
      "Un bot de diagnostic doit voir les Pods mais pas les Secrets. Prouvez l’action autorisée et celle refusée sans jeton applicatif privilégié.",
    ),
    "ServiceAccount|Role|RoleBinding|API decision",
    "ServiceAccount|Role|RoleBinding|Décision API",
    [
      step(
        c("Create a narrow lab identity", "Créer une identité limitée"),
        c(
          "Use only the disposable local cluster. These commands grant read access to Pods in one namespace.",
          "Utilisez uniquement le cluster local jetable. Ces commandes accordent la lecture des Pods d’un namespace.",
        ),
        "kubectl -n lesson-lab create serviceaccount observer\nkubectl -n lesson-lab create role pod-reader --verb=get,list --resource=pods\nkubectl -n lesson-lab create rolebinding observer-reads-pods --role=pod-reader --serviceaccount=lesson-lab:observer",
        c(
          "The identity has a namespaced role, not cluster-admin.",
          "L’identité reçoit un rôle limité, pas cluster-admin.",
        ),
      ),
      step(
        c(
          "Test both sides of the boundary",
          "Tester les deux côtés de la frontière",
        ),
        c(
          "Impersonation is performed by your lab admin context; do not grant impersonation to the bot itself.",
          "L’usurpation de test utilise votre contexte administrateur de laboratoire ; ne donnez pas ce droit au bot.",
        ),
        "kubectl auth can-i list pods --as=system:serviceaccount:lesson-lab:observer -n lesson-lab\nkubectl auth can-i get secrets --as=system:serviceaccount:lesson-lab:observer -n lesson-lab",
        c(
          "Listing Pods is allowed and reading Secrets is denied.",
          "Lister les Pods est permis et lire les Secrets est refusé.",
        ),
      ),
      step(
        c("Compare other boundaries", "Comparer les autres frontières"),
        c(
          "Read this repository’s Pod security and NetworkPolicy manifests. Explain why base64 is not encryption and why a policy manifest without a supporting CNI proves no network enforcement.",
          "Lisez les manifestes de sécurité et NetworkPolicy du dépôt. Expliquez pourquoi base64 n’est pas du chiffrement et pourquoi un manifeste sans CNI compatible ne prouve rien sur les flux.",
        ),
        "kubectl kustomize deploy/k8s/overlays/eks",
        c(
          "Present positive and negative RBAC evidence plus a separate network-enforcement verification plan.",
          "Présentez preuves RBAC positives et négatives et un plan séparé de vérification réseau.",
        ),
      ),
    ],
    c(
      "Does applying a NetworkPolicy always mean traffic is filtered?",
      "Appliquer une NetworkPolicy signifie-t-il toujours que les flux sont filtrés ?",
    ),
    c(
      "No. The cluster network implementation must enforce it. Test an allowed connection and a denied one from the intended sources.",
      "Non. Le réseau du cluster doit l’appliquer. Testez une connexion autorisée et une interdite depuis les sources prévues.",
    ),
    c(
      "Yes. A namespace automatically enforces every declared network policy.",
      "Oui. Un namespace applique automatiquement toute politique réseau.",
    ),
  ),
  "dev-helm": lesson(
    "Helm · environment configuration",
    "kubernetes",
    c(
      "Helm renders parameterised Kubernetes templates. Values express differences between environments; a release records an installation. Rendering valid YAML does not prove a rollout will be healthy or that cloud resources are affordable.",
      "Helm rend des templates Kubernetes paramétrés. Les valeurs expriment les différences entre environnements ; une release représente une installation. Un YAML valide ne prouve ni santé du déploiement ni coût acceptable.",
    ),
    c(
      "Development needs one replica and staging needs two. Use one chart with explicit values files instead of copying and editing manifests independently.",
      "Le développement nécessite un réplica et la préproduction deux. Utilisez un chart avec fichiers de valeurs explicites plutôt que des copies divergentes.",
    ),
    "Chart templates|Environment values|Rendered YAML|Reviewed release",
    "Templates chart|Valeurs environnement|YAML rendu|Release revue",
    [
      step(
        c("Generate a disposable chart", "Créer un chart de laboratoire"),
        c(
          "Helm must already be installed. The generated chart is a learning example; do not deploy its defaults to production.",
          "Helm doit être installé. Le chart généré est un exemple, pas une configuration de production.",
        ),
        "helm create lesson-chart\nhelm lint lesson-chart",
        c(
          "The chart passes its initial lint.",
          "Le chart passe sa vérification initiale.",
        ),
      ),
      step(
        c("Render two environments", "Rendre deux environnements"),
        c(
          "Save the outputs and compare only intended differences.",
          "Conservez les rendus et comparez uniquement les différences prévues.",
        ),
        'printf "replicaCount: 1\\n" > dev-values.yaml\nprintf "replicaCount: 2\\n" > staging-values.yaml\nhelm template lesson lesson-chart -f dev-values.yaml > dev.yaml\nhelm template lesson lesson-chart -f staging-values.yaml > staging.yaml\ndiff -u dev.yaml staging.yaml',
        c(
          "The difference reflects the replica count; diff returning 1 means a difference, not a broken render.",
          "La différence concerne les réplicas ; le code 1 de diff indique une différence, pas un rendu cassé.",
        ),
      ),
      step(
        c("Review the rendered contract", "Revoir le contrat rendu"),
        c(
          "Locate image, resources, Service type and probes. Add one resource setting to values and render again. Keep secrets out of values committed to Git.",
          "Repérez image, ressources, type de Service et probes. Ajoutez une ressource dans values puis refaites le rendu. Aucun secret dans les valeurs commitées.",
        ),
        "helm lint lesson-chart -f staging-values.yaml\nhelm template lesson lesson-chart -f staging-values.yaml",
        c(
          "Explain an environment difference from values through to the rendered Kubernetes field.",
          "Expliquez une différence depuis values jusqu’au champ Kubernetes rendu.",
        ),
      ),
    ],
    c(
      "Why review rendered manifests even when helm lint passes?",
      "Pourquoi relire les manifestes rendus si helm lint réussit ?",
    ),
    c(
      "Lint cannot decide your intended permissions, service exposure or capacity. Inspect the generated resources and validate their behaviour in the target lab.",
      "Lint ne décide pas des permissions, de l’exposition ou de la capacité voulues. Inspectez les ressources puis leur comportement dans le laboratoire cible.",
    ),
    c(
      "Because Helm values are guaranteed to hide all secrets automatically.",
      "Parce que Helm garantit de masquer automatiquement tous les secrets.",
    ),
  ),
  "dev-gitops": lesson(
    "Argo CD · reconciliation",
    "kubernetes",
    c(
      "Git holds the reviewed desired state; Argo CD compares it with the cluster and synchronises differences. CI produces artifacts while GitOps promotes references to tested artifacts. Automated pruning can delete resources and must be an explicit decision.",
      "Git contient l’état désiré revu ; Argo CD le compare au cluster puis synchronise les écarts. La CI produit les artefacts ; GitOps promeut leurs références. Le pruning peut supprimer des ressources et doit être explicite.",
    ),
    c(
      "Someone manually changes a replica count. Decide whether the change belongs in Git or is drift to correct; do not fight the reconciler with repeated manual edits.",
      "Quelqu’un change manuellement les réplicas. Décidez s’il faut modifier Git ou corriger une dérive ; ne combattez pas le contrôleur à coups d’éditions manuelles.",
    ),
    "Reviewed Git|Argo comparison|Approved sync|Cluster health",
    "Git revu|Comparaison Argo|Sync approuvée|Santé cluster",
    [
      step(
        c("Read the application boundary", "Lire le périmètre applicatif"),
        c(
          "Inspect the repository’s Argo project and Application before installing anything. Identify repository, path, destination and sync policy.",
          "Inspectez projet et Application Argo avant installation. Repérez dépôt, chemin, destination et politique de sync.",
        ),
        "ls deploy/argocd\ncat deploy/argocd/*.yaml",
        c(
          "You can explain what Argo may manage and why pruning is not automatic.",
          "Vous expliquez ce qu’Argo peut gérer et pourquoi le pruning n’est pas automatique.",
        ),
      ),
      step(
        c("Render desired state first", "Rendre d’abord l’état désiré"),
        c(
          "The EKS overlay contains an image placeholder. Do not sync until a reviewed image digest and the correct repository are configured as described in the README.",
          "L’overlay EKS contient une image à renseigner. Ne synchronisez pas avant configuration d’un digest revu et du dépôt correct selon le README.",
        ),
        "kubectl kustomize deploy/k8s/overlays/eks > desired-state.yaml",
        c(
          "The rendered artifact is reviewable before any cluster mutation.",
          "Le rendu peut être revu avant toute mutation du cluster.",
        ),
      ),
      step(
        c("Practise drift and recovery", "Pratiquer dérive et retour arrière"),
        c(
          "In a configured private lab from the README, change a harmless field in your own GitOps repository, inspect the Argo diff, sync and verify health. Revert the Git commit and sync again; record both revisions. Do not use campus SQLite with multiple writers.",
          "Dans le laboratoire privé configuré via le README, modifiez un champ sans risque dans votre dépôt GitOps, inspectez le diff Argo, synchronisez puis vérifiez. Annulez le commit puis synchronisez à nouveau. Ne multipliez pas les écrivains SQLite du campus.",
        ),
        undefined,
        c(
          "Demonstrate Git revision → sync → healthy workload → reviewed rollback.",
          "Démontrez révision Git → sync → service sain → retour arrière revu.",
        ),
      ),
    ],
    c(
      "Why should a lasting configuration change go through Git?",
      "Pourquoi une modification durable doit-elle passer par Git ?",
    ),
    c(
      "Otherwise the live cluster and desired state diverge, and reconciliation may undo the manual edit. Git provides review, history and a reproducible rollback reference.",
      "Sinon l’état réel diverge et la réconciliation peut annuler l’édition manuelle. Git apporte revue, historique et référence de retour arrière.",
    ),
    c(
      "Because Argo CD builds source code and replaces every CI test.",
      "Parce qu’Argo CD compile le code et remplace tous les tests CI.",
    ),
  ),
  "dev-delivery": lesson(
    "Delivery · rollout and rollback",
    "kubernetes",
    c(
      "A rollout changes instances gradually according to an update strategy. Health signals determine whether to continue. Rollback restores workload configuration, but cannot necessarily undo a database migration or externally processed request.",
      "Un rollout change progressivement les instances selon une stratégie. Les signaux de santé décident de la suite. Un retour arrière de configuration n’annule pas forcément une migration ou une requête déjà traitée.",
    ),
    c(
      "A new web image cannot start. Use rollout status and revision history to recover in the disposable lab, then explain why a real database change needs its own recovery plan.",
      "Une nouvelle image web ne démarre pas. Utilisez état du rollout et historique pour revenir dans le laboratoire, puis expliquez pourquoi une migration exige son propre plan.",
    ),
    "Candidate image|Rollout|Health evidence|Continue or rollback",
    "Image candidate|Rollout|Preuves santé|Continuer ou revenir",
    [
      step(
        c("Record a healthy baseline", "Relever une base saine"),
        c(
          "Use the web Deployment from the local Kubernetes lesson, not the single-replica campus database workload.",
          "Utilisez le Deployment web du cours Kubernetes local, pas le campus à base unique.",
        ),
        "kubectl -n lesson-lab rollout status deployment/web\nkubectl -n lesson-lab rollout history deployment/web",
        c(
          "A healthy starting revision is recorded.",
          "Une révision saine de départ est consignée.",
        ),
      ),
      step(
        c("Introduce a bad lab image", "Introduire une image de test invalide"),
        c(
          "The intentionally nonexistent tag should fail to pull. Observe rather than repeatedly deleting Pods.",
          "Le tag volontairement inexistant doit échouer au téléchargement. Observez sans supprimer les Pods en boucle.",
        ),
        "kubectl -n lesson-lab set image deployment/web nginx=nginx:lesson-does-not-exist\nkubectl -n lesson-lab rollout status deployment/web --timeout=30s\nkubectl -n lesson-lab describe pods",
        c(
          "ImagePull errors explain why the rollout cannot finish.",
          "Les erreurs ImagePull expliquent le rollout incomplet.",
        ),
      ),
      step(
        c("Recover and verify", "Rétablir et vérifier"),
        c(
          "Undo only this lab Deployment change, then test through the Service using a local port-forward.",
          "Annulez uniquement ce changement du Deployment de laboratoire puis testez via le Service en port-forward local.",
        ),
        "kubectl -n lesson-lab rollout undo deployment/web\nkubectl -n lesson-lab rollout status deployment/web\nkubectl -n lesson-lab get pods",
        c(
          "Show failed rollout evidence and successful recovery to the previous revision.",
          "Montrez les preuves du rollout échoué et du retour sain à la révision précédente.",
        ),
      ),
    ],
    c(
      "Does rolling back an image necessarily reverse a database migration?",
      "Revenir à l’ancienne image annule-t-il nécessairement une migration ?",
    ),
    c(
      "No. Image rollback and data recovery are separate. Plan backward-compatible migrations, backups and tested recovery before release.",
      "Non. Retour d’image et restauration de données sont distincts. Prévoyez migrations compatibles, sauvegardes et restauration testée.",
    ),
    c(
      "Yes. Kubernetes automatically restores every external database transaction.",
      "Oui. Kubernetes restaure automatiquement toutes les transactions externes.",
    ),
  ),
};
