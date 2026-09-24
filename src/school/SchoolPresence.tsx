import { useEffect, useState } from "react";
import type { Persona } from "../campus/lib/model";
import { useLanguage } from "../campus/lib/language";
import { schoolRequest, schoolError } from "./api";
import type { SchoolCatalog } from "./model";

type Presence = {
  count: number;
  self: boolean;
  roster: { id: string; name: string; online: boolean; classIds: string[] }[];
};
export function SchoolPresence({
  persona,
  classId,
  catalog,
}: {
  persona: Persona;
  classId: string;
  catalog: SchoolCatalog;
}) {
  const { locale } = useLanguage(),
    fr = locale === "fr";
  const [joined, setJoined] = useState(false),
    [data, setData] = useState<Presence | null>(null),
    [error, setError] = useState("");
  useEffect(() => {
    let stopped = false;
    const token = crypto.randomUUID();
    const update = async () => {
      try {
        const result = await schoolRequest<Presence>(
          "presence",
          persona,
          joined
            ? { token, classId, active: document.visibilityState === "visible" }
            : undefined,
        );
        if (!stopped) {
          setData(result);
          setError("");
        }
      } catch (e) {
        if (!stopped) {
          setData(null);
          setError(schoolError(e, fr));
        }
      }
    };
    const leave = () => {
      if (joined)
        void fetch("/api/school/presence", {
          method: "POST",
          keepalive: true,
          headers: {
            "Content-Type": "application/json",
            "x-campus-persona": persona,
          },
          body: JSON.stringify({ token, classId, active: false }),
        }).catch(() => {});
    };
    void update();
    const timer = window.setInterval(() => void update(), 25000);
    document.addEventListener("visibilitychange", update);
    window.addEventListener("pagehide", leave);
    return () => {
      stopped = true;
      clearInterval(timer);
      document.removeEventListener("visibilitychange", update);
      window.removeEventListener("pagehide", leave);
      leave();
    };
  }, [joined, persona, classId, fr]);
  return (
    <section className="school-card school-presence">
      <div className="school-section-heading">
        <h3>
          {fr
            ? "Qui est dans l'espace scolaire ?"
            : "Who is in the school space?"}
        </h3>
        <p>
          {fr
            ? "Présence volontaire des profils de démonstration. Un onglet actif ne prouve pas la participation à un cours. Le signal expire après 90 secondes sans réponse."
            : "Voluntary presence for demonstration profiles. An active tab does not prove class attendance. The signal expires after 90 seconds without a response."}
        </p>
      </div>
      <p role="status">
        <span className={data?.self ? "school-dot online" : "school-dot"} />
        {data
          ? `${data.count} ${fr ? "profil(s) actif(s)" : "active profile(s)"}`
          : fr
            ? "Présence indisponible"
            : "Presence unavailable"}
        {data?.self &&
          ` · ${persona === "parent" ? (fr ? "Le profil enfant est en ligne" : "The child profile is online") : fr ? "Votre profil est en ligne" : "Your profile is online"}`}
      </p>
      {persona !== "parent" && (
        <button onClick={() => setJoined(!joined)}>
          {joined
            ? fr
              ? "Quitter l'espace en ligne"
              : "Leave the online space"
            : fr
              ? "Signaler ma présence"
              : "Show that I am here"}
        </button>
      )}
      {error && <p role="alert">{error}</p>}
      {persona === "teacher" && data && (
        <ul className="school-roster">
          {data.roster.map((row) => (
            <li key={row.id}>
              <span>
                <span
                  className={row.online ? "school-dot online" : "school-dot"}
                />
                {row.name}
              </span>
              <span>
                {row.online
                  ? fr
                    ? "En ligne"
                    : "Online"
                  : fr
                    ? "Hors ligne"
                    : "Offline"}{" "}
                {row.classIds
                  .map(
                    (id) =>
                      catalog.classes.find((c) => c.id === id)?.name[locale],
                  )
                  .filter(Boolean)
                  .join(", ")}
              </span>
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}
