import { useEffect, useId, useState } from 'react'
import { NavLink, useLocation } from 'react-router-dom'
import { useLocale } from '../../i18n/LocaleContext'
import { primaryNavigationIds, publicRoutes } from '../../routes/public-routes'
import { Button } from '../ui/Button'

export function MobileNavigation() {
  const [isOpen, setIsOpen] = useState(false)
  const menuId = useId()
  const location = useLocation()
  const { content } = useLocale()

  useEffect(() => {
    setIsOpen(false)
  }, [location.pathname])

  return (
    <div className="mobile-navigation">
      <Button
        variant="secondary"
        type="button"
        aria-expanded={isOpen}
        aria-controls={menuId}
        onClick={() => setIsOpen((current) => !current)}
      >
        {isOpen ? content.shell.closeMenu : content.shell.openMenu}
      </Button>
      <nav id={menuId} aria-label={content.shell.mobileNavigation} hidden={!isOpen}>
        <ul className="navigation-list navigation-list--mobile">
          {primaryNavigationIds.map((routeId) => (
            <li key={routeId}>
              <NavLink to={publicRoutes[routeId]}>{content.navigation[routeId]}</NavLink>
            </li>
          ))}
        </ul>
      </nav>
    </div>
  )
}

