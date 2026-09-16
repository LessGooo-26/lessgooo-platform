import {
  createCipheriv,
  createDecipheriv,
  createHash,
  randomBytes,
  timingSafeEqual,
} from "node:crypto";
import { existsSync, mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { dirname, resolve } from "node:path";
import { z } from "zod";
import { DomainError } from "../src/campus/lib/domain";
import {
  ownerEmail,
  type IntegrationStatus,
} from "../src/campus/lib/workspace";
import { WorkspaceStore } from "./workspace-store";

const paymentResult = z.object({
  transaction: z.object({
    id: z.string().min(1),
    reference: z.string(),
    amount: z.number(),
    currency: z.string(),
    status: z.enum([
      "pending",
      "processing",
      "complete",
      "failed",
      "canceled",
      "expired",
    ]),
  }),
  authorization_url: z.string().url().optional(),
});
export class Integrations {
  private oauth = new Map<string, { verifier: string; expires: number }>();
  private syncing = false;
  private value(name: string) {
    if (this.env[name]) return this.env[name]!;
    const saved = this.store.config("credential:" + name);
    return saved ? this.decrypt(saved) : "";
  }
  configure(input: unknown) {
    const result = z
      .object({
        googleClientId: z.string().trim().max(1000).optional(),
        googleClientSecret: z.string().trim().max(4000).optional(),
        notchKey: z.string().trim().max(4000).optional(),
        notchMode: z.enum(["test", "live"]).optional(),
      })
      .strict()
      .safeParse(input);
    if (!result.success) throw new DomainError("Configuration invalide.");
    const data = result.data;
    const entries = [
      ["GOOGLE_CLIENT_ID", data.googleClientId],
      ["GOOGLE_CLIENT_SECRET", data.googleClientSecret],
      ["NOTCHPAY_PUBLIC_KEY", data.notchKey],
      ["NOTCHPAY_MODE", data.notchMode],
    ] as const;
    for (const [name, value] of entries)
      if (value && this.env[name])
        throw new DomainError(
          `${name} est défini dans .env.local ; modifiez ce fichier pour le remplacer.`,
        );
    if (
      data.googleClientId &&
      this.value("GOOGLE_CLIENT_ID") !== data.googleClientId
    )
      for (const key of ["google-refresh", "google-email", "google-folder"])
        this.store.setConfig(key, "");
    for (const [name, value] of entries)
      if (value)
        this.store.setConfig("credential:" + name, this.encrypt(value));
    return this.status();
  }
  constructor(
    readonly store: WorkspaceStore,
    readonly baseUrl: string,
    readonly env: NodeJS.ProcessEnv = process.env,
    readonly fetcher: typeof fetch = fetch,
  ) {}
  private get driveConfigured() {
    return !!(
      this.value("GOOGLE_CLIENT_ID") && this.value("GOOGLE_CLIENT_SECRET")
    );
  }
  private get payConfigured() {
    return (
      !!this.value("NOTCHPAY_PUBLIC_KEY") &&
      ["test", "live"].includes(this.value("NOTCHPAY_MODE") || "")
    );
  }
  status(): IntegrationStatus {
    return {
      email: ownerEmail,
      drive: {
        configured: this.driveConfigured,
        connected:
          this.driveConfigured && !!this.store.config("google-refresh"),
        email: this.store.config("google-email"),
        folder: this.store.config("google-folder"),
      },
      payment: {
        configured: this.payConfigured,
        mode: this.payConfigured ? this.value("NOTCHPAY_MODE") : "disabled",
      },
      jobs: this.store.jobs(),
    };
  }
  private key() {
    const path = resolve(
      this.env.CAMPUS_DATA_DIR || ".local-data",
      "integration-key",
    );
    if (!existsSync(path)) {
      mkdirSync(dirname(path), { recursive: true });
      writeFileSync(path, randomBytes(32), { mode: 0o600, flag: "wx" });
    }
    return readFileSync(path);
  }
  private encrypt(value: string) {
    const iv = randomBytes(12),
      cipher = createCipheriv("aes-256-gcm", this.key(), iv);
    return Buffer.concat([
      iv,
      cipher.update(value, "utf8"),
      cipher.final(),
      cipher.getAuthTag(),
    ]).toString("base64");
  }
  private decrypt(value: string) {
    const bytes = Buffer.from(value, "base64"),
      cipher = createDecipheriv(
        "aes-256-gcm",
        this.key(),
        bytes.subarray(0, 12),
      );
    cipher.setAuthTag(bytes.subarray(-16));
    return Buffer.concat([
      cipher.update(bytes.subarray(12, -16)),
      cipher.final(),
    ]).toString("utf8");
  }
  async json(url: string, init?: RequestInit) {
    const response = await this.fetcher(url, {
      ...init,
      signal: AbortSignal.timeout(30000),
      redirect: "error",
    });
    if (!response.ok)
      throw new DomainError(
        `Le service externe a refusé la demande (${response.status}).`,
        502,
      );
    return response.json();
  }
  googleStart() {
    if (!this.driveConfigured)
      throw new DomainError(
        "Renseignez GOOGLE_CLIENT_ID et GOOGLE_CLIENT_SECRET dans .env.local puis redémarrez.",
        503,
      );
    for (const [k, v] of this.oauth)
      if (v.expires < Date.now()) this.oauth.delete(k);
    const state = randomBytes(32).toString("hex"),
      verifier = randomBytes(32).toString("base64url");
    this.oauth.set(state, { verifier, expires: Date.now() + 600000 });
    const url = new URL("https://accounts.google.com/o/oauth2/v2/auth");
    url.search = new URLSearchParams({
      client_id: this.value("GOOGLE_CLIENT_ID"),
      redirect_uri: `${this.baseUrl}/api/integrations/google/callback`,
      response_type: "code",
      scope: "openid email https://www.googleapis.com/auth/drive.file",
      access_type: "offline",
      prompt: "consent",
      login_hint: ownerEmail,
      state,
      code_challenge: createHash("sha256").update(verifier).digest("base64url"),
      code_challenge_method: "S256",
    }).toString();
    return { url: url.toString(), state };
  }
  async googleFinish(state: string, code: string, cookieState: string) {
    const flow = this.oauth.get(state);
    this.oauth.delete(state);
    if (
      !flow ||
      flow.expires < Date.now() ||
      !cookieState ||
      state.length !== cookieState.length ||
      !timingSafeEqual(Buffer.from(state), Buffer.from(cookieState))
    )
      throw new DomainError(
        "Connexion expirée ou état OAuth invalide. Recommencez.",
        403,
      );
    const token = await this.json("https://oauth2.googleapis.com/token", {
      method: "POST",
      body: new URLSearchParams({
        client_id: this.value("GOOGLE_CLIENT_ID"),
        client_secret: this.value("GOOGLE_CLIENT_SECRET"),
        redirect_uri: `${this.baseUrl}/api/integrations/google/callback`,
        grant_type: "authorization_code",
        code,
        code_verifier: flow.verifier,
      }),
    });
    if (
      typeof token.access_token !== "string" ||
      typeof token.refresh_token !== "string"
    )
      throw new DomainError(
        "Google n’a pas fourni l’autorisation hors ligne. Recommencez la connexion.",
        502,
      );
    const user = await this.json(
      "https://openidconnect.googleapis.com/v1/userinfo",
      { headers: { Authorization: `Bearer ${token.access_token}` } },
    );
    if (user.email !== ownerEmail || user.email_verified !== true)
      throw new DomainError(`Connectez uniquement ${ownerEmail}.`, 403);
    this.store.setConfig("google-refresh", this.encrypt(token.refresh_token));
    this.store.setConfig("google-email", ownerEmail);
    await this.folder(token.access_token);
  }
  private async token() {
    if (!this.status().drive.connected)
      throw new DomainError("Google Drive n’est pas connecté.", 503);
    const d = await this.json("https://oauth2.googleapis.com/token", {
      method: "POST",
      body: new URLSearchParams({
        client_id: this.value("GOOGLE_CLIENT_ID"),
        client_secret: this.value("GOOGLE_CLIENT_SECRET"),
        grant_type: "refresh_token",
        refresh_token: this.decrypt(this.store.config("google-refresh")),
      }),
    });
    if (typeof d.access_token !== "string")
      throw new DomainError("Reconnectez Google Drive.", 503);
    return d.access_token as string;
  }
  private async folder(token: string) {
    const stored = this.store.config("google-folder");
    if (stored) return stored;
    const headers = {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
    };
    const found = await this.json(
      "https://www.googleapis.com/drive/v3/files?" +
        new URLSearchParams({
          q: "trashed=false and mimeType='application/vnd.google-apps.folder' and appProperties has { key='lessgooo' and value='homework' }",
          fields: "files(id)",
        }),
      { headers },
    );
    const id =
      found.files?.[0]?.id ||
      (
        await this.json("https://www.googleapis.com/drive/v3/files", {
          method: "POST",
          headers,
          body: JSON.stringify({
            name: "LESSGOOO — Devoirs du campus",
            mimeType: "application/vnd.google-apps.folder",
            appProperties: { lessgooo: "homework" },
          }),
        })
      ).id;
    if (typeof id !== "string")
      throw new DomainError("Impossible de créer le dossier Drive.", 502);
    this.store.setConfig("google-folder", id);
    return id;
  }
  private async upload(
    token: string,
    folder: string,
    key: string,
    name: string,
    type: string,
    size: number,
    chunks: () => Iterable<Uint8Array>,
  ) {
    const headers = { Authorization: `Bearer ${token}` };
    let id = this.store.config("drive-file:" + key);
    if (!id) {
      const found = await this.json(
        "https://www.googleapis.com/drive/v3/files?" +
          new URLSearchParams({
            q: `trashed=false and appProperties has { key='lessgoooKey' and value='${key}' }`,
            fields: "files(id)",
          }),
        { headers },
      );
      id = found.files?.[0]?.id || "";
    }
    const metadata = id
      ? { name }
      : { name, parents: [folder], appProperties: { lessgoooKey: key } };
    const response = await this.fetcher(
      `https://www.googleapis.com/upload/drive/v3/files${id ? "/" + encodeURIComponent(id) : ""}?uploadType=resumable&fields=id,webViewLink`,
      {
        method: id ? "PATCH" : "POST",
        headers: {
          ...headers,
          "Content-Type": "application/json",
          "X-Upload-Content-Type": type,
          "X-Upload-Content-Length": String(size),
        },
        body: JSON.stringify(metadata),
        signal: AbortSignal.timeout(30000),
        redirect: "error",
      },
    );
    if (!response.ok)
      throw new DomainError("Google a refusé le début du transfert.", 502);
    const location = response.headers.get("location");
    if (!location || new URL(location).origin !== "https://www.googleapis.com")
      throw new DomainError("Session Drive invalide.", 502);
    let offset = 0,
      result: { id?: string; webViewLink?: string } = {};
    for (const bytes of chunks()) {
      const end = offset + bytes.length;
      const r = await this.fetcher(location, {
        method: "PUT",
        headers: {
          ...headers,
          "Content-Type": type,
          "Content-Length": String(bytes.length),
          "Content-Range": `bytes ${offset}-${end - 1}/${size}`,
        },
        body: new Uint8Array(bytes),
        signal: AbortSignal.timeout(60000),
        redirect: "manual",
      });
      if (end === size) {
        if (!r.ok)
          throw new DomainError("Google n’a pas confirmé le fichier.", 502);
        result = await r.json();
      } else if (r.status !== 308)
        throw new DomainError("Transfert Drive interrompu. Réessayez.", 502);
      offset = end;
    }
    if (!result.id || offset !== size)
      throw new DomainError("Transfert Drive incomplet.", 502);
    this.store.setConfig("drive-file:" + key, result.id);
    return (
      result.webViewLink ||
      `https://drive.google.com/file/d/${encodeURIComponent(result.id)}/view`
    );
  }
  async sync() {
    if (this.syncing) return this.status();
    if (!this.status().drive.connected)
      throw new DomainError(
        "Connectez Google Drive pour synchroniser les devoirs.",
        503,
      );
    this.syncing = true;
    try {
      const token = await this.token(),
        folder = await this.folder(token);
      const jobs = this.store
        .jobs()
        .filter((j) => j.status !== "synced")
        .slice(0, 20);
      for (const job of jobs) {
        try {
          const c = this.store.campus.read().state,
            s = c.submissions.find((x) => x.id === job.id);
          if (!s) throw new DomainError("Devoir introuvable.");
          const name = `${s.student} — ${c.lessons.find((l) => l.id === s.lesson)?.title || s.lesson}`;
          const text = Buffer.from(
            `# ${name}\n\n${s.text}\n\nProjet : ${s.url}\nStatut : ${s.status}\nRetour : ${s.feedback}\n`,
            "utf8",
          );
          const url = await this.upload(
            token,
            folder,
            job.id,
            name + ".md",
            "text/markdown",
            text.length,
            () => [text],
          );
          if (s.file) {
            const media = this.store.db
              .prepare("SELECT id,size FROM media WHERE id=? AND complete=1")
              .get(s.file.id);
            if (media)
              await this.upload(
                token,
                folder,
                s.file.id,
                s.file.name,
                "application/octet-stream",
                Number(media.size),
                () => this.mediaChunks(s.file!.id),
              );
            else {
              const f = this.store.campus.file("teacher", s.file.id);
              await this.upload(
                token,
                folder,
                s.file.id,
                s.file.name,
                "application/octet-stream",
                f.bytes.length,
                () => [f.bytes],
              );
            }
          }
          this.store.db
            .prepare(
              "UPDATE sync_jobs SET status='synced',error='',url=?,updated=? WHERE id=? AND updated=?",
            )
            .run(url, new Date().toISOString(), job.id, job.updated);
        } catch (error) {
          this.store.db
            .prepare(
              "UPDATE sync_jobs SET status='error',error=?,updated=? WHERE id=?",
            )
            .run(
              error instanceof DomainError
                ? error.message
                : "Connexion interrompue ; réessayez.",
              new Date().toISOString(),
              job.id,
            );
        }
      }
      return this.status();
    } finally {
      this.syncing = false;
    }
  }
  private *mediaChunks(id: string) {
    for (const r of this.store.bytes(id)) yield r.bytes as Uint8Array;
  }
  checkouts() {
    return this.store.db
      .prepare(
        "SELECT reference,amount,currency,email,status,url,description FROM checkout ORDER BY rowid DESC",
      )
      .all();
  }
  async checkout(input: unknown) {
    if (!this.payConfigured)
      throw new DomainError(
        "Ajoutez la clé Notch Pay et son mode dans .env.local.",
        503,
      );
    const d = z
      .object({
        amount: z.number().int().min(1).max(10000000),
        currency: z.literal("XAF"),
        email: z.string().email(),
        description: z.string().trim().min(3).max(200),
      })
      .safeParse(input);
    if (!d.success)
      throw new DomainError("Montant, description ou email invalide.");
    const reference = "lessgooo-" + crypto.randomUUID();
    this.store.db
      .prepare("INSERT INTO checkout VALUES(?,?,?,?,?,'creating','','')")
      .run(reference, d.data.amount, d.data.currency, d.data.email, "");
    try {
      const raw = await this.json("https://api.notchpay.co/payments", {
        method: "POST",
        headers: {
          Authorization: this.value("NOTCHPAY_PUBLIC_KEY"),
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ ...d.data, reference }),
      });
      const result = paymentResult.parse(raw),
        t = result.transaction;
      if (
        t.reference !== reference ||
        t.amount !== d.data.amount ||
        t.currency !== d.data.currency
      )
        throw new DomainError(
          "Le prestataire a retourné une commande différente.",
          502,
        );
      const u = new URL(result.authorization_url || "");
      if (u.origin !== "https://pay.notchpay.co" || u.username || u.password)
        throw new DomainError("Adresse de paiement non autorisée.", 502);
      this.store.db
        .prepare(
          "UPDATE checkout SET provider=?,status=?,url=?,description=? WHERE reference=?",
        )
        .run(t.id, t.status, u.toString(), d.data.description, reference);
      return { reference, url: u.toString() };
    } catch (e) {
      this.store.db
        .prepare("UPDATE checkout SET status='error' WHERE reference=?")
        .run(reference);
      throw e instanceof DomainError
        ? e
        : new DomainError(
            "Réponse de paiement invalide. Vérifiez le tableau marchand avant de réessayer.",
            502,
          );
    }
  }
  async verify(reference: string) {
    if (!this.payConfigured)
      throw new DomainError("Notch Pay non configuré.", 503);
    const expected = this.store.db
      .prepare("SELECT * FROM checkout WHERE reference=?")
      .get(reference);
    if (!expected) throw new DomainError("Commande inconnue.", 404);
    const result = paymentResult.safeParse(
      await this.json(
        `https://api.notchpay.co/payments/${encodeURIComponent(reference)}`,
        { headers: { Authorization: this.value("NOTCHPAY_PUBLIC_KEY") } },
      ),
    );
    if (!result.success)
      throw new DomainError("Réponse de paiement invalide.", 502);
    const t = result.data.transaction;
    if (
      t.reference !== reference ||
      t.id !== expected.provider ||
      t.amount !== expected.amount ||
      t.currency !== expected.currency
    )
      throw new DomainError(
        "La transaction ne correspond pas à la commande.",
        409,
      );
    this.store.db
      .prepare("UPDATE checkout SET status=? WHERE reference=?")
      .run(t.status, reference);
    return { reference, status: t.status };
  }
}
