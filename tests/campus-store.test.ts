// @vitest-environment node
import { test, expect } from "vitest";
import { request } from "node:http";
import { mkdtempSync, rmSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { backup } from "node:sqlite";
import { CampusStore } from "../server/store";
import { createCampusServer } from "../server/http";

test("SQLite survives reopening and refuses stale writes without losing work", () => {
  const dir = mkdtempSync(join(tmpdir(), "lessgooo-test-"));
  let store = new CampusStore(join(dir, "campus.sqlite"));
  try {
    const first = store.snapshot("adult");
    const changed = store.mutate("adult", first.version, "submit", {
      lesson: "linux-2",
      text: "My local work",
      url: "",
    });
    expect(() =>
      store.mutate("adult", first.version, "help", { question: "Stale" }),
    ).toThrow(/changé/);
    store.close();
    store = new CampusStore(join(dir, "campus.sqlite"));
    expect(store.snapshot("adult").version).toBe(changed.version);
    expect(store.snapshot("adult").state.submissions[0].text).toBe(
      "My local work",
    );
  } finally {
    store.close();
    rmSync(dir, { recursive: true, force: true });
  }
});

test("files are restricted by view, replaced atomically and included in backups", async () => {
  const dir = mkdtempSync(join(tmpdir(), "lessgooo-test-"));
  const store = new CampusStore(join(dir, "campus.sqlite"));
  try {
    const sent = store.mutate("adult", 1, "submit", {
      lesson: "linux-2",
      text: "A test attachment",
      url: "",
    });
    const sub = sent.state.submissions[0];
    expect(() =>
      store.attach(
        "parent",
        sub.id,
        "proof.txt",
        new Uint8Array([1]),
        sent.version,
      ),
    ).toThrow(/élève/);
    expect(() =>
      store.attach(
        "adult",
        sub.id,
        "proof.html",
        new Uint8Array([1]),
        sent.version,
      ),
    ).toThrow(/Formats/);
    expect(() =>
      store.attach(
        "adult",
        sub.id,
        "proof.txt",
        new Uint8Array(5 * 1024 * 1024 + 1),
        sent.version,
      ),
    ).toThrow(/5 Mo/);
    const attached = store.attach(
      "adult",
      sub.id,
      "proof.txt",
      new TextEncoder().encode("proof"),
      sent.version,
    );
    const id = attached.state.submissions[0].file!.id;
    expect(() => store.file("parent", id)).toThrow(/introuvable/);
    expect(new TextDecoder().decode(store.file("teacher", id).bytes)).toBe(
      "proof",
    );
    await backup(store.db, join(dir, "backup.sqlite"));
    const restored = new CampusStore(join(dir, "backup.sqlite"));
    try {
      expect(new TextDecoder().decode(restored.file("adult", id).bytes)).toBe(
        "proof",
      );
    } finally {
      restored.close();
    }
    const newer = store.attach(
      "adult",
      sub.id,
      "new.txt",
      new TextEncoder().encode("new"),
      attached.version,
    );
    expect(() => store.file("adult", id)).toThrow(/introuvable/);
    expect(() =>
      store.attach(
        "adult",
        sub.id,
        "stale.txt",
        new Uint8Array([1]),
        attached.version,
      ),
    ).toThrow(/changé/);
    store.mutate("teacher", newer.version, "reset", {
      confirm: "REINITIALISER",
    });
    expect(
      store.db.prepare("SELECT COUNT(*) AS count FROM files").get()!.count,
    ).toBe(0);
  } finally {
    store.close();
    rmSync(dir, { recursive: true, force: true });
  }
});

test("HTTP blocks foreign origins and enforces methods, versions and view restrictions", async () => {
  const store = new CampusStore(":memory:");
  // Bind an ephemeral loopback port, then configure the validated Host header explicitly.
  const server = createCampusServer(store, { port: 4174 });
  await new Promise<void>((resolve) => server.listen(0, "127.0.0.1", resolve));
  const address = server.address() as { port: number };
  const base = "http://127.0.0.1:" + address.port;
  const call = (
    path: string,
    init: {
      method?: string;
      headers?: Record<string, string>;
      body?: string | Uint8Array;
    } = {},
  ) =>
    new Promise<Response>((resolve, reject) => {
      const req = request(
        base + path,
        {
          method: init.method,
          headers: { host: "127.0.0.1:4174", ...init.headers },
        },
        (res) => {
          const chunks: Buffer[] = [];
          res.on("data", (chunk) => chunks.push(Buffer.from(chunk)));
          res.on("end", () =>
            resolve(
              new Response(new Uint8Array(Buffer.concat(chunks)), {
                status: res.statusCode,
              }),
            ),
          );
        },
      );
      req.on("error", reject);
      req.end(init.body);
    });
  try {
    expect((await call("/api/health")).status).toBe(200);
    expect(
      (
        await call("/api/campus", {
          headers: { origin: "https://untrusted.example" },
        })
      ).status,
    ).toBe(403);
    expect(
      (await call("/api/campus", { headers: { host: "untrusted.example" } }))
        .status,
    ).toBe(403);
    expect((await call("/api/campus", { method: "DELETE" })).status).toBe(405);
    const child = await (
      await call("/api/campus", { headers: { "x-campus-persona": "child" } })
    ).json();
    expect(child.state.payments).toEqual([]);
    const refused = await call("/api/campus", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-campus-persona": "child",
      },
      body: JSON.stringify({
        action: "reset",
        data: { confirm: "REINITIALISER" },
        version: 1,
      }),
    });
    expect(refused.status).toBe(403);
    expect(
      (
        await call("/api/campus", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: "not json",
        })
      ).status,
    ).toBe(400);
    expect((await call("/.local-data/campus.sqlite")).status).toBe(404);
    const sent = await (
      await call("/api/campus", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "x-campus-persona": "adult",
        },
        body: JSON.stringify({
          version: 1,
          action: "submit",
          data: { lesson: "linux-2", text: "HTTP attachment test", url: "" },
        }),
      })
    ).json();
    const form = new FormData();
    form.append("file", new File(["proof over HTTP"], "proof.txt"));
    form.append("submission", sent.state.submissions[0].id);
    form.append("version", String(sent.version));
    const multipart = new Request("http://localhost/", {
      method: "POST",
      body: form,
    });
    const uploaded = await call("/api/files", {
      method: "POST",
      headers: {
        "Content-Type": multipart.headers.get("content-type")!,
        "x-campus-persona": "adult",
      },
      body: new Uint8Array(await multipart.arrayBuffer()),
    });
    expect(uploaded.status).toBe(200);
    const attached = await uploaded.json();
    const fileId = attached.state.submissions[0].file.id;
    expect(
      await (
        await call("/api/files?id=" + fileId, {
          headers: { "x-campus-persona": "adult" },
        })
      ).text(),
    ).toBe("proof over HTTP");
    expect(
      (
        await call("/api/files?id=" + fileId, {
          headers: { "x-campus-persona": "parent" },
        })
      ).status,
    ).toBe(404);
  } finally {
    await new Promise<void>((resolve, reject) =>
      server.close((e) => (e ? reject(e) : resolve())),
    );
    store.close();
  }
});
