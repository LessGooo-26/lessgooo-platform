import type { LessonGuide, Reference } from "./lesson-guide-model";
import { canonicalLessonId } from "./lesson-references";
import { foundationGuides } from "./lesson-foundations";
import { collaborationGuides } from "./lesson-collaboration";
import { deliveryGuides } from "./lesson-delivery";
import { kubernetesGuides } from "./lesson-kubernetes";
import { cloudGuides } from "./lesson-cloud";
import { automationGuides } from "./lesson-automation";
import { reliabilityGuides } from "./lesson-reliability";
import { kidsGuides } from "./lesson-kids";
import { kidsDiscoveryGuides } from "./lesson-kids-discovery";
export const lessonGuides: Record<string, LessonGuide> = {
  ...foundationGuides,
  ...collaborationGuides,
  ...deliveryGuides,
  ...kubernetesGuides,
  ...cloudGuides,
  ...automationGuides,
  ...reliabilityGuides,
  ...kidsGuides,
  ...kidsDiscoveryGuides,
};
export const guideFor = (id: string) => lessonGuides[canonicalLessonId(id)];
export function referenceVideos(id: string): Reference[] {
  const canonical = canonicalLessonId(id);
  if (canonical.startsWith("dev-git-") || canonical === "git-1")
    return [
      {
        title: "Git & GitHub · freeCodeCamp (English, 2020)",
        url: "https://www.youtube.com/watch?v=RGOj5yH7evk",
      },
    ];
  if (["dev-docker-build", "dev-compose", "dev-registry"].includes(canonical))
    return [
      {
        title: "Docker · TechWorld with Nana (English, 2023)",
        url: "https://www.youtube.com/watch?v=pg19Z8LL06w",
      },
    ];
  if (canonical.startsWith("dev-k8s-") || canonical === "dev-delivery")
    return [
      {
        title: "Kubernetes · TechWorld with Nana (English, 2020)",
        url: "https://www.youtube.com/watch?v=X48VuDVv0do",
      },
    ];
  if (["dev-terraform", "dev-tf-modules"].includes(canonical))
    return [
      {
        title: "Terraform · freeCodeCamp (English, 2020)",
        url: "https://www.youtube.com/watch?v=SLB_c_ayRMo",
      },
    ];
  return [];
}
export function projectReference(id: string): Reference | undefined {
  const family = guideFor(id)?.family;
  if (family === "kids") return undefined;
  const anchors: Partial<Record<LessonGuide["family"], string>> = {
    containers: "docker-compose-step-by-step",
    pipeline: "devsecops-pipeline",
    security: "devsecops-pipeline",
    kubernetes: "kubernetes-manifests",
    cloud: "aws-eks-cluster-in-a-few-commands",
    observe: "monitoring-with-prometheus-and-grafana",
  };
  // A full runbook is attached; in-page headings may evolve, so link to the stable file.
  return anchors[family!]
    ? {
        title: "LESSGOOO · DevSecOps project runbook",
        url: "https://github.com/LessGooo-26/lessgooo-platform/blob/codex/campus-local/README.md",
      }
    : undefined;
}
