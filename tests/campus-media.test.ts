// @vitest-environment node
import { afterEach, expect, test } from "vitest";
import { createHash } from "node:crypto";
import { CampusStore } from "../server/store";
import { WorkspaceStore, chunkBytes } from "../server/workspace-store";
import { createCampusServer } from "../server/http";
import type { Persona } from "../src/campus/lib/model";
const open: CampusStore[] = [];
afterEach(() => open.splice(0).forEach((c) => c.close()));
const setup = () => {
  const c = new CampusStore(":memory:");
  open.push(c);
  return new WorkspaceStore(c);
};
const png = Buffer.from(
  "iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mP8/x8AAwMCAO+ip1sAAAAASUVORK5CYII=",
  "base64",
);
const upload = (w: WorkspaceStore, p: Persona, options = {}, bytes = png) => {
  const { id } = w.start(p, {
    name: "photo.png",
    type: "image/png",
    size: bytes.length,
    ...options,
  });
  w.chunk(p, id, 0, bytes);
  w.finish(p, id);
  return id;
};
test("parent profile and image persist without changing roles or other profiles", () => {
  const w = setup(),
    id = upload(w, "parent");
  const original = w.snapshot("child").profile;
  const result = w.action("parent", "profile", {
    name: "Camille Updated",
    email: "test@example.test",
    phone: "",
    bio: "Hello",
    avatar: id,
  });
  expect(result.profile.name).toBe("Camille Updated");
  expect(new WorkspaceStore(w.campus).snapshot("parent").profile.avatar).toBe(
    id,
  );
  expect(w.snapshot("child").profile).toEqual(original);
  expect(w.campus.snapshot("parent").state.students.map((s) => s.id)).toEqual([
    "maya",
  ]);
  expect(() =>
    w.action("child", "profile", { ...original, avatar: id }),
  ).toThrow();
  const fake = upload(w, "parent", {}, Buffer.from("<svg onload='alert(1)'/>"));
  expect(() =>
    w.action("parent", "profile", { ...result.profile, avatar: fake }),
  ).toThrow(/JPG/);
  expect(() =>
    w.start("parent", {
      name: "work.txt",
      type: "text/plain",
      size: 1,
      submission: "s1",
    }),
  ).toThrow(/élève/);
});
test("galleries enforce ownership and keep sharing consistent, including pending uploads", () => {
  const w = setup();
  const g = w.action("teacher", "gallery", {
    name: "Class projects",
    purpose: "Our projects",
    color: "orange",
    shared: false,
  }).galleries[0];
  const photo = upload(w, "teacher", { gallery: g.id });
  expect(w.snapshot("child").galleries).toHaveLength(0);
  expect(() => w.media("child", photo)).toThrow();
  expect(() =>
    w.action("child", "gallery", { ...g, name: "Hijack" }),
  ).toThrow();
  expect(() =>
    w.start("child", {
      name: "x.png",
      type: "image/png",
      size: png.length,
      gallery: g.id,
    }),
  ).toThrow();
  w.action("teacher", "gallery", { ...g, shared: true });
  expect(w.media("child", photo).shared).toBe(1);
  expect(w.snapshot("parent").galleries[0].name).toBe(g.name);
  const pending = w.start("teacher", {
    name: "later.png",
    type: "image/png",
    size: png.length,
    gallery: g.id,
  });
  w.chunk("teacher", pending.id, 0, png);
  w.action("teacher", "gallery", { ...g, shared: false });
  w.finish("teacher", pending.id);
  expect(() => w.media("adult", pending.id)).toThrow();
  expect(() => w.media("child", photo)).toThrow();
  w.action("teacher", "mediaGallery", { id: photo, gallery: "" });
  expect(w.media("teacher", photo).gallery).toBe("");
  expect(Buffer.concat([...w.byteRange(photo, 0, png.length - 1)])).toEqual(
    png,
  );
  const kid = w.action("child", "gallery", {
    name: "My game",
    purpose: "Practice",
    color: "green",
    shared: true,
  }).galleries[0];
  expect(kid.shared).toBe(false);
  expect(w.snapshot("parent").galleries.map((g) => g.id)).toContain(kid.id);
  expect(w.snapshot("adult").galleries).toHaveLength(0);
});
test("incomplete uploads can be cancelled only by their owner and completed files survive", () => {
  const w = setup(),
    f = w.start("adult", {
      name: "unfinished.mp4",
      type: "video/mp4",
      size: 100,
    });
  w.chunk("adult", f.id, 0, new Uint8Array([1, 2]));
  expect(() => w.cancel("child", f.id)).toThrow();
  w.cancel("adult", f.id);
  expect([...w.bytes(f.id)]).toHaveLength(0);
  const done = upload(w, "adult");
  expect(() => w.cancel("adult", done)).toThrow(/Completed/);
});
test("video HTTP transfer preserves bytes, supports seeking and HEAD, and checks role access", async () => {
  const w = setup(),
    port = 19349,
    server = createCampusServer(w.campus, { port });
  await new Promise<void>((resolve) =>
    server.listen(port, "127.0.0.1", resolve),
  );
  const base = `http://127.0.0.1:${port}`,
    headers = {
      "x-campus-persona": "adult",
      "Content-Type": "application/json",
    };
  const bytes = Buffer.alloc(chunkBytes + 233, 42);
  bytes.write("ftypisom", 4);
  try {
    const start = await fetch(base + "/api/media/start", {
      method: "POST",
      headers,
      body: JSON.stringify({
        name: "test movie.mp4",
        type: "video/mp4",
        size: bytes.length,
      }),
    });
    const { id } = await start.json();
    for (let offset = 0; offset < bytes.length; offset += chunkBytes) {
      const r = await fetch(
        `${base}/api/media/chunk?id=${id}&offset=${offset}`,
        {
          method: "PUT",
          headers: { "x-campus-persona": "adult" },
          body: bytes.subarray(offset, offset + chunkBytes),
        },
      );
      expect(r.status).toBe(200);
    }
    expect(
      (
        await fetch(`${base}/api/media/finish?id=${id}`, {
          method: "POST",
          headers,
        })
      ).status,
    ).toBe(200);
    const url = `${base}/api/media?id=${id}&persona=adult`;
    const file = await fetch(url);
    expect(file.headers.get("content-disposition")).toMatch(/^attachment;/);
    const digest = (value: Uint8Array) =>
      createHash("sha256").update(value).digest("hex");
    expect(digest(new Uint8Array(await file.arrayBuffer()))).toBe(
      digest(bytes),
    );
    const head = await fetch(url + "&inline=1", { method: "HEAD" });
    expect(head.status).toBe(200);
    expect(head.headers.get("content-type")).toBe("video/mp4");
    expect(head.headers.get("content-length")).toBe(String(bytes.length));
    expect((await head.arrayBuffer()).byteLength).toBe(0);
    const ranged = await fetch(url + "&inline=1", {
      headers: { Range: `bytes=${chunkBytes - 7}-${chunkBytes + 7}` },
    });
    expect(ranged.status).toBe(206);
    expect(Buffer.from(await ranged.arrayBuffer())).toEqual(
      bytes.subarray(chunkBytes - 7, chunkBytes + 8),
    );
    const suffix = await fetch(url, { headers: { Range: "bytes=-13" } });
    expect(Buffer.from(await suffix.arrayBuffer())).toEqual(
      bytes.subarray(-13),
    );
    for (const range of [
      "bytes=999999999-",
      "bytes=5-3",
      "bytes=-0",
      "bytes=0-1,4-5",
    ]) {
      const bad = await fetch(url, { headers: { Range: range } });
      expect(bad.status).toBe(416);
      expect(bad.headers.get("content-range")).toBe(`bytes */${bytes.length}`);
      await bad.arrayBuffer();
    }
    expect(
      (
        await fetch(url.replace("persona=adult", "persona=child"), {
          headers: { Range: "bytes=0-10" },
        })
      ).status,
    ).toBe(404);
    expect(
      (await fetch(url, { headers: { "x-campus-persona": "child" } })).status,
    ).toBe(403);
    const svg = upload(
      w,
      "adult",
      { name: "unsafe.svg", type: "image/png" },
      Buffer.from("<svg onload='alert(1)'/>"),
    );
    const inert = await fetch(
      `${base}/api/media?id=${svg}&persona=adult&inline=1`,
    );
    expect(inert.headers.get("content-type")).toBe("application/octet-stream");
    expect(inert.headers.get("content-disposition")).toMatch(/^attachment/);
    await inert.arrayBuffer();
  } finally {
    server.closeAllConnections();
    await new Promise<void>((resolve) => server.close(() => resolve()));
  }
}, 30000);

