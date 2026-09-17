import { useEffect, useRef, useState } from "react";
import {
  ArrowLeft,
  Camera,
  Download,
  FolderPlus,
  ImagePlus,
  Upload,
  Video,
  FileText,
  Save,
  X,
} from "lucide-react";
import { toast } from "sonner";
import { Button } from "./components/ui/button";
import { HelpTip } from "./WorkspacePanel";
import type { Gallery, Media, Profile } from "./lib/workspace";
import type { Campus, Persona } from "./lib/model";
import { progress } from "./lib/model";
import {
  mediaUrl,
  post,
  uploadMedia,
  workspaceRequest,
} from "./lib/workspace-api";
import { useLanguage } from "./lib/language";
import "./personal-space.css";

export type PersonalData = {
  media: Media[];
  galleries: Gallery[];
  profile: Profile;
};
type Props = {
  persona: Persona;
  data: PersonalData;
  reload: () => Promise<void>;
};
const ownerFor = (p: Persona) =>
  ({ teacher: "teacher", parent: "parent", adult: "alex", child: "maya" })[p];
const sizeLabel = (n: number) =>
  n < 1024 * 1024
    ? `${Math.ceil(n / 1024)} KB`
    : `${(n / 1024 / 1024).toFixed(1)} MB`;

function UploadBox({
  persona,
  gallery = "",
  reload,
  photos = false,
}: {
  persona: Persona;
  gallery?: string;
  reload: () => Promise<void>;
  photos?: boolean;
}) {
  const { t } = useLanguage();
  const [busy, setBusy] = useState(false),
    [percent, setPercent] = useState(0),
    [label, setLabel] = useState(""),
    [error, setError] = useState(""),
    [shared, setShared] = useState(false);
  const controller = useRef<AbortController | null>(null);
  useEffect(() => () => controller.current?.abort(), []);
  useEffect(() => {
    const guard = (event: Event) => {
      if (busy) {
        event.preventDefault();
        toast.info(
          t(
            "Wait for the upload, or cancel it first.",
            "Attendez le transfert ou annulez-le.",
          ),
        );
      }
    };
    window.addEventListener("campus-before-navigate", guard);
    const leave = (event: BeforeUnloadEvent) => {
      if (busy) event.preventDefault();
    };
    window.addEventListener("beforeunload", leave);
    return () => {
      window.removeEventListener("campus-before-navigate", guard);
      window.removeEventListener("beforeunload", leave);
    };
  }, [busy, t]);
  const upload = async (files: File[]) => {
    if (!files.length || busy) return;
    setBusy(true);
    setError("");
    controller.current = new AbortController();
    try {
      for (const [index, file] of files.entries()) {
        controller.current.signal.throwIfAborted();
        if (
          photos &&
          !["image/png", "image/jpeg", "image/gif", "image/webp"].includes(
            file.type,
          )
        )
          throw new Error(
            t(
              "Choose JPG, PNG, GIF or WebP photos.",
              "Choisissez des photos JPG, PNG, GIF ou WebP.",
            ),
          );
        setLabel(`${index + 1}/${files.length} · ${file.name}`);
        setPercent(0);
        await uploadMedia(
          file,
          persona,
          setPercent,
          "",
          shared,
          gallery,
          controller.current.signal,
        );
      }
      toast.success(t("Upload complete", "Transfert terminé"));
    } catch (e) {
      setError(
        controller.current.signal.aborted
          ? t(
              "Upload cancelled. Finished files are kept.",
              "Transfert annulé. Les fichiers terminés sont conservés.",
            )
          : (e as Error).message,
      );
    } finally {
      setBusy(false);
      setLabel("");
      await reload();
    }
  };
  return (
    <section
      className="upload-zone"
      onDragOver={(e) => e.preventDefault()}
      onDrop={(e) => {
        e.preventDefault();
        void upload(Array.from(e.dataTransfer.files));
      }}
    >
      <div className="upload-symbol">{photos ? <ImagePlus /> : <Upload />}</div>
      <div>
        <h2>
          {photos
            ? t(
                "Add photos to this gallery",
                "Ajouter des photos à cette galerie",
              )
            : t(
                "Drop a video or file here",
                "Déposez une vidéo ou un fichier ici",
              )}
        </h2>
        <p>
          {photos
            ? t(
                "JPG, PNG, GIF or WebP. Pick several photos at once.",
                "JPG, PNG, GIF ou WebP. Choisissez plusieurs photos à la fois.",
              )
            : t(
                "All file types · Up to 200 MB each. MP4 and WebM work best for playback.",
                "Tous les formats · 200 Mo par fichier. MP4 et WebM sont conseillés pour la lecture.",
              )}
        </p>
      </div>
      <label className={`file-picker ${busy ? "disabled" : ""}`}>
        {photos
          ? t("Choose photos", "Choisir des photos")
          : t("Choose files", "Choisir des fichiers")}
        <input
          type="file"
          multiple
          accept={
            photos ? "image/jpeg,image/png,image/gif,image/webp" : undefined
          }
          disabled={busy}
          onChange={(e) => {
            void upload(Array.from(e.target.files || []));
            e.target.value = "";
          }}
        />
      </label>
      {persona === "teacher" && !gallery && (
        <label className="upload-sharing">
          <input
            type="checkbox"
            checked={shared}
            disabled={busy}
            onChange={(e) => setShared(e.target.checked)}
          />
          {t("Share with the campus", "Partager avec le campus")}{" "}
          <HelpTip>
            {t(
              "Shared files can be viewed by all demo profiles. Leave this off for your own files.",
              "Les fichiers partagés sont visibles par tous les profils de démo. Désactivez pour vos fichiers personnels.",
            )}
          </HelpTip>
        </label>
      )}
      {busy && (
        <div className="upload-status" role="status">
          <span>
            {label} · {percent}%
          </span>
          <progress value={percent} max={100} />
          <Button variant="outline" onClick={() => controller.current?.abort()}>
            <X size={16} />
            {t("Cancel upload", "Annuler le transfert")}
          </Button>
        </div>
      )}
      {error && (
        <p role="alert" className="upload-error">
          {error}
        </p>
      )}
    </section>
  );
}

