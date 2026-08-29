import { ProgramCard } from '../components/content/ProgramCard'
import { Section } from '../components/ui/Section'
import { useLocale } from '../i18n/LocaleContext'
import { programRouteIds, publicRoutes, type PublicRouteId } from '../routes/public-routes'

export function PreparedPage({ routeId }: { routeId: Exclude<PublicRouteId, 'home'> }) {
  const { content } = useLocale()
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
    </>
  )
}

