import { useRef, useState, type FormEvent } from "react";
import { useSearchParams } from "react-router-dom";
import type { z } from "zod";
import { ServiceIntakeFields } from "../campus/ServiceIntake";
import { findCourse, type CourseId } from "../campus/lib/course-catalog";
import {
  countries,
  questionsFor,
  timeframes,
  type ServiceId,
} from "../campus/lib/service-intake";
import { services, serviceRequestSchema } from "../campus/lib/studio";
import { ownerEmail, publicServiceForm } from "../content/contact";
import { useLocale } from "../i18n/LocaleContext";
type Enquiry = z.infer<typeof serviceRequestSchema>;
export function ContactEnquiry() {
  const [params] = useSearchParams();
  // Remount when a visitor follows a different course's enquiry link.
  return (
    <EnquiryForm
      key={params.toString()}
      service={params.get("service")}
      course={params.get("course")}
    />
  );
}
function EnquiryForm({
  service: initialService,
  course: initialCourse,
}: {
  service: string | null;
  course: string | null;
}) {
  const { locale } = useLocale();
  const fr = locale === "fr";
  const [service, setService] = useState<ServiceId>(
    () => services.find((s) => s.id === initialService)?.id || "training",
  );
  const [course, setCourse] = useState<CourseId | "">(
    () => findCourse(initialCourse || "")?.id || "",
  );
  const [draft, setDraft] = useState<Enquiry | null>(null),
    [problem, setProblem] = useState(false),
    [copied, setCopied] = useState(false),
    [copyFailed, setCopyFailed] = useState(false);
  const review = useRef<HTMLHeadingElement>(null),
    form = useRef<HTMLFormElement>(null);
  const submit = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const fields = new FormData(e.currentTarget);
    const parsed = serviceRequestSchema.safeParse({
      ...Object.fromEntries(fields),
      service,
      course: ["training", "company"].includes(service) ? course : "",
      consent: fields.get("consent") === "on",
      answers: Object.fromEntries(
        questionsFor(service, course).map((q) => [
          q.id,
          fields.get("answer:" + q.id) || "",
        ]),
      ),
    });
    setProblem(!parsed.success);
    if (!parsed.success) return;
    setDraft(parsed.data);
    setCopied(false);
    setCopyFailed(false);
    requestAnimationFrame(() => review.current?.focus());
  };
  const text = draft
    ? [
        "LESSGOOO — " + (fr ? "Demande de renseignements" : "Enquiry"),
        (fr ? "Service : " : "Service: ") +
          services.find((s) => s.id === draft.service)?.[locale],
        (fr ? "Domaine : " : "Area: ") +
          (findCourse(draft.course)?.title[locale] ||
            (fr ? "À définir" : "To discuss")),
        (fr ? "Nom : " : "Name: ") + draft.name,
        "Email: " + draft.email,
        (fr ? "Téléphone : " : "Phone: ") + (draft.phone || "—"),
        (fr ? "Lieu : " : "Location: ") +
          [
            countries(locale).find((c) => c.code === draft.country)?.name,
            draft.city,
            draft.timezone,
          ]
            .filter(Boolean)
            .join(" · "),
        (fr ? "Contact souhaité : " : "Preferred contact: ") +
          (draft.contact === "phone" ? (fr ? "Téléphone" : "Phone") : "Email"),
        (fr ? "Langue souhaitée : " : "Preferred language: ") +
          (draft.language === "fr"
            ? fr
              ? "Français"
              : "French"
            : fr
              ? "Anglais"
              : "English"),
        (fr ? "Période souhaitée : " : "Preferred timing: ") +
          timeframes.find((f) => f.id === draft.timeframe)?.[locale],
        ...questionsFor(draft.service, draft.course)
          .filter((q) => draft.answers[q.id])
          .map((q) => "\n" + q.label[locale] + "\n" + draft.answers[q.id]),
        "\n" +
          (fr ? "Résultat attendu" : "Expected result") +
          "\n" +
          draft.message,
        "\n" +
          (fr
            ? "J’accepte d’être contacté au sujet de cette demande."
            : "I agree to be contacted about this request."),
      ].join("\n")
    : "";
  const longEmail = encodeURIComponent(text).length > 1800;
  const subject =
    "LESSGOOO — " +
    (findCourse(course)?.title[locale] || (fr ? "Renseignements" : "Enquiry"));
  const mailto =
    "mailto:" +
    ownerEmail +
    "?subject=" +
    encodeURIComponent(subject) +
    "&body=" +
    encodeURIComponent(
      longEmail
        ? fr
          ? "Bonjour, je souhaite discuter de ma demande LESSGOOO.\n[Coller la demande complète ici ou joindre le fichier téléchargé.]"
          : "Hello, I would like to discuss my LESSGOOO enquiry.\n[Paste the complete brief here or attach the downloaded file.]"
        : text,
    );
  const download = () => {
    const url = URL.createObjectURL(
      new Blob([text], { type: "text/plain;charset=utf-8" }),
    );
    const a = document.createElement("a");
    a.href = url;
    a.download = "lessgooo-enquiry.txt";
    a.click();
    setTimeout(() => URL.revokeObjectURL(url), 1000);
  };
  return (
    <div className="public-enquiry service-intake">
      <div className="public-notice">
        <h2>{fr ? "Parlons de votre objectif" : "Tell us about your goal"}</h2>
        <p>
          <a href={"mailto:" + ownerEmail}>{ownerEmail}</a>
        </p>
        <p>
          {fr
            ? "Ce formulaire prépare un brouillon dans cette page. Il ne sauvegarde ni n’envoie votre demande. Relisez-la, puis envoyez-la depuis votre messagerie. Pour une demande concernant un enfant, un parent ou responsable remplit le formulaire."
            : "This form prepares a draft on this page. It does not save or send your enquiry. Review it, then send it from your email app. A parent or guardian should complete enquiries about children."}
        </p>
        <details>
          <summary>
            {fr
              ? "Une autre façon de nous contacter"
              : "Another way to contact us"}
          </summary>
          <p>
            {fr
              ? "Notre formulaire Google général s’ouvre sur un site externe. Il couvre les demandes générales ; le brouillon ci-dessous contient les questions propres aux neuf domaines."
              : "Our general Google form opens on an external site. It handles general enquiries; the draft below includes questions tailored to the nine areas."}
          </p>
          <a href={publicServiceForm} target="_blank" rel="noreferrer">
            {fr ? "Ouvrir le formulaire Google" : "Open the Google form"} ↗
          </a>
        </details>
      </div>
      <form
        className="studio-form"
        ref={form}
        hidden={!!draft}
        onSubmit={submit}
      >
        <ServiceIntakeFields
          service={service}
          course={course}
          changeService={(s) => {
            setService(s);
            if (!["training", "company"].includes(s)) setCourse("");
          }}
          changeCourse={setCourse}
          busy={false}
          publicDraft
        />
        {problem && (
          <p role="alert">
            {fr
              ? "Vérifiez les champs : évitez les réponses vides ou trop courtes, choisissez un pays, une période et un domaine si nécessaire."
              : "Check the fields: avoid empty or very short answers, and select a country, timing and an area when required."}
          </p>
        )}
      </form>
      {draft && (
        <section className="enquiry-review">
          <h2 ref={review} tabIndex={-1}>
            {fr
              ? "Votre demande est prête à relire"
              : "Your enquiry is ready to review"}
          </h2>
          <p>
            {fr
              ? "Rien n’a été envoyé. Copiez ou téléchargez ce texte pour le conserver."
              : "Nothing has been sent. Copy or download this text to keep it."}
          </p>
          <pre>{text}</pre>
          <div className="button-group">
            <a className="button button--primary" href={mailto}>
              {fr ? "Ouvrir ma messagerie" : "Open my email app"}
            </a>
            <button
              className="button"
              onClick={async () => {
                try {
                  await navigator.clipboard.writeText(text);
                  setCopied(true);
                  setCopyFailed(false);
                } catch {
                  setCopyFailed(true);
                }
              }}
            >
              {fr ? "Copier" : "Copy"}
            </button>
            <button className="button" onClick={download}>
              {fr ? "Télécharger" : "Download"}
            </button>
            <button
              className="button"
              onClick={() => {
                setDraft(null);
                requestAnimationFrame(() =>
                  form.current?.querySelector("select")?.focus(),
                );
              }}
            >
              {fr ? "Modifier" : "Edit"}
            </button>
          </div>
          {longEmail && (
            <p>
              {fr
                ? "Votre demande est longue : copiez-la dans l’email ou joignez le fichier téléchargé avant l’envoi."
                : "Your brief is long: paste it into the email or attach the downloaded file before sending."}
            </p>
          )}
          {copied && (
            <p role="status">{fr ? "Texte copié." : "Text copied."}</p>
          )}
          {copyFailed && (
            <p role="alert">
              {fr
                ? "La copie est indisponible. Sélectionnez le texte ou téléchargez-le."
                : "Copy is unavailable. Select the text or download it."}
            </p>
          )}
        </section>
      )}
    </div>
  );
}