export function MediaLibrary({ persona, data, reload }: Props) {
  const { t } = useLanguage();
  const [query, setQuery] = useState(""),
    [filter, setFilter] = useState("all");
  const media = data.media.filter(
    (m) =>
      m.name.toLowerCase().includes(query.toLowerCase()) &&
      (filter === "all" ||
        (filter === "videos"
          ? m.type.startsWith("video/") || m.preview.startsWith("video/")
          : m.preview.startsWith("image/"))),
  );
  return (
    <div className="personal-stack">
      <UploadBox persona={persona} reload={reload} />
      <div className="media-filters">
        <input
          aria-label={t("Find a file", "Chercher un fichier")}
          placeholder={t("Find a file…", "Chercher un fichier…")}
          value={query}
          onChange={(e) => setQuery(e.target.value)}
        />
        <select
          aria-label={t("File type", "Type de fichier")}
          value={filter}
          onChange={(e) => setFilter(e.target.value)}
        >
          <option value="all">{t("All files", "Tous les fichiers")}</option>
          <option value="videos">{t("Videos", "Vidéos")}</option>
          <option value="photos">{t("Photos", "Photos")}</option>
        </select>
        <span>
          {media.length} {t("files", "fichiers")}
        </span>
      </div>
      <div className="media-grid">
        {media.map((m) => (
          <MediaCard key={m.id} file={m} persona={persona} />
        ))}
      </div>
      {!media.length && (
        <div className="friendly-empty">
          <Video />
          <h2>
            {t(
              "Your next lesson can start here",
              "Votre prochaine leçon peut commencer ici",
            )}
          </h2>
          <p>
            {t(
              "Upload a video, a worksheet or a project. It will stay saved on this computer.",
              "Ajoutez une vidéo, un exercice ou un projet. Il restera enregistré sur cet ordinateur.",
            )}
          </p>
        </div>
      )}
    </div>
  );
}
function MediaCard({
  file,
  persona,
  children,
}: {
  file: Media;
  persona: Persona;
  children?: React.ReactNode;
}) {
  const { t } = useLanguage();
  const [playbackError, setPlaybackError] = useState(false);
  return (
    <article className="media-card">
      <div className="media-preview">
        {file.preview.startsWith("video/") ? (
          <video
            controls
            preload="metadata"
            playsInline
            aria-label={file.name}
            src={mediaUrl(file.id, persona, true)}
            onError={() => setPlaybackError(true)}
          />
        ) : file.preview.startsWith("image/") ? (
          <a
            href={mediaUrl(file.id, persona, true)}
            target="_blank"
            rel="noreferrer"
            aria-label={t("Open photo: ", "Ouvrir la photo : ") + file.name}
          >
            <img
              src={mediaUrl(file.id, persona, true)}
              alt={file.name}
              loading="lazy"
            />
          </a>
        ) : (
          <FileText size={44} />
        )}
      </div>
      <div className="media-card-body">
        <h3>{file.name}</h3>
        <p>
          {sizeLabel(file.size)} ·{" "}
          {file.shared ? t("Campus", "Campus") : t("Personal", "Personnel")}
        </p>
        {playbackError && (
          <p role="status">
            {t(
              "This browser cannot play this video. Download it to watch with a video player.",
              "Ce navigateur ne peut pas lire cette vidéo. Téléchargez-la pour la regarder avec un lecteur vidéo.",
            )}
          </p>
        )}
        <a
          className="download-link"
          href={mediaUrl(file.id, persona)}
          download={file.name}
        >
          <Download size={17} />
          {t("Download", "Télécharger")}
        </a>
        {children}
      </div>
    </article>
  );
}

