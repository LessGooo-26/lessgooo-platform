import { ProgramCard } from '../components/content/ProgramCard'
import { Section } from '../components/ui/Section'
import { useLocale } from '../i18n/LocaleContext'
import { programRouteIds, publicRoutes, type PublicRouteId } from '../routes/public-routes'
import { LearningPreview } from '../components/content/LearningPreview'
import { ownerEmail } from '../campus/lib/workspace'

export function PreparedPage({ routeId }: { routeId: Exclude<PublicRouteId, 'home'> }) {
  const { content, locale } = useLocale()
  const page = content.preparedPages[routeId]

  return (
    <>
      <Section className="page-intro" labelledBy="page-title">
        <p className="eyebrow">{page.eyebrow}</p>
        <h1 id="page-title">{page.title}</h1>
        <p className="page-intro__description">{page.description}</p>
      </Section>
      {routeId === 'programs' ? (
        <Section tone="subtle">
          <div className="program-grid">
            {programRouteIds.map((programRouteId) => {
              const program = content.programs.find(({ routeId: id }) => id === programRouteId)!
              return <ProgramCard key={program.routeId} title={program.title} description={program.description} linkLabel={content.home.learnMore} to={publicRoutes[program.routeId]} />
            })}
          </div>
        </Section>
      ) : null}
      {['kids','devopsCloudAi','linux','programs'].includes(routeId) && <LearningPreview track={routeId==='kids'?'kids':routeId==='programs'?undefined:'devops'} expanded/>}
      {routeId==='contact' && <Section><div className="public-career-callout"><div><h2>{locale==='fr'?'Construisons ton parcours.':'Let’s build your learning path.'}</h2><p>{locale==='fr'?'Formation, préparation aux entretiens ou accompagnement de ton enfant : explique-nous ton objectif.':'Training, interview preparation or your child’s learning: tell us about your goal.'}</p></div><a href={`mailto:${ownerEmail}`}>{ownerEmail}</a></div></Section>}
    </>
  )
}

