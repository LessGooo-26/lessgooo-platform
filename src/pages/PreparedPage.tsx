import { lazy, Suspense } from "react";
import { Link } from "react-router-dom";
import { SchoolSpotlight } from "../components/content/SchoolSpotlight";
import { ProgramCard } from "../components/content/ProgramCard";
import { CourseDirectory } from "../components/content/CourseDirectory";
import { Section } from "../components/ui/Section";
import { useLocale } from "../i18n/LocaleContext";
import { publicRoutes, type PublicRouteId } from "../routes/public-routes";
import { LearningPreview } from "../components/content/LearningPreview";
import type { CourseId } from "../campus/lib/course-catalog";
import { PublicGuidance } from "../components/content/PublicGuidance";
const ContactEnquiry = lazy(() =>
  import("./ContactEnquiry").then((m) => ({ default: m.ContactEnquiry })),
);
const areas: Partial<Record<PublicRouteId, CourseId[]>> = {
  devopsCloudAi: ["devops", "cloud", "ai-automation"],
  linux: ["linux"],
  webDevelopment: ["ai-web"],
  modernSecretariat: ["secretariat"],
};
export function PreparedPage({
  routeId,
}: {
  routeId: Exclude<PublicRouteId, "home">;
}) {
  const { content, locale } = useLocale();
  const page = content.preparedPages[routeId],
    fr = locale === "fr";
  return (
    <>
      <Section className="page-intro" labelledBy="page-title">
        <p className="eyebrow">{page.eyebrow}</p>
        <h1 id="page-title">{page.title}</h1>
        <p className="page-intro__description">{page.description}</p>
        {routeId === "programs" && (
          <Link to="/faq">
            {fr
              ? "Je ne sais pas par où commencer"
              : "Help me find where to start"}{" "}
            →
          </Link>
        )}
      </Section>
      {(routeId === "programs" || routeId === "services" || areas[routeId]) && (
        <Section tone="subtle">
          {routeId === "programs" && <SchoolSpotlight />}
          <CourseDirectory
            company={routeId === "services"}
            ids={areas[routeId]}
          />
        </Section>
      )}
      {routeId === "programs" && (
        <Section>
          <h2>{fr ? "D’autres façons d’apprendre" : "More ways to learn"}</h2>
          <div className="program-grid">
            {content.programs
              .filter((p) =>
                ["kids", "iotArduino", "languages"].includes(p.routeId),
              )
              .map((p) => (
                <ProgramCard
                  key={p.routeId}
                  title={p.title}
                  description={p.description}
                  linkLabel={content.home.learnMore}
                  to={publicRoutes[p.routeId]}
                />
              ))}
          </div>
        </Section>
      )}
      {[
        "about",
        "kids",
        "iotArduino",
        "languages",
        "partners",
        "faq",
        "services",
      ].includes(routeId) && <PublicGuidance routeId={routeId} />}
      {routeId === "kids" && <LearningPreview track="kids" expanded />}
      {routeId === "contact" && (
        <Section>
          <Suspense
            fallback={
              <p role="status">
                {fr ? "Préparation du formulaire…" : "Preparing the form…"}
              </p>
            }
          >
            <ContactEnquiry />
          </Suspense>
        </Section>
      )}
    </>
  );
}
