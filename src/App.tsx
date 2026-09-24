import { lazy, Suspense } from "react";
import { Route, Routes } from "react-router-dom";
import { AppLayout } from "./components/layout/AppLayout";
import { LocaleProvider } from "./i18n/LocaleContext";
import { HomePage } from "./pages/HomePage";
import { NotFoundPage } from "./pages/NotFoundPage";
import { PreparedPage } from "./pages/PreparedPage";
import { publicRoutes, type PublicRouteId } from "./routes/public-routes";

const SchoolHub = lazy(() => import("./school/SchoolHub"));
const CoursePage = lazy(() =>
  import("./pages/CoursePage").then((m) => ({ default: m.CoursePage })),
);

const preparedRouteIds = Object.keys(publicRoutes).filter(
  (routeId): routeId is Exclude<PublicRouteId, "home"> => routeId !== "home",
);

export function App() {
  return (
    <LocaleProvider>
      <AppLayout>
        <Suspense fallback={<p role="status">…</p>}>
          <Routes>
            <Route path={publicRoutes.home} element={<HomePage />} />
            {preparedRouteIds.map((routeId) => (
              <Route
                key={routeId}
                path={publicRoutes[routeId]}
                element={<PreparedPage key={routeId} routeId={routeId} />}
              />
            ))}
            <Route path="/school" element={<SchoolHub />} />
            <Route path="/courses/:courseId" element={<CoursePage />} />
            <Route path="*" element={<NotFoundPage />} />
          </Routes>
        </Suspense>
      </AppLayout>
    </LocaleProvider>
  );
}
