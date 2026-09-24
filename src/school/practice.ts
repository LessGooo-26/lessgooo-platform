import { pair as p } from "./model";
export const practiceTopics = [
  "equations",
  "percent",
  "area",
  "probability",
] as const;
export type PracticeTopic = (typeof practiceTopics)[number];
export function makePractice(topic: PracticeTopic, seed: number) {
  const n = Math.abs(Math.trunc(seed)) % 100000;
  const a = 2 + (n % 11),
    b = 1 + (Math.floor(n / 11) % 15),
    x = 1 + (Math.floor(n / 165) % 20);
  if (topic === "equations")
    return {
      prompt: p(
        `Résoudre ${a}x + ${b} = ${a * x + b}.`,
        `Solve ${a}x + ${b} = ${a * x + b}.`,
      ),
      answer: x,
      explanation: p(
        `Soustraire ${b} puis diviser par ${a} : x = ${x}. Remplacer x dans l'équation pour vérifier.`,
        `Subtract ${b}, then divide by ${a}: x = ${x}. Substitute into the equation to check.`,
      ),
    };
  if (topic === "percent") {
    const percent = b * 5,
      amount = a * 100;
    return {
      prompt: p(
        `Calculer ${percent} % de ${amount}.`,
        `Calculate ${percent}% of ${amount}.`,
      ),
      answer: percent * a,
      explanation: p(
        `${amount} × ${percent}/100 = ${percent * a}.`,
        `${amount} × ${percent}/100 = ${percent * a}.`,
      ),
    };
  }
  if (topic === "area")
    return {
      prompt: p(
        `Un rectangle mesure ${a} cm sur ${b} cm. Quelle est son aire en cm² ?`,
        `A rectangle measures ${a} cm by ${b} cm. What is its area in cm²?`,
      ),
      answer: a * b,
      explanation: p(
        `Aire = longueur × largeur = ${a} × ${b} = ${a * b} cm².`,
        `Area = length × width = ${a} × ${b} = ${a * b} cm².`,
      ),
    };
  return {
    prompt: p(
      `Un sac contient ${a} boules rouges sur 20 boules. Quelle est la probabilité de rouge, en pourcentage ?`,
      `A bag contains ${a} red balls out of 20 balls. What is the probability of red as a percentage?`,
    ),
    answer: a * 5,
    explanation: p(
      `${a}/20 × 100 = ${a * 5} %. Les boules sont supposées équiprobables.`,
      `${a}/20 × 100 = ${a * 5}%. Each ball is assumed equally likely.`,
    ),
  };
}
