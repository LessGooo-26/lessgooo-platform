import { useRef } from "react";
import { afterEach, beforeEach, expect, test, vi } from "vitest";
import {
  act,
  cleanup,
  fireEvent,
  render,
  renderHook,
  screen,
  waitFor,
  within,
} from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import {
  WorkspaceHub,
  WorkspaceWelcome,
  type WorkspaceLauncherHandle,
} from "../src/campus/WorkspaceHub";
import {
  cleanPreferences,
  loadPreferences,
  visibleTools,
  workspaceKey,
} from "../src/campus/lib/campus-navigation";
import { useWorkspacePreferences } from "../src/campus/lib/use-workspace-preferences";
import { setLanguage } from "../src/campus/lib/language";
import type { Lesson, Persona } from "../src/campus/lib/model";
const lesson = {
  id: "visible-lesson",
  title: "Linux practice",
  module: "Environment basics",
} as Lesson;
beforeEach(() => {
  localStorage.clear();
  setLanguage("en");
});
afterEach(() => {
  cleanup();
  vi.restoreAllMocks();
  setLanguage("en");
});
function Harness({
  persona = "adult",
  go = vi.fn(),
  openResult = vi.fn(),
  searchCampus = vi.fn(),
  lessons = [lesson],
}: {
  persona?: Persona;
  go?: (page: string) => boolean | void;
  openResult?: (result: unknown) => boolean | void;
  searchCampus?: (query: string) => boolean | void;
  lessons?: Lesson[];
}) {
  const workspace = useWorkspacePreferences(persona, "dashboard"),
    launcher = useRef<WorkspaceLauncherHandle>(null);
  return (
    <>
      <WorkspaceHub
        ref={launcher}
        persona={persona}
        preferences={workspace.data}
        lessons={lessons}
        go={go}
        onPin={workspace.toggle}
        clearRecent={workspace.clearRecent}
        openResult={openResult}
        searchCampus={searchCampus}
      />
      <WorkspaceWelcome
        persona={persona}
        preferences={workspace.data}
        go={go}
        openTools={(button) => launcher.current?.openTools(button)}
      />
    </>
  );
}
test("tools follow the existing role visibility and persisted shortcuts cannot expose forbidden sections", () => {
  expect(visibleTools("teacher").map((t) => t.id)).toEqual(
    expect.arrayContaining(["students", "integrations", "coaching"]),
  );
  expect(visibleTools("adult").map((t) => t.id)).not.toEqual(
    expect.arrayContaining(["students"]),
  );
  expect(visibleTools("parent").map((t) => t.id)).not.toContain("coaching");
  expect(visibleTools("child").map((t) => t.id)).not.toContain("services");
  expect(
    cleanPreferences(
      {
        pinned: [
          "students",
          "integrations",
          "payments",
          "services",
          "coaching",
          "courses",
          "courses",
          "unknown",
          7,
        ],
        recent: ["students", "profile"],
      },
      "child",
    ),
  ).toEqual({ pinned: ["courses"], recent: ["profile"] });
});
test("preferences recover from malformed storage and honor an intentionally empty favorites list", () => {
  localStorage.setItem(workspaceKey("adult"), "broken JSON");
  expect(loadPreferences("adult").pinned).toContain("courses");
  localStorage.setItem(
    workspaceKey("adult"),
    JSON.stringify({ pinned: [], recent: "bad" }),
  );
  expect(loadPreferences("adult")).toEqual({ pinned: [], recent: [] });
});
test("favorites and recent spaces are capped and isolated across personas; clearing recent spaces persists", () => {
  const { result, rerender } = renderHook(
    ({ persona, page }: { persona: Persona; page: string }) =>
      useWorkspacePreferences(persona, page),
    { initialProps: { persona: "adult" as Persona, page: "courses" } },
  );
  act(() => result.current.toggle("galleries"));
  act(() => result.current.toggle("sessions"));
  act(() => result.current.toggle("services"));
  expect(result.current.data.pinned).toHaveLength(6);
  expect(result.current.data.pinned).not.toContain("services");
  for (const page of ["projects", "notebook", "library", "galleries"])
    rerender({ persona: "adult", page });
  expect(result.current.data.recent).toEqual([
    "galleries",
    "library",
    "notebook",
    "projects",
  ]);
  rerender({ persona: "child", page: "dashboard" });
  expect(result.current.data.recent).toEqual([]);
  expect(result.current.data.pinned).not.toContain("library");
  rerender({ persona: "adult", page: "dashboard" });
  expect(result.current.data.pinned).toContain("sessions");
  act(() => result.current.clearRecent());
  expect(
    JSON.parse(localStorage.getItem(workspaceKey("adult"))!).recent,
  ).toEqual([]);
});
test("the workspace remains usable when browser storage is blocked", () => {
  vi.spyOn(Storage.prototype, "getItem").mockImplementation(() => {
    throw new Error("blocked");
  });
  vi.spyOn(Storage.prototype, "setItem").mockImplementation(() => {
    throw new Error("blocked");
  });
  const { result } = renderHook(() =>
    useWorkspacePreferences("adult", "courses"),
  );
  act(() => result.current.toggle("galleries"));
  expect(result.current.data.pinned).toContain("galleries");
});
test("Ctrl K opens a focused search; Escape restores the initiating control and leaves language unchanged", async () => {
  const user = userEvent.setup();
  render(<Harness />);
  const trigger = screen.getByRole("button", { name: /Search your campus/ });
  trigger.focus();
  await user.keyboard("{Control>}k{/Control}");
  expect(screen.getByRole("dialog")).toBeInTheDocument();
  expect(screen.getByRole("searchbox")).toHaveFocus();
  await user.keyboard("{Escape}");
  await waitFor(() => expect(trigger).toHaveFocus());
  expect(screen.queryByRole("dialog")).not.toBeInTheDocument();
  expect(localStorage.getItem("lessgooo-language")).toBe("en");
});
test("Customize opens the same launcher, starts fresh and returns focus to Customize", async () => {
  const user = userEvent.setup();
  render(<Harness />);
  const customize = screen.getByRole("button", { name: "Customize" });
  await user.click(customize);
  await user.type(screen.getByRole("searchbox"), "Linux");
  await user.keyboard("{Escape}");
  await waitFor(() => expect(customize).toHaveFocus());
  await user.click(customize);
  expect(screen.getByRole("searchbox")).toHaveValue("");
});
test("a learner can pin a tool, see it on the home page and keep it after reopening the workspace", async () => {
  const user = userEvent.setup();
  const first = render(<Harness />);
  await user.click(screen.getByRole("button", { name: "All campus tools" }));
  await user.click(screen.getByRole("button", { name: "Pin Photo galleries" }));
  expect(
    screen.getByRole("button", { name: "Unpin Photo galleries" }),
  ).toHaveAttribute("aria-pressed", "true");
  await user.keyboard("{Escape}");
  expect(
    within(screen.getByRole("region", { name: "My workspace" })).getByRole(
      "button",
      { name: /Photo galleries/ },
    ),
  ).toBeInTheDocument();
  first.unmount();
  render(<Harness />);
  expect(
    within(screen.getByRole("region", { name: "My workspace" })).getByRole(
      "button",
      { name: /Photo galleries/ },
    ),
  ).toBeInTheDocument();
});
test("a seventh favorite gives an explanation without replacing existing pins", async () => {
  localStorage.setItem(
    workspaceKey("adult"),
    JSON.stringify({
      pinned: [
        "courses",
        "projects",
        "notebook",
        "library",
        "galleries",
        "sessions",
      ],
    }),
  );
  const user = userEvent.setup();
  render(<Harness />);
  await user.click(screen.getByRole("button", { name: "All campus tools" }));
  await user.click(
    screen.getByRole("button", { name: "Pin Services & requests" }),
  );
  expect(screen.getByRole("status")).toHaveTextContent("Six shortcuts");
  expect(loadPreferences("adult").pinned).not.toContain("services");
});
test("lesson results open the exact visible lesson and whole-campus search keeps the query", async () => {
  const openResult = vi.fn(),
    searchCampus = vi.fn(),
    user = userEvent.setup();
  render(<Harness openResult={openResult} searchCampus={searchCampus} />);
  await user.click(screen.getByRole("button", { name: /Search your campus/ }));
  await user.type(screen.getByRole("searchbox"), "Linux practice");
  await user.click(
    screen.getByRole("button", { name: /Linux practice Environment basics/ }),
  );
  expect(openResult).toHaveBeenCalledWith(
    expect.objectContaining({
      id: "visible-lesson",
      type: "lessons",
      page: "courses",
    }),
  );
  expect(screen.queryByRole("dialog")).not.toBeInTheDocument();
  await user.click(screen.getByRole("button", { name: /Search your campus/ }));
  await user.type(screen.getByRole("searchbox"), "my architecture notes");
  await user.keyboard("{Enter}");
  expect(searchCampus).toHaveBeenCalledWith("my architecture notes");
});
test("child launcher excludes adult catalog and teacher tools", async () => {
  const user = userEvent.setup();
  render(<Harness persona="child" lessons={[]} />);
  await user.click(screen.getByRole("button", { name: "All campus tools" }));
  const dialog = within(screen.getByRole("dialog"));
  expect(dialog.queryByText("My students")).not.toBeInTheDocument();
  expect(dialog.queryByText("Services & requests")).not.toBeInTheDocument();
  await user.type(screen.getByRole("searchbox"), "DevOps");
  expect(dialog.queryByText("Course areas")).not.toBeInTheDocument();
  expect(dialog.queryByText("Linux practice")).not.toBeInTheDocument();
});
test("French tool search ignores accents and navigation never switches the language", async () => {
  setLanguage("fr");
  const user = userEvent.setup(),
    go = vi.fn();
  render(<Harness go={go} />);
  await user.click(
    screen.getByRole("button", { name: "Tous les outils du campus" }),
  );
  expect(
    screen.getByRole("heading", { name: "Vos outils, au même endroit" }),
  ).toBeInTheDocument();
  await user.type(screen.getByRole("searchbox"), "presentations");
  await user.click(
    screen.getByRole("button", { name: /^Notes & présentations Garder/ }),
  );
  expect(go).toHaveBeenCalledWith("notebook");
  expect(localStorage.getItem("lessgooo-language")).toBe("fr");
});
test("a cancelled navigation keeps the launcher open; keyboard search does not interrupt another dialog", async () => {
  const user = userEvent.setup();
  const view = render(<Harness go={() => false} />);
  await user.click(screen.getByRole("button", { name: "All campus tools" }));
  await user.click(screen.getByRole("button", { name: /^Homework Practise/ }));
  expect(screen.getByRole("dialog")).toBeInTheDocument();
  await user.keyboard("{Escape}");
  view.rerender(
    <>
      <Harness />
      <div role="dialog" aria-label="Lesson editor">
        Editing
      </div>
    </>,
  );
  fireEvent.keyDown(window, { key: "k", ctrlKey: true });
  expect(screen.getAllByRole("dialog")).toHaveLength(1);
  expect(screen.getByRole("dialog")).toHaveAccessibleName("Lesson editor");
});
