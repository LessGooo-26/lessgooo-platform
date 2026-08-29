import { Link } from 'react-router-dom'
import { useLocale } from '../../i18n/LocaleContext'
import { publicRoutes } from '../../routes/public-routes'
import { Container } from '../ui/Container'
import { LanguageSwitcher } from './LanguageSwitcher'
import { MobileNavigation } from './MobileNavigation'
import { Navigation } from './Navigation'

export function Header() {
  const { content } = useLocale()

  return (
    <header className="site-header">
      <Container className="site-header__inner">
        <Link className="site-name" to={publicRoutes.home} aria-label={content.shell.homeLabel}>
          LESSGOOO
        </Link>
        <Navigation />
        <LanguageSwitcher />
        <MobileNavigation />
      </Container>
    </header>
  )
}

