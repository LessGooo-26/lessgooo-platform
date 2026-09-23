import type { Persona } from "./model";
import { tx } from "./language";
export async function workspaceRequest<T>(
  path: string,
  p: Persona,
  init?: RequestInit,
): Promise<T> {
  const r = await fetch(path, {
    ...init,
    headers: { "x-campus-persona": p, ...init?.headers },
  });
  if (!r.headers.get("content-type")?.includes("application/json"))
    throw new Error(
      tx("Ouvrez le campus depuis le serveur local pour enregistrer."),
    );
  const d = await r.json();
  if (!r.ok) throw new Error(tx(d.error || "Action impossible."));
  return d;
}
export const post = <T>(path: string, p: Persona, data: unknown) =>
  workspaceRequest<T>(path, p, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  });
export async function uploadMedia(
  file: File,
  p: Persona,
  onProgress: (n: number) => void,
  submission = "",
  shared = false,
  gallery = "",
  signal?: AbortSignal,
) {
  if (file.size > 200 * 1024 * 1024)
    throw new Error(tx("La limite est de 200 Mo par fichier."));
  if (!file.size) throw new Error(tx("Le fichier est vide."));
  const start = await post<{ id: string; chunkBytes: number }>(
    "/api/media/start",
    p,
    {
      name: file.name,
      type: file.type,
      size: file.size,
      submission,
      shared,
      gallery,
    },
  );
  try {
    for (let offset = 0; offset < file.size; offset += start.chunkBytes) {
      const end = Math.min(file.size, offset + start.chunkBytes);
      await workspaceRequest(
        `/api/media/chunk?id=${encodeURIComponent(start.id)}&offset=${offset}`,
        p,
        {
          method: "PUT",
          headers: { "Content-Type": "application/octet-stream" },
          body: file.slice(offset, end),
          signal,
        },
      );
      onProgress(Math.round((end / file.size) * 100));
    }
    signal?.throwIfAborted();
    await post("/api/media/finish?id=" + encodeURIComponent(start.id), p, {});
    return start.id;
  } catch (error) {
    await post(
      "/api/media/cancel?id=" + encodeURIComponent(start.id),
      p,
      {},
    ).catch(() => {});
    throw error;
  }
}
export const mediaUrl = (id: string, persona: Persona, inline = false) =>
  `/api/media?id=${encodeURIComponent(id)}&persona=${persona}${inline ? "&inline=1" : ""}`;
