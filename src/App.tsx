import { useEffect, useState } from 'react'
import { Link, Route, Routes } from 'react-router-dom'
import { copy, type Locale } from './content/site-copy'

export function App() {
  const [locale, setLocale] = useState<Locale>('en')
  const text = copy[locale]

  useEffect(() => {
    document.documentElement.lang = locale
  }, [locale])

  return (
    <div className="site-shell">
      <a className="skip-link" href="#main-content">
        {text.skipToContent}
      </a>
      <header className="site-header">
        <Link className="site-name" to="/" aria-label={text.homeLabel}>
          LESSGOOO
        </Link>
        <nav aria-label={text.primaryNavigation}>
          <Link to="/">{text.home}</Link>
        </nav>
        <div className="language-switcher" aria-label={text.languageLabel}>
          <button
            type="button"
            aria-pressed={locale === 'en'}
            onClick={() => setLocale('en')}
          >
            EN
          </button>
          <button
            type="button"
            aria-pressed={locale === 'fr'}
            onClick={() => setLocale('fr')}
          >
            FR
          </button>
        </div>
      </header>

      <main id="main-content" tabIndex={-1}>
        <Routes>
          <Route path="/" element={<Home locale={locale} />} />
          <Route path="*" element={<NotFound locale={locale} />} />
        </Routes>
      </main>

      <footer className="site-footer">
        <p>{text.footer}</p>
      </footer>
    </div>
  )
}

function Home({ locale }: { locale: Locale }) {
  const text = copy[locale]

  return (
    <section className="page" aria-labelledby="home-title">
      <p className="eyebrow">{text.publicWebsite}</p>
      <h1 id="home-title">{text.homeTitle}</h1>
      <p>{text.homeIntroduction}</p>
    </section>
  )
}

function NotFound({ locale }: { locale: Locale }) {
  const text = copy[locale]

  return (
    <section className="page" aria-labelledby="not-found-title">
      <h1 id="not-found-title">{text.notFoundTitle}</h1>
      <p>{text.notFoundMessage}</p>
      <Link to="/">{text.returnHome}</Link>
    </section>
  )
}

