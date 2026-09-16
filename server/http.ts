import { createServer, type IncomingMessage } from "node:http";
import { readFile, stat } from "node:fs/promises";
import { resolve, extname, sep } from "node:path";
import { DomainError } from "../src/campus/lib/domain";
import type { Persona } from "../src/campus/lib/model";
import type { CampusStore } from "./store";

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
  const hosts = new Set([
    `127.0.0.1:${options.port}`,
    `localhost:${options.port}`,
  ]);
  const origins = new Set([...hosts].map((h) => `http://${h}`));
  if (options.devPort)
    for (const host of ["localhost", "127.0.0.1"])
      origins.add(`http://${host}:${options.devPort}`);
  return createServer(async (req, res) => {
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
      if (req.headers["sec-fetch-site"] === "cross-site")
        throw new DomainError("Requête externe refusée.", 403);
      const url = new URL(req.url || "/", `http://${req.headers.host}`);
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
          return json(
            store.mutate(persona, input.version, input.action, input.data),
          );
        }
        throw new DomainError("Méthode refusée.", 405);
      }
      if (url.pathname === "/api/files") {
        const persona = personaFor(req);
        if (req.method === "GET") {
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
          return json(
            store.attach(
              persona,
              String(form.get("submission") || ""),
              file.name,
              new Uint8Array(await file.arrayBuffer()),
              Number(form.get("version")),
            ),
          );
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
}
