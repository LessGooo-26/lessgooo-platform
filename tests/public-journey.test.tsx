import { afterEach, beforeAll, beforeEach, expect, test, vi } from "vitest";
import {
  act,
  cleanup,
  fireEvent,
  render,
  screen,
  within,
} from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { MemoryRouter } from "react-router-dom";
import { App } from "../src/App";
import { questionsFor } from "../src/campus/lib/service-intake";
import { courseCatalog } from "../src/campus/lib/course-catalog";
import { setLanguage } from "../src/campus/lib/language";
import { curriculum } from "../src/campus/lib/curriculum";
function page(path: string) {
  return render(
    <MemoryRouter initialEntries={[path]}>
      <App />
    </MemoryRouter>,
  );
}
// Preload lazy modules so this interaction test measures behavior, not cold Vite transforms.
beforeAll(async () => {
  await Promise.all([
    import("../src/pages/CoursePage"),
    import("../src/pages/ContactEnquiry"),
  ]);
}, 15000);
beforeEach(() => {
  localStorage.clear();
  setLanguage("en");
});
afterEach(() => {
  cleanup();
  vi.restoreAllMocks();
});
test("the public directory exposes all nine areas and a useful empty state", async () => {
  page("/programs");
  for (const course of courseCatalog)
    expect(
      screen.getByRole("link", { name: "Explore: " + course.title.en }),
    ).toHaveAttribute("href", "/courses/" + course.id);
  fireEvent.change(screen.getByLabelText("What would you like to explore?"), {
    target: { value: "no-such-course" },
  });
  expect(
    screen.queryByRole("link", { name: "Explore: DevOps" }),
  ).not.toBeInTheDocument();
  await userEvent.click(screen.getByRole("button", { name: "Clear search" }));
  expect(
    screen.getByRole("link", { name: "Explore: DevOps" }),
  ).toBeInTheDocument();
});
test("a company course links its tailored enquiry and has prerequisites and practical phases", async () => {
  page("/courses/cloud?view=company");
  expect(
    await screen.findByRole("heading", { level: 1, name: "Cloud computing" }),
  ).toBeInTheDocument();
  expect(
    screen.getByRole("heading", { name: "Before you start" }),
  ).toBeInTheDocument();
  expect(
    screen.getByRole("heading", { name: "Your path, step by step" }),
  ).toBeInTheDocument();
  await userEvent.click(
    screen.getByRole("link", { name: "Discuss my company’s needs" }),
  );
  expect(
    await screen.findByLabelText(
      "Which service do you need?",
      {},
      { timeout: 5000 },
    ),
  ).toHaveValue("company");
  expect(
    screen.getByLabelText("Which service area does your company need?"),
  ).toHaveValue("cloud");
});
test("public enquiry validates a complete brief and never sends or persists contact information", async () => {
  const fetch = vi.spyOn(globalThis, "fetch");
  page("/contact?service=company&course=cloud");
  await screen.findByRole(
    "button",
    { name: "Review my enquiry" },
    { timeout: 5000 },
  );
  const fields: Record<string, string> = {
    name: "Demo Reviewer",
    email: "reviewer@example.test",
    country: "CM",
    timezone: "Africa/Douala",
    timeframe: "flexible",
    message: "Help our demo team understand cloud deployment.",
  };
  const form = screen
    .getByRole("button", { name: "Review my enquiry" })
    .closest("form")!;
  for (const [name, value] of Object.entries(fields))
    fireEvent.change(form.elements.namedItem(name)!, { target: { value } });
  for (const q of questionsFor("company", "cloud"))
    fireEvent.change(
      screen.getByLabelText(q.label.en + (q.required ? "" : " (optional)")),
      { target: { value: "Demo context for our practice project" } },
    );
  fireEvent.click(screen.getByRole("checkbox"));
  fireEvent.submit(form);
  expect(
    screen.getByRole("heading", { name: "Your enquiry is ready to review" }),
  ).toBeInTheDocument();
  expect(screen.getByText(/Nothing has been sent/)).toBeInTheDocument();
  expect(
    screen.getByRole("link", { name: "Open my email app" }),
  ).toHaveAttribute(
    "href",
    expect.stringContaining("mailto:lessgooo.ai26@gmail.com?subject="),
  );
  expect(fetch).not.toHaveBeenCalled();
  expect(JSON.stringify(localStorage)).not.toContain("reviewer@example.test");
  await userEvent.click(
    screen.getByRole("button", { name: "Edit", exact: true }),
  );
  expect(screen.getByLabelText("What name should we use?")).toHaveValue(
    "Demo Reviewer",
  );
});
test("public intake follows language changes and keeps the user's entered details", async () => {
  page("/contact?service=training&course=linux");
  await screen.findByLabelText("What name should we use?");
  fireEvent.change(screen.getByLabelText("What name should we use?"), {
    target: { value: "Demo Reviewer" },
  });
  await userEvent.click(screen.getByRole("button", { name: "Français" }));
  expect(
    screen.getByLabelText("Comment devons-nous vous appeler ?"),
  ).toHaveValue("Demo Reviewer");
  expect(
    screen.getByRole("button", { name: "Relire ma demande" }),
  ).toBeInTheDocument();
  expect(screen.queryByText("Choose your support")).not.toBeInTheDocument();
  expect(document.documentElement.lang).toBe("fr");
});
test("public lesson previews translate with the shared preference", async () => {
  page("/programs/kids");
  const lesson = curriculum.find((l) => l.track === "kids")!;
  expect(screen.queryByText(lesson.explanation)).not.toBeInTheDocument();
  await userEvent.click(screen.getByRole("button", { name: "Français" }));
  expect(screen.getByText(lesson.explanation)).toBeInTheDocument();
  act(() => setLanguage("en"));
  expect(document.documentElement.lang).toBe("en");
  expect(screen.queryByText(lesson.explanation)).not.toBeInTheDocument();
});
test("skip link preserves the route and mobile Escape returns focus", async () => {
  page("/about");
  const user = userEvent.setup();
  await user.click(screen.getByRole("link", { name: "Skip to main content" }));
  expect(screen.getByRole("main")).toHaveFocus();
  expect(
    screen.getByRole("heading", { level: 1, name: "About LESSGOOO" }),
  ).toBeInTheDocument();
  await user.click(screen.getByRole("button", { name: "Open menu" }));
  const nav = screen.getByRole("navigation", { name: "Mobile navigation" });
  within(nav).getByRole("link", { name: "Programs" }).focus();
  await user.keyboard("{Escape}");
  expect(screen.getByRole("button", { name: "Open menu" })).toHaveFocus();
});
test("unknown course routes have a useful recovery path", async () => {
  page("/courses/unknown");
  expect(
    await screen.findByRole("heading", { name: "Page not found" }),
  ).toBeInTheDocument();
  expect(screen.getByRole("link", { name: "Return home" })).toHaveAttribute(
    "href",
    "/",
  );
});
