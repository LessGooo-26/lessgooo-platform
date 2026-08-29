import { LinkButton } from '../components/ui/LinkButton'
import { Section } from '../components/ui/Section'
import { useLocale } from '../i18n/LocaleContext'
import { publicRoutes } from '../routes/public-routes'

export function NotFoundPage() {
  const { content } = useLocale()

  return (
    <Section className="page-intro" labelledBy="not-found-title">
      <h1 id="not-found-title">{content.notFound.title}</h1>
      <p className="page-intro__description">{content.notFound.message}</p>
      <LinkButton to={publicRoutes.home}>{content.notFound.returnHome}</LinkButton>
    </Section>
  )
}
