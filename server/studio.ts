import { z } from "zod";
import { existsSync, createWriteStream, createReadStream } from "node:fs";
import { mkdir, mkdtemp, rm, stat } from "node:fs/promises";
import { resolve, join, sep, basename } from "node:path";
import { Readable, Transform } from "node:stream";
import { pipeline } from "node:stream/promises";
import { execFile } from "node:child_process";
import { promisify } from "node:util";
import { WorkspaceStore, maxUploadBytes, chunkBytes } from "./workspace-store";
import { DomainError } from "../src/campus/lib/domain";
import type { Persona } from "../src/campus/lib/model";
import type { Media } from "../src/campus/lib/workspace";
import {
  serviceRequestSchema,
  type ServiceRequest,
  type ImportJob,
  type Transcript,
} from "../src/campus/lib/studio";
import { downloadUrl, openDownload } from "./safe-download";

const run = promisify(execFile);
const python =
  process.env.CAMPUS_TRANSCRIPTION_PYTHON ||
  resolve(
    ".local-data/transcription-venv",
    process.platform === "win32" ? "Scripts/python.exe" : "bin/python",
  );
const model =
  process.env.CAMPUS_TRANSCRIPTION_MODEL || resolve(".local-data/whisper-base");
const parse = <T extends z.ZodTypeAny>(
  schema: T,
  input: unknown,
): z.output<T> => {
  const r = schema.safeParse(input);
  if (!r.success)
    throw new DomainError(
      "Please check the form and fill all required fields.",
    );
  return r.data;
};
export class Studio {
  private importBusy = false;
  private transcriptBusy = false;
  private closed = false;
  private active = new Map<string, AbortController>();
  private timer: ReturnType<typeof setInterval>;
  constructor(readonly ws: WorkspaceStore) {
    for (const job of ws.items<ImportJob>("import"))
      if (["running", "queued"].includes(job.status))
        ws.put("import", job.owner, {
          ...job,
          status: "error",
          error: "The server restarted. Start the import again.",
        });
    for (const job of ws.items<Transcript>("transcript"))
      if (job.status === "running")
        ws.put("transcript", job.owner, { ...job, status: "queued" });
    this.timer = setInterval(() => void this.tick(), 2000);
    this.timer.unref();
  }
  ready() {
    return existsSync(python) && existsSync(join(model, "model.bin"));
  }
  searchableTranscripts(p: Persona) {
    const visible = new Set(
      this.ws.mediaList(p).map((m) => `transcript:${m.id}`),
    );
    return this.ws
      .items<Transcript>("transcript")
      .filter((t) => t.status === "done" && visible.has(t.id))
      .map((t) => ({
        id: t.id,
        text: t.segments.map((s) => s.text).join(" "),
      }));
  }
  close() {
    this.closed = true;
    clearInterval(this.timer);
    for (const c of this.active.values()) c.abort();
  }
  snapshot(p: Persona) {
    return {
      ready: this.ready(),
      imports: this.ws
        .items<ImportJob>("import", this.ws.owner(p))
        .map((job) => ({ ...job, url: "" })),
      requests:
        p === "teacher"
          ? this.ws.items<ServiceRequest>("service")
          : this.ws
              .items<ServiceRequest>("service", this.ws.owner(p))
              .map((r) => ({ ...r, notes: "" })),
    };
  }
  import(p: Persona, input: unknown) {
    const d = parse(
      z.object({
        url: z.string().min(1).max(2000),
        name: z.string().trim().max(180).default(""),
        rights: z.literal(true),
      }),
      input,
    );
    downloadUrl(d.url);
    const owner = this.ws.owner(p);
    if (
      this.ws
        .items<ImportJob>("import", owner)
        .filter((j) => ["queued", "running"].includes(j.status)).length >= 3
    )
      throw new DomainError("Wait for your current imports to finish.", 429);
    const job: ImportJob = {
      id: crypto.randomUUID(),
      owner,
      persona: p,
      url: d.url,
      name: d.name,
      status: "queued",
      received: 0,
      total: 0,
      media: "",
      error: "",
      created: new Date().toISOString(),
    };
    this.ws.put("import", owner, job);
    void this.tick();
    return { id: job.id };
  }
  cancel(p: Persona, id: string) {
    const j = this.ws
      .items<ImportJob>("import", this.ws.owner(p))
      .find((x) => x.id === id);
    if (!j || !["queued", "running"].includes(j.status))
      throw new DomainError("Active import not found.", 404);
    this.ws.put("import", j.owner, { ...j, status: "cancelled", error: "" });
    this.active.get(id)?.abort();
    return { ok: true };
  }
  transcript(p: Persona, id: string) {
    this.ws.media(p, id);
    return (
      this.ws
        .items<Transcript>("transcript")
        .find((t) => t.id === `transcript:${id}`) || null
    );
  }
  retry(p: Persona, id: string) {
    const m = this.ws.media(p, id, true);
    if (!m.complete || !m.preview.startsWith("video/"))
      throw new DomainError("Choose a completed video.");
    const old = this.transcript(p, id);
    if (old && ["running", "queued"].includes(old.status)) return { ok: true };
    this.queue(m);
    void this.tick();
    return { ok: true };
  }
  queue(m: Media) {
    this.ws.put("transcript", m.owner, {
      id: `transcript:${m.id}`,
      owner: m.owner,
      status: "queued",
      language: "",
      error: "",
      segments: [],
    });
  }
  request(p: Persona, input: unknown) {
    if (p === "child")
      throw new DomainError("Ask a parent to send this request.", 403);
    const d = parse(serviceRequestSchema, input),
      owner = this.ws.owner(p);
    const existing = this.ws.items<ServiceRequest>("service");
    if (
      existing.some(
        (r) =>
          r.email.toLowerCase() === d.email.toLowerCase() &&
          r.service === d.service &&
          (r.course || "") === d.course &&
          r.status !== "closed",
      )
    )
      throw new DomainError(
        "A request is already open for this email and service.",
        409,
      );
    const request: ServiceRequest = {
      ...d,
      id: crypto.randomUUID(),
      owner,
      created: new Date().toISOString(),
      status: "new",
      notes: "",
    };
    this.ws.put("service", owner, request);
    return { id: request.id };
  }
  updateRequest(p: Persona, input: unknown) {
    if (p !== "teacher") throw new DomainError("Teacher view required.", 403);
    const d = parse(
      z.object({
        id: z.string(),
        status: z.enum(["new", "contacted", "closed"]),
        notes: z.string().max(3000),
      }),
      input,
    );
    const old = this.ws
      .items<ServiceRequest>("service")
      .find((r) => r.id === d.id);
    if (!old) throw new DomainError("Request not found.", 404);
    this.ws.put("service", old.owner, { ...old, ...d });
    return { ok: true };
  }
  private async tick() {
    if (this.closed) return;
    try {
      const imported = this.ws
        .items<ImportJob>("import")
        .find((j) => j.status === "queued");
      if (imported && !this.importBusy) {
        this.importBusy = true;
        void this.runImport(imported)
          .catch(() => {
            if (!this.closed) console.error("Import cleanup failed.");
          })
          .finally(() => {
            this.importBusy = false;
          });
      }
      if (this.transcriptBusy || !this.ready()) return;
      const transcripts = this.ws.items<Transcript>("transcript");
      for (const m of this.ws.mediaList("teacher"))
        if (
          m.preview.startsWith("video/") &&
          !transcripts.some((t) => t.id === `transcript:${m.id}`)
        )
          this.queue(m);
      const next = this.ws
        .items<Transcript>("transcript")
        .find((t) => t.status === "queued");
      if (next) {
        this.transcriptBusy = true;
        void this.runTranscript(next)
          .catch(() => {
            if (!this.closed) console.error("Transcript cleanup failed.");
          })
          .finally(() => {
            this.transcriptBusy = false;
          });
      }
    } catch {
      if (!this.closed) console.error("Studio background job could not start.");
    }
  }
  private async temporary() {
    const root = resolve(
      process.env.CAMPUS_DATA_DIR || ".local-data",
      "studio-temp",
    );
    await mkdir(root, { recursive: true });
    return mkdtemp(join(root, "job-"));
  }
  private async cleanTemporary(dir: string) {
    const root = resolve(
      process.env.CAMPUS_DATA_DIR || ".local-data",
      "studio-temp",
    );
    if (
      !resolve(dir).startsWith(root + sep) ||
      !basename(dir).startsWith("job-")
    )
      throw new Error("Unexpected temporary path");
    await rm(dir, { recursive: true, force: true });
  }
  private async runImport(job: ImportJob) {
    const controller = new AbortController();
    this.active.set(job.id, controller);
    const deadline = setTimeout(() => controller.abort(), 10 * 60 * 1000);
    deadline.unref();
    let dir = "",
      media = "";
    const save = () => {
      if (!this.closed) this.ws.put("import", job.owner, job);
    };
    try {
      job.status = "running";
      save();
      const response = await openDownload(job.url, controller.signal);
      job.total = Number(response.headers["content-length"] || 0);
      if (job.total > maxUploadBytes) {
        response.destroy();
        throw new Error("The file is larger than 200 MB.");
      }
      const type = (
        response.headers["content-type"] || "application/octet-stream"
      ).split(";")[0];
      job.name ||= decodeURIComponent(
        new URL(job.url).pathname.split("/").pop() || "download",
      )
        .replace(/[\\/:*?"<>|]/g, "_")
        .split("")
        .filter((c) => c.charCodeAt(0) >= 32)
        .join("")
        .slice(0, 180);
      dir = await this.temporary();
      const path = join(dir, "download"),
        ws = this.ws;
      let lastSave = 0;
      await pipeline(
        response,
        new Transform({
          transform(chunk: Buffer, _encoding, callback) {
            job.received += chunk.length;
            if (job.received > maxUploadBytes)
              return callback(new Error("The file is larger than 200 MB."));
            if (Date.now() - lastSave > 500) {
              lastSave = Date.now();
              ws.put("import", job.owner, job);
            }
            callback(null, chunk);
          },
        }),
        createWriteStream(path),
        { signal: controller.signal },
      );
      controller.signal.throwIfAborted();
      if (!job.received) throw new Error("The downloaded file is empty.");
      const start = this.ws.start(job.persona, {
        name: job.name,
        type,
        size: job.received,
        shared: false,
        gallery: "",
        submission: "",
      });
      media = start.id;
      let offset = 0;
      for await (const bytes of createReadStream(path, {
        highWaterMark: chunkBytes,
      })) {
        controller.signal.throwIfAborted();
        this.ws.chunk(job.persona, media, offset, bytes);
        offset += bytes.length;
      }
      this.ws.finish(job.persona, media);
      job.media = media;
      job.status = "done";
      job.url = "";
      save();
    } catch (e) {
      if (media && !this.closed) {
        try {
          this.ws.cancel(job.persona, media);
        } catch {
          /* A completed file is kept. */
        }
      }
      job.status = controller.signal.aborted ? "cancelled" : "error";
      job.error = controller.signal.aborted
        ? "Import cancelled or timed out. Try again."
        : e instanceof DomainError
          ? e.message
          : "The file could not be imported. Check the direct link and try again.";
      job.url = "";
      save();
    } finally {
      clearTimeout(deadline);
      this.active.delete(job.id);
      if (dir) await this.cleanTemporary(dir);
    }
  }
  private async runTranscript(job: Transcript) {
    const controller = new AbortController();
    this.active.set(job.id, controller);
    let dir = "";
    try {
      job.status = "running";
      this.ws.put("transcript", job.owner, job);
      const id = job.id.slice(11);
      dir = await this.temporary();
      const path = join(dir, "video");
      await pipeline(
        Readable.from(
          (function* (ws: WorkspaceStore) {
            for (const c of ws.bytes(id)) yield c.bytes;
          })(this.ws),
        ),
        createWriteStream(path),
        { signal: controller.signal },
      );
      if (!(await stat(path)).size) throw new Error("Empty file");
      const { stdout } = await run(
        python,
        [resolve("scripts/transcribe.py"), path, model],
        {
          signal: controller.signal,
          timeout: 60 * 60 * 1000,
          maxBuffer: 10 * 1024 * 1024,
          windowsHide: true,
          env: {
            ...process.env,
            PYTHONIOENCODING: "utf-8",
            HF_HUB_OFFLINE: "1",
          },
        },
      );
      const result = JSON.parse(stdout) as Pick<
        Transcript,
        "segments" | "language"
      >;
      job = { ...job, ...result, status: "done", error: "" };
    } catch {
      job.status = "error";
      job.error =
        "This video could not be transcribed. Check that it has a clear audio track, then retry.";
    } finally {
      if (!this.closed) this.ws.put("transcript", job.owner, job);
      this.active.delete(job.id);
      if (dir) await this.cleanTemporary(dir);
    }
  }
}
