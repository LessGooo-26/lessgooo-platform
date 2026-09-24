import { useEffect, useState } from "react";
import type { Persona } from "../campus/lib/model";
import type { Media } from "../campus/lib/workspace";
import { mediaUrl, workspaceRequest } from "../campus/lib/workspace-api";
import { useLanguage } from "../campus/lib/language";
export function SchoolMedia({ id, persona }: { id: string; persona: Persona }) {
  const { locale } = useLanguage(),
    fr = locale === "fr";
  const [file, setFile] = useState<Media | null>(null),
    [failed, setFailed] = useState(false);
  useEffect(() => {
    let live = true;
    void workspaceRequest<{ media: Media[] }>("/api/workspace", persona)
      .then((s) => {
        if (live) {
          const found = s.media.find((m) => m.id === id);
          setFile(found || null);
          setFailed(!found);
        }
      })
      .catch(() => {
        if (live) setFailed(true);
      });
    return () => {
      live = false;
    };
  }, [id, persona]);
  if (failed)
    return (
      <p role="status">
        {fr
          ? "Ce fichier est indisponible ou n'est plus partagé."
          : "This file is unavailable or no longer shared."}
      </p>
    );
  if (!file)
    return (
      <p role="status">{fr ? "Chargement du fichier…" : "Loading file…"}</p>
    );
  return (
    <div className="school-media">
      {file.preview.startsWith("video/") ? (
        <video
          controls
          preload="metadata"
          src={mediaUrl(id, persona, true)}
          aria-label={file.name}
        />
      ) : file.preview.startsWith("audio/") ? (
        <audio
          controls
          preload="metadata"
          src={mediaUrl(id, persona, true)}
          aria-label={file.name}
        />
      ) : file.preview.startsWith("image/") ? (
        <img
          loading="lazy"
          src={mediaUrl(id, persona, true)}
          alt={file.label || file.name}
        />
      ) : (
        <p>
          {fr
            ? "Téléchargez ce format pour l'ouvrir dans une application compatible."
            : "Download this format to open it in a compatible application."}
        </p>
      )}
      <a href={mediaUrl(id, persona)} download>
        {fr ? "Télécharger" : "Download"} · {file.name} (
        {Math.ceil(file.size / 1024)} Ko)
      </a>
    </div>
  );
}
