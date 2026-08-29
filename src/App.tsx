import { Route, Routes } from 'react-router-dom'
import { AppLayout } from './components/layout/AppLayout'
import { LocaleProvider } from './i18n/LocaleContext'
import { HomePage } from './pages/HomePage'
import { NotFoundPage } from './pages/NotFoundPage'
import { PreparedPage } from './pages/PreparedPage'
import { publicRoutes, type PublicRouteId } from './routes/public-routes'

const preparedRouteIds = Object.keys(publicRoutes).filter(
  (routeId): routeId is Exclude<PublicRouteId, 'home'> => routeId !== 'home',
)

export function App() {
  return (
    <LocaleProvider>
      <AppLayout>
        <Routes>
          <Route path={publicRoutes.home} element={<HomePage />} />
          {preparedRouteIds.map((routeId) => (
            <Route key={routeId} path={publicRoutes[routeId]} element={<PreparedPage routeId={routeId} />} />
          ))}
          <Route path="*" element={<NotFoundPage />} />
        </Routes>
      </AppLayout>
    </LocaleProvider>
  )
}
