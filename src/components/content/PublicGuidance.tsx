import { Link } from "react-router-dom";
import { Section } from "../ui/Section";
import { useLocale } from "../../i18n/LocaleContext";
import type { PublicRouteId } from "../../routes/public-routes";
const copy = {
  en: {
    about: [
      [
        "Technology you can understand and use",
        "LESSGOOO is an education and technology training initiative in Cameroon. We connect computer foundations, practical technology and professional skills for children, young people, adults and professionals.",
      ],
      [
        "Understand, try, explain",
        "Start with a clear explanation, practise on a small task, and describe what happened. A project gives you something concrete to show and a way to identify what needs more practice.",
      ],
      [
        "Choose a path that fits your goal",
        "Explore the course prerequisites and starter projects before making an enquiry. Tell us what you can already do, your available equipment and the result you want to achieve.",
      ],
    ],
    kids: [
      [
        "Build confidence with technology",
        "Children explore computer basics, files, programming foundations and practical technology activities. Learning emphasizes continued practice rather than a single holiday course.",
      ],
      [
        "Prepare together",
        "A parent or guardian can explain the child’s interests, current computer experience and access to equipment. Discuss suitable activities and guidance with LESSGOOO; age ranges, schedules and fees must be confirmed.",
      ],
      [
        "A small activity to try",
        "With adult guidance, create a practice folder, save a drawing and explain how to find it again. Focus on understanding the steps, then explore the lesson previews below.",
      ],
    ],
    iotArduino: [
      [
        "Make technology tangible",
        "IoT connects physical devices with digital systems. Arduino activities help explain how a program reads a sensor and controls an output, such as a light.",
      ],
      [
        "Prepare before buying equipment",
        "Basic computer skills and curiosity about electronics help. Start by drawing an input → program → output diagram. Ask which board, cable and components are appropriate before buying a kit.",
      ],
      [
        "A safe starting project",
        "Plan a simulated light that responds to a sensor. Explain the input, the decision and the output. Hardware activities need suitable supervision; begin with low-voltage learning equipment.",
      ],
    ],
    languages: [
      [
        "Language for everyday and professional situations",
        "LESSGOOO’s language program family includes English and German. Describe the situations in which you want to communicate, such as introducing yourself or writing a professional message.",
      ],
      [
        "Prepare your starting point",
        "Tell us which language interests you, what you already understand, and whether you need speaking, listening, reading or writing practice. Specific levels, assessments and current availability are to be discussed.",
      ],
      [
        "Try a first activity",
        "Write five sentences introducing yourself and your learning goal. Read them aloud, note the words you find difficult, and use those notes to explain the support you need.",
      ],
    ],
    partners: [
      [
        "Discuss a collaboration",
        "For a training or company collaboration, describe your organization, audience, objectives and the contribution you have in mind.",
      ],
      [
        "Ask about a specific program",
        "Contact LESSGOOO to confirm who delivers the training, which activities are included and what arrangements apply before making a decision. Partnership details and any certification terms should be confirmed directly.",
      ],
    ],
    services: [
      [
        "Explain your challenge",
        "Choose a service area and tell us how your team works today. Include the tools you use, the people involved and the problem you want to solve.",
      ],
      [
        "Agree on a practical scope",
        "Use the preparation checklist to discuss deliverables, responsibilities, access needs and success criteria. Availability, fees and delivery terms are agreed separately.",
      ],
      [
        "Prepare for handover",
        "Discuss how your team will use, maintain and evaluate the result. Your brief can include documentation, staff training and an example workflow to test.",
      ],
    ],
  },
  fr: {
    about: [
      [
        "Une technologie compréhensible et utile",
        "LESSGOOO est une initiative de formation et d’éducation technologique au Cameroun. Elle relie les bases informatiques, la pratique et les compétences professionnelles pour les enfants, les jeunes, les adultes et les professionnels.",
      ],
      [
        "Comprendre, essayer, expliquer",
        "Commencez par une explication claire, réalisez une petite activité et décrivez le résultat. Un projet permet de montrer votre travail et d’identifier les points à approfondir.",
      ],
      [
        "Un parcours adapté à votre objectif",
        "Explorez les prérequis et les projets de démarrage avant de nous contacter. Précisez ce que vous savez déjà faire, le matériel disponible et le résultat souhaité.",
      ],
    ],
    kids: [
      [
        "Prendre confiance avec la technologie",
        "Les enfants découvrent les bases informatiques, les fichiers, la programmation et des activités technologiques concrètes. La démarche privilégie une pratique continue au-delà des vacances.",
      ],
      [
        "Se préparer ensemble",
        "Un parent ou responsable peut décrire les centres d’intérêt, l’expérience informatique et le matériel disponible. Discutez des activités et de l’accompagnement adaptés ; les âges, horaires et tarifs restent à confirmer.",
      ],
      [
        "Une première activité",
        "Avec l’aide d’un adulte, créez un dossier d’exercice, enregistrez un dessin et expliquez comment le retrouver. Comprenez chaque étape, puis explorez les leçons ci-dessous.",
      ],
    ],
    iotArduino: [
      [
        "Rendre la technologie concrète",
        "Les objets connectés relient des appareils physiques à des systèmes numériques. Les activités Arduino aident à comprendre comment un programme lit un capteur et commande une sortie, comme une lumière.",
      ],
      [
        "Se préparer avant tout achat",
        "Les bases informatiques et la curiosité pour l’électronique sont utiles. Dessinez d’abord une chaîne entrée → programme → sortie. Demandez quelle carte, quel câble et quels composants conviennent avant d’acheter un kit.",
      ],
      [
        "Un premier projet accessible",
        "Imaginez une lumière simulée qui réagit à un capteur. Expliquez l’entrée, la décision et la sortie. La manipulation de matériel nécessite un encadrement adapté ; commencez avec du matériel pédagogique à basse tension.",
      ],
    ],
    languages: [
      [
        "Communiquer au quotidien et au travail",
        "La famille de programmes linguistiques de LESSGOOO comprend l’anglais et l’allemand. Décrivez les situations dans lesquelles vous souhaitez communiquer, comme vous présenter ou rédiger un message professionnel.",
      ],
      [
        "Préciser votre point de départ",
        "Indiquez la langue souhaitée, votre compréhension actuelle et les compétences à pratiquer : expression orale, écoute, lecture ou écriture. Les niveaux, évaluations et disponibilités sont à discuter.",
      ],
      [
        "Une première activité",
        "Écrivez cinq phrases pour vous présenter et expliquer votre objectif. Lisez-les à voix haute, notez les mots difficiles et utilisez ces notes pour décrire l’aide souhaitée.",
      ],
    ],
    partners: [
      [
        "Discuter d’une collaboration",
        "Pour une collaboration de formation ou un projet d’entreprise, présentez votre organisation, le public concerné, les objectifs et la contribution envisagée.",
      ],
      [
        "Se renseigner sur un programme",
        "Contactez LESSGOOO pour confirmer les intervenants, les activités et les modalités avant de prendre une décision. Les détails des partenariats et les éventuelles conditions de certification doivent être confirmés directement.",
      ],
    ],
    services: [
      [
        "Expliquer votre besoin",
        "Choisissez un domaine et décrivez le fonctionnement actuel de votre équipe : outils utilisés, personnes concernées et problème à résoudre.",
      ],
      [
        "Définir un périmètre concret",
        "La liste de préparation aide à discuter des livrables, responsabilités, accès nécessaires et critères de réussite. Disponibilités, tarifs et modalités sont convenus séparément.",
      ],
      [
        "Préparer la prise en main",
        "Précisez comment votre équipe utilisera, entretiendra et évaluera le résultat. Votre demande peut inclure de la documentation, une formation et un exemple de processus à tester.",
      ],
    ],
  },
};
const faqs = {
  en: [
    [
      "I am a beginner. Where should I start?",
      "Choose the result you want to achieve, then read the course’s ‘Before you start’ section. Basic typing, files, folders and browser skills help across every area. If these are new, tell us you need guided computer practice.",
    ],
    [
      "Do I need to buy software or open a cloud account?",
      "You can read the outlines and plan starter activities first. Each course explains its tools. Check equipment requirements and possible account costs before installing or purchasing anything.",
    ],
    [
      "How do I get course dates, fees and delivery options?",
      "Prepare an enquiry with your country, time zone, current level and preferred timing. LESSGOOO can discuss the details with you. An enquiry does not create an enrollment, booking or payment.",
    ],
    [
      "Can my company request these services?",
      "Yes. The nine course areas are also company service areas. Select ‘Company services’ and prepare the tailored brief to explain your team’s need and the expected result.",
    ],
    [
      "Are all nine courses complete in the campus?",
      "Each area has a plain-language outline, prerequisites and starter activities. Available detailed lessons are linked where they exist. These outlines do not represent nine fully authored, assessed curricula.",
    ],
    [
      "How do the projects and homework work?",
      "In the local campus, open a lesson and its practice task, submit your work and review the feedback. The DevSecOps application project is split into phases. Access follows the selected local demo profile.",
    ],
    [
      "Why does the campus need a local server?",
      "The public website can run on static hosting. The campus uses a local server for homework, files and other saved work. Start the application locally with npm run dev. The demo profiles are for practice; they are not secure production accounts.",
    ],
    [
      "Can I use French or English?",
      "Use the language buttons at the top. Your choice is shared with the campus on the same site. Your own notes, uploaded documents and external documentation keep their original language.",
    ],
  ],
  fr: [
    [
      "Je débute. Par où commencer ?",
      "Choisissez le résultat souhaité, puis lisez la rubrique « Avant de commencer ». Saisir du texte, utiliser les fichiers, les dossiers et le navigateur aide dans tous les domaines. Si ces notions sont nouvelles, demandez une prise en main accompagnée.",
    ],
    [
      "Faut-il acheter un logiciel ou ouvrir un compte cloud ?",
      "Vous pouvez d’abord lire les parcours et préparer les activités. Chaque domaine indique les outils utiles. Vérifiez les besoins matériels et les éventuels coûts des comptes avant toute installation ou dépense.",
    ],
    [
      "Comment connaître les dates, tarifs et modalités ?",
      "Préparez une demande avec votre pays, fuseau horaire, niveau et période souhaitée. LESSGOOO pourra en discuter avec vous. Une demande ne crée ni inscription, ni réservation, ni paiement.",
    ],
    [
      "Mon entreprise peut-elle demander ces services ?",
      "Oui. Les neuf domaines de formation sont aussi proposés comme services aux entreprises. Choisissez « Services aux entreprises » et remplissez les questions adaptées à votre équipe et au résultat attendu.",
    ],
    [
      "Les neuf formations sont-elles complètes dans le campus ?",
      "Chaque domaine présente un parcours, des prérequis et des activités de démarrage. Les leçons détaillées disponibles sont associées quand elles existent. Ces aperçus ne constituent pas neuf cursus entièrement rédigés et évalués.",
    ],
    [
      "Comment fonctionnent les projets et les devoirs ?",
      "Dans le campus local, ouvrez une leçon et son exercice, remettez votre travail et consultez les retours. Le projet d’application DevSecOps est divisé en phases. L’accès suit le profil de démonstration sélectionné.",
    ],
    [
      "Pourquoi le campus a-t-il besoin d’un serveur local ?",
      "Le site public fonctionne sur un hébergement statique. Le campus utilise un serveur local pour les devoirs, fichiers et travaux enregistrés. Démarrez l’application localement avec npm run dev. Les profils de démonstration servent à la pratique ; ce ne sont pas des comptes de production sécurisés.",
    ],
    [
      "Puis-je utiliser le français ou l’anglais ?",
      "Utilisez les boutons de langue en haut de page. Votre choix est partagé avec le campus sur le même site. Vos notes, documents importés et ressources externes conservent leur langue d’origine.",
    ],
  ],
};
export function PublicGuidance({ routeId }: { routeId: PublicRouteId }) {
  const { locale } = useLocale(),
    fr = locale === "fr";
  const cards = copy[locale][routeId as keyof typeof copy.en];
  return (
    <Section>
      <div className="feature-grid">
        {cards?.map(([title, body], i) => (
          <article className="feature-card" key={title}>
            <span className="feature-card__number">0{i + 1}</span>
            <h2>{title}</h2>
            <p>{body}</p>
          </article>
        ))}
      </div>
      {routeId === "faq" && (
        <>
          <ol className="learning-path">
            <li>
              <span>01</span>
              <h2>{fr ? "Choisir un objectif" : "Choose a goal"}</h2>
              <p>
                {fr
                  ? "Une compétence à apprendre ou un besoin d’entreprise à résoudre."
                  : "A skill to learn or a company problem to solve."}
              </p>
              <Link to="/programs">
                {fr ? "Explorer les formations" : "Explore courses"}
              </Link>
            </li>
            <li>
              <span>02</span>
              <h2>
                {fr ? "Vérifier les prérequis" : "Check the prerequisites"}
              </h2>
              <p>
                {fr
                  ? "Votre niveau, votre matériel et les outils du domaine choisi."
                  : "Your starting level, equipment and the tools for your chosen area."}
              </p>
            </li>
            <li>
              <span>03</span>
              <h2>{fr ? "Préparer une demande" : "Prepare an enquiry"}</h2>
              <p>
                {fr
                  ? "Décrire votre contexte pour discuter de la suite."
                  : "Describe your situation so we can discuss the next step."}
              </p>
              <Link to="/contact">{fr ? "Nous contacter" : "Contact us"}</Link>
            </li>
          </ol>
          <h2>{fr ? "Vos questions" : "Your questions"}</h2>
          <div className="public-lesson-list">
            {faqs[locale].map(([q, a]) => (
              <details key={q}>
                <summary>{q}</summary>
                <p>{a}</p>
              </details>
            ))}
          </div>
        </>
      )}
      {routeId !== "faq" && (
        <div className="public-notice">
          <p>
            {fr
              ? "Expliquez votre objectif, votre point de départ et le soutien souhaité. Nous pourrons discuter des modalités adaptées."
              : "Tell us your goal, starting point and the support you need so we can discuss the details."}
          </p>
          <Link
            className="button button--primary"
            to={
              "/contact?service=" +
              (routeId === "kids"
                ? "kids"
                : routeId === "partners"
                  ? "workshop"
                  : routeId === "services"
                    ? "company"
                    : "training")
            }
          >
            {fr ? "Préparer ma demande" : "Prepare my enquiry"}
          </Link>
        </div>
      )}
    </Section>
  );
}