export function Galleries({ persona, data, reload }: Props) {
  const { t } = useLanguage();
  const [selected, setSelected] = useState(""),
    [editing, setEditing] = useState<Partial<Gallery> | null>(null),
    [busy, setBusy] = useState(false),
    [error, setError] = useState("");
  const active = data.galleries.find((g) => g.id === selected),
    own = ownerFor(persona),
    photos = data.media.filter((m) => m.preview.startsWith("image/"));
  const save = async (event: React.FormEvent) => {
    event.preventDefault();
    setBusy(true);
    setError("");
    try {
      await post("/api/workspace", persona, {
        action: "gallery",
        data: editing,
      });
      await reload();
      setEditing(null);
      toast.success(t("Gallery saved", "Galerie enregistrée"));
    } catch (e) {
      setError((e as Error).message);
    } finally {
      setBusy(false);
    }
  };
  const move = async (file: Media, gallery: string) => {
    try {
      await post("/api/workspace", persona, {
        action: "mediaGallery",
        data: { id: file.id, gallery },
      });
      await reload();
    } catch (e) {
      toast.error((e as Error).message);
    }
  };
  return (
    <div className="personal-stack">
      <div className="gallery-toolbar">
        {active ? (
          <Button variant="outline" onClick={() => setSelected("")}>
            <ArrowLeft size={18} />
            {t("All galleries", "Toutes les galeries")}
          </Button>
        ) : (
          <p>
            {t(
              "One gallery for each story: classes, projects, events or family moments.",
              "Une galerie pour chaque histoire : cours, projets, événements ou moments en famille.",
            )}
          </p>
        )}
        <Button
          onClick={() =>
            setEditing({ name: "", purpose: "", color: "blue", shared: false })
          }
        >
          <FolderPlus size={18} />
          {t("New gallery", "Nouvelle galerie")}
        </Button>
      </div>
      {editing && (
        <form className="panel profile-form" onSubmit={save}>
          <h2>
            {editing.id
              ? t("Edit gallery", "Modifier la galerie")
              : t("Create a gallery", "Créer une galerie")}
          </h2>
          <label>
            {t("Gallery name", "Nom de la galerie")}
            <input
              required
              maxLength={100}
              value={editing.name}
              onChange={(e) => setEditing({ ...editing, name: e.target.value })}
              placeholder={t(
                "For example: Our first projects",
                "Par exemple : Nos premiers projets",
              )}
            />
          </label>
          <label>
            {t("What is it for?", "À quoi sert-elle ?")}
            <textarea
              maxLength={500}
              value={editing.purpose}
              onChange={(e) =>
                setEditing({ ...editing, purpose: e.target.value })
              }
            />
          </label>
          <label>
            {t("Gallery colour", "Couleur de la galerie")}
            <select
              value={editing.color}
              onChange={(e) =>
                setEditing({
                  ...editing,
                  color: e.target.value as Gallery["color"],
                })
              }
            >
              {[
                ["blue", t("Blue", "Bleu")],
                ["green", t("Green", "Vert")],
                ["yellow", t("Yellow", "Jaune")],
                ["orange", t("Orange", "Orange")],
                ["red", t("Red", "Rouge")],
                ["navy", t("Navy", "Bleu nuit")],
              ].map(([v, l]) => (
                <option key={v} value={v}>
                  {l}
                </option>
              ))}
            </select>
          </label>
          {persona === "teacher" && (
            <label className="checkbox-label">
              <input
                type="checkbox"
                checked={editing.shared}
                onChange={(e) =>
                  setEditing({ ...editing, shared: e.target.checked })
                }
              />
              {t(
                "Share this gallery with the campus",
                "Partager cette galerie avec le campus",
              )}
              <HelpTip>
                {t(
                  "This also changes who can see all photos in this gallery.",
                  "Cela change aussi la visibilité de toutes les photos de cette galerie.",
                )}
              </HelpTip>
            </label>
          )}
          <div className="form-actions">
            <Button
              type="button"
              variant="outline"
              onClick={() => setEditing(null)}
            >
              {t("Cancel", "Annuler")}
            </Button>
            <Button disabled={busy}>
              <Save size={16} />
              {t("Save gallery", "Enregistrer la galerie")}
            </Button>
          </div>
          {error && <p role="alert">{error}</p>}
        </form>
      )}
      {!active && (
        <div className="gallery-grid">
          {data.galleries.map((g) => {
            const cover = photos.find((m) => m.gallery === g.id);
            return (
              <button
                className={`gallery-card accent-${g.color}`}
                key={g.id}
                onClick={() => setSelected(g.id)}
              >
                <div className="gallery-cover">
                  {cover ? (
                    <img
                      src={mediaUrl(cover.id, persona, true)}
                      alt=""
                      loading="lazy"
                    />
                  ) : (
                    <Camera size={48} />
                  )}
                </div>
                <div>
                  <h2>{g.name}</h2>
                  <p>{g.purpose}</p>
                  <small>
                    {photos.filter((m) => m.gallery === g.id).length}{" "}
                    {t("photos", "photos")} ·{" "}
                    {g.shared
                      ? t("Campus", "Campus")
                      : t("Personal", "Personnel")}
                  </small>
                </div>
              </button>
            );
          })}
        </div>
      )}
      {!active && !data.galleries.length && (
        <div className="friendly-empty">
          <Camera />
          <h2>
            {t(
              "Make room for your memories",
              "Faites une place à vos souvenirs",
            )}
          </h2>
          <p>
            {t(
              "Create your first gallery above, then add photos.",
              "Créez votre première galerie ci-dessus, puis ajoutez des photos.",
            )}
          </p>
        </div>
      )}
      {active && (
        <>
          <div className={`gallery-heading accent-${active.color}`}>
            <Camera />
            <div>
              <h2>{active.name}</h2>
              <p>{active.purpose}</p>
            </div>
            {active.owner === own && (
              <Button variant="outline" onClick={() => setEditing(active)}>
                {t("Edit gallery", "Modifier la galerie")}
              </Button>
            )}
          </div>
          {active.owner === own && (
            <UploadBox
              persona={persona}
              gallery={active.id}
              reload={reload}
              photos
            />
          )}
          <div className="media-grid">
            {photos
              .filter((m) => m.gallery === active.id)
              .map((file) => (
                <MediaCard key={file.id} file={file} persona={persona}>
                  {file.owner === own && (
                    <Button variant="ghost" onClick={() => void move(file, "")}>
                      {t("Remove from gallery", "Retirer de la galerie")}
                    </Button>
                  )}
                </MediaCard>
              ))}
          </div>
          {active.owner === own &&
            photos.some(
              (m) => !m.gallery && m.owner === own && !m.submission,
            ) && (
              <section className="panel">
                <h2>
                  {t(
                    "Add photos already in your files",
                    "Ajouter des photos déjà dans vos fichiers",
                  )}
                </h2>
                <div className="existing-photos">
                  {photos
                    .filter(
                      (m) => !m.gallery && m.owner === own && !m.submission,
                    )
                    .map((file) => (
                      <button
                        key={file.id}
                        onClick={() => void move(file, active.id)}
                      >
                        <img
                          src={mediaUrl(file.id, persona, true)}
                          alt={file.name}
                          loading="lazy"
                        />
                        <span>
                          {t("Add", "Ajouter")} · {file.name}
                        </span>
                      </button>
                    ))}
                </div>
              </section>
            )}
        </>
      )}
    </div>
  );
}

