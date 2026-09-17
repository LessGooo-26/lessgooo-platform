import { createServer, type IncomingMessage } from "node:http";
import { readFile, stat } from "node:fs/promises";
import { resolve, extname, sep } from "node:path";
import { DomainError } from "../src/campus/lib/domain";
import type { Persona } from "../src/campus/lib/model";
import type { CampusStore } from "./store";
import { WorkspaceStore, chunkBytes } from "./workspace-store";
import { Integrations } from "./integrations";
import { Readable } from "node:stream";
import { pipeline } from "node:stream/promises";
import { serveMedia } from "./media-stream";

const maxBody = 6 * 1024 * 1024;
async function body(req: IncomingMessage, limit: number) {
  const chunks: Buffer[] = [];
  let size = 0;
  for await (const chunk of req) {
    size += chunk.length;
    if (size > limit) throw new DomainError("Requête trop volumineuse.", 413);
    chunks.push(Buffer.from(chunk));
  }
  return Buffer.concat(chunks);
}
function personaFor(req: IncomingMessage): Persona {
  const value = req.headers["x-campus-persona"] || "teacher";
  if (!["teacher", "adult", "parent", "child"].includes(String(value)))
    throw new DomainError("Vue invalide.");
  return value as Persona;
}
const mime: Record<string, string> = {
  ".html": "text/html; charset=utf-8",
  ".js": "text/javascript",
  ".css": "text/css",
  ".png": "image/png",
  ".svg": "image/svg+xml",
  ".ico": "image/x-icon",
  ".woff2": "font/woff2",
  ".json": "application/json",
};

