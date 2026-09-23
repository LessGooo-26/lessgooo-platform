import { beforeEach, expect, test, vi } from "vitest";
import { fireEvent, render, screen, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import CourseCatalog from "../src/campus/CourseCatalog";
import {
  courseCatalog,
  courseIds,
  startingChecklist,
} from "../src/campus/lib/course-catalog";
import { setLanguage } from "../src/campus/lib/language";
import { seedCampus } from "../src/campus/lib/seed";
beforeEach(() => setLanguage("en"));
test("all nine confirmed areas contain bilingual preparation, starter phases and company briefs", () => {
  expect(courseCatalog.map((area) => area.id)).toEqual([...courseIds]);
  for (const area of courseCatalog) {
    for (const locale of ["en", "fr"] as const) {
      for (const copy of [
        area.title,
        area.description,
        area.audience,
        area.role,
        area.project,
        area.company,
        area.companyNeeds,
        ...startingChecklist,
        ...area.prerequisites,
        ...area.evidence,
        ...area.deliverables,
        ...area.phases.flatMap((phase) => [phase.title, phase.practice]),
        ...area.brief.flatMap((question) => [question.label, question.hint]),
      ])
        expect(copy[locale].trim().length, area.id).toBeGreaterThan(0);
    }
    expect(area.phases).toHaveLength(4);
    expect(new Set(area.brief.map((q) => q.id)).size).toBe(area.brief.length);
    for (const id of area.lessons)
      expect(
        seedCampus().lessons.some((lesson) => lesson.id === id),
        id,
      ).toBe(true);
    expect(new URL(area.documentation.url).protocol).toBe("https:");
  }
});
test("a keyboard user can open prerequisites and return focus; related lessons respect the supplied visible list", async () => {
  const user = userEvent.setup();
  const openLesson = vi.fn();
  const visible = seedCampus().lessons.filter(
    (lesson) => lesson.id === "linux-1",
  );
  render(
    <CourseCatalog
      lessons={visible}
      openLesson={openLesson}
      onInquiry={vi.fn()}
    />,
  );
  const trigger = screen.getByRole("button", { name: "Explore DevOps" });
  trigger.focus();
  await user.keyboard("{Enter}");
  const dialog = screen.getByRole("dialog", { name: "DevOps" });
  expect(
    within(dialog).getByRole("heading", { name: "Before you start" }),
  ).toBeVisible();
  expect(
    within(dialog).getByRole("link", {
      name: /Docker · official documentation/,
    }),
  ).toHaveAttribute("href", "https://docs.docker.com/get-started/");
  expect(dialog.querySelectorAll(".course-related button")).toHaveLength(1);
  await user.keyboard("{Escape}");
  expect(trigger).toHaveFocus();
  await user.click(trigger);
  fireEvent.click(document.querySelector(".course-related button")!);
  expect(openLesson).toHaveBeenCalledWith(visible[0]);
});
test("French catalog search is accent-insensitive and carries the selected course into an inquiry", () => {
  setLanguage("fr");
  const inquiry = vi.fn();
  render(<CourseCatalog onInquiry={inquiry} />);
  fireEvent.change(screen.getByRole("searchbox"), {
    target: { value: "secretariat" },
  });
  expect(screen.getAllByRole("article")).toHaveLength(1);
  fireEvent.click(
    screen.getByRole("button", { name: "Découvrir : Secrétariat moderne" }),
  );
  const dialog = screen.getByRole("dialog");
  expect(
    within(dialog).getByRole("heading", { name: "Avant de commencer" }),
  ).toBeVisible();
  expect(dialog).not.toHaveTextContent("Before you start");
  fireEvent.click(
    within(dialog).getByRole("button", {
      name: "Se renseigner sur cette formation",
    }),
  );
  expect(inquiry).toHaveBeenCalledWith({
    service: "training",
    course: "secretariat",
  });
});
test("company catalog explains preparation and sends a company inquiry for the selected area", () => {
  const inquiry = vi.fn();
  render(<CourseCatalog companyOnly onInquiry={inquiry} />);
  fireEvent.click(
    screen.getByRole("button", { name: "Explore AI automation" }),
  );
  const dialog = screen.getByRole("dialog");
  expect(
    within(dialog).getByRole("heading", { name: "What to prepare" }),
  ).toBeVisible();
  expect(
    within(dialog).queryByRole("button", { name: "Ask about this course" }),
  ).toBeNull();
  fireEvent.click(
    within(dialog).getByRole("button", { name: "Discuss a company project" }),
  );
  expect(inquiry).toHaveBeenCalledWith({
    service: "company",
    course: "ai-automation",
  });
});
