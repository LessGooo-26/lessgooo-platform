import { afterEach, beforeEach, expect, test, vi } from "vitest";
import {
  act,
  fireEvent,
  render,
  screen,
  waitFor,
  within,
} from "@testing-library/react";
import { setLanguage } from "../src/campus/lib/language";
import SchoolHub from "../src/school/SchoolHub";
import SchoolEditor from "../src/school/SchoolEditor";
import { SchoolQuiz } from "../src/school/SchoolQuiz";
import { initialCatalog } from "../src/school/catalog";
import { schoolRequest } from "../src/school/api";
import type { CatalogSnapshot } from "../src/school/model";
vi.mock("../src/school/api", async (importOriginal) => ({
  ...(await importOriginal<typeof import("../src/school/api")>()),
  schoolRequest: vi.fn(),
}));
beforeEach(() => {
  localStorage.clear();
  setLanguage("en");
  vi.mocked(schoolRequest).mockImplementation(async (route) => {
    if (route === "catalog")
      return { catalog: structuredClone(initialCatalog), version: 1 } as never;
    if (route === "progress") return { profile: null, attempts: [] } as never;
    return [] as never;
  });
});
afterEach(() => {
  setLanguage("en");
  vi.clearAllMocks();
});

test("switching subsystem preserves interface language and exposes a clear empty curriculum state", async () => {
  render(<SchoolHub />);
  await waitFor(() =>
    expect(screen.queryByText("Loading catalogue…")).not.toBeInTheDocument(),
  );
  fireEvent.change(screen.getByLabelText("Subsystem"), {
    target: { value: "en" },
  });
  expect(screen.getByLabelText("My class")).toHaveValue("en-5");
  expect(
    screen.getByRole("heading", { name: "What will we understand today?" }),
  ).toBeInTheDocument();
  fireEvent.change(screen.getByLabelText("My class"), {
    target: { value: "en-class1" },
  });
  expect(
    screen.getByRole("heading", { name: "This pathway is still growing" }),
  ).toBeInTheDocument();
  act(() => setLanguage("fr"));
  expect(screen.getByLabelText("Ma classe")).toHaveValue("en-class1");
  expect(
    screen.getByRole("heading", {
      name: "Construisons la suite de ce parcours",
    }),
  ).toBeInTheDocument();
  expect(
    screen.queryByRole("button", { name: "Learn", exact: true }),
  ).not.toBeInTheDocument();
});
test("parent navigation offers read-only progress without management controls", async () => {
  render(<SchoolHub persona="parent" />);
  await waitFor(() =>
    expect(screen.queryByText("Loading catalogue…")).not.toBeInTheDocument(),
  );
  expect(
    screen.queryByRole("button", { name: "Manage", exact: true }),
  ).not.toBeInTheDocument();
  fireEvent.click(
    screen.getByRole("button", { name: "Progress", exact: true }),
  );
  expect(
    screen.getByText(/demonstration child's attempts/),
  ).toBeInTheDocument();
  fireEvent.click(
    screen.getByRole("button", { name: "Guidance", exact: true }),
  );
  screen
    .getAllByRole("checkbox")
    .forEach((input) => expect(input).toBeDisabled());
  expect(
    screen.queryByRole("button", { name: "Add mark" }),
  ).not.toBeInTheDocument();
});
test("quiz reveals explanations only after completion and retains answers if persistence fails", async () => {
  const chapter = initialCatalog.chapters[0],
    submit = vi
      .fn()
      .mockRejectedValueOnce(new Error("SCHOOL_OFFLINE"))
      .mockResolvedValue(undefined);
  render(<SchoolQuiz chapter={chapter} onSubmit={submit} />);
  expect(
    screen.queryByText(chapter.questions[0].explanation.en),
  ).not.toBeInTheDocument();
  for (const q of chapter.questions)
    fireEvent.click(
      within(
        screen.getByRole("group", {
          name: new RegExp(q.prompt.en.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")),
        }),
      ).getByRole("radio", { name: q.choices[q.answer].en, exact: true }),
    );
  fireEvent.click(screen.getByRole("button", { name: "Check my quiz" }));
  await screen.findByRole("alert");
  expect(screen.getByRole("radio", { name: "5/6", exact: true })).toBeChecked();
  fireEvent.click(screen.getByRole("button", { name: "Check my quiz" }));
  expect(
    await screen.findByText(chapter.questions[0].explanation.en),
  ).toBeInTheDocument();
  fireEvent.click(screen.getByRole("button", { name: "Try again" }));
  expect(
    screen.queryByText(chapter.questions[0].explanation.en),
  ).not.toBeInTheDocument();
});
test("editor saves a validated fee, preserves content, and blocks navigation with unsaved work", async () => {
  const snapshot: CatalogSnapshot = {
    catalog: structuredClone(initialCatalog),
    version: 1,
  };
  const save = vi.fn(async (catalog) => ({ catalog, version: 2 }));
  render(<SchoolEditor snapshot={snapshot} onSave={save} />);
  fireEvent.change(screen.getByLabelText("Registration (F CFA)"), {
    target: { value: "3000" },
  });
  let allowed = true;
  act(() => {
    allowed = window.dispatchEvent(
      new Event("campus-before-navigate", { cancelable: true }),
    );
  });
  expect(allowed).toBe(false);
  fireEvent.click(screen.getByRole("button", { name: "Save changes" }));
  await waitFor(() => expect(save).toHaveBeenCalledTimes(1));
  expect(save.mock.calls[0][0].registration).toBe(3000);
  expect(save.mock.calls[0][0].chapters).toEqual(initialCatalog.chapters);
  await screen.findByText(/Catalogue saved/);
  expect(
    window.dispatchEvent(
      new Event("campus-before-navigate", { cancelable: true }),
    ),
  ).toBe(true);
});
test("editor retains the draft on an optimistic concurrency conflict and does not publish invalid input", async () => {
  const save = vi.fn().mockRejectedValue(new Error("SCHOOL_CONFLICT"));
  render(
    <SchoolEditor
      snapshot={{ catalog: structuredClone(initialCatalog), version: 1 }}
      onSave={save}
    />,
  );
  fireEvent.change(screen.getByLabelText("Registration (F CFA)"), {
    target: { value: "-1" },
  });
  fireEvent.click(screen.getByRole("button", { name: "Save changes" }));
  expect(save).not.toHaveBeenCalled();
  expect(screen.getByText(/Nothing was saved/)).toBeInTheDocument();
  fireEvent.change(screen.getByLabelText("Registration (F CFA)"), {
    target: { value: "4000" },
  });
  fireEvent.click(screen.getByRole("button", { name: "Save changes" }));
  await screen.findByText(/catalogue changed in another window/i);
  expect(screen.getByLabelText("Registration (F CFA)")).toHaveValue(4000);
});
