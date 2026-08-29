import { NavLink } from 'react-router-dom'
import { useLocale } from '../../i18n/LocaleContext'
import { primaryNavigationIds, publicRoutes } from '../../routes/public-routes'

export function Navigation() {
  const { content } = useLocale()

  return (
    <nav className="desktop-navigation" aria-label={content.shell.primaryNavigation}>
      <ul className="navigation-list">
        {primaryNavigationIds.map((routeId) => (
          <li key={routeId}>
            <NavLink to={publicRoutes[routeId]}>{content.navigation[routeId]}</NavLink>
          </li>
        ))}
      </ul>
    </nav>
  )
}

