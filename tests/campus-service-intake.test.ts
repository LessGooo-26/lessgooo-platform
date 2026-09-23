import { describe, test, expect } from "vitest";
import { serviceRequestSchema, services } from "../src/campus/lib/studio";
import { countries, serviceQuestions } from "../src/campus/lib/service-intake";
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
    answers: Object.fromEntries(
      serviceQuestions[service]
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
