import type { ProgramRouteId, PublicRouteId } from '../routes/public-routes'

export type Locale = 'en' | 'fr'

export type ProgramContent = {
  routeId: ProgramRouteId
  title: string
  description: string
}

type FeatureContent = {
  title: string
  description: string
}

type SiteContent = {
  navigation: Record<PublicRouteId, string>
  shell: {
    skipToContent: string
    homeLabel: string
    primaryNavigation: string
    footerNavigation: string
    openMenu: string
    closeMenu: string
    mobileNavigation: string
    languageLabel: string
    footerSummary: string
  }
  home: {
    eyebrow: string
    title: string
    introduction: string
    explorePrograms: string
    learnAbout: string
    approachEyebrow: string
    approachTitle: string
    approachIntroduction: string
    features: FeatureContent[]
    learnersEyebrow: string
    learnersTitle: string
    learnersDescription: string
    programsEyebrow: string
    programsTitle: string
    programsIntroduction: string
    learnMore: string
    continuityEyebrow: string
    continuityTitle: string
    continuityDescription: string
    contactAction: string
  }
  programs: ProgramContent[]
  preparedPages: Record<Exclude<PublicRouteId, 'home'>, {
    eyebrow: string
    title: string
    description: string
  }>
  notFound: {
    title: string
    message: string
    returnHome: string
  }
}

