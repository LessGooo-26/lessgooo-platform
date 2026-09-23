import { describe, test, expect } from "vitest";
import { serviceRequestSchema, services } from "../src/campus/lib/studio";
import {
  countries,
  serviceQuestions,
  questionsFor,
} from "../src/campus/lib/service-intake";
const base = {
  name: "Test Learner",
  email: "learner@example.test",
  phone: "",
  message: "Prepare a practical learning plan",
  country: "CM",
  city: "Douala",
  timezone: "Africa/Douala",
  contact: "email",
  timeframe: "flexible",
  language: "fr",
  consent: true,
};
function valid(service: keyof typeof serviceQuestions) {
  return {
    ...base,
    service,
    ...(service === "company" ? { course: "devops" } : {}),
    answers: Object.fromEntries(
      questionsFor(service, service === "company" ? "devops" : "")
        .filter((q) => q.required)
        .map((q) => [q.id, "An explicit test answer"]),
    ),
  };
}
describe("service brief validation", () => {
  test.each(services.map((s) => s.id))(
    "%s accepts its own brief and rejects incomplete or unrelated answers",
    (service) => {
      const input = valid(service);
      expect(serviceRequestSchema.parse(input)).toMatchObject(input);
      const first = serviceQuestions[service].find((q) => q.required)!;
      expect(
        serviceRequestSchema.safeParse({
          ...input,
          answers: { ...input.answers, [first.id]: "   " },
        }).success,
      ).toBe(false);
      expect(
        serviceRequestSchema.safeParse({
          ...input,
          answers: { ...input.answers, unrelated: "Should not be stored" },
        }).success,
      ).toBe(false);
    },
  );
  test("requires a real country, time zone, consent and a phone only for phone replies", () => {
    const input = valid("training");
    for (const patch of [
      { country: "" },
      { country: "XX" },
      { timezone: "MadeUp/Zone" },
      { consent: false },
      { contact: "phone" },
      { answers: {} },
      { timeframe: "guaranteed" },
    ]) {
      expect(
        serviceRequestSchema.safeParse({ ...input, ...patch }).success,
      ).toBe(false);
    }
    expect(
      serviceRequestSchema.safeParse({
        ...input,
        contact: "phone",
        phone: "+237000000000",
      }).success,
    ).toBe(true);
    expect(serviceRequestSchema.parse(input).phone).toBe("");
    expect(countries("fr").find((c) => c.code === "CM")?.name).toBe("Cameroun");
    expect(countries("en").find((c) => c.code === "CM")?.name).toBe("Cameroon");
  });
});

test("company requests require a recognized area and only its specific brief answers", () => {
  for (const course of [
    "devops",
    "cloud",
    "cybersecurity",
    "linux",
    "ai-web",
    "secretariat",
    "ai-infographics",
    "ai-design",
    "ai-automation",
  ]) {
    const input = {
      ...valid("company"),
      course,
      answers: Object.fromEntries(
        questionsFor("company", course).map((q) => [
          q.id,
          "Explicit test answer",
        ]),
      ),
    };
    expect(serviceRequestSchema.parse(input)).toMatchObject(input);
    expect(
      serviceRequestSchema.safeParse({ ...input, course: "" }).success,
    ).toBe(false);
    expect(
      serviceRequestSchema.safeParse({ ...input, course: "invented-course" })
        .success,
    ).toBe(false);
    expect(
      serviceRequestSchema.safeParse({
        ...input,
        answers: {
          organisation: "Test company",
          businessContext: "Test context",
        },
      }).success,
    ).toBe(false);
    const other = course === "linux" ? "ai-design" : "linux";
    expect(
      serviceRequestSchema.safeParse({ ...input, course: other }).success,
    ).toBe(false);
  }
  expect(
    serviceRequestSchema.safeParse({ ...valid("training"), course: "ai-web" })
      .success,
  ).toBe(true);
  expect(
    serviceRequestSchema.safeParse({ ...valid("interview"), course: "ai-web" })
      .success,
  ).toBe(false);
  expect(serviceRequestSchema.parse(valid("training")).course).toBe("");
});