export function ProfileEditor({ persona, data, reload }: Props) {
  const { t } = useLanguage();
  const [draft, setDraft] = useState(data.profile),
    [busy, setBusy] = useState(false),
    [error, setError] = useState("");
  const dirty = (["name", "email", "phone", "bio", "avatar"] as const).some(
    (key) => draft[key] !== data.profile[key],
  );
  useEffect(() => {
    const guard = (event: Event) => {
      if (dirty || busy) {
        event.preventDefault();
        toast.info(
          t(
            "Save your profile or undo your changes first.",
            "Enregistrez votre profil ou annulez vos modifications.",
          ),
        );
      }
    };
    const leave = (event: BeforeUnloadEvent) => {
      if (dirty || busy) event.preventDefault();
    };
    window.addEventListener("campus-before-navigate", guard);
    window.addEventListener("beforeunload", leave);
    return () => {
      window.removeEventListener("campus-before-navigate", guard);
      window.removeEventListener("beforeunload", leave);
    };
  }, [dirty, busy, t]);
  const photo = async (file?: File) => {
    if (!file) return;
    setBusy(true);
    setError("");
    try {
      if (
        file.size > 8 * 1024 * 1024 ||
        !["image/jpeg", "image/png", "image/gif", "image/webp"].includes(
          file.type,
        )
      )
        throw new Error(
          t(
            "Choose JPG, PNG, GIF or WebP, up to 8 MB.",
            "Choisissez JPG, PNG, GIF ou WebP, jusqu’à 8 Mo.",
          ),
        );
      const id = await uploadMedia(file, persona, () => {});
      setDraft((d) => ({ ...d, avatar: id }));
    } catch (e) {
      setError((e as Error).message);
    } finally {
      setBusy(false);
    }
  };
  const save = async (event: React.FormEvent) => {
    event.preventDefault();
    setBusy(true);
    setError("");
    try {
      const saved = await post<PersonalData>("/api/workspace", persona, {
        action: "profile",
        data: draft,
      });
      setDraft(saved.profile);
      await reload();
      window.dispatchEvent(new Event("campus-profile-updated"));
      toast.success(t("Profile saved", "Profil enregistré"));
    } catch (e) {
      setError((e as Error).message);
    } finally {
      setBusy(false);
    }
  };
  return (
    <form className="panel profile-form" onSubmit={save}>
      <div className="profile-cover">
        <img
          src={`${import.meta.env.BASE_URL}logo-lessgooo.png`}
          alt="LESSGOOO"
        />
        <span>{t("Your space to grow", "Votre espace pour grandir")}</span>
      </div>
      <div className="profile-photo-row">
        <div className="profile-photo">
          {draft.avatar ? (
            <img
              src={mediaUrl(draft.avatar, persona, true)}
              alt={t("My profile photo", "Ma photo de profil")}
            />
          ) : (
            <span>{draft.name.slice(0, 1)}</span>
          )}
        </div>
        <label className="file-picker">
          <Camera size={18} />
          {t("Change photo", "Changer la photo")}
          <input
            type="file"
            accept="image/jpeg,image/png,image/gif,image/webp"
            disabled={busy}
            onChange={(e) => {
              void photo(e.target.files?.[0]);
              e.target.value = "";
            }}
          />
        </label>
        {draft.avatar && (
          <Button
            type="button"
            variant="ghost"
            onClick={() => setDraft({ ...draft, avatar: "" })}
          >
            {t("Remove photo", "Retirer la photo")}
          </Button>
        )}
      </div>
      <div className="profile-fields">
        {(
          [
            ["name", t("Your name", "Votre nom"), "text"],
            ["email", t("Contact email", "Email de contact"), "email"],
            ["phone", t("Phone (optional)", "Téléphone (facultatif)"), "tel"],
          ] as const
        ).map(([key, label, type]) => (
          <label key={key}>
            {label}
            <input
              required={key === "name"}
              type={type}
              maxLength={key === "phone" ? 40 : key === "email" ? 254 : 100}
              value={draft[key]}
              onChange={(e) => setDraft({ ...draft, [key]: e.target.value })}
            />
          </label>
        ))}
      </div>
      <label>
        {t("About me (optional)", "À propos de moi (facultatif)")}
        <textarea
          maxLength={500}
          rows={3}
          value={draft.bio}
          onChange={(e) => setDraft({ ...draft, bio: e.target.value })}
        />
      </label>
      <p className="profile-note">
        {t(
          "These details belong to this local profile. Changing your contact email does not change your Google or payment account.",
          "Ces informations appartiennent à ce profil local. Changer votre email de contact ne change pas votre compte Google ou de paiement.",
        )}{" "}
        <HelpTip>
          {t(
            "Your role and your child's access stay the same. Never put a password in your profile.",
            "Votre rôle et l’accès de votre enfant restent les mêmes. Ne mettez jamais de mot de passe dans votre profil.",
          )}
        </HelpTip>
      </p>
      <div className="form-actions">
        <Button
          variant="outline"
          type="button"
          disabled={busy || !dirty}
          onClick={() => setDraft(data.profile)}
        >
          {t("Undo changes", "Annuler les modifications")}
        </Button>
        <Button disabled={busy || !dirty}>
          <Save size={17} />
          {t("Save profile", "Enregistrer le profil")}
        </Button>
      </div>
      {error && (
        <p role="alert" className="upload-error">
          {error}
        </p>
      )}
    </form>
  );
}