export const siteContent: Record<Locale, SiteContent> = {
  en: {
    navigation: {
      home: 'Home',
      about: 'About LESSGOOO',
      programs: 'Programs',
      kids: 'LESSGOOO Kids',
      devopsCloudAi: 'DevOps / Cloud / AI',
      linux: 'Linux',
      webDevelopment: 'Web Development',
      iotArduino: 'IoT / Arduino',
      modernSecretariat: 'Modern Secretariat',
      languages: 'Languages',
      partners: 'Partners',
      contact: 'Contact',
    },
    shell: {
      skipToContent: 'Skip to main content',
      homeLabel: 'LESSGOOO home',
      primaryNavigation: 'Primary navigation',
      footerNavigation: 'Footer navigation',
      openMenu: 'Open menu',
      closeMenu: 'Close menu',
      mobileNavigation: 'Mobile navigation',
      languageLabel: 'Language',
      footerSummary: 'Practical technology education in Cameroon.',
    },
    home: {
      eyebrow: 'Technology education in Cameroon',
      title: 'Learn technology by doing.',
      introduction:
        'LESSGOOO makes practical digital, technical and professional skills understandable for learners in Cameroon.',
      explorePrograms: 'Explore programs',
      learnAbout: 'About LESSGOOO',
      approachEyebrow: 'How learning works',
      approachTitle: 'Practice builds understanding.',
      approachIntroduction:
        'Learning goes beyond definitions. Learners use technology, explore how it works and build confidence through continued practice.',
      features: [
        {
          title: 'Learn by doing',
          description: 'Practical activities connect ideas to real software, equipment and tasks.',
        },
        {
          title: 'Start with foundations',
          description: 'Clear explanations build understanding before more advanced tools and concepts.',
        },
        {
          title: 'Keep learning',
          description: 'Continuous practice helps learners develop useful, lasting technology skills.',
        },
      ],
      learnersEyebrow: 'Learning for different stages',
      learnersTitle: 'For children, adults and professionals.',
      learnersDescription:
        'LESSGOOO supports children beginning with technology and adults or professionals developing practical digital and technical skills.',
      programsEyebrow: 'Confirmed program families',
      programsTitle: 'Explore practical learning paths.',
      programsIntroduction:
        'Discover the major areas of learning currently documented by LESSGOOO.',
      learnMore: 'Learn more',
      continuityEyebrow: 'A long-term mindset',
      continuityTitle: 'Technology learning continues.',
      continuityDescription:
        'LESSGOOO emphasizes continued learning and practice rather than treating technology education as a one-time event.',
      contactAction: 'Contact LESSGOOO',
    },
    programs: [
      {
        routeId: 'kids',
        title: 'LESSGOOO Kids',
        description: 'Practical computer and technology learning for children, with an emphasis on continuity.',
      },
      {
        routeId: 'devopsCloudAi',
        title: 'DevOps / Cloud / AI',
        description: 'Structured professional learning across modern infrastructure, cloud and AI themes.',
      },
      {
        routeId: 'linux',
        title: 'Linux',
        description: 'Foundations, systems understanding, troubleshooting, scripting and DevOps relevance.',
      },
      {
        routeId: 'webDevelopment',
        title: 'Web Development',
        description: 'Practical web and software development learning, including appropriate use of AI tools.',
      },
      {
        routeId: 'iotArduino',
        title: 'IoT / Arduino',
        description: 'Hands-on activities that make sensors, automation and connected technology tangible.',
      },
      {
        routeId: 'modernSecretariat',
        title: 'Modern Secretariat',
        description: 'Office skills combined with digital productivity, collaboration and professional communication.',
      },
      {
        routeId: 'languages',
        title: 'Languages',
        description: 'Language learning that may include English and German.',
      },
    ],
    preparedPages: {
      about: {
        eyebrow: 'About',
        title: 'About LESSGOOO',
        description: 'Learn about LESSGOOO’s practical approach to technology and professional education in Cameroon.',
      },
      programs: {
        eyebrow: 'Programs',
        title: 'Practical learning paths',
        description: 'Explore the confirmed program families documented by LESSGOOO.',
      },
      kids: {
        eyebrow: 'Program family',
        title: 'LESSGOOO Kids',
        description: 'Practical computer and technology education for children with an emphasis on continuous learning.',
      },
      devopsCloudAi: {
        eyebrow: 'Program family',
        title: 'DevOps / Cloud / AI',
        description: 'Structured professional learning in DevOps, cloud computing and artificial intelligence.',
      },
      linux: {
        eyebrow: 'Program family',
        title: 'Linux',
        description: 'Learning focused on foundations, systems understanding and practical troubleshooting.',
      },
      webDevelopment: {
        eyebrow: 'Program family',
        title: 'Web Development',
        description: 'Practical web and software development learning.',
      },
      iotArduino: {
        eyebrow: 'Program family',
        title: 'IoT / Arduino',
        description: 'Practical activities that make technology, sensors and automation tangible.',
      },
      modernSecretariat: {
        eyebrow: 'Program family',
        title: 'Modern Secretariat',
        description: 'Traditional office skills combined with modern digital productivity and communication.',
      },
      languages: {
        eyebrow: 'Program family',
        title: 'Languages',
        description: 'Language learning, including English and German.',
      },
      partners: {
        eyebrow: 'Partners',
        title: 'Partners',
        description: 'Approved public partnership information will be added when it is confirmed.',
      },
      contact: {
        eyebrow: 'Contact',
        title: 'Contact LESSGOOO',
        description: 'Confirmed public contact information will be added here when available.',
      },
    },
    notFound: {
      title: 'Page not found',
      message: 'The page you requested does not exist.',
      returnHome: 'Return home',
    },
  },
  fr: {
    navigation: {
      home: 'Accueil',
      about: 'À propos de LESSGOOO',
      programs: 'Programmes',
      kids: 'LESSGOOO Kids',
      devopsCloudAi: 'DevOps / Cloud / IA',
      linux: 'Linux',
      webDevelopment: 'Développement web',
      iotArduino: 'IoT / Arduino',
      modernSecretariat: 'Secrétariat moderne',
      languages: 'Langues',
      partners: 'Partenaires',
      contact: 'Contact',
    },
    shell: {
      skipToContent: 'Aller au contenu principal',
      homeLabel: 'Accueil LESSGOOO',
      primaryNavigation: 'Navigation principale',
      footerNavigation: 'Navigation de pied de page',
      openMenu: 'Ouvrir le menu',
      closeMenu: 'Fermer le menu',
      mobileNavigation: 'Navigation mobile',
      languageLabel: 'Langue',
      footerSummary: 'Une formation technologique pratique au Cameroun.',
    },
    home: {
      eyebrow: 'Formation technologique au Cameroun',
      title: 'Apprendre la technologie par la pratique.',
      introduction:
        'LESSGOOO rend les compétences numériques, techniques et professionnelles pratiques plus compréhensibles pour les apprenants au Cameroun.',
      explorePrograms: 'Explorer les programmes',
      learnAbout: 'À propos de LESSGOOO',
      approachEyebrow: 'Notre approche',
      approachTitle: 'La pratique développe la compréhension.',
      approachIntroduction:
        'L’apprentissage va au-delà des définitions. Les apprenants utilisent la technologie, découvrent son fonctionnement et renforcent leurs compétences par une pratique continue.',
      features: [
        {
          title: 'Apprendre en pratiquant',
          description: 'Les activités pratiques relient les idées aux logiciels, aux équipements et aux tâches concrètes.',
        },
        {
          title: 'Commencer par les bases',
          description: 'Des explications claires construisent la compréhension avant les outils et concepts avancés.',
        },
        {
          title: 'Continuer à apprendre',
          description: 'Une pratique continue aide à développer des compétences technologiques utiles et durables.',
        },
      ],
      learnersEyebrow: 'Apprendre à chaque étape',
      learnersTitle: 'Pour les enfants, les adultes et les professionnels.',
      learnersDescription:
        'LESSGOOO accompagne les enfants qui découvrent la technologie ainsi que les adultes et professionnels qui développent des compétences numériques et techniques pratiques.',
      programsEyebrow: 'Familles de programmes confirmées',
      programsTitle: 'Explorer des parcours pratiques.',
      programsIntroduction:
        'Découvrez les principaux domaines d’apprentissage actuellement documentés par LESSGOOO.',
      learnMore: 'En savoir plus',
      continuityEyebrow: 'Une vision à long terme',
      continuityTitle: 'L’apprentissage technologique continue.',
      continuityDescription:
        'LESSGOOO met l’accent sur l’apprentissage et la pratique continus plutôt que sur une formation technologique ponctuelle.',
      contactAction: 'Contacter LESSGOOO',
    },
    programs: [
      {
        routeId: 'kids',
        title: 'LESSGOOO Kids',
        description: 'Une initiation pratique à l’informatique et à la technologie pour les enfants, axée sur la continuité.',
      },
      {
        routeId: 'devopsCloudAi',
        title: 'DevOps / Cloud / IA',
        description: 'Un apprentissage professionnel structuré autour des infrastructures modernes, du cloud et de l’IA.',
      },
      {
        routeId: 'linux',
        title: 'Linux',
        description: 'Bases, compréhension des systèmes, dépannage, scripts et lien avec le DevOps.',
      },
      {
        routeId: 'webDevelopment',
        title: 'Développement web',
        description: 'Un apprentissage pratique du développement web et logiciel, avec un usage adapté des outils d’IA.',
      },
      {
        routeId: 'iotArduino',
        title: 'IoT / Arduino',
        description: 'Des activités pratiques pour rendre concrets les capteurs, l’automatisation et les objets connectés.',
      },
      {
        routeId: 'modernSecretariat',
        title: 'Secrétariat moderne',
        description: 'Les compétences de bureau associées à la productivité numérique, à la collaboration et à la communication professionnelle.',
      },
      {
        routeId: 'languages',
        title: 'Langues',
        description: 'Un apprentissage des langues pouvant inclure l’anglais et l’allemand.',
      },
    ],
    preparedPages: {
      about: {
        eyebrow: 'À propos',
        title: 'À propos de LESSGOOO',
        description: 'Découvrez l’approche pratique de LESSGOOO pour la formation technologique et professionnelle au Cameroun.',
      },
      programs: {
        eyebrow: 'Programmes',
        title: 'Des parcours d’apprentissage pratiques',
        description: 'Explorez les familles de programmes confirmées dans la documentation LESSGOOO.',
      },
      kids: {
        eyebrow: 'Famille de programmes',
        title: 'LESSGOOO Kids',
        description: 'Une formation pratique en informatique et en technologie pour les enfants, axée sur l’apprentissage continu.',
      },
      devopsCloudAi: {
        eyebrow: 'Famille de programmes',
        title: 'DevOps / Cloud / IA',
        description: 'Un apprentissage professionnel structuré en DevOps, cloud computing et intelligence artificielle.',
      },
      linux: {
        eyebrow: 'Famille de programmes',
        title: 'Linux',
        description: 'Un apprentissage axé sur les bases, la compréhension des systèmes et le dépannage pratique.',
      },
      webDevelopment: {
        eyebrow: 'Famille de programmes',
        title: 'Développement web',
        description: 'Un apprentissage pratique du développement web et logiciel.',
      },
      iotArduino: {
        eyebrow: 'Famille de programmes',
        title: 'IoT / Arduino',
        description: 'Des activités pratiques pour rendre concrets la technologie, les capteurs et l’automatisation.',
      },
      modernSecretariat: {
        eyebrow: 'Famille de programmes',
        title: 'Secrétariat moderne',
        description: 'Les compétences traditionnelles de bureau associées à la productivité numérique et à la communication modernes.',
      },
      languages: {
        eyebrow: 'Famille de programmes',
        title: 'Langues',
        description: 'Un apprentissage des langues, dont l’anglais et l’allemand.',
      },
      partners: {
        eyebrow: 'Partenaires',
        title: 'Partenaires',
        description: 'Les informations publiques approuvées sur les partenariats seront ajoutées après confirmation.',
      },
      contact: {
        eyebrow: 'Contact',
        title: 'Contacter LESSGOOO',
        description: 'Les coordonnées publiques confirmées seront ajoutées ici lorsqu’elles seront disponibles.',
      },
    },
    notFound: {
      title: 'Page introuvable',
      message: 'La page demandée n’existe pas.',
      returnHome: 'Retour à l’accueil',
    },
  },
}
