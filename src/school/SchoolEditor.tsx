import { useEffect, useRef, useState, type ReactNode } from "react";
import { useLanguage } from "../campus/lib/language";
import { uploadMedia } from "../campus/lib/workspace-api";
import {
  catalogSchema,
  pair,
  resourceKinds,
  type CatalogSnapshot,
  type SchoolCatalog,
  type Copy,
  type Chapter,
} from "./model";
import { schoolError } from "./api";

type Collection =
  "classes" | "subjects" | "chapters" | "resources" | "timetable";
type Section = "general" | Collection;
const emptyCopy = () => pair("", "");
const identifier = () => crypto.randomUUID().slice(0, 8);
function newItem(key: Collection, c: SchoolCatalog): Record<string, unknown> {
  const id = `${key}-${identifier()}`;
  if (key === "classes")
    return {
      id,
      name: emptyCopy(),
      system: "fr",
      cycle: "secondary",
      exam: "",
      tuition: null,
      tutoring: false,
      active: true,
    };
  if (key === "subjects")
    return {
      id,
      name: emptyCopy(),
      description: emptyCopy(),
      prerequisites: emptyCopy(),
      active: true,
    };
  if (key === "chapters")
    return {
      id,
      title: emptyCopy(),
      subjectId: c.subjects[0].id,
      classIds: [c.classes.find((v) => v.tutoring)?.id || c.classes[0].id],
      order: 1,
      goal: emptyCopy(),
      prerequisites: emptyCopy(),
      lesson: emptyCopy(),
      example: emptyCopy(),
      challenge: emptyCopy(),
      solution: emptyCopy(),
      questions: [
        {
          id: `${id}-q1`,
          prompt: emptyCopy(),
          choices: [emptyCopy(), emptyCopy()],
          answer: 0,
          explanation: emptyCopy(),
        },
      ],
      published: false,
    };
  if (key === "resources")
    return {
      id,
      title: emptyCopy(),
      description: emptyCopy(),
      kind: "document",
      classIds: [],
      subjectId: "",
      url: "",
      mediaId: "",
      source: "LESSGOOO",
      year: c.schoolYear,
      language: "both",
      status: "review",
      rights: emptyCopy(),
      published: false,
    };
  const slot = c.availability[0] || { day: 1, start: "16:00", end: "18:00" };
  return {
    id,
    classId: c.classes.find((v) => v.tutoring)?.id || c.classes[0].id,
    subjectId: c.subjects[0].id,
    ...slot,
    location: "",
    meetingUrl: "",
    status: "draft",
  };
}

