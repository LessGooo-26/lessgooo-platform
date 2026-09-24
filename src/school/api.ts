import type { Persona } from "../campus/lib/model";
export async function schoolRequest<T>(
  route: string,
  persona?: Persona,
  data?: unknown,
): Promise<T> {
  if (import.meta.env.BASE_URL === "/lessgooo-platform/")
    throw new Error("SCHOOL_OFFLINE");
  const response = await fetch(`/api/school/${route}`, {
    method: data === undefined ? "GET" : "POST",
    headers: {
      ...(persona ? { "x-campus-persona": persona } : {}),
      ...(data === undefined ? {} : { "Content-Type": "application/json" }),
    },
    ...(data === undefined ? {} : { body: JSON.stringify(data) }),
  });
  if (!response.headers.get("content-type")?.includes("application/json"))
    throw new Error("SCHOOL_OFFLINE");
  const result = await response.json();
  if (!response.ok) throw new Error(result.error || "SCHOOL_FAILED");
  return result;
}
export function schoolError(error: unknown, fr: boolean) {
  const code = error instanceof Error ? error.message : "";
  const messages: Record<string, [string, string]> = {
    SCHOOL_LESSON_CHANGED: [
      "Le catalogue a été mis à jour pendant votre exercice. Rechargez la page pour répondre à la version actuelle ; cet essai n'a pas été enregistré.",
      "The catalogue changed during your exercise. Reload to answer the current version; this attempt was not saved.",
    ],
    SCHOOL_CONFLICT: [
      "Le catalogue a changé dans une autre fenêtre. Exportez votre brouillon, puis rechargez avant de fusionner vos changements.",
      "The catalogue changed in another window. Export your draft, then reload before merging your changes.",
    ],
    SCHOOL_INVALID: [
      "Vérifiez les champs, les identifiants, les réponses et les chevauchements d'horaires.",
      "Check fields, identifiers, answers and timetable overlaps.",
    ],
    SCHOOL_MEDIA: [
      "Choisissez un fichier terminé, partagé et appartenant au formateur.",
      "Choose a completed, shared file owned by the teacher.",
    ],
    SCHOOL_ANSWERS: [
      "Répondez à toutes les questions avant de valider.",
      "Answer every question before submitting.",
    ],
    SCHOOL_FORBIDDEN: [
      "Cette action n'est pas autorisée dans cette vue de démonstration.",
      "This action is not allowed in this demonstration view.",
    ],
    SCHOOL_READ_ONLY: [
      "Le suivi parent est en lecture seule.",
      "Parent progress is read-only.",
    ],
  };
  return (messages[code] || [
    "Connexion indisponible. Votre saisie reste affichée ; réessayez depuis le serveur local.",
    "Connection unavailable. Your input remains visible; retry using the local server.",
  ])[fr ? 0 : 1];
}
