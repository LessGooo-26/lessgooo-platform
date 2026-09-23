// @vitest-environment node
import { test } from "vitest";
import assert from "node:assert/strict";
import { seedCampus } from "../src/campus/lib/seed";
import { applyAction, filterCampus, safeUrl } from "../src/campus/lib/domain";
import { progress } from "../src/campus/lib/model";
test("parent sees only own child and no adult stages", () => {
  const c = filterCampus(seedCampus(), "parent");
  assert.deepEqual(
    c.students.map((x) => x.id),
    ["maya"],
  );
  assert.equal(c.stages.length, 0);
  assert.ok(c.submissions.every((s) => s.student === "maya"));
  assert.ok(c.payments.every((s) => s.student === "maya"));
  assert.ok(c.sessions.every((s) => s.track === "kids"));
});
test("children cannot see payments or mutate lessons", () => {
  const c = seedCampus();
  assert.equal(filterCampus(c, "child").payments.length, 0);
  assert.throws(
    () =>
      applyAction(c, "child", "lesson", { ...c.lessons[0], title: "attack" }),
    /réservée/,
  );
});
test("submission and correction change mastery only after human review", () => {
  let c = seedCampus();
  const before = progress(c, "alex").done;
  c = applyAction(c, "adult", "submit", {
    lesson: "linux-2",
    text: "Le propriétaire peut lire et écrire.",
    url: "",
  });
  assert.equal(progress(c, "alex").done, before);
  const s = c.submissions[0];
  c = applyAction(c, "teacher", "review", {
    id: s.id,
    status: "validated",
    feedback: "Autonome, appliquer à un dossier.",
    level: "autonome",
  });
  assert.equal(progress(c, "alex").done, before + 1);
  assert.equal(
    filterCampus(c, "adult").submissions[0].feedback,
    "Autonome, appliquer à un dossier.",
  );
});
test("cross-track and duplicate pending submissions are rejected", () => {
  let c = seedCampus();
  assert.throws(
    () =>
      applyAction(c, "child", "submit", {
        lesson: "linux-2",
        text: "test",
        url: "",
      }),
    /parcours/,
  );
  c = applyAction(c, "adult", "submit", {
    lesson: "linux-2",
    text: "test",
    url: "",
  });
  assert.throws(
    () =>
      applyAction(c, "adult", "submit", {
        lesson: "linux-2",
        text: "again",
        url: "",
      }),
    /déjà/,
  );
});
test("booking is exclusive and cancellation returns credit once", () => {
  let c = seedCampus();
  const before = c.students[0].credits;
  c = applyAction(c, "adult", "book", { id: "slot1", goal: "Permissions" });
  assert.equal(c.students[0].credits, before - 1);
  assert.throws(
    () =>
      applyAction(c, "teacher", "book", {
        id: "slot1",
        student: "samira",
        goal: "other",
      }),
    /déjà réservé/,
  );
  assert.throws(
    () => applyAction(c, "adult", "cancel", { id: "slot3" }),
    /inaccessible/,
  );
  c = applyAction(c, "adult", "cancel", { id: "slot1" });
  assert.equal(c.students[0].credits, before);
  assert.throws(
    () => applyAction(c, "adult", "cancel", { id: "slot1" }),
    /inaccessible|ne peut plus/,
  );
});
test("zero credits prevent booking", () => {
  const c = seedCampus();
  c.students[0].credits = 0;
  assert.throws(
    () => applyAction(c, "adult", "book", { id: "slot1", goal: "test" }),
    /crédit/,
  );
});
test("conflicting sessions rejected", () => {
  const c = seedCampus();
  assert.throws(
    () =>
      applyAction(c, "teacher", "session", { ...c.sessions[0], id: undefined }),
    /chevauche/,
  );
});
test("payments cannot duplicate references or refund pending payment", () => {
  let c = seedCampus();
  const payment = {
    student: "alex",
    amount: 10000,
    currency: "USD",
    date: "2026-09-16",
    reference: "TEST-1",
    description: "Test",
    status: "pending",
  };
  c = applyAction(c, "teacher", "payment", payment);
  assert.throws(() => applyAction(c, "teacher", "payment", payment), /déjà/);
  assert.throws(
    () =>
      applyAction(c, "teacher", "paymentStatus", {
        id: c.payments[0].id,
        status: "refunded",
      }),
    /vérifié/,
  );
  c = applyAction(c, "teacher", "paymentStatus", {
    id: c.payments[0].id,
    status: "verified",
  });
  assert.equal(c.payments[0].status, "verified");
});
test("stage acceptance requires mentor and dates; kids rejected", () => {
  const c = seedCampus();
  assert.throws(
    () =>
      applyAction(c, "teacher", "stage", {
        ...c.stages[0],
        status: "accepted",
      }),
    /Tuteur/,
  );
  assert.throws(
    () =>
      applyAction(c, "teacher", "stage", { ...c.stages[0], student: "maya" }),
    /adulte/,
  );
});
test("URL schemes and host Zoom links blocked", () => {
  assert.throws(() => safeUrl("javascript:alert(1)"));
  assert.throws(() => safeUrl("https://evil.test/j/123", true));
  assert.throws(() => safeUrl("https://zoom.us/s/123", true));
  assert.equal(safeUrl("https://zoom.us/j/123", true), "https://zoom.us/j/123");
});
test("DST conversion uses real IANA timezone rules", () => {
  const f = new Intl.DateTimeFormat("fr-FR", {
    timeZone: "America/Toronto",
    hour: "2-digit",
    minute: "2-digit",
  });
  assert.notEqual(
    f.format(new Date("2026-10-31T20:00:00Z")),
    f.format(new Date("2026-11-02T20:00:00Z")),
  );
});
test("parent cannot submit work as the child or alter attendance", () => {
  const c = seedCampus();
  assert.throws(
    () =>
      applyAction(c, "parent", "submit", {
        lesson: "scratch-1",
        text: "test",
        url: "",
      }),
    /vue élève/,
  );
  assert.throws(
    () =>
      applyAction(c, "adult", "attendance", {
        session: "s1",
        student: "alex",
        status: "present",
      }),
    /formateur/,
  );
});