export default function SchoolEditor({
  snapshot,
  onSave,
}: {
  snapshot: CatalogSnapshot;
  onSave: (c: SchoolCatalog, version: number) => Promise<CatalogSnapshot>;
}) {
  const { locale } = useLanguage(),
    fr = locale === "fr",
    text = (f: string, e: string) => (fr ? f : e);
  const [draft, setDraft] = useState(() => structuredClone(snapshot.catalog)),
    [version, setVersion] = useState(snapshot.version),
    [dirty, setDirty] = useState(false),
    [section, setSection] = useState<Section>("general"),
    [selected, setSelected] = useState(""),
    [filter, setFilter] = useState(""),
    [busy, setBusy] = useState(false),
    [message, setMessage] = useState(""),
    [issues, setIssues] = useState<string[]>([]),
    [percent, setPercent] = useState(0);
  const fileRef = useRef<HTMLInputElement>(null);
  const update = (next: SchoolCatalog) => {
    setDraft(next);
    setDirty(true);
    setMessage("");
    setIssues([]);
  };
  useEffect(() => {
    const before = (e: BeforeUnloadEvent) => {
      if (dirty || busy) e.preventDefault();
    };
    const navigate = (e: Event) => {
      if (dirty || busy) {
        e.preventDefault();
        setMessage(
          fr
            ? "Enregistrez ou abandonnez votre brouillon avant de quitter la gestion."
            : "Save or discard your draft before leaving management.",
        );
      }
    };
    window.addEventListener("beforeunload", before);
    window.addEventListener("campus-before-navigate", navigate);
    return () => {
      window.removeEventListener("beforeunload", before);
      window.removeEventListener("campus-before-navigate", navigate);
    };
  }, [dirty, busy, fr]);
  const names: Record<Section, string> = {
    general: text("Tarifs et ouverture", "Fees and opening hours"),
    classes: text("Classes et séries", "Classes and streams"),
    subjects: text("Matières", "Subjects"),
    chapters: text("Chapitres et quiz", "Chapters and quizzes"),
    resources: text("Documents et médias", "Documents and media"),
    timetable: text("Emplois du temps", "Timetables"),
  };
  const days = fr
    ? ["Lundi", "Mardi", "Mercredi", "Jeudi", "Vendredi", "Samedi", "Dimanche"]
    : [
        "Monday",
        "Tuesday",
        "Wednesday",
        "Thursday",
        "Friday",
        "Saturday",
        "Sunday",
      ];
  const entity =
    section === "general"
      ? undefined
      : (draft[section].find((v) => v.id === selected) as
          Record<string, unknown> | undefined);
  const change = (key: string, value: unknown) => {
    if (section === "general" || !entity) return;
    update({
      ...draft,
      [section]: draft[section].map((v) =>
        v.id === selected ? { ...v, [key]: value } : v,
      ),
    });
  };
  const label = (v: Record<string, unknown>): string => {
    const copy = (v.name || v.title) as Copy | undefined;
    return (
      copy?.[locale] ||
      (v.classId
        ? `${draft.classes.find((c) => c.id === v.classId)?.name[locale] || v.classId} · ${days[Number(v.day) - 1]} ${v.start}`
        : text("Nouvel élément", "New item"))
    );
  };
  const bilingual = (
    key: string,
    title: string,
    long = false,
    hint?: string,
  ): ReactNode => {
    const value = entity?.[key] as Copy;
    return (
      <fieldset className="school-bilingual">
        <legend>{title}</legend>
        {hint && <p className="school-muted">{hint}</p>}
        {(["fr", "en"] as const).map((lang) => (
          <label key={lang}>
            {lang === "fr"
              ? text("Version française", "French version")
              : text("Version anglaise", "English version")}
            {long ? (
              <textarea
                rows={key === "lesson" ? 7 : 3}
                required
                value={value[lang]}
                onChange={(e) =>
                  change(key, { ...value, [lang]: e.target.value })
                }
              />
            ) : (
              <input
                required
                value={value[lang]}
                onChange={(e) =>
                  change(key, { ...value, [lang]: e.target.value })
                }
              />
            )}
          </label>
        ))}
      </fieldset>
    );
  };
  const field = (key: string, title: string, type = "text", hint?: string) => (
    <label>
      {title}
      <input
        type={type}
        value={(entity?.[key] as string | number) ?? ""}
        step={type === "number" ? 1 : undefined}
        min={type === "number" ? 0 : undefined}
        onChange={(e) =>
          change(
            key,
            type === "number"
              ? e.target.value === "" && key === "tuition"
                ? null
                : Number(e.target.value)
              : e.target.value,
          )
        }
      />
      {hint && <small>{hint}</small>}
    </label>
  );
  const choice = (key: string, title: string, values: [string, string][]) => (
    <label>
      {title}
      <select
        value={String(entity?.[key])}
        onChange={(e) =>
          change(key, key === "day" ? Number(e.target.value) : e.target.value)
        }
      >
        {values.map(([id, name]) => (
          <option key={id} value={id}>
            {name}
          </option>
        ))}
      </select>
    </label>
  );
  const check = (key: string, title: string) => (
    <label className="school-choice">
      <input
        type="checkbox"
        checked={Boolean(entity?.[key])}
        onChange={(e) => change(key, e.target.checked)}
      />
      {title}
    </label>
  );
  const classesField = () => (
    <fieldset>
      <legend>{text("Classes concernées", "Related classes")}</legend>
      <p>
        {text(
          "Pour une ressource, aucune sélection signifie toutes les classes. Un chapitre doit avoir au moins une classe.",
          "For a resource, no selection means all classes. A chapter needs at least one class.",
        )}
      </p>
      <div className="school-class-checks">
        {draft.classes.map((c) => (
          <label className="school-choice" key={c.id}>
            <input
              type="checkbox"
              checked={(entity?.classIds as string[]).includes(c.id)}
              onChange={(e) =>
                change(
                  "classIds",
                  e.target.checked
                    ? [...(entity?.classIds as string[]), c.id]
                    : (entity?.classIds as string[]).filter(
                        (id) => id !== c.id,
                      ),
                )
              }
            />
            {c.name[locale]} · {c.system.toUpperCase()}
          </label>
        ))}
      </div>
    </fieldset>
  );
  const exportDraft = () => {
    const blob = new Blob([JSON.stringify(draft, null, 2)], {
        type: "application/json",
      }),
      url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `lessgooo-school-${new Date().toISOString().slice(0, 10)}.json`;
    a.click();
    setTimeout(() => URL.revokeObjectURL(url), 1000);
  };
  const submit = async () => {
    setIssues([]);
    setMessage("");
    const result = catalogSchema.safeParse(draft);
    if (!result.success) {
      setMessage(
        text(
          "Le brouillon contient des champs à corriger. Rien n'a été enregistré.",
          "The draft has fields to correct. Nothing was saved.",
        ),
      );
      setIssues(
        result.error.issues.slice(0, 12).map((issue) =>
          issue.path
            .map((v) =>
              typeof v === "number"
                ? String(v + 1)
                : (
                    {
                      ...names,
                      name: text("Nom", "Name"),
                      title: text("Titre", "Title"),
                      question: text("Question", "Question"),
                      lesson: text("Leçon", "Lesson"),
                      rights: text("Droits", "Rights"),
                      url: text("Lien HTTPS", "HTTPS link"),
                      description: "Description",
                      classIds: text("Classes", "Classes"),
                      prerequisites: text("Prérequis", "Prerequisites"),
                      goal: text("Objectif", "Goal"),
                      example: text("Exemple", "Example"),
                      challenge: text("Défi", "Challenge"),
                      solution: text("Solution", "Solution"),
                      questions: text("Quiz", "Quiz"),
                      prompt: text("Question", "Question"),
                      choices: text("Choix", "Choices"),
                      explanation: text("Explication", "Explanation"),
                      answer: text("Bonne réponse", "Correct answer"),
                      availability: text("Créneaux", "Opening slots"),
                    } as Record<string, string>
                  )[v] || v,
            )
            .join(" › "),
        ),
      );
      return;
    }
    setBusy(true);
    try {
      const saved = await onSave(result.data, version);
      setDraft(structuredClone(saved.catalog));
      setVersion(saved.version);
      setDirty(false);
      setMessage(
        text(
          "Catalogue enregistré. Les changements sont visibles sur le site relié à ce serveur.",
          "Catalogue saved. Changes are visible on the site connected to this server.",
        ),
      );
    } catch (e) {
      setMessage(schoolError(e, fr));
    } finally {
      setBusy(false);
    }
  };
  return (
    <section className="school-editor">
      <div className="school-section-heading">
        <h2>{text("Piloter l'espace scolaire", "Manage the school space")}</h2>
        <p>
          {text(
            "Gestion locale de démonstration : cette vue simule l'administration du propriétaire. Elle ne crée pas de comptes réels. Les tarifs, classes et contenus ci-dessous alimentent le même catalogue.",
            "Local demonstration management: this view simulates owner administration. It does not create real accounts. The fees, classes and content below use the same catalogue.",
          )}
        </p>
      </div>
      <div className="school-editor-bar">
        <strong>
          {dirty
            ? text("Brouillon non enregistré", "Unsaved draft")
            : text(
                "Tous les changements sont enregistrés",
                "All changes are saved",
              )}
        </strong>
        <div className="school-actions">
          <button
            type="button"
            className="school-primary"
            disabled={busy || !dirty}
            onClick={() => void submit()}
          >
            {busy
              ? text("En cours…", "Working…")
              : text("Enregistrer les changements", "Save changes")}
          </button>
          <button
            type="button"
            disabled={busy || !dirty}
            onClick={() => {
              setDraft(structuredClone(snapshot.catalog));
              setVersion(snapshot.version);
              setDirty(false);
              setSelected("");
              setIssues([]);
              setMessage("");
            }}
          >
            {text("Abandonner le brouillon", "Discard draft")}
          </button>
        </div>
      </div>
      {message && (
        <p
          role="status"
          className={issues.length ? "school-error" : "school-note"}
        >
          {message}
        </p>
      )}
      {issues.length > 0 && (
        <ul>
          {issues.map((issue, i) => (
            <li key={i}>{issue}</li>
          ))}
        </ul>
      )}
      <nav
        className="school-subnav"
        aria-label={text("Rubriques de gestion", "Management sections")}
      >
        {(Object.keys(names) as Section[]).map((key) => (
          <button
            key={key}
            aria-current={section === key ? "page" : undefined}
            onClick={() => {
              setSection(key);
              setSelected("");
              setFilter("");
            }}
          >
            {names[key]}
          </button>
        ))}
      </nav>
      <fieldset disabled={busy} className="school-editor-body">
        <legend className="school-sr">{names[section]}</legend>
        {section === "general" ? (
          <div className="school-card school-form">
            <label>
              {text("Année scolaire", "School year")}
              <input
                value={draft.schoolYear}
                onChange={(e) =>
                  update({ ...draft, schoolYear: e.target.value })
                }
              />
            </label>
            <div className="school-form-row">
              <label>
                {text("Inscription (F CFA)", "Registration (F CFA)")}
                <input
                  type="number"
                  min="0"
                  value={draft.registration}
                  onChange={(e) =>
                    update({ ...draft, registration: Number(e.target.value) })
                  }
                />
              </label>
              <label>
                {text("Période des frais de cours", "Tuition billing period")}
                <select
                  value={draft.billing}
                  onChange={(e) =>
                    update({
                      ...draft,
                      billing: e.target.value as SchoolCatalog["billing"],
                    })
                  }
                >
                  {[
                    ["unknown", text("À préciser", "To be confirmed")],
                    ["month", text("Par mois", "Per month")],
                    ["term", text("Par trimestre", "Per term")],
                    ["year", text("Par an", "Per year")],
                    ["session", text("Par séance", "Per session")],
                  ].map(([v, l]) => (
                    <option key={v} value={v}>
                      {l}
                    </option>
                  ))}
                </select>
              </label>
            </div>
            <p>
              {text(
                "Les frais de chaque classe se règlent dans « Classes et séries ». Une case vide signifie tarif non confirmé, jamais gratuit.",
                "Set class-specific tuition in Classes and streams. A blank amount means unconfirmed, never free.",
              )}
            </p>
            <fieldset>
              <legend>
                {text(
                  "Matières proposées en répétition",
                  "Tutoring subjects offered",
                )}
              </legend>
              <div className="school-class-checks">
                {draft.subjects.map((s) => (
                  <label className="school-choice" key={s.id}>
                    <input
                      type="checkbox"
                      checked={draft.tutoringSubjectIds.includes(s.id)}
                      onChange={(e) =>
                        update({
                          ...draft,
                          tutoringSubjectIds: e.target.checked
                            ? [...draft.tutoringSubjectIds, s.id]
                            : draft.tutoringSubjectIds.filter(
                                (id) => id !== s.id,
                              ),
                        })
                      }
                    />
                    {s.name[locale]}
                  </label>
                ))}
              </div>
            </fieldset>
            <h3>
              {text(
                "Créneaux d'ouverture — heure du Cameroun",
                "Opening hours — Cameroon time",
              )}
            </h3>
            <p>
              {text(
                "Ces plages ne répartissent pas automatiquement les matières. Ajoutez ensuite les séances par classe dans Emplois du temps.",
                "These hours do not automatically assign subjects. Add class sessions in Timetables next.",
              )}
            </p>
            {draft.availability.map((slot, i) => (
              <div className="school-form-row" key={i}>
                <label>
                  {text("Jour", "Day")}
                  <select
                    value={slot.day}
                    onChange={(e) =>
                      update({
                        ...draft,
                        availability: draft.availability.map((v, j) =>
                          i === j ? { ...v, day: Number(e.target.value) } : v,
                        ),
                      })
                    }
                  >
                    {days.map((day, j) => (
                      <option key={day} value={j + 1}>
                        {day}
                      </option>
                    ))}
                  </select>
                </label>
                {(["start", "end"] as const).map((key) => (
                  <label key={key}>
                    {key === "start"
                      ? text("Début", "Start")
                      : text("Fin", "End")}
                    <input
                      type="time"
                      value={slot[key]}
                      onChange={(e) =>
                        update({
                          ...draft,
                          availability: draft.availability.map((v, j) =>
                            i === j ? { ...v, [key]: e.target.value } : v,
                          ),
                        })
                      }
                    />
                  </label>
                ))}
                <button
                  type="button"
                  aria-label={`${text("Retirer le créneau", "Remove slot")} ${i + 1}`}
                  onClick={() =>
                    update({
                      ...draft,
                      availability: draft.availability.filter(
                        (_, j) => i !== j,
                      ),
                    })
                  }
                >
                  ×
                </button>
              </div>
            ))}
            <button
              type="button"
              onClick={() =>
                update({
                  ...draft,
                  availability: [
                    ...draft.availability,
                    { day: 6, start: "08:00", end: "12:00" },
                  ],
                })
              }
            >
              {text("Ajouter un créneau", "Add an opening slot")}
            </button>
            <details>
              <summary>
                {text(
                  "Sauvegarde et transfert du catalogue",
                  "Catalogue backup and transfer",
                )}
              </summary>
              <p>
                {text(
                  "Le fichier contient le catalogue, sans notes, profils ni historique d'élèves. Les fichiers téléversés restent sur le serveur d'origine. Un import remplace le brouillon ; il ne sera publié qu'après Enregistrer. Sur GitHub Pages, republiez un instantané pour mettre à jour le catalogue statique.",
                  "The file contains the catalogue without learner marks, profiles or history. Uploaded media remain on the original server. Import replaces the draft; publication requires Save. On GitHub Pages, redeploy a snapshot to update the static catalogue.",
                )}
              </p>
              <div className="school-actions">
                <button type="button" onClick={exportDraft}>
                  {text("Exporter le catalogue", "Export catalogue")}
                </button>
                <button type="button" onClick={() => fileRef.current?.click()}>
                  {text("Importer comme brouillon", "Import as draft")}
                </button>
                <input
                  className="school-sr"
                  ref={fileRef}
                  type="file"
                  accept="application/json,.json"
                  aria-label={text("Fichier du catalogue", "Catalogue file")}
                  onChange={async (e) => {
                    const file = e.target.files?.[0];
                    e.target.value = "";
                    if (!file) return;
                    if (file.size > 6 * 1024 * 1024) {
                      setMessage(
                        text(
                          "Fichier trop volumineux (6 Mo maximum).",
                          "File too large (6 MB maximum).",
                        ),
                      );
                      return;
                    }
                    try {
                      const parsed = catalogSchema.parse(
                        JSON.parse(await file.text()),
                      );
                      update(parsed);
                      setSelected("");
                      setMessage(
                        text(
                          "Import chargé dans le brouillon. Vérifiez toutes les rubriques avant d'enregistrer.",
                          "Import loaded into the draft. Review every section before saving.",
                        ),
                      );
                    } catch {
                      setMessage(
                        text(
                          "Ce fichier ne respecte pas le format du catalogue ou contient des références invalides.",
                          "This file does not match the catalogue format or has invalid references.",
                        ),
                      );
                    }
                  }}
                />
              </div>
            </details>
          </div>
        ) : (
          <div className="school-editor-split">
            <aside className="school-card">
              <label>
                {text("Retrouver un élément", "Find an item")}
                <input
                  type="search"
                  value={filter}
                  onChange={(e) => setFilter(e.target.value)}
                />
              </label>
              <button
                type="button"
                onClick={() => {
                  const item = newItem(section, draft);
                  update({ ...draft, [section]: [...draft[section], item] });
                  setSelected(String(item.id));
                }}
              >
                {text("Ajouter", "Add")}
              </button>
              <ul className="school-editor-list">
                {draft[section]
                  .filter((v) =>
                    label(v)
                      .toLocaleLowerCase()
                      .includes(filter.toLocaleLowerCase()),
                  )
                  .map((v) => (
                    <li key={v.id}>
                      <button
                        type="button"
                        aria-current={selected === v.id ? "true" : undefined}
                        onClick={() => setSelected(v.id)}
                      >
                        {label(v)}
                        {("published" in v && !v.published) ||
                        ("active" in v && !v.active)
                          ? ` · ${text("non publié", "unpublished")}`
                          : ""}
                      </button>
                    </li>
                  ))}
              </ul>
            </aside>
            <div className="school-card school-form">
              {!entity ? (
                <p>
                  {text(
                    "Choisissez un élément à modifier ou ajoutez-en un.",
                    "Choose an item to edit or add a new one.",
                  )}
                </p>
              ) : (
                <>
                  <p className="school-muted">
                    {text("Référence stable", "Stable reference")} :{" "}
                    {String(entity.id)}
                  </p>
                  {section === "classes" && (
                    <>
                      {bilingual(
                        "name",
                        text(
                          "Nom de la classe ou série",
                          "Class or stream name",
                        ),
                      )}
                      {choice("system", text("Sous-système", "Subsystem"), [
                        ["fr", text("Francophone", "Francophone")],
                        ["en", text("Anglophone", "Anglophone")],
                      ])}
                      {choice("cycle", text("Cycle", "Cycle"), [
                        ["primary", text("Primaire", "Primary")],
                        [
                          "secondary",
                          text("Secondaire général", "General secondary"),
                        ],
                        [
                          "technical",
                          text(
                            "Technique / professionnel",
                            "Technical / vocational",
                          ),
                        ],
                      ])}
                      {field(
                        "exam",
                        text(
                          "Examen préparé, si applicable",
                          "Examination, if applicable",
                        ),
                      )}
                      {field(
                        "tuition",
                        text("Frais de cours (F CFA)", "Tuition (F CFA)"),
                        "number",
                        text(
                          "Laisser vide si le tarif n'est pas confirmé.",
                          "Leave blank if tuition is unconfirmed.",
                        ),
                      )}
                      {check(
                        "tutoring",
                        text(
                          "Répétitions proposées pour cette classe",
                          "Tutoring offered for this class",
                        ),
                      )}
                      {check("active", text("Classe visible", "Class visible"))}
                    </>
                  )}
                  {section === "subjects" && (
                    <>
                      {bilingual(
                        "name",
                        text("Nom de la matière", "Subject name"),
                      )}
                      {bilingual(
                        "description",
                        text(
                          "Description simple",
                          "Plain-language description",
                        ),
                        true,
                      )}
                      {bilingual(
                        "prerequisites",
                        text(
                          "Ce qu'il faut pour commencer",
                          "What learners need to start",
                        ),
                        true,
                      )}
                      {check(
                        "active",
                        text("Matière visible", "Subject visible"),
                      )}
                    </>
                  )}
                  {section === "chapters" && (
                    <>
                      {bilingual(
                        "title",
                        text("Titre du chapitre", "Chapter title"),
                      )}
                      {choice(
                        "subjectId",
                        text("Matière", "Subject"),
                        draft.subjects.map((s) => [s.id, s.name[locale]]),
                      )}
                      {field(
                        "order",
                        text("Ordre du chapitre", "Chapter order"),
                        "number",
                      )}
                      {classesField()}
                      {(
                        [
                          ["goal", text("Objectif", "Goal")],
                          ["prerequisites", text("Prérequis", "Prerequisites")],
                          [
                            "lesson",
                            text("Explication du cours", "Lesson explanation"),
                          ],
                          ["example", text("Exemple résolu", "Worked example")],
                          ["challenge", text("Défi à résoudre", "Challenge")],
                          [
                            "solution",
                            text("Correction du défi", "Challenge solution"),
                          ],
                        ] as [string, string][]
                      ).map(([key, title]) => (
                        <div key={key}>{bilingual(key, title, true)}</div>
                      ))}
                      <QuizEditor
                        questions={entity.questions as Chapter["questions"]}
                        onChange={(questions) => change("questions", questions)}
                      />
                      {check(
                        "published",
                        text(
                          "Publier ce chapitre après vérification pédagogique",
                          "Publish this chapter after educational review",
                        ),
                      )}
                    </>
                  )}
                  {section === "resources" && (
                    <>
                      {bilingual(
                        "title",
                        text("Titre de la ressource", "Resource title"),
                      )}
                      {bilingual(
                        "description",
                        text(
                          "À quoi sert cette ressource ?",
                          "How does this resource help?",
                        ),
                        true,
                      )}
                      {choice(
                        "kind",
                        text("Type de contenu", "Content type"),
                        resourceKinds.map((v) => [
                          v,
                          {
                            programme: text("Programme", "Curriculum"),
                            booklist: text("Liste de manuels", "Book list"),
                            book: text("Livre autorisé", "Authorised book"),
                            paper: text("Annale", "Past paper"),
                            mock: text("Examen blanc", "Mock examination"),
                            exercise: text("Exercices", "Exercises"),
                            video: text("Vidéo", "Video"),
                            audio: "Audio",
                            document: "Document",
                            simulation: "Simulation",
                            guidance: "Orientation",
                          }[v],
                        ]),
                      )}
                      {choice("subjectId", text("Matière", "Subject"), [
                        ["", text("Toutes les matières", "All subjects")],
                        ...draft.subjects.map(
                          (s) => [s.id, s.name[locale]] as [string, string],
                        ),
                      ])}
                      {classesField()}
                      {field(
                        "source",
                        text(
                          "Auteur ou organisme source",
                          "Author or source organisation",
                        ),
                      )}
                      {field(
                        "year",
                        text(
                          "Année ou session du document",
                          "Document year or session",
                        ),
                      )}
                      {choice(
                        "language",
                        text("Langue du document", "Document language"),
                        [
                          ["fr", text("Français", "French")],
                          ["en", text("Anglais", "English")],
                          ["both", text("Les deux", "Both")],
                        ],
                      )}
                      {choice(
                        "status",
                        text("Statut de vérification", "Verification status"),
                        [
                          [
                            "source",
                            text(
                              "Source consultée (vérifier l'édition)",
                              "Source consulted (check edition)",
                            ),
                          ],
                          [
                            "historical",
                            text("Édition ancienne", "Historical edition"),
                          ],
                          [
                            "complement",
                            text(
                              "Complément international",
                              "International enrichment",
                            ),
                          ],
                          ["review", text("À vérifier", "Needs review")],
                        ],
                      )}
                      {field(
                        "url",
                        text(
                          "Lien HTTPS (laisser vide pour un fichier)",
                          "HTTPS link (leave blank for an upload)",
                        ),
                        "url",
                      )}
                      {bilingual(
                        "rights",
                        text(
                          "Droits et conditions d'accès",
                          "Rights and access conditions",
                        ),
                        true,
                        text(
                          "Précisez l'autorisation de partage. Ne téléversez pas un manuel commercial sans droit de diffusion.",
                          "State the sharing permission. Do not upload a commercial textbook without distribution rights.",
                        ),
                      )}
                      <label>
                        {text(
                          "Téléverser un fichier autorisé — 200 Mo maximum",
                          "Upload an authorised file — 200 MB maximum",
                        )}
                        <input
                          type="file"
                          onChange={async (e) => {
                            const file = e.target.files?.[0];
                            e.target.value = "";
                            if (!file) return;
                            setBusy(true);
                            setPercent(0);
                            try {
                              const mediaId = await uploadMedia(
                                file,
                                "teacher",
                                setPercent,
                                "",
                                true,
                              );
                              update({
                                ...draft,
                                resources: draft.resources.map((r) =>
                                  r.id === selected
                                    ? { ...r, mediaId, url: "" }
                                    : r,
                                ),
                              });
                              setMessage(
                                text(
                                  "Fichier partagé avec le campus. Enregistrez le catalogue pour l'attacher à cette ressource.",
                                  "File shared with the campus. Save the catalogue to attach it to this resource.",
                                ),
                              );
                            } catch (err) {
                              setMessage(
                                err instanceof Error
                                  ? err.message
                                  : text(
                                      "Échec du téléversement.",
                                      "Upload failed.",
                                    ),
                              );
                            } finally {
                              setBusy(false);
                            }
                          }}
                        />
                      </label>
                      {busy && (
                        <progress
                          max="100"
                          value={percent}
                          aria-label={text(
                            "Progression du téléversement",
                            "Upload progress",
                          )}
                        />
                      )}
                      {Boolean(entity.mediaId) && (
                        <p>
                          {text("Fichier attaché", "Attached file")} :{" "}
                          {String(entity.mediaId)}{" "}
                          <button
                            type="button"
                            onClick={() => change("mediaId", "")}
                          >
                            {text("Détacher", "Detach")}
                          </button>
                        </p>
                      )}
                      <p className="school-muted">
                        {text(
                          "Tous les formats peuvent être conservés ; la lecture intégrée dépend du format. Les fichiers restent disponibles au téléchargement. Les fichiers sont partagés avec les profils du campus local.",
                          "Any file format can be stored; inline playback depends on the format. Downloads remain available. Files are shared with local campus profiles.",
                        )}
                      </p>
                      {check(
                        "published",
                        text(
                          "Ressource visible après vérification",
                          "Resource visible after review",
                        ),
                      )}
                    </>
                  )}
                  {section === "timetable" && (
                    <>
                      {choice(
                        "classId",
                        text("Classe", "Class"),
                        draft.classes.map((c) => [c.id, c.name[locale]]),
                      )}
                      {choice(
                        "subjectId",
                        text("Matière", "Subject"),
                        draft.subjects.map((s) => [s.id, s.name[locale]]),
                      )}
                      {choice(
                        "day",
                        text("Jour", "Day"),
                        days.map((d, i) => [String(i + 1), d]),
                      )}
                      {field("start", text("Début", "Start"), "time")}
                      {field("end", text("Fin", "End"), "time")}
                      {field(
                        "location",
                        text(
                          "Salle ou modalité, si confirmée",
                          "Room or delivery mode, if confirmed",
                        ),
                      )}
                      {field(
                        "meetingUrl",
                        text(
                          "Lien participant HTTPS, facultatif",
                          "HTTPS participant link, optional",
                        ),
                        "url",
                      )}
                      {choice(
                        "status",
                        text("État du créneau", "Session status"),
                        [
                          [
                            "draft",
                            text("Brouillon à confirmer", "Draft to confirm"),
                          ],
                          ["confirmed", text("Confirmé", "Confirmed")],
                          [
                            "cancelled",
                            text("Annulé / masqué", "Cancelled / hidden"),
                          ],
                        ],
                      )}
                      <p>
                        {text(
                          "Un créneau doit rester dans les heures d'ouverture. Deux séances confirmées d'une même classe ne peuvent pas se chevaucher. Ne partagez jamais un lien hôte de réunion.",
                          "A session must fall within opening hours. Two confirmed sessions for the same class cannot overlap. Never share a meeting host link.",
                        )}
                      </p>
                    </>
                  )}
                </>
              )}
            </div>
          </div>
        )}
      </fieldset>
    </section>
  );
}

