export type Copy = readonly [en: string, fr: string];
export const c = (en: string, fr: string): Copy => [en, fr];
export type LabStep = {
  title: Copy;
  instruction: Copy;
  command?: string;
  expected: Copy;
};
export type LessonGuide = {
  topic: string;
  family:
    | "linux"
    | "git"
    | "containers"
    | "pipeline"
    | "cloud"
    | "iac"
    | "kubernetes"
    | "observe"
    | "security"
    | "kids";
  goal: Copy;
  role: Copy;
  scenario: Copy;
  takeaway: Copy;
  prerequisites: Copy;
  flow: readonly [Copy, Copy, Copy, Copy];
  steps: LabStep[];
  verify: Copy;
  cleanup: Copy;
  question: Copy;
  answer: Copy;
  misconception: Copy;
};
export const step = (
  title: Copy,
  instruction: Copy,
  command: string | undefined,
  expected: Copy,
): LabStep => ({ title, instruction, command, expected });
export type Reference = { title: string; url: string };
