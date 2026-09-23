import { c, step, type LessonGuide } from "./lesson-guide-model";
import { lesson } from "./lesson-recipes";
export const automationGuides: Record<string, LessonGuide> = {
  "dev-terraform": lesson(
    "Terraform · state and plans",
    "iac",
    c(
      "Configuration expresses desired resources; state links configuration addresses to managed objects. A plan proposes changes, while apply executes them. Treat state as private and coordinate writers with a backend that supports locking.",
      "La configuration exprime les ressources voulues ; l’état relie leurs adresses aux objets gérés. Plan propose et apply exécute. Protégez l’état et coordonnez les écritures avec un backend verrouillable.",
    ),
    c(
      "Practise the lifecycle without an AWS bill by managing terraform_data locally. Learn to inspect a change before applying it.",
      "Pratiquez sans facture AWS avec terraform_data en local. Apprenez à lire un changement avant de l’appliquer.",
    ),
    "Configuration|State comparison|Reviewed plan|Apply",
    "Configuration|Comparaison état|Plan revu|Apply",
    [
      step(
        c(
          "Create main.tf in a new folder",
          "Créer main.tf dans un dossier neuf",
        ),
        c(
          "This built-in resource needs Terraform 1.4 or newer and no cloud provider.",
          "Cette ressource intégrée nécessite Terraform 1.4 ou plus récent et aucun provider cloud.",
        ),
        'terraform {\n  required_version = ">= 1.4.0"\n}\nresource "terraform_data" "release" {\n  input = "version-one"\n}\noutput "release" {\n  value = terraform_data.release.output\n}',
        c(
          "The configuration has one local resource and one output.",
          "La configuration contient une ressource locale et une sortie.",
        ),
      ),
      step(
        c("Inspect then apply the plan", "Lire puis appliquer le plan"),
        c(
          "Read the saved plan and confirm it contains only terraform_data before applying.",
          "Lisez le plan sauvegardé et vérifiez qu’il ne contient que terraform_data avant application.",
        ),
        "terraform init\nterraform fmt -check\nterraform validate\nterraform plan -out=lab.tfplan\nterraform show lab.tfplan\nterraform apply lab.tfplan",
        c(
          "The local state records the resource and the output is version-one.",
          "L’état local enregistre la ressource et la sortie vaut version-one.",
        ),
      ),
      step(
        c("Observe convergence", "Observer la convergence"),
        c(
          "Run another plan, then change the input to version-two and compare the proposed update. Do not commit state or plan files.",
          "Relancez plan puis changez l’entrée en version-two et comparez la mise à jour proposée. Ne commitez ni état ni plan.",
        ),
        "terraform plan\nterraform state list",
        c(
          "Explain why an unchanged configuration yields no changes and a changed input yields a reviewed update.",
          "Expliquez pourquoi une configuration inchangée ne propose rien et une entrée modifiée propose une mise à jour.",
        ),
      ),
    ],
    c(
      "Is the Terraform state just an expendable cache?",
      "L’état Terraform est-il un simple cache jetable ?",
    ),
    c(
      "No. It tracks resource bindings and may contain sensitive values. Protect it, back it up and coordinate access instead of deleting it to hide drift.",
      "Non. Il conserve les liens vers les ressources et peut contenir des valeurs sensibles. Protégez-le, sauvegardez-le et coordonnez l’accès plutôt que de le supprimer.",
    ),
    c(
      "Yes. Deleting state always removes the remote resources safely.",
      "Oui. Supprimer l’état retire toujours les ressources distantes proprement.",
    ),
  ),
  "dev-tf-modules": lesson(
    "Terraform · module contracts",
    "iac",
    c(
      "A module packages a resource pattern behind inputs and outputs. Reuse configuration while isolating each environment’s state and credentials. Marking a value sensitive hides some display output but does not erase it from state.",
      "Un module encapsule des ressources derrière entrées et sorties. Réutilisez la configuration tout en isolant états et identifiants. sensitive masque certains affichages mais ne retire pas la valeur de l’état.",
    ),
    c(
      "Development and staging need the same structure with different labels. Separate the environment state directories so applying one cannot unintentionally update the other.",
      "Développement et préproduction partagent une structure mais pas les mêmes labels. Séparez les dossiers d’état pour qu’un apply n’affecte pas l’autre.",
    ),
    "Module interface|Dev inputs|Staging inputs|Separate states",
    "Interface module|Entrées dev|Entrées préprod|États séparés",
    [
      step(
        c("Create modules/label/main.tf", "Créer modules/label/main.tf"),
        c(
          "Use only a local terraform_data resource for this exercise.",
          "Utilisez uniquement terraform_data local pour cet exercice.",
        ),
        'variable "environment" { type = string }\nresource "terraform_data" "label" { input = var.environment }\noutput "label" { value = terraform_data.label.output }',
        c(
          "The child module has one input and one output.",
          "Le module enfant a une entrée et une sortie.",
        ),
      ),
      step(
        c(
          "Create two root configurations",
          "Créer deux configurations racines",
        ),
        c(
          'Create dev/main.tf using the code below and staging/main.tf with environment = "staging". The relative source is identical in both roots.',
          'Créez dev/main.tf avec le code ci-dessous et staging/main.tf avec environment = "staging". La source relative est identique.',
        ),
        'module "label" {\n  source = "../modules/label"\n  environment = "development"\n}\noutput "environment" { value = module.label.label }',
        c(
          "Both environments reuse one module but have separate root directories.",
          "Les environnements réutilisent un module avec deux dossiers racines.",
        ),
      ),
      step(
        c("Compare the plans", "Comparer les plans"),
        c(
          "Run each root separately. The exercise can stop at plan; cloud resources are not needed.",
          "Exécutez séparément les racines. L’exercice peut s’arrêter au plan, sans ressource cloud.",
        ),
        "terraform -chdir=dev init\nterraform -chdir=dev plan\nterraform -chdir=staging init\nterraform -chdir=staging plan",
        c(
          "Demonstrate different inputs with a shared module and independently located state.",
          "Démontrez des entrées distinctes, un module commun et des états séparés.",
        ),
      ),
    ],
    c(
      "Does reusing a module require sharing one state between all environments?",
      "Réutiliser un module oblige-t-il à partager un état entre tous les environnements ?",
    ),
    c(
      "No. Share the module code, but isolate state, access and promotion decisions according to each environment’s risk.",
      "Non. Partagez le code du module mais isolez état, accès et décisions de promotion selon le risque.",
    ),
    c(
      "Yes. A module can only operate with one global state file.",
      "Oui. Un module ne fonctionne qu’avec un fichier d’état global.",
    ),
    c(
      "If you applied either local root, review and destroy only its terraform_data resources with -chdir=dev or -chdir=staging. Keep the source files.",
      "Si vous avez appliqué une racine locale, inspectez puis détruisez uniquement ses terraform_data avec -chdir=dev ou -chdir=staging. Conservez les sources.",
    ),
  ),
  "dev-ansible": lesson(
    "Ansible · idempotent configuration",
    "iac",
    c(
      "Ansible describes desired configuration with modules. Inventory selects hosts; a playbook orders tasks; roles organise reusable behaviour. Check mode predicts changes but support varies by module, so a real lab run and a second no-change run matter.",
      "Ansible décrit la configuration voulue par modules. L’inventaire choisit les hôtes, le playbook ordonne les tâches et les rôles organisent la réutilisation. Le support du mode check varie : un vrai test puis un second passage sans changement sont nécessaires.",
    ),
    c(
      "Every team member should get the same lab configuration. A shell command that appends the same line on every run is not idempotent; use a module that manages content.",
      "Chaque membre doit obtenir la même configuration. Ajouter la même ligne à chaque passage n’est pas idempotent ; utilisez un module gérant le contenu.",
    ),
    "Inventory|Playbook|Desired file|No-change rerun",
    "Inventaire|Playbook|Fichier attendu|Second passage stable",
    [
      step(
        c("Write playbook.yml", "Écrire playbook.yml"),
        c(
          "This only writes a dummy file next to the playbook on localhost. No sudo or remote host is used.",
          "Ce playbook écrit seulement un fichier fictif à côté de lui sur localhost. Aucun sudo ni hôte distant.",
        ),
        '- name: Local configuration lab\n  hosts: all\n  gather_facts: false\n  tasks:\n    - name: Write a stable message\n      ansible.builtin.copy:\n        dest: "{{ playbook_dir }}/lesson-message.txt"\n        content: "Managed by the lesson\\n"\n        mode: "0640"',
        c(
          "The task states exact content and permissions.",
          "La tâche définit contenu et permissions exacts.",
        ),
      ),
      step(
        c("Predict then execute", "Prévoir puis exécuter"),
        c(
          "Review the diff before the real write.",
          "Relisez le diff avant l’écriture réelle.",
        ),
        "ansible-playbook -i localhost, -c local playbook.yml --check --diff\nansible-playbook -i localhost, -c local playbook.yml",
        c(
          "The first real execution creates the intended file.",
          "La première exécution réelle crée le fichier prévu.",
        ),
      ),
      step(
        c("Prove convergence", "Prouver la convergence"),
        c(
          "Run again, then compare the summary and file content.",
          "Relancez puis comparez le récapitulatif et le contenu.",
        ),
        "ansible-playbook -i localhost, -c local playbook.yml\ncat lesson-message.txt",
        c(
          "The second run reports changed=0 while the expected configuration remains present.",
          "Le deuxième passage indique changed=0 et la configuration attendue reste présente.",
        ),
      ),
    ],
    c(
      "What does idempotence mean in this playbook?",
      "Que signifie idempotence pour ce playbook ?",
    ),
    c(
      "Once the desired configuration is present, repeating the same task does not keep modifying it. Verify the second run and actual content, not only task exit success.",
      "Une fois l’état désiré atteint, répéter la tâche ne le modifie plus. Vérifiez le second passage et le contenu, pas seulement le code de succès.",
    ),
    c(
      "It means the task skips all future executions even if the file changes.",
      "Cela signifie que toute future exécution est ignorée même si le fichier change.",
    ),
    c(
      "Keep the playbook and summaries; remove only the lab-created lesson-message.txt when finished.",
      "Conservez playbook et récapitulatifs ; retirez uniquement lesson-message.txt créé pour cet exercice.",
    ),
  ),
  "dev-supply-chain": lesson(
    "DevSecOps · SBOM and provenance",
    "security",
    c(
      "An SBOM inventories components, a vulnerability scan compares them with known advisories, and a signature binds an artifact digest to an identity. None independently proves that an application is safe. Scan the artifact that will actually run.",
      "Un SBOM inventorie les composants, un scan les compare aux avis connus et une signature relie un digest à une identité. Aucun ne prouve seul la sécurité. Scannez l’artefact réellement exécuté.",
    ),
    c(
      "The source scan is green, but the image contains vulnerable OS packages. Follow the exact tested image through the gate instead of disabling the image scan.",
      "Le code est sans alerte mais l’image contient des paquets système vulnérables. Suivez l’image testée à travers les contrôles plutôt que de désactiver le scan.",
    ),
    "Built image|SBOM|Vulnerability gate|Signature verification",
    "Image construite|SBOM|Barrière vulnérabilités|Signature vérifiée",
    [
      step(
        c(
          "Build or reuse the tested lab image",
          "Construire ou réutiliser l’image testée",
        ),
        c(
          "Use the Docker lesson image and the repository’s checksum-verified Trivy installation instructions.",
          "Utilisez l’image du cours Docker et les instructions Trivy avec contrôle de somme du dépôt.",
        ),
        'docker image inspect lessgooo-campus:lesson --format "{{.Id}}"',
        c(
          "The scan subject is an identified image, not an unrelated rebuild.",
          "Le sujet du scan est une image identifiée, pas un autre build.",
        ),
      ),
      step(
        c(
          "Generate inventory and enforce a gate",
          "Produire l’inventaire et appliquer une barrière",
        ),
        c(
          "The second command must fail when high/critical vulnerabilities are found. Investigate and update components; do not turn failure into success.",
          "La seconde commande doit échouer si des vulnérabilités élevées/critiques sont détectées. Analysez et mettez à jour les composants ; ne masquez pas l’échec.",
        ),
        "trivy image --format spdx-json --output sbom.spdx.json lessgooo-campus:lesson\ntrivy image --scanners vuln,secret --severity HIGH,CRITICAL --exit-code 1 lessgooo-campus:lesson",
        c(
          "The SBOM and scan describe the same image.",
          "Le SBOM et le scan décrivent la même image.",
        ),
      ),
      step(
        c(
          "Review provenance before promotion",
          "Revoir la provenance avant promotion",
        ),
        c(
          "Read the README verification section. For a published image, verify the expected signer identity and issuer against its digest; save the workflow URL and decision. Generating an SBOM alone is not signing.",
          "Lisez la section de vérification du README. Pour une image publiée, vérifiez identité et émetteur attendus sur son digest ; conservez le run et la décision. Générer un SBOM ne signe pas l’image.",
        ),
        undefined,
        c(
          "Explain inventory, vulnerability status and signer verification as three distinct pieces of evidence.",
          "Expliquez inventaire, état des vulnérabilités et vérification du signataire comme trois preuves distinctes.",
        ),
      ),
    ],
    c(
      "Does a signed image with an SBOM necessarily have no vulnerabilities?",
      "Une image signée avec SBOM est-elle forcément sans vulnérabilité ?",
    ),
    c(
      "No. Signature verification establishes identity/integrity and the SBOM lists components. You still need current vulnerability assessment and runtime testing.",
      "Non. La signature établit identité/intégrité et le SBOM liste les composants. Il faut encore analyser les vulnérabilités actuelles et tester le runtime.",
    ),
    c(
      "Yes. Signing automatically patches all listed dependencies.",
      "Oui. Signer corrige automatiquement toutes les dépendances.",
    ),
  ),
  "dev-cloud-secrets": lesson(
    "DevSecOps · OIDC and secrets",
    "security",
    c(
      "OIDC lets a workload present a short-lived identity claim to a cloud trust policy. Restrict audience and subject to the intended repository, branch or environment. id-token: write permits requesting an identity token; it is not general cloud administrator access.",
      "OIDC permet à un workload de présenter une identité temporaire à une politique de confiance. Limitez audience et sujet au dépôt, à la branche ou à l’environnement voulu. id-token: write autorise une demande de jeton, pas un accès administrateur cloud.",
    ),
    c(
      "Replace a long-lived cloud key in CI with scoped federation. Threat-model a malicious fork, an unexpected branch and a reused workflow before approving trust.",
      "Remplacez une clé cloud durable en CI par une fédération limitée. Examinez fork malveillant, branche inattendue et workflow réutilisé avant d’approuver la confiance.",
    ),
    "Workflow identity|OIDC claims|Trust condition|Temporary permission",
    "Identité workflow|Claims OIDC|Condition confiance|Droit temporaire",
    [
      step(
        c("Inventory credential uses", "Inventorier les usages d’identifiants"),
        c(
          "List credential names and consumers without copying values. Separate registry publishing, deployment and application runtime secrets.",
          "Listez noms et consommateurs sans copier les valeurs. Séparez registre, déploiement et secrets du runtime.",
        ),
        undefined,
        c(
          "Every credential has an owner and a bounded purpose.",
          "Chaque identifiant a un responsable et un usage limité.",
        ),
      ),
      step(
        c(
          "Inspect the local workflow policy",
          "Examiner les permissions du workflow",
        ),
        c(
          "Find the jobs with packages: write or id-token: write and explain why the quality/source jobs do not need those permissions.",
          "Repérez les jobs avec packages: write ou id-token: write et expliquez pourquoi qualité et code n’en ont pas besoin.",
        ),
        "cat .github/workflows/ci.yml",
        c(
          "You can map a sensitive permission to its exact consumer.",
          "Vous reliez une permission sensible à son consommateur exact.",
        ),
      ),
      step(
        c("Design negative trust tests", "Concevoir les refus attendus"),
        c(
          "Using the official OIDC claim examples, write expected decisions for the approved branch, another repository and a fork. Keep this as a review exercise unless the account owner authorises trust-policy changes.",
          "Avec les exemples officiels de claims, écrivez les décisions pour branche autorisée, autre dépôt et fork. Restez en revue tant que le responsable n’autorise pas une modification de confiance.",
        ),
        undefined,
        c(
          "Show one allowed identity and two denied identities with explicit trust conditions.",
          "Montrez une identité permise et deux refusées avec conditions explicites.",
        ),
      ),
    ],
    c(
      "Does replacing a secret with OIDC remove the need for least privilege?",
      "Remplacer un secret par OIDC supprime-t-il le besoin de droits minimaux ?",
    ),
    c(
      "No. Federation shortens credential lifetime, but broad trust or permission policies can still grant excessive access. Restrict both identity claims and resource actions.",
      "Non. La fédération réduit la durée de vie mais une confiance ou des droits larges restent dangereux. Limitez claims d’identité et actions sur les ressources.",
    ),
    c(
      "Yes. Every OIDC token automatically has only safe permissions.",
      "Oui. Tout jeton OIDC reçoit automatiquement uniquement des droits sûrs.",
    ),
  ),
};
