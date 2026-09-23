import { c, type Copy, type LessonGuide } from "./lesson-guide-model";
export function flow(en: string, fr: string): LessonGuide["flow"] {
  const first = en.split("|"),
    second = fr.split("|");
  if (first.length !== 4 || second.length !== 4)
    throw new Error("A lesson flow needs four stages.");
  return first.map((text, index) =>
    c(text, second[index]),
  ) as unknown as LessonGuide["flow"];
}
export function guide(
  input: Omit<LessonGuide, "verify"> & { verify?: Copy },
): LessonGuide {
  return {
    ...input,
    verify: input.verify || input.steps[input.steps.length - 1].expected,
  };
}
