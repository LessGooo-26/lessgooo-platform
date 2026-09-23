import type { Reference } from "./lesson-guide-model";
const doc = (title: string, url: string): Reference => ({ title, url });
export const lessonDocumentation: Record<string, Reference[]> = {
  "linux-1": [
    doc(
      "GNU Coreutils · files and directories",
      "https://www.gnu.org/software/coreutils/manual/coreutils.html",
    ),
  ],
  "linux-2": [
    doc(
      "GNU Coreutils · file permissions",
      "https://www.gnu.org/software/coreutils/manual/html_node/File-permissions.html",
    ),
  ],
  "dev-process": [
    doc(
      "systemd · systemctl",
      "https://www.freedesktop.org/software/systemd/man/latest/systemctl.html",
    ),
    doc(
      "systemd · journalctl",
      "https://www.freedesktop.org/software/systemd/man/latest/journalctl.html",
    ),
  ],
  "dev-bash": [
    doc(
      "GNU Bash manual",
      "https://www.gnu.org/software/bash/manual/bash.html",
    ),
  ],
  "dev-python": [
    doc("Python · tutorial", "https://docs.python.org/3/tutorial/"),
    doc(
      "Python · subprocess",
      "https://docs.python.org/3/library/subprocess.html",
    ),
  ],
  "dev-network": [
    doc("MDN · DNS", "https://developer.mozilla.org/en-US/docs/Glossary/DNS"),
    doc("curl · command-line manual", "https://curl.se/docs/manpage.html"),
  ],
  "dev-http": [
    doc(
      "MDN · HTTP overview",
      "https://developer.mozilla.org/en-US/docs/Web/HTTP/Overview",
    ),
    doc(
      "Traefik · routing",
      "https://doc.traefik.io/traefik/routing/overview/",
    ),
  ],
  "git-1": [doc("Git · tutorial", "https://git-scm.com/docs/gittutorial")],
  "dev-git-team": [
    doc(
      "Git · branching",
      "https://git-scm.com/book/en/v2/Git-Branching-Basic-Branching-and-Merging",
    ),
    doc("GitHub · pull requests", "https://docs.github.com/en/pull-requests"),
  ],
  "dev-git-secrets": [
    doc("Git · gitignore", "https://git-scm.com/docs/gitignore"),
    doc(
      "GitHub · removing sensitive data",
      "https://docs.github.com/en/authentication/keeping-your-account-and-data-secure/removing-sensitive-data-from-a-repository",
    ),
  ],
  "dev-docker-build": [
    doc(
      "Docker · build best practices",
      "https://docs.docker.com/build/building/best-practices/",
    ),
    doc(
      "Dockerfile reference",
      "https://docs.docker.com/reference/dockerfile/",
    ),
  ],
  "dev-compose": [
    doc(
      "Docker Compose · getting started",
      "https://docs.docker.com/compose/gettingstarted/",
    ),
    doc("Docker · volumes", "https://docs.docker.com/engine/storage/volumes/"),
  ],
  "dev-registry": [
    doc(
      "Docker · image tags",
      "https://docs.docker.com/reference/cli/docker/image/tag/",
    ),
    doc(
      "GitHub · container registry",
      "https://docs.github.com/en/packages/working-with-a-github-packages-registry/working-with-the-container-registry",
    ),
  ],
  "dev-actions": [
    doc(
      "GitHub Actions · understand workflows",
      "https://docs.github.com/en/actions/get-started/understand-github-actions",
    ),
  ],
  "dev-jenkins": [
    doc("Jenkins · Pipeline", "https://www.jenkins.io/doc/book/pipeline/"),
    doc("GitLab · CI/CD pipelines", "https://docs.gitlab.com/ci/pipelines/"),
  ],
  "dev-delivery": [
    doc(
      "Kubernetes · Deployments and rollback",
      "https://kubernetes.io/docs/concepts/workloads/controllers/deployment/",
    ),
  ],
  "dev-aws-iam": [
    doc(
      "AWS IAM · introduction",
      "https://docs.aws.amazon.com/IAM/latest/UserGuide/introduction.html",
    ),
    doc(
      "AWS · shared responsibility",
      "https://aws.amazon.com/compliance/shared-responsibility-model/",
    ),
  ],
  "dev-aws-vpc": [
    doc(
      "AWS VPC · user guide",
      "https://docs.aws.amazon.com/vpc/latest/userguide/what-is-amazon-vpc.html",
    ),
  ],
  "dev-aws-compute": [
    doc(
      "AWS EC2 · getting started",
      "https://docs.aws.amazon.com/AWSEC2/latest/UserGuide/EC2_GetStarted.html",
    ),
    doc(
      "EC2 Auto Scaling · overview",
      "https://docs.aws.amazon.com/autoscaling/ec2/userguide/what-is-amazon-ec2-auto-scaling.html",
    ),
  ],
  "dev-aws-storage": [
    doc(
      "Amazon S3 · user guide",
      "https://docs.aws.amazon.com/AmazonS3/latest/userguide/Welcome.html",
    ),
    doc(
      "Amazon RDS · backups",
      "https://docs.aws.amazon.com/AmazonRDS/latest/UserGuide/CHAP_CommonTasks.BackupRestore.html",
    ),
  ],
  "dev-serverless": [
    doc(
      "AWS Lambda · SQS event sources",
      "https://docs.aws.amazon.com/lambda/latest/dg/with-sqs.html",
    ),
  ],
  "dev-terraform": [
    doc(
      "Terraform · CLI workflow",
      "https://developer.hashicorp.com/terraform/cli/run",
    ),
    doc(
      "Terraform · state",
      "https://developer.hashicorp.com/terraform/language/state",
    ),
  ],
  "dev-tf-modules": [
    doc(
      "Terraform · modules",
      "https://developer.hashicorp.com/terraform/language/modules",
    ),
  ],
  "dev-ansible": [
    doc(
      "Ansible · getting started",
      "https://docs.ansible.com/projects/ansible/latest/getting_started/index.html",
    ),
  ],
  "dev-k8s-core": [
    doc(
      "Kubernetes · basics",
      "https://kubernetes.io/docs/tutorials/kubernetes-basics/",
    ),
    doc(
      "kind · quick start",
      "https://kind.sigs.k8s.io/docs/user/quick-start/",
    ),
  ],
  "dev-k8s-health": [
    doc(
      "Kubernetes · liveness, readiness and startup probes",
      "https://kubernetes.io/docs/tasks/configure-pod-container/configure-liveness-readiness-startup-probes/",
    ),
  ],
  "dev-k8s-security": [
    doc(
      "Kubernetes · RBAC",
      "https://kubernetes.io/docs/reference/access-authn-authz/rbac/",
    ),
    doc(
      "Kubernetes · NetworkPolicy",
      "https://kubernetes.io/docs/concepts/services-networking/network-policies/",
    ),
    doc(
      "Kubernetes · persistent volumes",
      "https://kubernetes.io/docs/concepts/storage/persistent-volumes/",
    ),
  ],
  "dev-helm": [
    doc("Helm · quick start", "https://helm.sh/docs/intro/quickstart/"),
  ],
  "dev-gitops": [
    doc(
      "Argo CD · getting started",
      "https://argo-cd.readthedocs.io/en/stable/getting_started/",
    ),
  ],
  "dev-metrics": [
    doc(
      "Prometheus · overview",
      "https://prometheus.io/docs/introduction/overview/",
    ),
    doc(
      "Grafana · dashboards",
      "https://grafana.com/docs/grafana/latest/dashboards/",
    ),
  ],
  "dev-traces": [
    doc(
      "OpenTelemetry · signals",
      "https://opentelemetry.io/docs/concepts/signals/",
    ),
  ],
  "dev-slo": [
    doc(
      "Google SRE workbook · implementing SLOs",
      "https://sre.google/workbook/implementing-slos/",
    ),
  ],
  "dev-incident": [
    doc(
      "Google SRE book · effective troubleshooting",
      "https://sre.google/sre-book/effective-troubleshooting/",
    ),
  ],
  "dev-supply-chain": [
    doc("Trivy · SBOM", "https://trivy.dev/latest/docs/supply-chain/sbom/"),
    doc(
      "Sigstore · verifying signatures",
      "https://docs.sigstore.dev/cosign/verifying/verify/",
    ),
  ],
  "dev-cloud-secrets": [
    doc(
      "GitHub Actions · OIDC",
      "https://docs.github.com/en/actions/concepts/security/openid-connect",
    ),
    doc(
      "AWS · secrets best practices",
      "https://docs.aws.amazon.com/secretsmanager/latest/userguide/best-practices.html",
    ),
  ],
  "dev-finops": [
    doc(
      "AWS · cost budgets",
      "https://docs.aws.amazon.com/cost-management/latest/userguide/budgets-managing-costs.html",
    ),
  ],
  "dev-platform": [
    doc(
      "CNCF · platforms white paper",
      "https://tag-app-delivery.cncf.io/whitepapers/platforms/",
    ),
    doc(
      "Azure · architecture center",
      "https://learn.microsoft.com/en-us/azure/architecture/",
    ),
    doc(
      "Google Cloud · MLOps",
      "https://cloud.google.com/architecture/mlops-continuous-delivery-and-automation-pipelines-in-machine-learning",
    ),
  ],
  "kids-hardware": [
    doc(
      "GCFGlobal · inside a computer",
      "https://edu.gcfglobal.org/en/computerbasics/inside-a-computer/1/",
    ),
  ],
  "kids-peripherals": [
    doc(
      "GCFGlobal · buttons and ports",
      "https://edu.gcfglobal.org/en/computerbasics/buttons-and-ports-on-a-computer/1/",
    ),
  ],
  "kids-os-files": [
    doc(
      "LearnFree · Windows and files",
      "https://www.learnfree.org/series/windows-basics",
    ),
  ],
  "kids-binary": [
    doc(
      "CS Unplugged · binary numbers",
      "https://www.csunplugged.org/en/topics/binary-numbers/",
    ),
  ],
  "kids-web-safety": [
    doc(
      "LearnFree · internet safety for kids",
      "https://www.learnfree.org/series/internet-safety-for-kids",
    ),
  ],
  "kids-scratch-game": [
    doc("Scratch · ideas and tutorials", "https://scratch.mit.edu/ideas"),
  ],
  "kids-python": [
    doc(
      "Raspberry Pi Foundation · Python projects",
      "https://projects.raspberrypi.org/en/pathways/python-intro",
    ),
  ],
  "kids-web": [
    doc(
      "MDN · your first website",
      "https://developer.mozilla.org/en-US/docs/Learn_web_development/Getting_started/Your_first_website",
    ),
  ],
  "kids-git": [doc("Git · tutorial", "https://git-scm.com/docs/gittutorial")],
  "kids-server": [
    doc(
      "Python · local HTTP server",
      "https://docs.python.org/3/library/http.server.html",
    ),
  ],
  "kids-cloud": [
    doc(
      "AWS · what is cloud computing?",
      "https://aws.amazon.com/what-is-cloud-computing/",
    ),
  ],
  "kids-aws": [
    doc(
      "AWS · cloud computing concepts",
      "https://aws.amazon.com/what-is-cloud-computing/",
    ),
  ],
  "kids-cloud-project": [
    doc(
      "Raspberry Pi Foundation · web projects",
      "https://projects.raspberrypi.org/en/pathways/web-intro",
    ),
  ],
  "kids-design": [
    doc("Canva · design school", "https://www.canva.com/design-school/"),
  ],
  "kids-ai": [
    doc(
      "Raspberry Pi Foundation · Experience AI",
      "https://experience-ai.org/en/",
    ),
  ],
};
export const lessonAliases: Record<string, string> = {
  "linux-3": "dev-process",
  "aws-1": "dev-aws-compute",
  "kids-1": "kids-os-files",
  "scratch-1": "kids-scratch-game",
  "scratch-2": "kids-scratch-game",
};
export const canonicalLessonId = (id: string) => lessonAliases[id] || id;
export const documentationFor = (id: string) =>
  lessonDocumentation[canonicalLessonId(id)] || [];
export const referencesReviewed = "2026-09-23";
