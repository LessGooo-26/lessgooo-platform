import { beforeEach, test, expect, vi } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import LessonReader from "../src/campus/LessonReader";
import { LessonLibrary } from "../src/campus/LessonLibrary";
import { LessonDiagram } from "../src/campus/LessonDiagram";
import { seedCampus } from "../src/campus/lib/seed";
import { guideFor } from "../src/campus/lib/lesson-guides";
import { documentationFor } from "../src/campus/lib/lesson-references";
import { setLanguage } from "../src/campus/lib/language";
const lessons = seedCampus().lessons;
const python = lessons.find((l) => l.id === "dev-python")!;
beforeEach(() => {
  setLanguage("en");
});
test("every seeded lesson has a guided project and subject-specific documentation", () => {
  for (const lesson of lessons) {
    expect(guideFor(lesson.id), lesson.id).toBeDefined();
    expect(documentationFor(lesson.id).length, lesson.id).toBeGreaterThan(0);
  }
  expect(
    documentationFor("dev-python").every(
      (d) => new URL(d.url).hostname === "docs.python.org",
    ),
  ).toBe(true);
  expect(documentationFor("dev-ansible")[0].url).toContain("docs.ansible.com");
  expect(
    documentationFor("dev-jenkins").map((d) => new URL(d.url).hostname),
  ).toEqual(["www.jenkins.io", "docs.gitlab.com"]);
});
test("the project remains attached to the selected lesson and environment instructions are explicit", async () => {
  const user = userEvent.setup(),
    submit = vi.fn();
  render(
    <LessonReader lesson={python}>
      <button onClick={() => submit(python.id)}>Submit attached work</button>
    </LessonReader>,
  );
  expect(
    screen.queryByRole("button", { name: "Submit attached work" }),
  ).not.toBeInTheDocument();
  await user.click(
    screen.getByRole("button", { name: "Start the attached project" }),
  );
  expect(
    screen.getByRole("heading", { name: "Your submission checklist" }),
  ).toBeInTheDocument();
  expect(screen.getByText(/Only the instructor’s review/)).toBeInTheDocument();
  await user.selectOptions(
    screen.getByLabelText("Choose your practice environment"),
    "vm",
  );
  expect(
    screen.getByRole("heading", { name: "Linux virtual machine" }),
  ).toBeInTheDocument();
  await user.click(
    screen.getByRole("button", { name: "Submit attached work" }),
  );
  expect(submit).toHaveBeenCalledWith("dev-python");
});
test("quiz corrects a misconception, supports retry and never submits work", async () => {
  const user = userEvent.setup(),
    submit = vi.fn(),
    guide = guideFor(python.id);
  render(
    <LessonReader lesson={python}>
      <button onClick={submit}>Submit</button>
    </LessonReader>,
  );
  await user.click(screen.getByRole("tab", { name: "Check yourself" }));
  expect(
    screen.getByRole("button", { name: "Check my reasoning" }),
  ).toBeDisabled();
  await user.click(screen.getByRole("radio", { name: guide.misconception[0] }));
  await user.click(screen.getByRole("button", { name: "Check my reasoning" }));
  expect(screen.getByRole("status")).toHaveTextContent(
    "Review this distinction",
  );
  await user.click(screen.getByRole("button", { name: "Try again" }));
  await user.click(screen.getByRole("radio", { name: guide.answer[0] }));
  await user.click(screen.getByRole("button", { name: "Check my reasoning" }));
  expect(screen.getByRole("status")).toHaveTextContent("Good reasoning.");
  expect(submit).not.toHaveBeenCalled();
});
test("resources link directly to Python docs and load no video embed", async () => {
  const user = userEvent.setup();
  const { container } = render(<LessonReader lesson={python} />);
  await user.click(screen.getByRole("tab", { name: "Resources" }));
  expect(
    screen.getByRole("link", { name: /Python · tutorial/ }),
  ).toHaveAttribute("href", "https://docs.python.org/3/tutorial/");
  expect(
    screen.getByRole("link", { name: /Find more videos/ }),
  ).toHaveAttribute(
    "href",
    expect.stringContaining("youtube.com/results?search_query="),
  );
  expect(container.querySelector("iframe")).toBeNull();
});
test("library avoids duplicate legacy entries and keeps custom instructor lessons accessible", () => {
  const custom = {
    ...python,
    id: "custom-one",
    title: "Instructor special topic",
  };
  const open = vi.fn();
  render(
    <LessonLibrary
      lessons={[python, python, custom]}
      validated={new Set()}
      openLesson={open}
      searching
    />,
  );
  expect(screen.getAllByRole("button")).toHaveLength(2);
  fireEvent.click(
    screen.getByRole("button", { name: /Instructor special topic/ }),
  );
  expect(open).toHaveBeenCalledWith(custom);
});
test("reduced motion uses manual stepping and French content is available", async () => {
  vi.stubGlobal(
    "matchMedia",
    vi.fn(() => ({
      matches: true,
      addEventListener: vi.fn(),
      removeEventListener: vi.fn(),
    })),
  );
  try {
    setLanguage("fr");
    const { container } = render(<LessonDiagram guide={guideFor(python.id)} />);
    expect(
      screen.queryByRole("button", { name: "Animer le parcours" }),
    ).not.toBeInTheDocument();
    fireEvent.click(screen.getByRole("button", { name: "Étape suivante" }));
    expect(container.querySelectorAll(".flow-active")).toHaveLength(1);
    expect(container.querySelector(".flow-active")).toHaveTextContent("02");
  } finally {
    vi.unstubAllGlobals();
  }
});

test("a homework entry opens the attached practice immediately in the selected language", () => {
  setLanguage("fr");
  render(
    <LessonReader lesson={python} initialTab="lab">
      <button>Remettre mon travail</button>
    </LessonReader>,
  );
  expect(
    screen.getByRole("button", { name: "Remettre mon travail" }),
  ).toBeVisible();
  expect(
    screen.getByRole("heading", { name: "Votre liste de preuves" }),
  ).toBeVisible();
  expect(screen.getByRole("tab", { name: "Projet guidé" })).toHaveAttribute(
    "aria-selected",
    "true",
  );
});
