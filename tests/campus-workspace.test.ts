// @vitest-environment node
import { afterEach, expect, test } from "vitest";
import { mkdtempSync, rmSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { backup } from "node:sqlite";
import { CampusStore } from "../server/store";
import {
  WorkspaceStore,
  chunkBytes,
  maxUploadBytes,
} from "../server/workspace-store";
import { Integrations } from "../server/integrations";
import { createCampusServer } from "../server/http";
import { curriculum } from "../src/campus/lib/curriculum";
import { ownerEmail, noteMarkdown } from "../src/campus/lib/workspace";

const open: CampusStore[] = [];
const dirs: string[] = [];
const setup = () => {
  const c = new CampusStore(":memory:");
  open.push(c);
  return new WorkspaceStore(c);
};
afterEach(() => {
  open.splice(0).forEach((c) => c.close());
  dirs.splice(0).forEach((d) => rmSync(d, { recursive: true, force: true }));
});
const note = {
  title: "Un projet",
  icon: "🚀",
  revision: 0,
  blocks: [
    { id: "one", type: "todo", text: "Tester la sauvegarde", checked: true },
  ],
};
const interest = {
  name: "Test Adulte",
  email: "test@example.test",
  service: "both",
  goal: "Préparer mes entretiens techniques",
  consent: true,
};

test("notes are private per persona, preserved and reject stale updates", () => {
  const w = setup();
  let result = w.action("adult", "note", note);
  const n = result.notes[0];
  expect(n.revision).toBe(1);
  expect(w.snapshot("teacher").notes).toHaveLength(0);
  expect(w.snapshot("parent").notes).toHaveLength(0);
  expect(() => w.action("child", "note", { ...n, title: "Overwrite" })).toThrow(
    /introuvable/,
  );
  result = w.action("adult", "note", { ...n, title: "Nouveau titre" });
  expect(result.notes[0].revision).toBe(2);
  expect(() => w.action("adult", "note", n)).toThrow(/changé/);
  expect(noteMarkdown(result.notes[0])).toContain("- [x] Tester la sauvegarde");
});
test("career interests require consent and adult access; teacher can track them", () => {
  const w = setup();
  expect(() => w.action("child", "career", interest)).toThrow(/adultes/);
  expect(() => w.action("parent", "career", interest)).toThrow(/adultes/);
  expect(() =>
    w.action("adult", "career", { ...interest, consent: false }),
  ).toThrow();
  const result = w.action("adult", "career", interest);
  expect(result.interests).toHaveLength(1);
  expect(w.snapshot("child").interests).toHaveLength(0);
  expect(w.snapshot("teacher").interests).toHaveLength(1);
  expect(() => w.action("adult", "career", interest)).toThrow(/existe/);
  const id = result.interests[0].id;
  expect(() =>
    w.action("adult", "careerStatus", { id, status: "closed" }),
  ).toThrow(/formateur/);
  w.action("teacher", "careerStatus", { id, status: "contacted" });
  expect(w.snapshot("adult").interests[0].status).toBe("contacted");
});
test("job applications cannot cross owners or execute URL schemes", () => {
  const w = setup(),
    app = {
      company: "Fictive",
      role: "DevOps",
      url: "https://example.test/job",
      status: "saved",
      nextStep: "Adapter le CV",
      date: "2026-09-17",
    };
  expect(() =>
    w.action("adult", "application", { ...app, url: "javascript:alert(1)" }),
  ).toThrow(/HTTPS/);
  const created = w.action("adult", "application", app).applications[0];
  expect(() =>
    w.action("teacher", "application", { ...created, status: "offer" }),
  ).toThrow(/introuvable/);
  expect(w.snapshot("teacher").applications).toHaveLength(0);
});
test("arbitrary formats upload in bounded ordered chunks and obey visibility", () => {
  const w = setup(),
    size = chunkBytes + 5;
  const { id } = w.start("adult", {
    name: "test.html",
    type: "text/html",
    size,
  });
  expect(() => w.chunk("child", id, 0, new Uint8Array([1]))).toThrow(
    /inaccessible/,
  );
  expect(() => w.finish("adult", id)).toThrow(/incomplet/);
  expect(() => w.chunk("adult", id, 0, new Uint8Array(chunkBytes + 1))).toThrow(
    /invalide/,
  );
  w.chunk("adult", id, 0, new Uint8Array(chunkBytes).fill(42));
  expect(() => w.chunk("adult", id, 0, new Uint8Array([1]))).toThrow(
    /Position/,
  );
  w.chunk("adult", id, chunkBytes, new Uint8Array(5).fill(7));
  w.finish("adult", id);
  expect(w.media("teacher", id).name).toBe("test.html");
  expect(() => w.media("parent", id)).toThrow(/inaccessible/);
  expect(
    [...w.bytes(id)].reduce((n, r) => n + (r.bytes as Uint8Array).length, 0),
  ).toBe(size);
  expect(() =>
    w.start("adult", { name: "too-big", type: "", size: maxUploadBytes + 1 }),
  ).toThrow();
  const shared = w.start("teacher", {
    name: "video.mp4",
    type: "video/mp4",
    size: 1,
    shared: true,
  });
  w.chunk("teacher", shared.id, 0, new Uint8Array([3]));
  w.finish("teacher", shared.id);
  expect(w.media("child", shared.id).shared).toBe(1);
  expect(w.snapshot("child").media).toHaveLength(1);
});
test("homework upload cannot bypass review; completed attachment queues Drive", () => {
  const w = setup();
  const s = w.campus.mutate("adult", 1, "submit", {
    lesson: "dev-compose",
    text: "Mon travail de test",
    url: "",
  }).state.submissions[0];
  const { id } = w.start("adult", {
    name: "exercise.tar.gz",
    type: "application/gzip",
    size: 3,
    submission: s.id,
  });
  w.chunk("adult", id, 0, new Uint8Array([1, 2, 3]));
  w.finish("adult", id);
  expect(w.campus.read().state.submissions[0].file?.id).toBe(id);
  expect(w.jobs()[0].status).toBe("pending");
  const other = w.start("adult", {
    name: "other.txt",
    type: "text/plain",
    size: 1,
    submission: s.id,
  });
  w.chunk("adult", other.id, 0, new Uint8Array([0]));
  w.campus.mutate("teacher", w.campus.read().version, "review", {
    id: s.id,
    status: "validated",
    feedback: "Correct",
    level: "autonome",
  });
  expect(() => w.finish("adult", other.id)).toThrow(/corrigé/);
  expect(w.campus.read().state.submissions[0].file?.id).toBe(id);
});
test("SQLite backup includes notebooks, interests and chunked binary files", async () => {
  const w = setup(),
    dir = mkdtempSync(join(tmpdir(), "lessgooo-workspace-"));
  dirs.push(dir);
  w.action("adult", "note", note);
  w.action("adult", "career", interest);
  const f = w.start("child", { name: "creation.sb3", type: "", size: 2 });
  w.chunk("child", f.id, 0, new Uint8Array([8, 9]));
  w.finish("child", f.id);
  const file = join(dir, "backup.sqlite");
  await backup(w.db, file);
  const c = new CampusStore(file);
  open.push(c);
  const restored = new WorkspaceStore(c);
  expect(restored.snapshot("adult").notes).toHaveLength(1);
  expect(restored.snapshot("teacher").interests).toHaveLength(1);
  expect(Array.from([...restored.bytes(f.id)][0].bytes as Uint8Array)).toEqual([
    8, 9,
  ]);
});
test("curriculum covers hardware to cloud with substantive exercises and stable identifiers", () => {
  expect(new Set(curriculum.map((l) => l.id)).size).toBe(curriculum.length);
  expect(curriculum.filter((l) => l.track === "devops").length).toBeGreaterThan(
    30,
  );
  expect(curriculum.find((l) => l.id === "kids-hardware")?.module).toMatch(
    /^00/,
  );
  expect(curriculum.some((l) => l.id === "kids-aws")).toBe(true);
  for (const l of curriculum) {
    expect(l.explanation.length).toBeGreaterThan(150);
    expect(l.task.length).toBeGreaterThan(60);
    expect(l.criteria.length).toBeGreaterThan(25);
    expect(new URL(l.resource).protocol).toBe("https:");
  }
});
test("curriculum migration preserves existing edits and homework", () => {
  const dir = mkdtempSync(join(tmpdir(), "lessgooo-migrate-"));
  dirs.push(dir);
  const path = join(dir, "db.sqlite");
  let c = new CampusStore(path);
  const original = c.read();
  original.state.lessons = original.state.lessons.filter(
    (l) => !l.id.startsWith("dev-") && !l.id.startsWith("kids-"),
  );
  original.state.lessons[0].title = "Leçon personnalisée";
  c.save(original.state, original.version);
  c.close();
  c = new CampusStore(path);
  open.push(c);
  expect(
    c.read().state.lessons.some((l) => l.title === "Leçon personnalisée"),
  ).toBe(true);
  expect(c.read().state.submissions).toEqual(original.state.submissions);
  expect(c.read().state.lessons.some((l) => l.id === "kids-hardware")).toBe(
    true,
  );
});
test("integration status never pretends a connection without credentials", async () => {
  const w = setup(),
    i = new Integrations(w, "http://127.0.0.1:4173", {});
  expect(i.status().email).toBe(ownerEmail);
  expect(i.status().drive.connected).toBe(false);
  expect(i.status().payment.configured).toBe(false);
  expect(() => i.googleStart()).toThrow(/CLIENT_ID/);
  await expect(i.sync()).rejects.toThrow(/Connectez/);
  await expect(i.checkout({})).rejects.toThrow(/clé/);
});
test("integration settings are encrypted, usable immediately and never returned", () => {
  const w = setup(),
    dir = mkdtempSync(join(tmpdir(), "lessgooo-config-"));
  dirs.push(dir);
  const i = new Integrations(w, "http://127.0.0.1:4173", {
    CAMPUS_DATA_DIR: dir,
  });
  const result = i.configure({
    googleClientId: "fake-client",
    googleClientSecret: "fake-google-secret",
    notchKey: "fake-payment-key",
    notchMode: "test",
  });
  expect(result.drive.configured).toBe(true);
  expect(result.drive.connected).toBe(false);
  expect(result.payment.configured).toBe(true);
  expect(JSON.stringify(result)).not.toMatch(
    /fake-client|fake-google-secret|fake-payment-key/,
  );
  expect(w.config("credential:NOTCHPAY_PUBLIC_KEY")).not.toContain(
    "fake-payment-key",
  );
  expect(new URL(i.googleStart().url).searchParams.get("client_id")).toBe(
    "fake-client",
  );
  expect(() => i.configure({ unexpected: "value" })).toThrow(/invalide/);
});
test("OAuth verifies anti-CSRF state and rejects a different Google account", async () => {
  const w = setup(),
    env = { GOOGLE_CLIENT_ID: "test-id", GOOGLE_CLIENT_SECRET: "test-secret" };
  let calls = 0;
  const fake: typeof fetch = async () => {
    calls++;
    return Response.json(
      calls === 1
        ? { access_token: "access-test", refresh_token: "refresh-test" }
        : { email: "other@example.test", email_verified: true },
    );
  };
  const i = new Integrations(w, "http://127.0.0.1:4173", env, fake),
    a = i.googleStart();
  await expect(i.googleFinish(a.state, "fake", "wrong-cookie")).rejects.toThrow(
    /OAuth/,
  );
  expect(calls).toBe(0);
  const b = i.googleStart();
  await expect(i.googleFinish(b.state, "fake", b.state)).rejects.toThrow(
    ownerEmail,
  );
  expect(w.config("google-refresh")).toBe("");
  expect(new URL(b.url).searchParams.get("scope")).toContain("drive.file");
});
test("Drive sync uploads content, confirms success and updates the same remote file on retry", async () => {
  const w = setup(),
    dir = mkdtempSync(join(tmpdir(), "lessgooo-oauth-"));
  dirs.push(dir);
  const methods: string[] = [];
  const fake: typeof fetch = async (input, init) => {
    const url = String(input);
    methods.push(`${init?.method || "GET"} ${url}`);
    if (url.includes("oauth2.googleapis.com/token"))
      return Response.json({
        access_token: "access-test",
        refresh_token: "refresh-test",
      });
    if (url.includes("userinfo"))
      return Response.json({ email: ownerEmail, email_verified: true });
    if (url.includes("uploadType=resumable"))
      return new Response(null, {
        status: 200,
        headers: { location: "https://www.googleapis.com/upload/session-test" },
      });
    if (url.endsWith("/upload/session-test"))
      return Response.json({
        id: "drive-file-1",
        webViewLink: "https://drive.google.com/file/d/drive-file-1/view",
      });
    if (init?.method === "POST") return Response.json({ id: "folder-1" });
    return Response.json({ files: [] });
  };
  const i = new Integrations(
      w,
      "http://127.0.0.1:4173",
      {
        GOOGLE_CLIENT_ID: "id",
        GOOGLE_CLIENT_SECRET: "secret",
        CAMPUS_DATA_DIR: dir,
      },
      fake,
    ),
    start = i.googleStart();
  await i.googleFinish(start.state, "code", start.state);
  expect(w.config("google-refresh")).not.toContain("refresh-test");
  const sub = w.campus.mutate("adult", 1, "submit", {
    lesson: "dev-compose",
    text: "A private test assignment",
    url: "",
  }).state.submissions[0];
  w.queue(sub.id, "Test");
  await i.sync();
  expect(w.jobs()[0].status).toBe("synced");
  expect(w.jobs()[0].url).toContain("drive-file-1");
  w.queue(sub.id, "Updated");
  await i.sync();
  expect(
    methods.filter((s) => s.startsWith("POST") && s.includes("uploadType")),
  ).toHaveLength(1);
  expect(
    methods.some((s) => s.startsWith("PATCH") && s.includes("drive-file-1")),
  ).toBe(true);
  expect(JSON.stringify(i.status())).not.toMatch(
    /access-test|refresh-test|test-secret/,
  );
});
test("Notch Pay validates amount, reference and provider identity before confirming payment", async () => {
  const w = setup();
  let reference = "",
    amount = 5000;
  const fake: typeof fetch = async (_url, init) => {
    if (init?.method === "POST")
      reference = JSON.parse(String(init.body)).reference;
    return Response.json({
      transaction: {
        id: "provider-1",
        reference,
        amount,
        currency: "XAF",
        status: init?.method === "POST" ? "pending" : "complete",
      },
      authorization_url: "https://pay.notchpay.co/provider-1",
    });
  };
  const i = new Integrations(
    w,
    "http://127.0.0.1:4173",
    { NOTCHPAY_PUBLIC_KEY: "test-key", NOTCHPAY_MODE: "test" },
    fake,
  );
  const created = await i.checkout({
    amount: 5000,
    currency: "XAF",
    email: "client@example.test",
    description: "Test convenu",
  });
  expect(i.checkouts()[0].status).toBe("pending");
  amount = 5;
  await expect(i.verify(created.reference)).rejects.toThrow(/correspond/);
  expect(i.checkouts()[0].status).toBe("pending");
  amount = 5000;
  expect((await i.verify(created.reference)).status).toBe("complete");
  expect((await i.verify(created.reference)).status).toBe("complete");
  await expect(i.verify("unknown")).rejects.toThrow(/inconnue/);
});
test("external checkout URLs cannot redirect a user to another host", async () => {
  const w = setup();
  const fake: typeof fetch = async (_url, init) => {
    const d = JSON.parse(String(init?.body));
    return Response.json({
      transaction: {
        id: "provider",
        reference: d.reference,
        amount: d.amount,
        currency: d.currency,
        status: "pending",
      },
      authorization_url: "https://evil.example/pay",
    });
  };
  const i = new Integrations(
    w,
    "http://127.0.0.1:4173",
    { NOTCHPAY_PUBLIC_KEY: "fake", NOTCHPAY_MODE: "test" },
    fake,
  );
  await expect(
    i.checkout({
      amount: 10,
      currency: "XAF",
      email: "client@example.test",
      description: "test",
    }),
  ).rejects.toThrow(/autorisée/);
});
test("HTTP serves arbitrary file types only as downloads and blocks student integration access", async () => {
  const c = new CampusStore(":memory:");
  open.push(c);
  const port = 19347,
    server = createCampusServer(c, { port });
  await new Promise<void>((resolve) =>
    server.listen(port, "127.0.0.1", resolve),
  );
  try {
    const headers = {
        "x-campus-persona": "adult",
        "Content-Type": "application/json",
      },
      base = `http://127.0.0.1:${port}`;
    const denied = await fetch(base + "/api/integrations", { headers });
    expect(denied.status).toBe(403);
    const start = await fetch(base + "/api/media/start", {
      method: "POST",
      headers,
      body: JSON.stringify({
        name: "script.svg",
        type: "image/svg+xml",
        size: 4,
      }),
    });
    const { id } = await start.json();
    expect(start.status).toBe(200);
    await fetch(base + `/api/media/chunk?id=${id}&offset=0`, {
      method: "PUT",
      headers: { "x-campus-persona": "adult" },
      body: "test",
    });
    await fetch(base + `/api/media/finish?id=${id}`, {
      method: "POST",
      headers,
    });
    const r = await fetch(base + `/api/media?id=${id}`, { headers });
    expect(r.headers.get("content-type")).toBe("application/octet-stream");
    expect(r.headers.get("content-disposition")).toMatch(/^attachment;/);
    expect(r.headers.get("x-content-type-options")).toBe("nosniff");
    expect(await r.text()).toBe("test");
  } finally {
    await new Promise<void>((resolve) => server.close(() => resolve()));
  }
});