test("photo labels and dates persist without replacing the original file or upload date", () => {
  const w = setup(),
    id = upload(w, "child");
  const original = w.media("child", id);
  w.action("child", "photoDetails", {
    id,
    label: "My first drawing",
    photoDate: "2024-02-29",
  });
  const saved = new WorkspaceStore(w.campus).media("child", id);
  expect(saved).toMatchObject({
    label: "My first drawing",
    photoDate: "2024-02-29",
    created: original.created,
    name: original.name,
  });
  expect(Buffer.concat([...w.byteRange(id, 0, png.length - 1)])).toEqual(png);
  for (const persona of ["adult", "parent", "teacher"] as const)
    expect(() =>
      w.action(persona, "photoDetails", {
        id,
        label: "Changed",
        photoDate: "",
      }),
    ).toThrow();
  for (const photoDate of [
    "2025-02-29",
    "2026-04-31",
    "not-a-date",
    "2026-01-01T00:00:00Z",
  ])
    expect(() =>
      w.action("child", "photoDetails", { id, label: "Test", photoDate }),
    ).toThrow(/valid photo date/);
  expect(() =>
    w.action("child", "photoDetails", {
      id,
      label: "x".repeat(161),
      photoDate: "",
    }),
  ).toThrow();
  w.action("child", "photoDetails", { id, label: "", photoDate: "" });
  expect(w.media("child", id)).toMatchObject({ label: "", photoDate: "" });
});

