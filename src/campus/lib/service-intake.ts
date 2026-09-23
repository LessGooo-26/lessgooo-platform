export type LocalText = { en: string; fr: string };
export const words = (en: string, fr: string): LocalText => ({ en, fr });
export type ServiceId =
  | "training"
  | "interview"
  | "applications"
  | "kids"
  | "workshop"
  | "consultation";
export type IntakeQuestion = {
  id: string;
  label: LocalText;
  hint: LocalText;
  required?: boolean;
  options?: LocalText[];
};
const q = (
  id: string,
  en: string,
  fr: string,
  hintEn: string,
  hintFr: string,
  required = true,
): IntakeQuestion => ({
  id,
  label: words(en, fr),
  hint: words(hintEn, hintFr),
  required,
});
export const serviceQuestions: Record<ServiceId, IntakeQuestion[]> = {
  training: [
    q(
      "background",
      "What is your current role and experience?",
      "Quel est votre rôle et votre expérience actuels ?",
      "For example: student, developer or IT support; describe what you can already do.",
      "Exemple : étudiant, développeur ou support informatique ; précisez ce que vous savez déjà faire.",
    ),
    q(
      "skills",
      "Which skills do you want to develop?",
      "Quelles compétences souhaitez-vous développer ?",
      "Name the tools or topics: Linux, Git, Docker, AWS, Kubernetes… Pick your priorities.",
      "Nommez les outils ou sujets : Linux, Git, Docker, AWS, Kubernetes… Indiquez vos priorités.",
    ),
    q(
      "equipment",
      "What equipment and practice environment do you have?",
      "De quel matériel et environnement de pratique disposez-vous ?",
      "Computer operating system, internet access and ability to install software. No account credentials.",
      "Système de votre ordinateur, accès internet et possibilité d’installer des logiciels. Aucun identifiant de connexion.",
    ),
    q(
      "studyTime",
      "How much time can you practise each week?",
      "Combien de temps pouvez-vous pratiquer chaque semaine ?",
      "An approximate number of hours and suitable days help us discuss a realistic plan.",
      "Un nombre approximatif d’heures et vos jours disponibles aideront à discuter d’un parcours réaliste.",
    ),
  ],
  interview: [
    q(
      "targetRole",
      "Which role and seniority are you interviewing for?",
      "Pour quel poste et niveau passez-vous un entretien ?",
      "Give a job title and the main skills in the vacancy, without confidential employer information.",
      "Indiquez l’intitulé et les principales compétences de l’offre, sans information confidentielle sur l’employeur.",
    ),
    q(
      "format",
      "Which interview stage or format needs preparation?",
      "Quelle étape ou quel format d’entretien faut-il préparer ?",
      "Technical discussion, live coding, system design, behavioural questions or an initial screening.",
      "Échange technique, code en direct, conception système, questions comportementales ou présélection.",
    ),
    q(
      "experience",
      "Which projects can you explain confidently?",
      "Quels projets pouvez-vous expliquer avec assurance ?",
      "Describe your own contribution and one difficulty. Separate practice projects from professional experience.",
      "Décrivez votre contribution et une difficulté. Distinguez projets d’apprentissage et expérience professionnelle.",
    ),
    q(
      "interviewDate",
      "Is an interview date already planned?",
      "Une date d’entretien est-elle déjà prévue ?",
      "If known, include the date and time zone. Otherwise write “not scheduled”.",
      "Si elle est connue, indiquez la date et le fuseau. Sinon, écrivez « non prévu ».",
      false,
    ),
  ],
  applications: [
    q(
      "targetRole",
      "Which jobs are you targeting?",
      "Quels postes ciblez-vous ?",
      "State the role, seniority and two or three key skills you want to use.",
      "Précisez le poste, le niveau et deux ou trois compétences que vous souhaitez utiliser.",
    ),
    q(
      "jobMarket",
      "Where and how would you like to work?",
      "Où et comment souhaitez-vous travailler ?",
      "Target countries or regions; remote, hybrid or on-site. Do not send identity or immigration documents.",
      "Pays ou régions visés ; télétravail, hybride ou sur site. N’envoyez aucun document d’identité ou d’immigration.",
    ),
    q(
      "materials",
      "What application materials are ready?",
      "Quels documents de candidature sont prêts ?",
      "Tell us whether you have a CV, portfolio, GitHub profile and tailored cover letter. Links are optional.",
      "Précisez si vous avez un CV, un portfolio, un profil GitHub et une lettre adaptée. Les liens sont facultatifs.",
    ),
    q(
      "obstacle",
      "Where do your applications get stuck?",
      "À quelle étape vos candidatures bloquent-elles ?",
      "For example: choosing roles, describing experience, getting replies or preparing interviews.",
      "Exemple : choisir les offres, présenter l’expérience, obtenir des réponses ou préparer les entretiens.",
    ),
  ],
  kids: [
    q(
      "relationship",
      "What is your relationship to the learner?",
      "Quel est votre lien avec l’enfant ?",
      "A parent or guardian submits this request. We only need the adult’s contact details.",
      "La demande est faite par un parent ou responsable. Seules les coordonnées de l’adulte sont nécessaires.",
    ),
    q(
      "ageRange",
      "What is the learner’s approximate age?",
      "Quel est l’âge approximatif de l’enfant ?",
      "Give an age or age range, not a date of birth. This helps adapt the conversation; it is not an admission rule.",
      "Indiquez un âge ou une tranche d’âge, sans date de naissance. Cela aide à adapter l’échange ; ce n’est pas une règle d’admission.",
    ),
    q(
      "interests",
      "What does the learner enjoy or already know?",
      "Qu’est-ce que l’enfant aime ou sait déjà faire ?",
      "Games, drawing, computer basics, Scratch or robotics; describe a small project they would enjoy.",
      "Jeux, dessin, bases informatiques, Scratch ou robotique ; décrivez un petit projet qui lui plairait.",
    ),
    q(
      "support",
      "What equipment and adult support are available?",
      "Quel matériel et quel accompagnement adulte sont disponibles ?",
      "Shared or personal computer, internet access and supervised practice time. No school name or private child information.",
      "Ordinateur partagé ou personnel, accès internet et pratique accompagnée. Aucun nom d’école ou renseignement privé sur l’enfant.",
    ),
  ],
  workshop: [
    q(
      "organisation",
      "Which organisation or team is this for?",
      "Pour quelle organisation ou équipe est cet atelier ?",
      "Team or organisation name and your role in arranging the workshop.",
      "Nom de l’équipe ou de l’organisation et votre rôle dans la préparation de l’atelier.",
    ),
    q(
      "audience",
      "Who will attend and how many people are expected?",
      "Quel est le public et combien de personnes sont prévues ?",
      "Approximate team size, roles and current technical level.",
      "Effectif approximatif, fonctions et niveau technique actuel.",
    ),
    q(
      "topics",
      "Which work problem should the workshop address?",
      "Quel problème professionnel l’atelier doit-il traiter ?",
      "Choose concrete topics and an observable result, such as a reviewed pipeline or a working Compose lab.",
      "Choisissez des sujets concrets et un résultat observable, par exemple un pipeline revu ou un laboratoire Compose fonctionnel.",
    ),
    q(
      "delivery",
      "What format and practical constraints should we consider?",
      "Quel format et quelles contraintes faut-il prévoir ?",
      "Remote or on-site preference, location, available computers and installation restrictions. Availability will be discussed.",
      "Préférence à distance ou sur site, lieu, ordinateurs disponibles et restrictions d’installation. La disponibilité sera discutée.",
    ),
    q(
      "budget",
      "Do you have an indicative budget?",
      "Avez-vous un budget indicatif ?",
      "Optional: give a range and currency, or say that a proposal is needed. This is not a quote.",
      "Facultatif : indiquez une fourchette et une devise, ou demandez une proposition. Ceci n’est pas un devis.",
      false,
    ),
  ],
  consultation: [
    q(
      "context",
      "What project or decision do you need help with?",
      "Sur quel projet ou quelle décision souhaitez-vous être accompagné ?",
      "Describe the situation, your role and what is blocking progress.",
      "Décrivez la situation, votre rôle et ce qui bloque votre progression.",
    ),
    q(
      "environment",
      "Which tools and environment are involved?",
      "Quels outils et quel environnement sont concernés ?",
      "Local lab, development, staging or production; list relevant tools and versions if known.",
      "Laboratoire local, développement, préproduction ou production ; listez les outils et versions si connus.",
    ),
    q(
      "attempts",
      "What have you tried and what happened?",
      "Qu’avez-vous déjà essayé et avec quel résultat ?",
      "Summarise observations and attempts. Remove credentials, customer data and internal addresses from examples.",
      "Résumez les observations et les essais. Retirez identifiants, données clients et adresses internes des exemples.",
    ),
    q(
      "decision",
      "What would make the consultation useful?",
      "Qu’est-ce qui rendrait cet échange utile ?",
      "A decision, a reviewed design, a troubleshooting plan or an explanation. Name the result you expect.",
      "Une décision, une architecture revue, un plan de diagnostic ou une explication. Nommez le résultat attendu.",
    ),
    q(
      "budget",
      "Would you like to discuss a budget or constraints?",
      "Souhaitez-vous préciser un budget ou des contraintes ?",
      "Optional: a range with currency and any timing constraints. Price and booking terms still need agreement.",
      "Facultatif : fourchette avec devise et contraintes de calendrier. Le prix et les modalités restent à convenir.",
      false,
    ),
  ],
};
// ISO 3166-1 alpha-2 region identifiers; names are localized by the browser's CLDR data.
export const countryCodes =
  "AD AE AF AG AI AL AM AO AQ AR AS AT AU AW AX AZ BA BB BD BE BF BG BH BI BJ BL BM BN BO BQ BR BS BT BV BW BY BZ CA CC CD CF CG CH CI CK CL CM CN CO CR CU CV CW CX CY CZ DE DJ DK DM DO DZ EC EE EG EH ER ES ET FI FJ FK FM FO FR GA GB GD GE GF GG GH GI GL GM GN GP GQ GR GS GT GU GW GY HK HM HN HR HT HU ID IE IL IM IN IO IQ IR IS IT JE JM JO JP KE KG KH KI KM KN KP KR KW KY KZ LA LB LC LI LK LR LS LT LU LV LY MA MC MD ME MF MG MH MK ML MM MN MO MP MQ MR MS MT MU MV MW MX MY MZ NA NC NE NF NG NI NL NO NP NR NU NZ OM PA PE PF PG PH PK PL PM PN PR PS PT PW PY QA RE RO RS RU RW SA SB SC SD SE SG SH SI SJ SK SL SM SN SO SR SS ST SV SX SY SZ TC TD TF TG TH TJ TK TL TM TN TO TR TT TV TW TZ UA UG UM US UY UZ VA VC VE VG VI VN VU WF WS YE YT ZA ZM ZW".split(
    " ",
  );
export function countries(locale: "en" | "fr") {
  const names = new Intl.DisplayNames([locale], { type: "region" });
  return countryCodes
    .map((code) => ({ code, name: names.of(code) || code }))
    .sort((a, b) => a.name.localeCompare(b.name, locale));
}
export function validTimezone(value: string) {
  try {
    new Intl.DateTimeFormat("en", { timeZone: value });
    return !!value;
  } catch {
    return false;
  }
}
export const timeframes = [
  {
    id: "exploring",
    ...words("I am exploring options", "Je découvre les possibilités"),
  },
  {
    id: "soon",
    ...words("Within the next two weeks", "Dans les deux prochaines semaines"),
  },
  { id: "month", ...words("Within the next month", "Dans le mois à venir") },
  {
    id: "flexible",
    ...words("My timing is flexible", "Mes dates sont flexibles"),
  },
] as const;
