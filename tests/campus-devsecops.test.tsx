import { afterEach, expect, test } from "vitest";
import { cleanup, render, screen, within } from "@testing-library/react";
import { DevSecOpsProject } from "../src/campus/DevSecOpsProject";
import { Explore } from "../src/campus/WorkspacePanel";
import { setLanguage } from "../src/campus/lib/language";
import { devsecopsPhases } from "../src/campus/lib/devsecops-project";
import { fireEvent } from "@testing-library/react";
afterEach(() => {
  cleanup();
  setLanguage("en");
});
test("the capstone is discoverable by tool and topic, with actionable evidence", () => {
  render(<Explore kids={false} />);
  fireEvent.change(screen.getByLabelText("Find a project"), {
    target: { value: "Argo CD" },
  });
  const project = screen.getByRole("region", {
    name: "Take LESSGOOO from code to a cloud lab",
  });
  expect(project.querySelectorAll("details")).toHaveLength(10);
  expect(within(project).getAllByText("Evidence to submit")).toHaveLength(10);
  for (const link of within(project).getAllByRole("link", {
    name: "Commands and explanations",
  })) {
    expect(link.getAttribute("href")).toMatch(/README.md#[a-z-]+$/);
  }
  fireEvent.change(screen.getByLabelText("Find a project"), {
    target: { value: "no-such-project-xyz" },
  });
  expect(
    screen.queryByRole("region", {
      name: "Take LESSGOOO from code to a cloud lab",
    }),
  ).not.toBeInTheDocument();
});
test("French phase content is complete and includes cloud cost boundaries", () => {
  setLanguage("fr");
  render(<DevSecOpsProject />);
  expect(
    screen.getByRole("heading", {
      name: "Du code LESSGOOO au laboratoire cloud",
    }),
  ).toBeInTheDocument();
  expect(
    screen.getByText(/Commencez en local avec des données fictives/),
  ).toBeInTheDocument();
  for (const phase of devsecopsPhases) {
    expect(screen.getByText(phase.title.fr)).toBeInTheDocument();
    expect(screen.getByText(phase.evidence.fr)).toBeInTheDocument();
  }
});
test("Kids discovery does not expose the paid-cloud capstone", () => {
  render(<Explore kids />);
  expect(
    screen.queryByRole("region", {
      name: "Take LESSGOOO from code to a cloud lab",
    }),
  ).not.toBeInTheDocument();
  expect(screen.queryByText(/EKS/)).not.toBeInTheDocument();
});
