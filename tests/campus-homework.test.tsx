import { afterEach, expect, test, vi } from "vitest";
import {
  cleanup,
  fireEvent,
  render,
  screen,
  within,
} from "@testing-library/react";
import {
  HomeworkBoard,
  HomeworkSummary,
  HomeworkHistory,
} from "../src/campus/HomeworkBoard";
import { LanguageSwitch } from "../src/campus/LanguageSwitch";
import { seedCampus } from "../src/campus/lib/seed";
import { filterCampus } from "../src/campus/lib/domain";
import { progress } from "../src/campus/lib/model";
import { homeworkItems, homeworkText } from "../src/campus/lib/homework";
import { setLanguage } from "../src/campus/lib/language";
afterEach(() => {
  cleanup();
  setLanguage("en");
});

test("homework presents six clear activities initially, with feedback and lesson actions", () => {
  const c = filterCampus(seedCampus(), "adult"),
    openLesson = vi.fn(),
    openSubmission = vi.fn();
  render(
    <HomeworkBoard
      c={c}
      persona="adult"
      openLesson={openLesson}
      openSubmission={openSubmission}
    />,
  );
  expect(screen.queryByRole("table")).not.toBeInTheDocument();
  expect(screen.getAllByRole("article")).toHaveLength(6);
  fireEvent.click(screen.getAllByRole("button", { name: "Start activity" })[0]);
  expect(openLesson).toHaveBeenCalledWith(
    c.lessons.find((l) => l.id === "linux-2"),
  );
  fireEvent.click(screen.getByRole("button", { name: /Show more activities/ }));
  expect(screen.getAllByRole("article")).toHaveLength(12);
  fireEvent.click(screen.getByRole("button", { name: /Completed/ }));
  expect(screen.getAllByRole("article")).toHaveLength(1);
  fireEvent.click(screen.getByRole("button", { name: "Read feedback" }));
  expect(openSubmission).toHaveBeenCalledWith(c.submissions[0]);
});

test("French remains selected through homework navigation and English restores all authored labels", () => {
  const c = filterCampus(seedCampus(), "adult"),
    callbacks = { openLesson: vi.fn(), openSubmission: vi.fn() };
  const ui = (show: boolean) => (
    <>
      <LanguageSwitch />
      {show && <HomeworkBoard c={c} persona="adult" {...callbacks} />}
    </>
  );
  const { rerender } = render(ui(false));
  fireEvent.change(
    screen.getByRole("combobox", { name: "Language / Langue" }),
    { target: { value: "fr" } },
  );
  rerender(ui(true));
  expect(document.documentElement.lang).toBe("fr");
  expect(localStorage.getItem("lessgooo-language")).toBe("fr");
  expect(
    screen.getAllByRole("button", { name: "Commencer l’activité" }),
  ).toHaveLength(6);
  expect(screen.queryByText("Ready to start")).not.toBeInTheDocument();
  fireEvent.click(screen.getByRole("button", { name: /Terminés/ }));
  expect(screen.getByRole("button", { name: "Lire le retour" })).toBeVisible();
  fireEvent.change(
    screen.getByRole("combobox", { name: "Language / Langue" }),
    { target: { value: "en" } },
  );
  expect(screen.getByRole("button", { name: /Completed/ })).toHaveAttribute(
    "aria-pressed",
    "true",
  );
  expect(screen.getByRole("button", { name: "Read feedback" })).toBeVisible();
  expect(screen.queryByText("Validé")).not.toBeInTheDocument();
  rerender(ui(false));
  rerender(ui(true));
  expect(document.documentElement.lang).toBe("en");
});

