import { courseCatalog, findCourse, type CourseId } from "./lib/course-catalog";
import { useState, type ReactNode } from "react";
import { Send } from "lucide-react";
import { Button } from "./components/ui/button";
import { useLanguage } from "./lib/language";
import { services, type ServiceRequest } from "./lib/studio";
import {
  countries,
  questionsFor,
  timeframes,
  type ServiceId,
} from "./lib/service-intake";
import "./service-intake.css";

function Field({
  id,
  label,
  hint,
  children,
}: {
  id: string;
  label: string;
  hint: string;
  children: ReactNode;
}) {
  return (
    <div className="intake-field">
      <label htmlFor={id}>{label}</label>
      <p id={`${id}-hint`}>{hint}</p>
      {children}
    </div>
  );
}
export function ServiceIntakeFields({
  service,
  changeService,
  course = "",
  changeCourse = () => {},
  busy,
  publicDraft = false,
}: {
  service: ServiceId;
  changeService: (id: ServiceId) => void;
  course?: CourseId | "";
  changeCourse?: (course: CourseId | "") => void;
  busy: boolean;
  publicDraft?: boolean;
}) {
  const { t, locale } = useLanguage();
  const selectedCourse = findCourse(course);
  const [contact, setContact] = useState("email");
  const currentZone = Intl.DateTimeFormat().resolvedOptions().timeZone || "UTC";
  const zones = [
    ...new Set(["UTC", currentZone, ...Intl.supportedValuesOf("timeZone")]),
  ].sort();
  return (
    <>
      <fieldset className="intake-section">
        <legend>
          <span>01</span>
          {t("Choose your support", "Choisissez votre accompagnement")}
        </legend>
        <Field
          id="service"
          label={t(
            "Which service do you need?",
            "De quel service avez-vous besoin ?",
          )}
          hint={t(
            "The questions below adapt to your choice. Changing service clears the previous service answers.",
            "Les questions s’adaptent à votre choix. Un changement de service efface les réponses spécifiques précédentes.",
          )}
        >
          <select
            id="service"
            name="service"
            value={service}
            onChange={(e) => changeService(e.target.value as ServiceId)}
            aria-describedby="service-hint"
          >
            {services.map((s) => (
              <option value={s.id} key={s.id}>
                {t(s.en, s.fr)}
              </option>
            ))}
          </select>
        </Field>
        <p className="intake-service-note">
          {t(
            services.find((s) => s.id === service)!.detailEn,
            services.find((s) => s.id === service)!.detailFr,
          )}
        </p>
        {["training", "company"].includes(service) && (
          <>
            <Field
              id="course"
              label={
                service === "company"
                  ? t(
                      "Which service area does your company need?",
                      "De quel domaine de service votre entreprise a-t-elle besoin ?",
                    )
                  : t(
                      "Which course interests you?",
                      "Quelle formation vous intéresse ?",
                    )
              }
              hint={
                service === "company"
                  ? t(
                      "Choose an area for its preparation checklist and project questions. Changing it clears brief answers; contact details stay.",
                      "Choisissez un domaine pour voir sa préparation et ses questions. Le changer efface les réponses du besoin ; les coordonnées restent.",
                    )
                  : t(
                      "Choose an area, or select ‘Help me choose’. This is an inquiry, not an enrollment.",
                      "Choisissez un domaine ou « Aidez-moi à choisir ». Il s’agit d’un renseignement, pas d’une inscription.",
                    )
              }
            >
              <select
                id="course"
                name="course"
                value={course}
                onChange={(e) => changeCourse(e.target.value as CourseId | "")}
                required={service === "company"}
                aria-describedby="course-hint"
              >
                <option value="">
                  {service === "company"
                    ? t(
                        "Choose a service area",
                        "Choisir un domaine de service",
                      )
                    : t("Help me choose", "Aidez-moi à choisir")}
                </option>
                {courseCatalog.map((area) => (
                  <option key={area.id} value={area.id}>
                    {area.title[locale]}
                  </option>
                ))}
              </select>
            </Field>
            {selectedCourse && (
              <div className="intake-course-context">
                <h3>{selectedCourse.title[locale]}</h3>
                <p>
                  {
                    (service === "company"
                      ? selectedCourse.company
                      : selectedCourse.description)[locale]
                  }
                </p>
                <p>
                  <strong>
                    {t("What to prepare", "Ce qu’il faut préparer")}
                  </strong>
                  <br />
                  {service === "company"
                    ? selectedCourse.companyNeeds[locale]
                    : selectedCourse.prerequisites
                        .map((item) => item[locale])
                        .join(" ")}
                </p>
              </div>
            )}
          </>
        )}
        {service === "consultation" && (
          <p className="consultation-note">
            {t(
              "Private consultations are paid. The price, currency and session length are being set. We will discuss terms before any booking or payment.",
              "Les consultations privées sont payantes. Le prix, la devise et la durée sont en cours de définition. Les modalités seront discutées avant toute réservation ou paiement.",
            )}
          </p>
        )}
      </fieldset>
      <fieldset className="intake-section">
        <legend>
          <span>02</span>
          {t("About you", "À propos de vous")}
        </legend>
        <p className="intake-expectation">
          {t(
            "Required unless marked optional. For a child, enter the parent or guardian’s contact information.",
            "Obligatoire sauf mention facultative. Pour un enfant, indiquez les coordonnées du parent ou responsable.",
          )}
        </p>
        <div className="intake-grid">
          <Field
            id="name"
            label={t(
              "What name should we use?",
              "Comment devons-nous vous appeler ?",
            )}
            hint={t(
              "Your name, or the responsible adult’s name.",
              "Votre nom, ou celui de l’adulte responsable.",
            )}
          >
            <input
              id="name"
              name="name"
              required
              minLength={2}
              maxLength={100}
              autoComplete="name"
              aria-describedby="name-hint"
            />
          </Field>
          <Field
            id="email"
            label={t(
              "Which email can we reply to?",
              "À quelle adresse email pouvons-nous répondre ?",
            )}
            hint={t(
              "Use an address you check regularly.",
              "Utilisez une adresse que vous consultez régulièrement.",
            )}
          >
            <input
              id="email"
              name="email"
              type="email"
              required
              maxLength={254}
              autoComplete="email"
              aria-describedby="email-hint"
            />
          </Field>
          <Field
            id="country"
            label={t(
              "Which country are you based in?",
              "Dans quel pays résidez-vous ?",
            )}
            hint={t(
              "Your current location helps us discuss time zones and delivery options.",
              "Votre pays actuel aide à discuter des horaires et des modalités.",
            )}
          >
            <select
              id="country"
              name="country"
              required
              defaultValue=""
              autoComplete="country"
              aria-describedby="country-hint"
            >
              <option value="">
                {t("Select a country", "Choisir un pays")}
              </option>
              {countries(locale).map((c) => (
                <option key={c.code} value={c.code}>
                  {c.name}
                </option>
              ))}
            </select>
          </Field>
          <Field
            id="city"
            label={t(
              "Which city or region? (optional)",
              "Quelle ville ou région ? (facultatif)",
            )}
            hint={t(
              "A city or region is enough; no street address is needed.",
              "Une ville ou région suffit ; aucune adresse postale n’est nécessaire.",
            )}
          >
            <input
              id="city"
              name="city"
              maxLength={100}
              autoComplete="address-level2"
              aria-describedby="city-hint"
            />
          </Field>
          <Field
            id="timezone"
            label={t(
              "Which time zone should we use?",
              "Quel fuseau horaire devons-nous utiliser ?",
            )}
            hint={t(
              "We suggest your browser’s time zone. Check it if you are travelling.",
              "Le fuseau proposé vient de votre navigateur. Vérifiez-le si vous voyagez.",
            )}
          >
            <select
              id="timezone"
              name="timezone"
              defaultValue={currentZone}
              aria-describedby="timezone-hint"
            >
              {zones.map((zone) => (
                <option key={zone}>{zone}</option>
              ))}
            </select>
          </Field>
          <Field
            id="language"
            label={t(
              "Which language do you prefer for the reply?",
              "Quelle langue préférez-vous pour la réponse ?",
            )}
            hint={t(
              "This choice is independent of the app’s display language.",
              "Ce choix est indépendant de la langue d’affichage de l’application.",
            )}
          >
            <select
              id="language"
              name="language"
              defaultValue={locale}
              aria-describedby="language-hint"
            >
              <option value="en">English</option>
              <option value="fr">Français</option>
            </select>
          </Field>
          <Field
            id="contact"
            label={t(
              "How would you prefer to be contacted?",
              "Comment préférez-vous être contacté ?",
            )}
            hint={t(
              "Choose email or phone. A phone number is only required for a phone reply.",
              "Choisissez email ou téléphone. Le numéro n’est obligatoire que pour une réponse téléphonique.",
            )}
          >
            <select
              id="contact"
              name="contact"
              value={contact}
              onChange={(e) => setContact(e.target.value)}
              aria-describedby="contact-hint"
            >
              <option value="email">Email</option>
              <option value="phone">{t("Phone", "Téléphone")}</option>
            </select>
          </Field>
          <Field
            id="phone"
            label={
              contact === "phone"
                ? t(
                    "What phone number can we use?",
                    "Quel numéro pouvons-nous utiliser ?",
                  )
                : t("Phone number (optional)", "Téléphone (facultatif)")
            }
            hint={t(
              "Include the international prefix, for example +237. Do not enter passwords or verification codes.",
              "Incluez l’indicatif international, par exemple +237. Aucun mot de passe ou code de vérification.",
            )}
          >
            <input
              id="phone"
              name="phone"
              type="tel"
              required={contact === "phone"}
              minLength={contact === "phone" ? 6 : undefined}
              maxLength={40}
              autoComplete="tel"
              aria-describedby="phone-hint"
            />
          </Field>
        </div>
      </fieldset>
      <fieldset className="intake-section" key={service + ":" + course}>
        <legend>
          <span>03</span>
          {t("Build your brief", "Décrivez votre besoin")}
        </legend>
        <div className="intake-grid">
          {questionsFor(service, course).map((question) => (
            <Field
              key={question.id}
              id={`answer-${question.id}`}
              label={`${question.label[locale]}${question.required ? "" : t(" (optional)", " (facultatif)")}`}
              hint={question.hint[locale]}
            >
              <textarea
                id={`answer-${question.id}`}
                name={`answer:${question.id}`}
                required={question.required}
                minLength={question.required ? 3 : undefined}
                maxLength={1500}
                rows={3}
                aria-describedby={`answer-${question.id}-hint`}
              />
            </Field>
          ))}
        </div>
        <Field
          id="message"
          label={t(
            "What result would make this support a success?",
            "Quel résultat ferait de cet accompagnement une réussite ?",
          )}
          hint={t(
            "Describe your main goal in one or two sentences. Be specific about what you want to be able to do.",
            "Décrivez votre objectif principal en une ou deux phrases. Précisez ce que vous souhaitez être capable de faire.",
          )}
        >
          <textarea
            id="message"
            name="message"
            required
            minLength={10}
            maxLength={4000}
            rows={3}
            aria-describedby="message-hint"
          />
        </Field>
        <Field
          id="timeframe"
          label={t(
            "When would you like to get started?",
            "Quand souhaitez-vous commencer ?",
          )}
          hint={t(
            "This is your preferred timing, not a confirmed availability or appointment.",
            "Il s’agit de votre préférence, pas d’une disponibilité ou d’un rendez-vous confirmé.",
          )}
        >
          <select
            id="timeframe"
            name="timeframe"
            required
            defaultValue=""
            aria-describedby="timeframe-hint"
          >
            <option value="">
              {t("Choose your timing", "Choisir une période")}
            </option>
            {timeframes.map((frame) => (
              <option key={frame.id} value={frame.id}>
                {frame[locale]}
              </option>
            ))}
          </select>
        </Field>
      </fieldset>
      <div className="intake-next">
        <h3>{t("What happens next?", "Quelle est la suite ?")}</h3>
        <p>
          {publicDraft
            ? t(
                "Review your brief, then copy it, download it or open your email app. This page does not send or save requests. You must send the email yourself.",
                "Relisez votre demande, puis copiez-la, téléchargez-la ou ouvrez votre messagerie. Cette page n’envoie ni n’enregistre les demandes. Vous devez envoyer l’email vous-même.",
              )
            : t(
                "Your brief is available for review in the local inbox. The next conversation can clarify scope, availability and any fee. Sending a request does not create a booking.",
                "Votre demande est disponible dans la boîte locale pour étude. Un échange pourra préciser le périmètre, les disponibilités et le tarif éventuel. L’envoi ne crée pas de réservation.",
              )}
        </p>
      </div>
      <label className="studio-check">
        <input type="checkbox" name="consent" required />
        {t(
          "I agree to be contacted about this request.",
          "J’accepte d’être contacté au sujet de cette demande.",
        )}
      </label>
      <Button disabled={busy}>
        <Send size={16} />
        {busy
          ? t("Sending…", "Envoi…")
          : publicDraft
            ? t("Review my enquiry", "Relire ma demande")
            : t("Submit request", "Envoyer la demande")}
      </Button>
    </>
  );
}
export function RequestBrief({ request }: { request: ServiceRequest }) {
  const { locale, t } = useLanguage();
  const country = countries(locale).find(
    (c) => c.code === request.country,
  )?.name;
  return (
    <details className="request-brief">
      <summary>
        {t("View the complete brief", "Voir la demande complète")}
      </summary>
      <dl>
        {findCourse(request.course) && (
          <>
            <dt>
              {t("Course / service area", "Formation / domaine de service")}
            </dt>
            <dd>{findCourse(request.course)!.title[locale]}</dd>
          </>
        )}
        <dt>{t("Location", "Localisation")}</dt>
        <dd>
          {[country, request.city, request.timezone]
            .filter(Boolean)
            .join(" · ") ||
            t(
              "Not provided in this earlier request",
              "Non renseigné dans cette ancienne demande",
            )}
        </dd>
        <dt>{t("Preferred contact", "Contact souhaité")}</dt>
        <dd>
          {request.contact === "phone" ? t("Phone", "Téléphone") : "Email"} ·{" "}
          {request.language.toUpperCase()}
        </dd>
        <dt>{t("Preferred timing", "Période souhaitée")}</dt>
        <dd>
          {timeframes.find((f) => f.id === request.timeframe)?.[locale] || "—"}
        </dd>
        {questionsFor(request.service, request.course)
          .filter((question) => request.answers?.[question.id])
          .map((question) => (
            <div key={question.id}>
              <dt>{question.label[locale]}</dt>
              <dd>{request.answers[question.id]}</dd>
            </div>
          ))}
      </dl>
    </details>
  );
}