export function ProfileButton({
  persona,
  onClick,
}: {
  persona: Persona;
  onClick: () => void;
}) {
  const { t } = useLanguage();
  const [profile, setProfile] = useState<Profile | null>(null);
  useEffect(() => {
    let active = true;
    const load = () =>
      workspaceRequest<PersonalData>("/api/workspace", persona)
        .then((d) => {
          if (active) setProfile(d.profile);
        })
        .catch(() => {});
    void load();
    window.addEventListener("campus-profile-updated", load);
    return () => {
      active = false;
      window.removeEventListener("campus-profile-updated", load);
    };
  }, [persona]);
  return (
    <button
      className="profile-button"
      onClick={onClick}
      aria-label={t("Edit my profile", "Modifier mon profil")}
      title={profile?.name}
    >
      {profile?.avatar ? (
        <img src={mediaUrl(profile.avatar, persona, true)} alt="" />
      ) : (
        <span>{profile?.name[0] || <Camera size={18} />}</span>
      )}
      <span className="profile-button-label">
        {t("My profile", "Mon profil")}
      </span>
    </button>
  );
}

export function ParentHome({
  c,
  go,
}: {
  c: Campus;
  go: (page: string) => void;
}) {
  const { t } = useLanguage(),
    child = c.students[0];
  const percent = child ? progress(c, child.id).percent : 0;
  return (
    <section className="parent-home">
      <div className="parent-welcome">
        <span className="parent-kicker">
          {t("A little progress, every day", "Un petit progrès chaque jour")}
        </span>
        <h2>
          {child?.name || t("My child", "Mon enfant")} ·{" "}
          {t("Let's keep growing", "Continuons à grandir")}
        </h2>
        <p>
          {t(
            "See what your child is learning, check their work and ask us for help.",
            "Découvrez ce que votre enfant apprend, consultez son travail et demandez de l’aide.",
          )}
        </p>
        <div className="parent-progress">
          <progress max={100} value={percent} />
          <strong>
            {percent}% {t("of lessons approved", "des leçons validées")}
          </strong>
        </div>
      </div>
      <div className="parent-actions">
        {[
          [
            "projects",
            t("My child's homework", "Les devoirs de mon enfant"),
            t("Read the teacher's feedback", "Lire les retours du formateur"),
            "blue",
          ],
          [
            "sessions",
            t("Classes", "Les cours"),
            t(
              "See class times and Zoom links",
              "Voir les horaires et liens Zoom",
            ),
            "orange",
          ],
          [
            "galleries",
            t("Photo galleries", "Les galeries photo"),
            t(
              "Keep projects and memories together",
              "Regrouper projets et souvenirs",
            ),
            "green",
          ],
          [
            "help",
            t("Ask for help", "Demander de l’aide"),
            t(
              "Send a question in the campus",
              "Poser une question dans le campus",
            ),
            "yellow",
          ],
        ].map(([id, title, description, color], i) => (
          <button
            key={id}
            className={`parent-action accent-${color}`}
            onClick={() => go(id)}
          >
            <b>0{i + 1}</b>
            <h3>{title}</h3>
            <p>{description}</p>
            <span aria-hidden="true">↗</span>
          </button>
        ))}
      </div>
    </section>
  );
}
