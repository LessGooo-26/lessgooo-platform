import { c, step, type LessonGuide } from "./lesson-guide-model";
import { lesson } from "./lesson-recipes";
const identity = step(
  c("Confirm the account and region", "Confirmer compte et région"),
  c(
    "Use an authorised sandbox profile. Redact account IDs in shared screenshots. If you have no account, draw the architecture using the docs and sample fields instead.",
    "Utilisez un profil de laboratoire autorisé. Masquez les numéros de compte dans les captures. Sans compte, dessinez l’architecture avec la documentation et des champs fictifs.",
  ),
  "aws sts get-caller-identity\naws configure get region",
  c(
    "The caller and intended region are known before any API request.",
    "L’identité et la région sont connues avant toute requête API.",
  ),
);
export const cloudGuides: Record<string, LessonGuide> = {
  "dev-aws-iam": lesson(
    "AWS · identity and responsibility",
    "cloud",
    c(
      "Separate identity, permission and resource ownership. Roles provide temporary credentials; policies define actions and resources. An explicit deny overrides an allow. AWS protects underlying infrastructure while customers still configure access and secure their workloads.",
      "Distinguez identité, permission et responsabilité. Les rôles fournissent des identifiants temporaires ; les politiques définissent actions et ressources. Un refus explicite prime. AWS protège l’infrastructure sous-jacente ; le client configure accès et workloads.",
    ),
    c(
      "A release job should deploy one lab service, not administer the whole account. Write the minimum access contract before requesting credentials.",
      "Un job doit déployer un service de laboratoire, pas administrer tout le compte. Définissez son accès minimal avant de demander des identifiants.",
    ),
    "Identity|Trust policy|Permission policy|Resource",
    "Identité|Confiance|Permissions|Ressource",
    [
      identity,
      step(
        c("Read a policy as a contract", "Lire une politique comme un contrat"),
        c(
          "In the IAM documentation, annotate Effect, Action, Resource and Condition. Write a fictional policy limited to reading one lab bucket; do not attach it to a live role.",
          "Dans la documentation IAM, annotez Effect, Action, Resource et Condition. Rédigez une politique fictive limitée à la lecture d’un bucket de laboratoire, sans l’attacher à un rôle réel.",
        ),
        undefined,
        c(
          "You distinguish who may assume a role from what the role may do.",
          "Vous distinguez qui peut prendre le rôle de ce que le rôle peut faire.",
        ),
      ),
      step(
        c("Test the reasoning", "Tester le raisonnement"),
        c(
          "Create a table of three requests: allowed object read, denied object write, denied access to another bucket. Explain the policy decision for each.",
          "Créez trois cas : lecture permise, écriture refusée, autre bucket refusé. Expliquez chaque décision.",
        ),
        undefined,
        c(
          "Explain least privilege and shared responsibility using three concrete access decisions.",
          "Expliquez moindre privilège et responsabilité partagée avec trois décisions concrètes.",
        ),
      ),
    ],
    c(
      "Does a role trust policy grant all the permissions needed to deploy?",
      "La politique de confiance d’un rôle accorde-t-elle les droits de déploiement ?",
    ),
    c(
      "No. Trust controls who can assume the role. Permission policies control allowed actions on resources, subject to other applicable boundaries and denies.",
      "Non. La confiance contrôle qui peut prendre le rôle. Les politiques de permissions contrôlent les actions sur les ressources, sous réserve des autres limites et refus.",
    ),
    c(
      "Yes. Being allowed to assume a role implies administrator access.",
      "Oui. Pouvoir prendre un rôle implique un accès administrateur.",
    ),
  ),
  "dev-aws-vpc": lesson(
    "AWS · network paths",
    "cloud",
    c(
      "A subnet’s route table determines its traffic paths. A public subnet has an internet-gateway route, but a workload also needs appropriate addressing and access rules. Security groups are stateful; network ACLs are separate subnet controls.",
      "La table de routage d’un sous-réseau définit ses chemins. Un sous-réseau public a une route vers une passerelle internet, mais il faut aussi adresses et règles adaptées. Les groupes de sécurité sont stateful ; les ACL sont un contrôle distinct.",
    ),
    c(
      "A private API cannot reach an external package repository. Draw the outbound route before changing inbound security-group rules.",
      "Une API privée ne rejoint pas un registre externe. Dessinez le trajet sortant avant de modifier les règles entrantes.",
    ),
    "Subnet|Route table|Gateway / endpoint|Destination",
    "Sous-réseau|Table de routes|Passerelle / endpoint|Destination",
    [
      identity,
      step(
        c("Inspect the existing topology", "Observer la topologie existante"),
        c(
          "These read-only calls may return an empty list. That is not an instruction to create resources.",
          "Ces lectures peuvent renvoyer une liste vide. Cela n’implique pas de créer des ressources.",
        ),
        'aws ec2 describe-vpcs --query "Vpcs[].{Id:VpcId,Cidr:CidrBlock}" --output table\naws ec2 describe-subnets --query "Subnets[].{Id:SubnetId,Vpc:VpcId,Zone:AvailabilityZone}" --output table',
        c(
          "VPCs and subnets can be related by VPC ID.",
          "VPC et sous-réseaux peuvent être reliés par identifiant.",
        ),
      ),
      step(
        c("Explain the route and access checks", "Expliquer routes et accès"),
        c(
          "Inspect route tables and security groups, then mark the route, permitted ports and return path on a diagram. Use fictional IDs in the submission.",
          "Inspectez routes et groupes puis annotez trajet, ports autorisés et retour. Utilisez des identifiants fictifs dans le rendu.",
        ),
        'aws ec2 describe-route-tables --output json\naws ec2 describe-security-groups --query "SecurityGroups[].{Id:GroupId,Name:GroupName}" --output table',
        c(
          "Explain why public/private routing and allowed ports are separate decisions.",
          "Expliquez pourquoi routage public/privé et ports autorisés sont distincts.",
        ),
      ),
    ],
    c(
      "Does a security-group rule create a route to the internet?",
      "Une règle de groupe de sécurité crée-t-elle une route internet ?",
    ),
    c(
      "No. Routes and gateways determine reachability; security rules decide permitted traffic. Both must be correct, along with addresses and return paths.",
      "Non. Routes et passerelles définissent le chemin ; les règles déterminent les flux permis. Les deux doivent être corrects, avec adresses et trajet de retour.",
    ),
    c(
      "Yes. Opening port 443 automatically adds a NAT gateway.",
      "Oui. Ouvrir 443 ajoute automatiquement une passerelle NAT.",
    ),
  ),
  "dev-aws-compute": lesson(
    "AWS · compute and scaling",
    "cloud",
    c(
      "EC2 supplies virtual machines. A load balancer distributes requests to healthy targets; an Auto Scaling group maintains desired capacity. Applications must externalise shared state before adding interchangeable instances.",
      "EC2 fournit des machines virtuelles. Un répartiteur distribue les requêtes aux cibles saines ; Auto Scaling maintient la capacité désirée. L’état partagé doit être externalisé avant de multiplier les instances interchangeables.",
    ),
    c(
      "An application keeps uploads on one server. Explain why adding a second server behind a load balancer can make files appear to disappear.",
      "Une application garde ses fichiers sur un serveur. Expliquez pourquoi un deuxième serveur derrière un répartiteur peut faire « disparaître » les fichiers.",
    ),
    "Client|Load balancer|Healthy instances|Shared storage",
    "Client|Répartiteur|Instances saines|Stockage partagé",
    [
      identity,
      step(
        c("Inspect rather than provision", "Observer sans provisionner"),
        c(
          "Read existing sandbox instances and scaling groups, or use an empty result as the basis for a proposed design.",
          "Lisez les instances et groupes existants du laboratoire, ou concevez une architecture à partir d’un résultat vide.",
        ),
        'aws ec2 describe-instances --query "Reservations[].Instances[].{Id:InstanceId,State:State.Name,Type:InstanceType}" --output table\naws autoscaling describe-auto-scaling-groups --query "AutoScalingGroups[].{Name:AutoScalingGroupName,Desired:DesiredCapacity}" --output table',
        c(
          "You distinguish instance state from desired group capacity.",
          "Vous distinguez l’état d’une instance de la capacité désirée du groupe.",
        ),
      ),
      step(
        c("Design a failure experiment", "Concevoir une expérience de panne"),
        c(
          "Draw two zones, health checks and external data storage. State which data cannot be lost and how you would test replacement. Do not scale this SQLite campus to multiple independent writers.",
          "Dessinez deux zones, contrôles de santé et stockage externe. Précisez les données à préserver et le test de remplacement. Ne multipliez pas les écrivains SQLite indépendants du campus.",
        ),
        undefined,
        c(
          "Present a scaling design that explicitly handles state, health and cost.",
          "Présentez une architecture qui traite explicitement état, santé et coût.",
        ),
      ),
    ],
    c(
      "Does adding more EC2 instances automatically make an application highly available?",
      "Ajouter des instances EC2 rend-il automatiquement une application hautement disponible ?",
    ),
    c(
      "No. Availability also depends on independent failure domains, health-based routing, data consistency, recovery and the capacity of dependencies.",
      "Non. Il faut aussi domaines de panne indépendants, routage par santé, cohérence des données, reprise et capacité des dépendances.",
    ),
    c(
      "Yes. Any two instances guarantee zero downtime and identical data.",
      "Oui. Deux instances garantissent zéro interruption et des données identiques.",
    ),
  ),
  "dev-aws-storage": lesson(
    "AWS · data and recovery",
    "cloud",
    c(
      "Object storage and relational databases solve different access patterns. Durability, availability and recoverability are different properties. Versioning and snapshots help, but a restore test is what proves you can recover useful data.",
      "Stockage objet et base relationnelle répondent à des accès différents. Durabilité, disponibilité et récupération sont distinctes. Versions et snapshots aident ; seule une restauration testée prouve une reprise utile.",
    ),
    c(
      "A user accidentally overwrites important records. Choose an acceptable recovery point and duration, then plan a restore into an isolated target.",
      "Un utilisateur écrase des données importantes. Choisissez un point et un délai de reprise acceptables, puis une restauration isolée.",
    ),
    "Application data|Backup policy|Isolated restore|Verified recovery",
    "Données|Politique sauvegarde|Restauration isolée|Reprise vérifiée",
    [
      identity,
      step(
        c(
          "Inventory the recovery sources",
          "Inventorier les sources de reprise",
        ),
        c(
          "Read only metadata; do not download customer objects or restore a database into a live environment.",
          "Lisez uniquement les métadonnées ; ne téléchargez pas de données clients et ne restaurez pas dans un environnement actif.",
        ),
        'aws s3api list-buckets --query "Buckets[].Name"\naws rds describe-db-instances --query "DBInstances[].{Id:DBInstanceIdentifier,Retention:BackupRetentionPeriod}" --output table',
        c(
          "You can identify whether the listed database has a nonzero automated backup retention.",
          "Vous pouvez déterminer si une base listée conserve des sauvegardes automatiques.",
        ),
      ),
      step(
        c("Specify a recovery acceptance test", "Définir un test de reprise"),
        c(
          "Use fictional data to specify row/object counts, integrity checks, access controls and application health after restore. Relate the recovery point to potential lost work and the recovery time to interruption.",
          "Avec des données fictives, définissez comptages, intégrité, accès et santé après restauration. Reliez le point de reprise au travail perdu et le délai à l’interruption.",
        ),
        undefined,
        c(
          "Write measurable RPO/RTO targets and a restore checklist with an isolated destination.",
          "Rédigez des objectifs RPO/RTO mesurables et une checklist de restauration isolée.",
        ),
      ),
    ],
    c(
      "Is a successful backup job enough evidence of recoverability?",
      "Un job de sauvegarde réussi prouve-t-il que la reprise fonctionne ?",
    ),
    c(
      "No. Restore into a separate environment and verify data integrity, required keys, permissions and application behaviour against RPO/RTO targets.",
      "Non. Restaurez séparément et vérifiez intégrité, clés nécessaires, permissions et comportement applicatif selon RPO/RTO.",
    ),
    c(
      "Yes. A green backup status guarantees every future restoration.",
      "Oui. Un statut de sauvegarde vert garantit toute restauration future.",
    ),
  ),
  "dev-serverless": lesson(
    "AWS · events and idempotency",
    "cloud",
    c(
      "A queue decouples producers and workers. Delivery can repeat, so side effects must tolerate duplicates. With Lambda and SQS, reason about batch failures, retries, visibility timeout and the dead-letter queue rather than assuming exactly-once work.",
      "Une file découple producteurs et consommateurs. Des livraisons peuvent se répéter ; les effets doivent tolérer les doublons. Avec Lambda et SQS, raisonnez lots, reprises, délai de visibilité et file d’erreur.",
    ),
    c(
      "A payment notification is delivered twice. Design a worker that records one effect per event ID while still allowing a failed first attempt to retry.",
      "Une notification de paiement arrive deux fois. Concevez un traitement produisant un seul effet par identifiant tout en permettant la reprise d’une tentative échouée.",
    ),
    "Producer|Queue|Worker|Idempotent effect",
    "Producteur|File|Traitement|Effet idempotent",
    [
      identity,
      step(
        c(
          "Inspect event connections",
          "Observer les connexions événementielles",
        ),
        c(
          "Read mapping metadata in the authorised sandbox; do not invoke functions or receive live queue messages.",
          "Lisez les métadonnées du laboratoire ; n’invoquez pas de fonctions et ne consommez pas une file réelle.",
        ),
        'aws lambda list-event-source-mappings --query "EventSourceMappings[].{Function:FunctionArn,State:State,Batch:BatchSize}" --output table',
        c(
          "A mapping connects a source, a function and a batch size.",
          "Un mapping relie source, fonction et taille de lot.",
        ),
      ),
      step(
        c(
          "Simulate duplicate delivery on paper",
          "Simuler les doublons sur papier",
        ),
        c(
          "Use events A, A and B. Draw a transaction that checks a unique event key and stores the result with the side effect. Add a crash before commit and a crash after commit; explain what retry should do.",
          "Utilisez A, A et B. Dessinez une transaction vérifiant une clé unique et enregistrant résultat et effet. Ajoutez une panne avant puis après commit et expliquez la reprise.",
        ),
        undefined,
        c(
          "Demonstrate two distinct effects for three deliveries and explain failure-safe deduplication.",
          "Démontrez deux effets distincts pour trois livraisons et expliquez une déduplication tolérante aux pannes.",
        ),
      ),
    ],
    c(
      "Why is “the queue delivers exactly once” a dangerous design assumption?",
      "Pourquoi supposer une livraison unique est-il dangereux ?",
    ),
    c(
      "Retries and partial failures can repeat processing. Use a stable event ID, atomic deduplication with the effect where possible, and observable retry/dead-letter behaviour.",
      "Reprises et pannes partielles peuvent répéter le traitement. Utilisez un identifiant stable, une déduplication atomique avec l’effet si possible et des reprises observables.",
    ),
    c(
      "Duplicates cannot happen when the worker runs in a cloud function.",
      "Les doublons sont impossibles dans une fonction cloud.",
    ),
  ),
  "dev-finops": lesson(
    "FinOps · cost ownership",
    "cloud",
    c(
      "Cost is an engineering feedback signal. Assign resource ownership, estimate usage, set budgets and review actual spend. Stopping a VM may leave storage, reserved addresses or other billable resources. A budget notification is not a universal spending cap.",
      "Le coût est un signal d’ingénierie. Attribuez un responsable, estimez l’usage, définissez des budgets et comparez au réel. Arrêter une VM peut laisser stockage ou autres ressources facturables. Une alerte n’est pas un plafond universel.",
    ),
    c(
      "A weekend EKS lab is forgotten. Build a teardown inventory that includes cluster, nodes, NAT, volumes and load balancers rather than only Pods.",
      "Un laboratoire EKS reste actif le week-end. Inventoriez cluster, nœuds, NAT, volumes et répartiteurs, pas seulement les Pods.",
    ),
    "Estimate|Owner and tags|Spend observation|Cleanup verification",
    "Estimation|Responsable et tags|Dépense observée|Nettoyage vérifié",
    [
      identity,
      step(
        c("List likely cost drivers", "Lister les postes de coût"),
        c(
          "These reads do not calculate a price. Consult current AWS pricing for your region rather than copying a fixed example amount.",
          "Ces lectures ne calculent pas un tarif. Consultez les prix actuels de votre région plutôt qu’un montant figé.",
        ),
        'aws ec2 describe-volumes --query "Volumes[].{Id:VolumeId,Size:Size,State:State}" --output table\naws ec2 describe-nat-gateways --query "NatGateways[].{Id:NatGatewayId,State:State}" --output table',
        c(
          "The inventory includes persistent and network resources.",
          "L’inventaire inclut ressources persistantes et réseau.",
        ),
      ),
      step(
        c("Build a lab exit checklist", "Construire une checklist de sortie"),
        c(
          "For each resource record owner, reason, expected end date, deletion dependency and evidence that billing has stopped. Discuss budget alerts and escalation with the account owner.",
          "Pour chaque ressource, notez responsable, usage, date de fin, dépendance de suppression et preuve de fin de facturation. Discutez alertes et escalade avec le responsable du compte.",
        ),
        undefined,
        c(
          "Produce a cost-aware deployment and cleanup plan without claiming the cloud lab is free.",
          "Produisez un plan de déploiement et nettoyage intégrant les coûts sans présenter le cloud comme gratuit.",
        ),
      ),
    ],
    c(
      "Does deleting Kubernetes Pods remove every EKS-related cost?",
      "Supprimer les Pods élimine-t-il tous les coûts EKS ?",
    ),
    c(
      "No. The control plane, nodes, storage and network infrastructure can remain. Inventory dependencies, clean up the intended lab resources and check billing afterwards.",
      "Non. Plan de contrôle, nœuds, stockage et réseau peuvent rester. Inventoriez, nettoyez les ressources du laboratoire puis vérifiez la facturation.",
    ),
    c(
      "Yes. Billing stops as soon as the namespace has no running Pods.",
      "Oui. La facturation s’arrête dès que le namespace n’a plus de Pods actifs.",
    ),
  ),
};
