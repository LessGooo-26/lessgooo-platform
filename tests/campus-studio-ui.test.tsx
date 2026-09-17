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
  fireEvent.click(
    screen.getByRole("button", {
      name: /Private consultation Request a paid conversation/,
    }),
  );
  expect(
    screen.getByText(/price, currency and session length are being set/),
  ).toBeInTheDocument();
  expect(
    screen.queryByRole("button", { name: /Pay now/i }),
  ).not.toBeInTheDocument();
  await waitFor(() => expect(workspaceRequest).toHaveBeenCalled());
});
