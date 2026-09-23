import { beforeEach, test, expect, vi } from "vitest";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import { ServiceDesk } from "../src/campus/StudioPanel";
import { RequestBrief } from "../src/campus/ServiceIntake";
import { serviceQuestions } from "../src/campus/lib/service-intake";
import type { ServiceRequest } from "../src/campus/lib/studio";
import { setLanguage } from "../src/campus/lib/language";
import { post, workspaceRequest } from "../src/campus/lib/workspace-api";
vi.mock("../src/campus/lib/workspace-api", () => ({
  workspaceRequest: vi.fn(),
  post: vi.fn(),
}));
beforeEach(() => {
  sessionStorage.clear();
  localStorage.clear();
  setLanguage("en");
  vi.clearAllMocks();
  vi.mocked(workspaceRequest).mockResolvedValue({
    ready: true,
    requests: [],
    imports: [],
  } as never);
  vi.mocked(post).mockResolvedValue({ id: "test-request-id" } as never);
});
function fillTraining() {
  fireEvent.change(screen.getByLabelText("What name should we use?"), {
    target: { value: "Test Learner" },
  });
  fireEvent.change(screen.getByLabelText("Which email can we reply to?"), {
    target: { value: "learner@example.test" },
  });
  fireEvent.change(screen.getByLabelText("Which country are you based in?"), {
    target: { value: "CM" },
  });
  fireEvent.change(
    screen.getByLabelText("Which language do you prefer for the reply?"),
    { target: { value: "fr" } },
  );
  for (const q of serviceQuestions.training)
    fireEvent.change(screen.getByLabelText(q.label.en), {
      target: { value: `Test response to ${q.id}` },
    });
  fireEvent.change(
    screen.getByLabelText("What result would make this support a success?"),
    { target: { value: "Build and explain my first Docker application" } },
  );
  fireEvent.change(
    screen.getByLabelText("When would you like to get started?"),
    { target: { value: "flexible" } },
  );
  fireEvent.click(screen.getByRole("checkbox"));
}
test("changing service clears only the old service brief and provides associated hints", async () => {
  render(<ServiceDesk persona="adult" />);
  const background = screen.getByLabelText(
    serviceQuestions.training[0].label.en,
  );
  expect(background).toHaveAccessibleDescription(
    serviceQuestions.training[0].hint.en,
  );
  fireEvent.change(background, { target: { value: "Old training answer" } });
  fireEvent.change(screen.getByLabelText("What name should we use?"), {
    target: { value: "Test Learner" },
  });
  fireEvent.change(screen.getByLabelText("Which service do you need?"), {
    target: { value: "interview" },
  });
  expect(
    screen.queryByLabelText(serviceQuestions.training[0].label.en),
  ).not.toBeInTheDocument();
  expect(
    screen.getByLabelText(serviceQuestions.interview[0].label.en),
  ).toHaveValue("");
  expect(screen.getByLabelText("What name should we use?")).toHaveValue(
    "Test Learner",
  );
  fireEvent.change(screen.getByLabelText("Which service do you need?"), {
    target: { value: "training" },
  });
  expect(
    screen.getByLabelText(serviceQuestions.training[0].label.en),
  ).toHaveValue("");
  fireEvent.change(
    screen.getByLabelText("How would you prefer to be contacted?"),
    { target: { value: "phone" } },
  );
  expect(screen.getByLabelText("What phone number can we use?")).toBeRequired();
});
test("submits country and service answers with the chosen reply language and preserves data after error", async () => {
  render(<ServiceDesk persona="adult" />);
  fillTraining();
  vi.mocked(post).mockRejectedValueOnce(new Error("Connection interrupted"));
  fireEvent.click(screen.getByRole("button", { name: "Submit request" }));
  await screen.findByRole("alert");
  expect(screen.getByLabelText("What name should we use?")).toHaveValue(
    "Test Learner",
  );
  fireEvent.click(screen.getByRole("button", { name: "Submit request" }));
  await screen.findByText("Request saved ✓");
  expect(post).toHaveBeenLastCalledWith(
    "/api/studio/request",
    "adult",
    expect.objectContaining({
      country: "CM",
      language: "fr",
      contact: "email",
      consent: true,
      answers: {
        background: "Test response to background",
        skills: "Test response to skills",
        equipment: "Test response to equipment",
        studyTime: "Test response to studyTime",
      },
    }),
  );
});
test("legacy stored requests remain readable without invented location details", () => {
  render(
    <RequestBrief
      request={{ service: "training", language: "en" } as ServiceRequest}
    />,
  );
  expect(
    screen.getByText("Not provided in this earlier request"),
  ).toBeInTheDocument();
});
test("French request labels and country names are available; children cannot use intake", async () => {
  setLanguage("fr");
  const view = render(<ServiceDesk persona="adult" />);
  expect(screen.getByLabelText("Dans quel pays résidez-vous ?")).toBeRequired();
  expect(screen.getByRole("option", { name: "Cameroun" })).toHaveValue("CM");
  view.rerender(<ServiceDesk persona="child" />);
  expect(
    screen.queryByRole("button", { name: "Envoyer la demande" }),
  ).not.toBeInTheDocument();
  await waitFor(() => expect(workspaceRequest).toHaveBeenCalled());
});