function QuizEditor({
  questions,
  onChange,
}: {
  questions: Chapter["questions"];
  onChange: (q: Chapter["questions"]) => void;
}) {
  const { locale } = useLanguage(),
    fr = locale === "fr";
  const set = (i: number, patch: Partial<Chapter["questions"][number]>) =>
    onChange(questions.map((q, j) => (j === i ? { ...q, ...patch } : q)));
  return (
    <section>
      <h3>
        {fr
          ? "Questions et corrections du quiz"
          : "Quiz questions and explanations"}
      </h3>
      {questions.map((q, i) => (
        <details key={q.id} open={questions.length === 1}>
          <summary>
            {i + 1}.{" "}
            {q.prompt[locale] || (fr ? "Nouvelle question" : "New question")}
          </summary>
          {(["fr", "en"] as const).map((lang) => (
            <fieldset key={lang}>
              <legend>
                {lang === "fr"
                  ? fr
                    ? "Version française"
                    : "French version"
                  : fr
                    ? "Version anglaise"
                    : "English version"}
              </legend>
              <label>
                {fr ? "Question" : "Question"}
                <textarea
                  value={q.prompt[lang]}
                  onChange={(e) =>
                    set(i, { prompt: { ...q.prompt, [lang]: e.target.value } })
                  }
                />
              </label>
              {q.choices.map((c, j) => (
                <label key={j}>
                  {fr ? "Choix" : "Choice"} {j + 1}
                  <input
                    value={c[lang]}
                    onChange={(e) =>
                      set(i, {
                        choices: q.choices.map((v, k) =>
                          k === j ? { ...v, [lang]: e.target.value } : v,
                        ),
                      })
                    }
                  />
                </label>
              ))}
              <label>
                {fr ? "Explication de la réponse" : "Answer explanation"}
                <textarea
                  value={q.explanation[lang]}
                  onChange={(e) =>
                    set(i, {
                      explanation: { ...q.explanation, [lang]: e.target.value },
                    })
                  }
                />
              </label>
            </fieldset>
          ))}
          <label>
            {fr ? "Numéro de la bonne réponse" : "Correct answer number"}
            <select
              value={q.answer}
              onChange={(e) => set(i, { answer: Number(e.target.value) })}
            >
              {q.choices.map((_, j) => (
                <option key={j} value={j}>
                  {j + 1}
                </option>
              ))}
            </select>
          </label>
          <div className="school-actions">
            <button
              type="button"
              disabled={q.choices.length >= 6}
              onClick={() => set(i, { choices: [...q.choices, emptyCopy()] })}
            >
              {fr ? "Ajouter un choix" : "Add a choice"}
            </button>
            <button
              type="button"
              disabled={q.choices.length <= 2}
              onClick={() =>
                set(i, {
                  choices: q.choices.slice(0, -1),
                  answer: Math.min(q.answer, q.choices.length - 2),
                })
              }
            >
              {fr ? "Retirer le dernier choix" : "Remove last choice"}
            </button>
            <button
              type="button"
              disabled={questions.length <= 1}
              onClick={() => onChange(questions.filter((_, j) => i !== j))}
            >
              {fr ? "Retirer cette question" : "Remove question"}
            </button>
          </div>
        </details>
      ))}
      <button
        type="button"
        disabled={questions.length >= 100}
        onClick={() =>
          onChange([
            ...questions,
            {
              id: `q-${identifier()}`,
              prompt: emptyCopy(),
              choices: [emptyCopy(), emptyCopy()],
              answer: 0,
              explanation: emptyCopy(),
            },
          ])
        }
      >
        {fr ? "Ajouter une question" : "Add a question"}
      </button>
    </section>
  );
}
