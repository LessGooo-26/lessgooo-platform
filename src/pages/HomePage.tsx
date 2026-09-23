import { CourseDirectory } from "../components/content/CourseDirectory";
import { CallToAction } from "../components/content/CallToAction";
import { FeatureCard } from "../components/content/FeatureCard";
import { Hero } from "../components/content/Hero";
import { ProgramCard } from "../components/content/ProgramCard";
import { Section } from "../components/ui/Section";
import { SectionHeading } from "../components/ui/SectionHeading";
import { useLocale } from "../i18n/LocaleContext";
import { publicRoutes } from "../routes/public-routes";
import { LearningPreview } from "../components/content/LearningPreview";

export function HomePage() {
  const { content } = useLocale();
  const home = content.home;

  return (
    <>
      <Hero
        eyebrow={home.eyebrow}
        title={home.title}
        introduction={home.introduction}
        primaryAction={{
          label: home.explorePrograms,
          to: publicRoutes.programs,
        }}
        secondaryAction={{ label: home.learnAbout, to: publicRoutes.about }}
      />
      <Section labelledBy="approach-title">
        <SectionHeading
          id="approach-title"
          eyebrow={home.approachEyebrow}
          title={home.approachTitle}
          description={home.approachIntroduction}
        />
        <div className="feature-grid">
          {home.features.map((feature, index) => (
            <FeatureCard
              key={feature.title}
              number={String(index + 1).padStart(2, "0")}
              title={feature.title}
              description={feature.description}
            />
          ))}
        </div>
      </Section>
      <Section labelledBy="learners-title" tone="contrast">
        <div className="split-layout">
          <p className="eyebrow">{home.learnersEyebrow}</p>
          <div>
            <h2 id="learners-title">{home.learnersTitle}</h2>
            <p>{home.learnersDescription}</p>
          </div>
        </div>
      </Section>
      <Section labelledBy="programs-title" tone="subtle">
        <SectionHeading
          id="programs-title"
          eyebrow={home.programsEyebrow}
          title={home.programsTitle}
          description={home.programsIntroduction}
        />
        <CourseDirectory />
        <h3 className="other-programs-title">{content.navigation.programs}</h3>
        <div className="program-grid">
          {content.programs
            .filter((p) =>
              ["kids", "iotArduino", "languages"].includes(p.routeId),
            )
            .map((program) => (
              <ProgramCard
                key={program.routeId}
                title={program.title}
                description={program.description}
                linkLabel={home.learnMore}
                to={publicRoutes[program.routeId]}
              />
            ))}
        </div>
      </Section>
      <Section labelledBy="continuity-title">
        <CallToAction
          eyebrow={home.continuityEyebrow}
          title={home.continuityTitle}
          description={home.continuityDescription}
          action={{ label: home.contactAction, to: publicRoutes.contact }}
        />
      </Section>
      <LearningPreview />
    </>
  );
}
