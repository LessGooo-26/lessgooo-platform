import { useLocale } from '../../i18n/LocaleContext'
import { Button } from '../ui/Button'

export function LanguageSwitcher() {
  const { locale, setLocale, content } = useLocale()

  return (
    <div className="language-switcher" aria-label={content.shell.languageLabel}>
      <Button
        variant="quiet"
        type="button"
        aria-pressed={locale === 'en'}
        aria-label="English"
        onClick={() => setLocale('en')}
      >
        EN
      </Button>
      <Button
        variant="quiet"
        type="button"
        aria-pressed={locale === 'fr'}
        aria-label="Français"
        onClick={() => setLocale('fr')}
      >
        FR
      </Button>
    </div>
  )
}

