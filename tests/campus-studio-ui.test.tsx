import { beforeEach, test, expect, vi } from "vitest";
import {
  render,
  screen,
  fireEvent,
  waitFor,
  cleanup,
} from "@testing-library/react";
import { CampusSearch, ServiceDesk } from "../src/campus/StudioPanel";
import { seedCampus } from "../src/campus/lib/seed";
import { workspaceRequest } from "../src/campus/lib/workspace-api";
vi.mock("../src/campus/lib/workspace-api", () => ({
  workspaceRequest: vi.fn(),
  post: vi.fn(),
}));
beforeEach(() => {
  cleanup();
  localStorage.clear();
  sessionStorage.clear();
  vi.mocked(workspaceRequest).mockImplementation(async (path) => {
    if (path === "/api/studio")
      return { ready: true, requests: [], imports: [] } as never;
    if (path === "/api/studio/search")
      return [
        {
          id: "transcript:video1",
          text: "A server stores files and runs applications.",
        },
      ] as never;
    return {
      notes: [],
      galleries: [],
      media: [{ id: "video1", name: "My cloud recording", type: "video/mp4" }],
    } as never;
  });
});
test("campus search finds spoken words and prepares an explicit Google search link", async () => {
  render(<CampusSearch persona="teacher" campus={seedCampus()} go={vi.fn()} />);
  const input = screen.getByLabelText("Search the campus");
  fireEvent.change(input, { target: { value: "stores files" } });
  await waitFor(() =>
    expect(screen.getByText("My cloud recording")).toBeInTheDocument(),
  );
  expect(screen.getByRole("link", { name: /Search Google/ })).toHaveAttribute(
    "href",
    "https://www.google.com/search?q=stores%20files&hl=en",
  );
  expect(
    vi
      .mocked(workspaceRequest)
      .mock.calls.every((c) => c[0].startsWith("/api/")),
  ).toBe(true);
});
test("service page offers the verified public form and no invented consultation fee", async () => {
  render(<ServiceDesk persona="adult" />);
  expect(
    screen.getByRole("link", { name: /Open the public request form/ }),
  ).toHaveAttribute(
    "href",
    expect.stringContaining("docs.google.com/forms/d/e/"),
  );
  fireEvent.change(screen.getByLabelText("Which service do you need?"), {
    target: { value: "consultation" },
  });
  expect(
    screen.getByText(/price, currency and session length are being set/),
  ).toBeInTheDocument();
  expect(
    screen.queryByRole("button", { name: /Pay now/i }),
  ).not.toBeInTheDocument();
  await waitFor(() => expect(workspaceRequest).toHaveBeenCalled());
});

test("search opens a matching course result and indexes photo labels", async () => {
  const open = vi.fn();
  vi.mocked(workspaceRequest).mockImplementation(async (path) =>
    path === "/api/studio/search"
      ? ([] as never)
      : ({
          notes: [],
          galleries: [],
          media: [
            {
              id: "photo",
              name: "IMG001.png",
              label: "Cloud architecture sketch",
              type: "image/png",
            },
          ],
        } as never),
  );
  render(
    <CampusSearch
      persona="adult"
      campus={seedCampus()}
      go={vi.fn()}
      openResult={open}
    />,
  );
  fireEvent.change(screen.getByLabelText("Search the campus"), {
    target: { value: "architecture sketch" },
  });
  expect(
    await screen.findByText("Cloud architecture sketch"),
  ).toBeInTheDocument();
  fireEvent.change(screen.getByLabelText("Search the campus"), {
    target: { value: "Cloud" },
  });
  fireEvent.click(
    screen.getByRole("button", { name: "Course areas", exact: true }),
  );
  fireEvent.click(screen.getAllByRole("button", { name: "Open result" })[0]);
  expect(open).toHaveBeenCalledWith(
    expect.objectContaining({ type: "courses", page: "courses" }),
  );
});
test("lesson search dispatches the visible lesson identifier; children do not get the adult course catalog", async () => {
  const open = vi.fn(),
    campus = seedCampus();
  campus.lessons = campus.lessons.filter((l) => l.track === "kids").slice(0, 1);
  render(
    <CampusSearch
      persona="child"
      campus={campus}
      go={vi.fn()}
      openResult={open}
    />,
  );
  fireEvent.click(screen.getByRole("button", { name: "Lessons", exact: true }));
  fireEvent.click(screen.getByRole("button", { name: "Open result" }));
  expect(open).toHaveBeenCalledWith(
    expect.objectContaining({ id: campus.lessons[0].id, type: "lessons" }),
  );
  expect(
    screen.queryByRole("button", { name: "Course areas" }),
  ).not.toBeInTheDocument();
  await waitFor(() => expect(workspaceRequest).toHaveBeenCalled());
});

test("search lets a learner reach results beyond the initial page", async () => {
  const campus = seedCampus(),
    template = campus.lessons[0];
  campus.lessons = Array.from({ length: 85 }, (_, i) => ({
    ...template,
    id: "lesson-" + i,
    title: "Practice lesson " + i,
  }));
  render(<CampusSearch persona="adult" campus={campus} go={vi.fn()} />);
  fireEvent.click(screen.getByRole("button", { name: "Lessons", exact: true }));
  expect(
    screen.queryByRole("heading", { name: "Practice lesson 84", exact: true }),
  ).not.toBeInTheDocument();
  fireEvent.click(screen.getByRole("button", { name: "Show more results" }));
  expect(
    screen.getByRole("heading", { name: "Practice lesson 84", exact: true }),
  ).toBeInTheDocument();
  await waitFor(() => expect(workspaceRequest).toHaveBeenCalled());
});

test("whole-campus search initializes with the query from the workspace launcher", async () => {
  render(
    <CampusSearch
      persona="adult"
      campus={seedCampus()}
      go={vi.fn()}
      initialQuery="My cloud recording"
    />,
  );
  expect(screen.getByLabelText("Search the campus")).toHaveValue(
    "My cloud recording",
  );
  expect(await screen.findByText("My cloud recording")).toBeInTheDocument();
});
