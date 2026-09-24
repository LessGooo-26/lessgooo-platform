import { pair as p, type SchoolProfile } from "./model";

export const guidancePaths = [
  {
    id: "science",
    title: p("Sciences et ingénierie", "Science and engineering"),
    subjects: ["math", "pct", "physics", "chemistry"],
    examples: p(
      "Mathématiques, génie civil, énergie, recherche. Explorer un problème concret et comparer les formations.",
      "Mathematics, civil engineering, energy and research. Explore a practical problem and compare courses.",
    ),
  },
  {
    id: "health",
    title: p("Santé et sciences du vivant", "Health and life sciences"),
    subjects: ["svt", "chemistry", "math"],
    examples: p(
      "Biologie, santé publique, soins, environnement. Vérifier les concours, les exigences et le parcours réel des métiers.",
      "Biology, public health, care and environment. Check entrance examinations, requirements and actual career pathways.",
    ),
  },
  {
    id: "technology",
    title: p("Numérique et systèmes", "Computing and systems"),
    subjects: ["computing", "math", "english"],
    examples: p(
      "Logiciels, réseaux, cybersécurité, données. Essayer un petit projet et présenter sa démarche.",
      "Software, networking, cybersecurity and data. Try a small project and explain your method.",
    ),
  },
  {
    id: "business",
    title: p("Gestion et entrepreneuriat", "Management and entrepreneurship"),
    subjects: ["math", "economics", "accounting", "commerce"],
    examples: p(
      "Gestion, comptabilité, logistique, économie. Construire un budget fictif et analyser un besoin local.",
      "Management, accounting, logistics and economics. Build a fictional budget and analyse a local need.",
    ),
  },
  {
    id: "arts",
    title: p(
      "Langues, création et communication",
      "Languages, creativity and communication",
    ),
    subjects: ["french", "english", "literature", "arts"],
    examples: p(
      "Langues, design, édition, communication. Constituer un portfolio original et demander des retours.",
      "Languages, design, publishing and communication. Build an original portfolio and request feedback.",
    ),
  },
  {
    id: "society",
    title: p("Sciences humaines et société", "Humanities and society"),
    subjects: ["history", "geography", "civics", "philosophy", "french"],
    examples: p(
      "Droit, éducation, géographie, travail social. Lire plusieurs sources et enquêter sur les formations reconnues.",
      "Law, education, geography and social work. Read several sources and investigate recognised courses.",
    ),
  },
] as const;

// An explainable exploration aid, never an admissions or aptitude decision.
// Missing grades do not become zero; interests drive the first ordering.
export function suggestPaths(profile: SchoolProfile) {
  return guidancePaths
    .map((path) => {
      const evidence = profile.grades.filter((g) =>
        (path.subjects as readonly string[]).includes(g.subjectId),
      );
      const average = evidence.length
        ? evidence.reduce((n, g) => n + g.score / g.maximum, 0) /
          evidence.length
        : null;
      const interested = profile.interests.includes(path.id);
      return { ...path, evidence, average, interested };
    })
    .sort(
      (a, b) =>
        Number(b.interested) - Number(a.interested) ||
        (b.average ?? -1) - (a.average ?? -1),
    );
}
