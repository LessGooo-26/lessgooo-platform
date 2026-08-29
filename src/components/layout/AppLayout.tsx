import type { ReactNode } from 'react'
import { useLocale } from '../../i18n/LocaleContext'
import { Footer } from './Footer'
import { Header } from './Header'

export function AppLayout({ children }: { children: ReactNode }) {
  const { content } = useLocale()

  return (
    <div className="site-shell">
      <a className="skip-link" href="#main-content">{content.shell.skipToContent}</a>
      <Header />
      <main id="main-content" tabIndex={-1}>{children}</main>
      <Footer />
    </div>
  )
}