test("gallery backgrounds require an owned completed photo in the same gallery and clear on move", () => {
  const w = setup();
  const g = w.action("child", "gallery", {
    name: "My projects",
    purpose: "",
    color: "blue",
  }).galleries[0];
  const id = upload(w, "child", { gallery: g.id });
  const other = upload(w, "child");
  const pending = w.start("child", {
    name: "later.png",
    type: "image/png",
    size: png.length,
    gallery: g.id,
  });
  for (const cover of [other, pending.id])
    expect(() => w.action("child", "gallery", { ...g, cover })).toThrow();
  expect(() => w.action("parent", "gallery", { ...g, cover: id })).toThrow();
  w.action("child", "gallery", { ...g, cover: id });
  expect(w.snapshot("parent").galleries[0].cover).toBe(id);
  w.action("child", "gallery", { ...g, name: "Renamed", cover: undefined });
  expect(w.snapshot("child").galleries[0].cover).toBe(id);
  w.action("child", "mediaGallery", { id, gallery: "" });
  expect(w.snapshot("child").galleries[0].cover).toBe("");
  expect(w.media("child", id).complete).toBe(1);
});

test("personal backgrounds preserve profile details, isolate personas, reset and respect revoked access", () => {
  const w = setup();
  const g = w.action("teacher", "gallery", {
    name: "Shared photos",
    purpose: "",
    color: "green",
    shared: true,
  }).galleries[0];
  const id = upload(w, "teacher", { gallery: g.id });
  const privateId = upload(w, "teacher");
  expect(() => w.action("adult", "background", { id: privateId })).toThrow();
  expect(() =>
    w.action("adult", "background", {
      id: upload(w, "adult", {}, Buffer.from("text file")),
    }),
  ).toThrow();
  const pending = w.start("adult", {
    name: "later.png",
    type: "image/png",
    size: png.length,
  });
  expect(() => w.action("adult", "background", { id: pending.id })).toThrow();
  w.action("adult", "background", { id });
  expect(w.snapshot("adult").profile.background).toBe(id);
  expect(w.snapshot("child").profile.background).toBeFalsy();
  w.action("adult", "profile", {
    ...w.snapshot("adult").profile,
    name: "My name",
    background: privateId,
  });
  expect(new WorkspaceStore(w.campus).snapshot("adult").profile).toMatchObject({
    name: "My name",
    background: id,
  });
  w.action("teacher", "gallery", { ...g, shared: false });
  expect(w.snapshot("adult").profile.background).toBe("");
  expect(() => w.media("adult", id)).toThrow();
  w.action("adult", "background", { id: "" });
  expect(w.snapshot("adult").profile).toMatchObject({
    name: "My name",
    background: "",
  });
});
