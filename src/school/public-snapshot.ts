import { catalogSchema, type SchoolCatalog } from "./model";

// Static publication never includes local media identifiers or class meeting links.
export function publicSnapshot(input: unknown): SchoolCatalog {
  const c = catalogSchema.parse(input);
  c.classes = c.classes.filter((v) => v.active);
  c.subjects = c.subjects.filter((v) => v.active);
  const classes = new Set(c.classes.map((v) => v.id)),
    subjects = new Set(c.subjects.map((v) => v.id));
  c.tutoringSubjectIds = c.tutoringSubjectIds.filter((id) => subjects.has(id));
  c.chapters = c.chapters
    .filter((v) => v.published && subjects.has(v.subjectId))
    .map((v) => ({
      ...v,
      classIds: v.classIds.filter((id) => classes.has(id)),
    }))
    .filter((v) => v.classIds.length);
  c.resources = c.resources
    .filter(
      (v) =>
        v.published &&
        !v.mediaId &&
        (!v.subjectId || subjects.has(v.subjectId)) &&
        (!v.classIds.length || v.classIds.some((id) => classes.has(id))),
    )
    .map((v) => ({
      ...v,
      classIds: v.classIds.filter((id) => classes.has(id)),
    }));
  c.timetable = c.timetable
    .filter(
      (v) =>
        v.status === "confirmed" &&
        classes.has(v.classId) &&
        subjects.has(v.subjectId),
    )
    .map((v) => ({ ...v, meetingUrl: "" }));
  return catalogSchema.parse(c);
}
