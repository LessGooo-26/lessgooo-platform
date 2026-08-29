export type Locale = 'en' | 'fr'

type SiteCopy = {
  skipToContent: string
  homeLabel: string
  primaryNavigation: string
  home: string
  languageLabel: string
  publicWebsite: string
  homeTitle: string
  homeIntroduction: string
  notFoundTitle: string
  notFoundMessage: string
  returnHome: string
  footer: string
}

export const copy: Record<Locale, SiteCopy> = {
  en: {
    skipToContent: 'Skip to main content',
    homeLabel: 'LESSGOOO home',
    primaryNavigation: 'Primary navigation',
    home: 'Home',
    languageLabel: 'Language',
    publicWebsite: 'Public website',
    homeTitle: 'LESSGOOO',
    homeIntroduction: 'The public website is being prepared.',
    notFoundTitle: 'Page not found',
    notFoundMessage: 'The page you requested does not exist.',
    returnHome: 'Return home',
    footer: 'LESSGOOO',
  },
  fr: {
    skipToContent: 'Aller au contenu principal',
    homeLabel: 'Accueil LESSGOOO',
    primaryNavigation: 'Navigation principale',
    home: 'Accueil',
    languageLabel: 'Langue',
    publicWebsite: 'Site public',
    homeTitle: 'LESSGOOO',
    homeIntroduction: 'Le site public est en cours de préparation.',
    notFoundTitle: 'Page introuvable',
    notFoundMessage: "La page demandée n’existe pas.",
    returnHome: 'Retour à l’accueil',
    footer: 'LESSGOOO',
  },
}