export function createCampusServer(
  store: CampusStore,
  options: { port: number; devPort?: number; staticDir?: string },
) {
  const workspace = new WorkspaceStore(store);
  const integrations = new Integrations(
    workspace,
    `http://127.0.0.1:${options.port}`,
  );
  const sync = () => {
    if (integrations.status().drive.connected)
      void integrations.sync().catch(() => {});
  };
  const timer = setInterval(sync, 60000);
  timer.unref();
  const hosts = new Set([
    `127.0.0.1:${options.port}`,
    `localhost:${options.port}`,
  ]);
  const origins = new Set([...hosts].map((h) => `http://${h}`));
  if (options.devPort)
    for (const host of ["localhost", "127.0.0.1"])
      origins.add(`http://${host}:${options.devPort}`);
  const server = createServer(async (req, res) => {
    res.setHeader("X-Content-Type-Options", "nosniff");
    res.setHeader("Referrer-Policy", "no-referrer");
    res.setHeader("Cache-Control", "no-store");
    const json = (value: unknown, status = 200) => {
      res.writeHead(status, {
        "Content-Type": "application/json; charset=utf-8",
      });
      res.end(JSON.stringify(value));
    };
    try {
      if (!hosts.has(req.headers.host || ""))
        throw new DomainError("Hôte refusé.", 403);
      if (req.headers.origin && !origins.has(req.headers.origin))
        throw new DomainError("Origine refusée.", 403);
      const url = new URL(req.url || "/", `http://${req.headers.host}`);
      const oauthCallback =
        req.method === "GET" &&
        url.pathname === "/api/integrations/google/callback";
      if (req.headers["sec-fetch-site"] === "cross-site" && !oauthCallback)
        throw new DomainError("Requête externe refusée.", 403);
      const input = async (limit = 1_000_000) => {
        if (!req.headers["content-type"]?.startsWith("application/json"))
          throw new DomainError("JSON requis.", 415);
        try {
          return JSON.parse((await body(req, limit)).toString("utf8"));
        } catch (e) {
          throw e instanceof DomainError
            ? e
            : new DomainError("Formulaire invalide.");
        }
      };
      if (oauthCallback) {
        const cookie =
          req.headers.cookie
            ?.split(";")
            .map((s) => s.trim())
            .find((s) => s.startsWith("lessgooo-oauth="))
            ?.slice(15) || "";
        await integrations.googleFinish(
          url.searchParams.get("state") || "",
          url.searchParams.get("code") || "",
          cookie,
        );
        res.writeHead(303, {
          Location: `http://127.0.0.1:${options.devPort || options.port}/campus.html#integrations`,
          "Set-Cookie":
            "lessgooo-oauth=; HttpOnly; SameSite=Lax; Path=/api/integrations/google/callback; Max-Age=0",
        });
        sync();
        return res.end();
      }
      if (url.pathname === "/api/workspace") {
        const p = personaFor(req);
        if (req.method === "GET") return json(workspace.snapshot(p));
        if (req.method === "POST") {
          const d = await input();
          return json(workspace.action(p, d.action, d.data));
        }
        throw new DomainError("Méthode refusée.", 405);
      }
      if (
        url.pathname.startsWith("/api/integrations") ||
        url.pathname === "/api/checkout"
      ) {
        if (personaFor(req) !== "teacher")
          throw new DomainError("Vue formateur requise.", 403);
        if (url.pathname === "/api/integrations" && req.method === "GET")
          return json({
            ...integrations.status(),
            checkouts: integrations.checkouts(),
          });
        if (
          url.pathname === "/api/integrations/config" &&
          req.method === "POST"
        )
          return json(integrations.configure(await input()));
        if (
          url.pathname === "/api/integrations/google/start" &&
          req.method === "POST"
        ) {
          const start = integrations.googleStart();
          res.setHeader(
            "Set-Cookie",
            `lessgooo-oauth=${start.state}; HttpOnly; SameSite=Lax; Path=/api/integrations/google/callback; Max-Age=600`,
          );
          return json({ url: start.url });
        }
        if (
          url.pathname === "/api/integrations/google/sync" &&
          req.method === "POST"
        )
          return json(await integrations.sync());
        if (url.pathname === "/api/checkout" && req.method === "POST")
          return json(await integrations.checkout(await input()));
        if (url.pathname === "/api/checkout" && req.method === "GET")
          return json(
            await integrations.verify(url.searchParams.get("reference") || ""),
          );
        throw new DomainError("Méthode refusée.", 405);
      }
      if (url.pathname.startsWith("/api/media")) {
        // Native video/image/download requests cannot set a custom header.
        // This is the same explicit persona selector as the local demo API,
        // not authentication. Mutations never accept the query selector.
        const readMedia =
          url.pathname === "/api/media" &&
          ["GET", "HEAD"].includes(req.method || "");
        const selected = readMedia ? url.searchParams.get("persona") : null;
        if (
          selected &&
          (!["teacher", "adult", "parent", "child"].includes(selected) ||
            (req.headers["x-campus-persona"] &&
              req.headers["x-campus-persona"] !== selected))
        )
          throw new DomainError("Vue invalide.", 403);
        const p = (selected as Persona) || personaFor(req),
          id = url.searchParams.get("id") || "";
        if (url.pathname === "/api/media/start" && req.method === "POST")
          return json(workspace.start(p, await input()));
        if (url.pathname === "/api/media/chunk" && req.method === "PUT")
          return json(
            workspace.chunk(
              p,
              id,
              Number(url.searchParams.get("offset")),
              await body(req, chunkBytes),
            ),
          );
        if (url.pathname === "/api/media/finish" && req.method === "POST") {
          const result = workspace.finish(p, id);
          sync();
          return json(result);
        }
        if (url.pathname === "/api/media/cancel" && req.method === "POST")
          return json(workspace.cancel(p, id));
        if (readMedia) {
          const file = workspace.media(p, id);
          await serveMedia(
            req,
            res,
            workspace,
            file,
            url.searchParams.get("inline") === "1",
          );
          return;
        }
        throw new DomainError("Méthode refusée.", 405);
      }
      if (url.pathname === "/api/health" && req.method === "GET") {
        store.read();
        return json({ status: "ok", mode: "local-demo" });
      }
      if (url.pathname === "/api/campus") {
        const persona = personaFor(req);
        if (req.method === "GET") return json(store.snapshot(persona));
        if (req.method === "POST") {
          if (!req.headers["content-type"]?.startsWith("application/json"))
            throw new DomainError("JSON requis.", 415);
          let input: { action: string; data: unknown; version: number };
          try {
            input = JSON.parse((await body(req, 100_000)).toString("utf8"));
          } catch (error) {
            if (error instanceof DomainError) throw error;
            throw new DomainError("Formulaire invalide.");
          }
          if (
            !input ||
            typeof input.action !== "string" ||
            !Number.isInteger(input.version)
          )
            throw new DomainError("Formulaire invalide.");
          const changed = store.mutate(
            persona,
            input.version,
            input.action,
            input.data,
          );
          if (input.action === "submit" || input.action === "review") {
            const data = input.data as { lesson?: string; id?: string };
            const sub =
              input.action === "review"
                ? changed.state.submissions.find((s) => s.id === data.id)
                : changed.state.submissions.find(
                    (s) => s.lesson === data.lesson,
                  );
            if (sub)
              workspace.queue(
                sub.id,
                `Devoir · ${changed.state.lessons.find((l) => l.id === sub.lesson)?.title || sub.lesson}`,
              );
            sync();
          }
          return json(changed);
        }
        throw new DomainError("Méthode refusée.", 405);
      }
      if (url.pathname === "/api/files") {
        const persona = personaFor(req);
        if (req.method === "GET") {
          const id = url.searchParams.get("id") || "";
          if (workspace.db.prepare("SELECT id FROM media WHERE id=?").get(id)) {
            const f = workspace.media(persona, id);
            // A homework file follows current submission visibility, not merely its original owner.
            if (
              !store
                .snapshot(persona)
                .state.submissions.some((s) => s.file?.id === id)
            )
              throw new DomainError("Fichier introuvable.", 404);
            res.writeHead(200, {
              "Content-Type": "application/octet-stream",
              "Content-Length": f.size,
              "Content-Disposition": `attachment; filename*=UTF-8''${encodeURIComponent(f.name)}`,
            });
            await pipeline(
              Readable.from(
                (function* () {
                  for (const row of workspace.bytes(id)) yield row.bytes;
                })(),
              ),
              res,
            );
            return;
          }
          const file = store.file(persona, url.searchParams.get("id") || "");
          res.writeHead(200, {
            "Content-Type": "application/octet-stream",
            "Content-Disposition": `attachment; filename*=UTF-8''${encodeURIComponent(file.name)}`,
          });
          return res.end(file.bytes);
        }
        if (req.method === "POST") {
          const raw = await body(req, maxBody);
          const request = new Request("http://localhost/api/files", {
            method: "POST",
            headers: { "Content-Type": req.headers["content-type"] || "" },
            body: new Uint8Array(raw),
          });
          let form: FormData;
          try {
            form = await request.formData();
          } catch {
            throw new DomainError("Fichier invalide.");
          }
          const file = form.get("file");
          if (!(file instanceof File)) throw new DomainError("Fichier requis.");
          const changed = store.attach(
            persona,
            String(form.get("submission") || ""),
            file.name,
            new Uint8Array(await file.arrayBuffer()),
            Number(form.get("version")),
          );
          const submission = String(form.get("submission") || "");
          workspace.queue(submission, `Devoir · ${file.name}`);
          sync();
          return json(changed);
        }
        throw new DomainError("Méthode refusée.", 405);
      }
      if (
        !options.staticDir ||
        !["GET", "HEAD"].includes(req.method || "") ||
        url.pathname.startsWith("/api/")
      )
        throw new DomainError("Page introuvable.", 404);
      const root = resolve(options.staticDir);
      const path = resolve(
        root,
        "." +
          decodeURIComponent(
            url.pathname === "/" ? "/campus.html" : url.pathname,
          ),
      );
      if (!path.startsWith(root + sep))
        throw new DomainError("Page introuvable.", 404);
      try {
        if (!(await stat(path)).isFile()) throw new Error();
      } catch {
        throw new DomainError("Page introuvable.", 404);
      }
      res.setHeader(
        "Content-Security-Policy",
        "default-src 'self'; script-src 'self'; style-src 'self' 'unsafe-inline'; img-src 'self' data:; connect-src 'self'; font-src 'self'; frame-ancestors 'none'; base-uri 'self'; form-action 'self'",
      );
      res.writeHead(200, {
        "Content-Type": mime[extname(path)] || "application/octet-stream",
      });
      res.end(req.method === "HEAD" ? undefined : await readFile(path));
    } catch (error) {
      if (res.headersSent) {
        res.destroy();
        return;
      }
      if (error instanceof DomainError)
        json({ error: error.message }, error.status);
      else {
        console.error(
          "Local campus request failed:",
          error instanceof Error ? error.message : "unknown",
        );
        json(
          { error: "Le serveur local ne peut pas traiter la demande." },
          500,
        );
      }
    }
  });
  server.on("close", () => clearInterval(timer));
  return server;
}
