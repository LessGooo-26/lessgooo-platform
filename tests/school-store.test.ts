// @vitest-environment node
import { afterEach, expect, test } from "vitest";
import { randomUUID } from "node:crypto";
import { request } from "node:http";
import { SchoolStore } from "../server/school-store";
import { CampusStore } from "../server/store";
import { WorkspaceStore } from "../server/workspace-store";
import { createCampusServer } from "../server/http";
import { previewType } from "../server/media-stream";
const open: CampusStore[] = [];
afterEach(() => open.splice(0).forEach((s) => s.close()));
const setup = (now?: () => number) => {
  const campus = new CampusStore(":memory:");
  open.push(campus);
  const workspace = new WorkspaceStore(campus);
  return { school: new SchoolStore(campus, now), campus, workspace };
};

test("owner demo updates are persistent, reject stale versions and preserve existing campus data", () => {
  const { school, campus } = setup();
  const before = campus.read();
  const first = school.read();
  first.catalog.registration = 2500;
  const next = school.save("teacher", first);
  expect(next.version).toBe(first.version + 1);
  expect(new SchoolStore(campus).read().catalog.registration).toBe(2500);
  expect(() => school.save("teacher", first)).toThrow("SCHOOL_CONFLICT");
  for (const role of ["adult", "child", "parent"] as const)
    expect(() => school.save(role, next)).toThrow("SCHOOL_FORBIDDEN");
  expect(campus.read()).toEqual(before);
});
test("private and incomplete media cannot be published through the catalogue", () => {
  const { school, workspace } = setup();
  const bytes = Buffer.from("an authorised original worksheet");
  const file = workspace.start("teacher", {
    name: "worksheet.txt",
    type: "text/plain",
    size: bytes.length,
    shared: false,
  });
  workspace.chunk("teacher", file.id, 0, bytes);
  workspace.finish("teacher", file.id);
  const first = school.read();
  first.catalog.resources[0] = {
    ...first.catalog.resources[0],
    url: "",
    mediaId: file.id,
  };
  expect(() => school.save("teacher", first)).toThrow("SCHOOL_MEDIA");
  const shared = workspace.start("teacher", {
    name: "worksheet.txt",
    type: "text/plain",
    size: bytes.length,
    shared: true,
  });
  first.catalog.resources[0].mediaId = shared.id;
  expect(() => school.save("teacher", first)).toThrow("SCHOOL_MEDIA");
  workspace.chunk("teacher", shared.id, 0, bytes);
  workspace.finish("teacher", shared.id);
  school.save("teacher", first);
  expect(
    school.catalog(false, true).catalog.resources.some((r) => r.mediaId),
  ).toBe(false);
  expect(
    school.catalog().catalog.resources.some((r) => r.mediaId === shared.id),
  ).toBe(true);
});
test("unpublished and archived material stays out of learner and public catalogues", () => {
  const { school } = setup();
  const first = school.read();
  first.catalog.chapters[0].published = false;
  first.catalog.resources[0].published = false;
  first.catalog.subjects.find((s) => s.id === "english")!.active = false;
  school.save("teacher", first);
  const published = school.catalog().catalog;
  expect(
    published.chapters.some(
      (c) => c.id === first.catalog.chapters[0].id || c.subjectId === "english",
    ),
  ).toBe(false);
  expect(
    published.resources.some((r) => r.id === first.catalog.resources[0].id),
  ).toBe(false);
  expect(school.catalog(true).catalog.chapters).toHaveLength(
    first.catalog.chapters.length,
  );
});
test("attempts are scored on the server, private to each learner and read-only for the linked demo parent", () => {
  const { school, campus } = setup();
  const chapter = school.read().catalog.chapters[0];
  const d = {
    version: school.read().version,
    chapterId: chapter.id,
    answers: Object.fromEntries(chapter.questions.map((q) => [q.id, q.answer])),
  };
  expect(() => school.attempt("child", { ...d, correct: 999 })).toThrow(
    "SCHOOL_INVALID",
  );
  const result = school.attempt("child", d);
  expect(result.attempt.correct).toBe(chapter.questions.length);
  expect(school.progress("parent").attempts).toEqual(
    school.progress("child").attempts,
  );
  expect(school.progress("adult").attempts).toEqual([]);
  expect(() => school.attempt("parent", d)).toThrow("SCHOOL_READ_ONLY");
  const changed = school.read();
  changed.catalog.chapters[0].questions[0].answer = 0;
  school.save("teacher", changed);
  expect(() => school.attempt("child", d)).toThrow("SCHOOL_LESSON_CHANGED");
  expect(new SchoolStore(campus).progress("child").attempts).toHaveLength(1);
  expect(
    school.report("teacher").find((s) => s.id === "maya")?.attempts,
  ).toHaveLength(1);
  expect(() => school.report("adult")).toThrow("SCHOOL_FORBIDDEN");
});
test("profiles validate class and marks and cannot be edited from the parent view", () => {
  const { school } = setup();
  const profile = {
    classId: "fr-3e",
    grades: [{ subjectId: "math", score: 15, maximum: 20 }],
    interests: ["science"],
  };
  school.profile("child", profile);
  expect(school.progress("parent").profile).toEqual(profile);
  expect(school.progress("adult").profile).toBeNull();
  expect(() => school.profile("parent", profile)).toThrow("SCHOOL_READ_ONLY");
  expect(() =>
    school.profile("adult", { ...profile, classId: "missing" }),
  ).toThrow("SCHOOL_INVALID");
});
test("presence is voluntary, deduplicates tabs, expires and never exposes the roster to learners", () => {
  let now = 100000;
  const { school, campus } = setup(() => now);
  const session = { token: randomUUID(), classId: "fr-3e", active: true };
  expect(school.presence("teacher").count).toBe(0);
  expect(school.presence("child", session).roster).toEqual([]);
  school.presence("child", { ...session, token: randomUUID() });
  expect(school.presence("teacher").count).toBe(1);
  expect(
    school.presence("teacher").roster.find((s) => s.id === "maya")?.online,
  ).toBe(true);
  expect(() => school.presence("adult", session)).toThrow("SCHOOL_FORBIDDEN");
  expect(() =>
    school.presence("parent", { ...session, token: randomUUID() }),
  ).toThrow("SCHOOL_READ_ONLY");
  expect(new SchoolStore(campus).presence("teacher").count).toBe(0);
  now += 90001;
  expect(school.presence("teacher").count).toBe(0);
  school.presence("adult", session);
  school.presence("adult", { ...session, active: false });
  expect(school.presence("teacher").count).toBe(0);
});
test("safe audio signatures are recognised without trusting the uploaded filename", () => {
  expect(previewType(Buffer.from("RIFF0000WAVEdata"))).toBe("audio/wav");
  expect(previewType(Buffer.from([73, 68, 51, 4, 0, 0, 0, 0, 0, 0, 0]))).toBe(
    "audio/mpeg",
  );
  expect(previewType(Buffer.from("fLaCmetadata"))).toBe("audio/flac");
  expect(previewType(Buffer.from("<script>alert(1)</script>"))).toBe("");
});
test("school HTTP requires an explicit persona for private routes and validates origins and methods", async () => {
  const { campus } = setup();
  const server = createCampusServer(campus, { port: 4174 });
  await new Promise<void>((resolve) => server.listen(0, "127.0.0.1", resolve));
  const port = (server.address() as { port: number }).port;
  const call = (
    path: string,
    method = "GET",
    headers: Record<string, string> = {},
    body?: unknown,
  ) =>
    new Promise<{ status: number; data: Record<string, unknown> }>(
      (resolve, reject) => {
        const req = request(
          `http://127.0.0.1:${port}/api/school/${path}`,
          { method, headers: { host: "127.0.0.1:4174", ...headers } },
          (res) => {
            let text = "";
            res.on("data", (chunk) => {
              text += chunk;
            });
            res.on("end", () =>
              resolve({ status: res.statusCode!, data: JSON.parse(text) }),
            );
          },
        );
        req.on("error", reject);
        req.end(body === undefined ? undefined : JSON.stringify(body));
      },
    );
  try {
    expect((await call("catalog")).status).toBe(200);
    for (const route of ["progress", "presence", "report"])
      expect((await call(route)).status).toBe(403);
    expect(
      (
        await call(
          "catalog",
          "POST",
          { "Content-Type": "application/json" },
          {},
        )
      ).status,
    ).toBe(403);
    expect(
      (await call("catalog", "GET", { origin: "https://untrusted.example" }))
        .status,
    ).toBe(403);
    expect(
      (await call("catalog", "DELETE", { "x-campus-persona": "teacher" }))
        .status,
    ).toBe(405);
    expect(
      (await call("catalog", "GET", { "x-campus-persona": "invented" })).status,
    ).toBe(400);
    expect(
      (await call("report", "GET", { "x-campus-persona": "child" })).status,
    ).toBe(403);
    expect(
      (
        await call(
          "profile",
          "POST",
          { "x-campus-persona": "child", "Content-Type": "application/json" },
          { classId: "fr-3e", grades: [], interests: [] },
        )
      ).status,
    ).toBe(200);
  } finally {
    await new Promise<void>((resolve, reject) =>
      server.close((e) => (e ? reject(e) : resolve())),
    );
  }
});
