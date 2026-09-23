import { useState } from "react";
import { Image, Monitor, Save, SlidersHorizontal } from "lucide-react";
import { Button } from "./components/ui/button";
import { useLanguage, tx } from "./lib/language";
import type { Gallery, Media } from "./lib/workspace";
import type { Persona } from "./lib/model";
import { post } from "./lib/workspace-api";

export function PhotoOptions({
  file,
  gallery,
  persona,
  editable,
  background,
  reload,
  remove,
}: {
  file: Media;
  gallery: Gallery;
  persona: Persona;
  editable: boolean;
  background?: string;
  reload: () => Promise<void>;
  remove: () => Promise<void>;
}) {
  const { t } = useLanguage();
  const [label, setLabel] = useState(file.label || "");
  const [photoDate, setPhotoDate] = useState(file.photoDate || "");
  const [busy, setBusy] = useState(false);
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState("");
  const update = async (action: string, data: unknown) => {
    setBusy(true);
    setSaved(false);
    setError("");
    try {
      await post("/api/workspace", persona, { action, data });
      await reload();
      if (action === "background")
        window.dispatchEvent(new Event("campus-profile-updated"));
      setSaved(true);
    } catch (e) {
      setError((e as Error).message);
    } finally {
      setBusy(false);
    }
  };
  return (
    <details className="photo-options">
      <summary>
        <SlidersHorizontal size={16} />
        {t("Photo options", "Options de la photo")}
      </summary>
      <div className="photo-options-body">
        {editable && (
          <form
            onSubmit={(e) => {
              e.preventDefault();
              void update("photoDetails", { id: file.id, label, photoDate });
            }}
          >
            <label>
              {t("Photo label", "Légende de la photo")}
              <input
                maxLength={160}
                value={label}
                onChange={(e) => setLabel(e.target.value)}
                placeholder={t(
                  "For example: My first project",
                  "Par exemple : Mon premier projet",
                )}
              />
            </label>
            <label>
              {t("Photo date (optional)", "Date de la photo (facultative)")}
              <input
                type="date"
                value={photoDate}
                onChange={(e) => setPhotoDate(e.target.value)}
              />
            </label>
            <p>
              {t(
                "Choose when the photo was taken. Leave empty to show the date added.",
                "Indiquez la date de prise de vue. Sinon, la date d’ajout sera affichée.",
              )}
            </p>
            <Button disabled={busy} variant="outline">
              <Save size={16} />
              {t("Save details", "Enregistrer les détails")}
            </Button>
          </form>
        )}
        <div className="photo-background-actions">
          <strong>{t("Set as background", "Définir comme fond")}</strong>
          {editable && (
            <Button
              disabled={busy}
              variant="outline"
              onClick={() =>
                void update("gallery", {
                  ...gallery,
                  cover: gallery.cover === file.id ? "" : file.id,
                })
              }
            >
              <Image size={16} />
              {gallery.cover === file.id
                ? t(
                    "Reset gallery background",
                    "Réinitialiser le fond de la galerie",
                  )
                : t("Gallery background", "Fond de la galerie")}
            </Button>
          )}
          <Button
            disabled={busy}
            variant="outline"
            onClick={() =>
              void update("background", {
                id: background === file.id ? "" : file.id,
              })
            }
          >
            <Monitor size={16} />
            {background === file.id
              ? t(
                  "Reset my campus background",
                  "Réinitialiser mon fond de campus",
                )
              : t("My campus background", "Fond de mon campus")}
          </Button>
          <p>
            {t(
              "Your campus background is a personal preference. Gallery backgrounds are visible to everyone who can view that gallery.",
              "Le fond de votre campus est personnel. Le fond d’une galerie est visible par les personnes qui y ont accès.",
            )}
          </p>
        </div>
        {editable && (
          <Button
            disabled={busy}
            variant="ghost"
            onClick={async () => {
              setBusy(true);
              try {
                await remove();
              } finally {
                setBusy(false);
              }
            }}
          >
            {t("Remove from gallery", "Retirer de la galerie")}
          </Button>
        )}
        <span role="status">{saved && t("Saved", "Enregistré")}</span>
        {error && <p role="alert">{tx(error)}</p>}
      </div>
    </details>
  );
}