test("parents get read-only activity actions and teachers start with work needing review", () => {
  const props = { openLesson: vi.fn(), openSubmission: vi.fn() };
  const view = render(
    <HomeworkBoard
      c={filterCampus(seedCampus(), "parent")}
      persona="parent"
      {...props}
    />,
  );
  expect(
    screen.queryByRole("button", { name: "Start activity" }),
  ).not.toBeInTheDocument();
  expect(screen.getAllByRole("button", { name: "Open activity" })).toHaveLength(
    6,
  );
  view.unmount();
  render(<HomeworkBoard c={seedCampus()} persona="teacher" {...props} />);
  fireEvent.click(screen.getByRole("button", { name: "Review work" }));
  expect(props.openSubmission).toHaveBeenCalledWith(
    expect.objectContaining({ id: "sub2", status: "pending" }),
  );
});

test("revisions are prioritised and custom feedback is kept exactly as written", () => {
  const c = filterCampus(seedCampus(), "adult");
  c.submissions.push({
    ...c.submissions[0],
    id: "custom",
    lesson: c.lessons[9].id,
    status: "revise",
    feedback: "My own feedback — à garder",
    created: "2099-01-01T00:00:00Z",
  });
  render(
    <HomeworkBoard
      c={c}
      persona="adult"
      openLesson={vi.fn()}
      openSubmission={vi.fn()}
    />,
  );
  expect(
    within(screen.getAllByRole("article")[0]).getByText(
      "My own feedback — à garder",
    ),
  ).toBeVisible();
});

test("progress counts distinct in-track validated lessons and the latest attempt stays accessible", () => {
  const c = seedCampus(),
    original = progress(c, "alex");
  c.lessons.push(c.lessons[0]);
  c.submissions.push(
    { ...c.submissions[0], id: "duplicate" },
    { ...c.submissions[0], id: "unknown", lesson: "unknown" },
    { ...c.submissions[0], id: "wrong-track", lesson: "kids-1" },
  );
  expect(progress(c, "alex")).toEqual(original);
  c.submissions.unshift({
    ...c.submissions[0],
    id: "new-attempt",
    created: "2099-01-01T00:00:00Z",
    status: "pending",
  });
  expect(
    homeworkItems(c, "alex").find((i) => i.lesson.id === "linux-1")?.submission
      ?.id,
  ).toBe("new-attempt");
  expect(homeworkItems(c, "alex")).toHaveLength(original.total);
});

test("only untouched demo submissions and feedback are translated", () => {
  const [s] = seedCampus().submissions;
  expect(homeworkText(s, "text", "en")).toContain("pwd shows where I am");
  expect(homeworkText(s, "feedback", "en")).toContain(
    "You can find your way around",
  );
  expect(homeworkText(s, "text", "fr")).toBe(s.text);
  expect(homeworkText({ ...s, id: "new" }, "text", "en")).toBe(s.text);
  expect(
    homeworkText({ ...s, feedback: "Mon vrai retour" }, "feedback", "en"),
  ).toBe("Mon vrai retour");
});

test("dashboard shows three named next steps and a single route to all homework", () => {
  const go = vi.fn();
  render(
    <HomeworkSummary
      c={filterCampus(seedCampus(), "child")}
      openLesson={vi.fn()}
      go={go}
    />,
  );
  expect(screen.getAllByRole("button")).toHaveLength(4);
  fireEvent.click(screen.getByRole("button", { name: "View all homework" }));
  expect(go).toHaveBeenCalledOnce();
});

test("older work and attachments remain reachable without exposing other learners or lessons", () => {
  const current = seedCampus().submissions[0],
    openSubmission = vi.fn();
  const previous = {
    ...current,
    id: "older",
    created: "2026-01-01T12:00:00Z",
    status: "revise" as const,
    file: { id: "my-file", name: "my-work.txt" },
  };
  render(
    <HomeworkHistory
      current={current}
      submissions={[
        current,
        previous,
        { ...previous, id: "other-learner", student: "maya" },
        { ...previous, id: "other-lesson", lesson: "kids-1" },
      ]}
      openSubmission={openSubmission}
    />,
  );
  fireEvent.click(screen.getByText("Other attempts (1)"));
  fireEvent.click(screen.getByRole("button", { name: /To improve/ }));
  expect(openSubmission).toHaveBeenCalledWith(previous);
  expect(screen.getAllByRole("button")).toHaveLength(1);
});
