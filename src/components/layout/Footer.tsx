import { Link } from 'react-router-dom'
import { useLocale } from '../../i18n/LocaleContext'
import { publicRoutes } from '../../routes/public-routes'
import { Container } from '../ui/Container'

export function Footer() {
  const { content } = useLocale()

  return (
    <footer className="site-footer">
      <Container className="site-footer__inner">
        <div>
          <Link className="site-name" to={publicRoutes.home}>LESSGOOO</Link>
          <p>{content.shell.footerSummary}</p>
        </div>
        <nav aria-label={content.shell.footerNavigation}>
          <Link to={publicRoutes.programs}>{content.navigation.programs}</Link>
          <Link to={publicRoutes.about}>{content.navigation.about}</Link>
          <Link to={publicRoutes.contact}>{content.navigation.contact}</Link>
        </nav>
      </Container>
    </footer>
  )
}
