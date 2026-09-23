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
          <img className="site-logo" src={`${import.meta.env.BASE_URL}logo-lessgooo.png`} alt="LESSGOOO Academy"/>
        </Link>
        <Navigation />
        <a className="campus-link" href={`${import.meta.env.BASE_URL}campus.html`}>Campus</a>
        <LanguageSwitcher />
        <MobileNavigation />
      </Container>
    </header>
  )
}

