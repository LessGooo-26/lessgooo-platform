import { pair as p, type Chapter, type Copy } from "./model";

const lower = ["fr-4e", "fr-3e", "en-3", "en-4", "en-5"];
const upper = ["fr-2nde", "fr-1re", "fr-terminale", "en-6", "en-7"];
type QuestionInput = [Copy, Copy[], number, Copy];
const q = (
  fr: string,
  en: string,
  options: string[],
  answer: number,
  ef: string,
  ee: string,
): QuestionInput => [p(fr, en), options.map((s) => p(s, s)), answer, p(ef, ee)];
const qb = (
  fr: string,
  en: string,
  options: [string, string][],
  answer: number,
  ef: string,
  ee: string,
): QuestionInput => [
  p(fr, en),
  options.map(([f, e]) => p(f, e)),
  answer,
  p(ef, ee),
];
const lesson = (
  id: string,
  subjectId: string,
  order: number,
  advanced: boolean,
  title: Copy,
  goal: Copy,
  prerequisites: Copy,
  content: Copy,
  example: Copy,
  challenge: Copy,
  solution: Copy,
  questions: QuestionInput[],
): Chapter => ({
  id,
  subjectId,
  order,
  classIds: advanced ? upper : lower,
  title,
  goal,
  prerequisites,
  lesson: content,
  example,
  challenge,
  solution,
  questions: questions.map(([prompt, choices, answer, explanation], i) => ({
    id: `${id}-q${i + 1}`,
    prompt,
    choices,
    answer,
    explanation,
  })),
  published: true,
});

// Original revision material. Class suggestions are pedagogical starting points,
// not a claim to reproduce a complete ministry curriculum or examination paper.
export const chapters: Chapter[] = [
  lesson(
    "math-ratios",
    "math",
    1,
    false,
    p("Fractions et proportionnalité", "Fractions and proportion"),
    p(
      "Choisir la bonne opération et justifier un pourcentage.",
      "Choose the right operation and justify a percentage.",
    ),
    p(
      "Tables de multiplication, division et sens d'une fraction.",
      "Multiplication tables, division and the meaning of a fraction.",
    ),
    p(
      "Une fraction a/b représente a parts quand l'unité est partagée en b parts égales, avec b non nul. Pour additionner deux fractions, on les exprime avec le même dénominateur. Une situation est proportionnelle si le quotient entre les grandeurs reste constant. Un pourcentage est une fraction de dénominateur 100. Avant de calculer, identifier la quantité de référence : 20 % d'une quantité n'est pas toujours une hausse de 20 %.",
      "A fraction a/b represents a parts when a whole is divided into b equal parts, with b nonzero. Add fractions by using a common denominator. Quantities are proportional when their ratio stays constant. A percentage is a fraction out of 100. Identify the reference quantity before calculating: 20% of an amount is different from a 20% increase.",
    ),
    p(
      "3 cahiers coûtent 900 F. Le prix unitaire est 900/3 = 300 F ; 5 cahiers coûtent donc 1 500 F si le prix unitaire reste constant.",
      "3 notebooks cost 900 F. The unit price is 900/3 = 300 F; 5 notebooks therefore cost 1,500 F if the unit price is unchanged.",
    ),
    p(
      "Un prix de 8 000 F baisse de 25 %, puis augmente de 25 %. Retrouve-t-on le prix initial ? Justifier.",
      "A price of 8,000 F falls by 25%, then rises by 25%. Does it return to its original value? Explain.",
    ),
    p(
      "8 000 × 0,75 = 6 000 puis 6 000 × 1,25 = 7 500 F. Les deux pourcentages ne portent pas sur la même base.",
      "8,000 × 0.75 = 6,000, then 6,000 × 1.25 = 7,500 F. The two percentages use different bases.",
    ),
    [
      q(
        "Combien vaut 2/3 + 1/6 ?",
        "What is 2/3 + 1/6?",
        ["3/9", "5/6", "1/2"],
        1,
        "2/3 = 4/6 ; 4/6 + 1/6 = 5/6.",
        "2/3 = 4/6; 4/6 + 1/6 = 5/6.",
      ),
      q(
        "Quel est 15 % de 200 ?",
        "What is 15% of 200?",
        ["15", "30", "185"],
        1,
        "200 × 15/100 = 30.",
        "200 × 15/100 = 30.",
      ),
    ],
  ),
  lesson(
    "math-equations",
    "math",
    2,
    false,
    p("Équations et contrôle du résultat", "Equations and checking solutions"),
    p(
      "Isoler une inconnue puis vérifier par substitution.",
      "Isolate an unknown and check by substitution.",
    ),
    p(
      "Nombres relatifs et distributivité.",
      "Signed numbers and the distributive property.",
    ),
    p(
      "Une équation affirme l'égalité de deux expressions. Effectuer la même opération sur les deux membres conserve cette égalité ; diviser exige un nombre non nul. Réduire les termes semblables, isoler l'inconnue et remplacer celle-ci dans l'énoncé initial. Une réponse sans vérification peut masquer une erreur de signe.",
      "An equation states that two expressions are equal. Performing the same operation on both sides preserves equality; division requires a nonzero number. Collect like terms, isolate the unknown, then substitute into the original equation. Checking helps catch sign errors.",
    ),
    p(
      "3x + 5 = 20 : soustraire 5 donne 3x = 15 ; diviser par 3 donne x = 5. Contrôle : 3 × 5 + 5 = 20.",
      "3x + 5 = 20: subtract 5 to get 3x = 15; divide by 3 to get x = 5. Check: 3 × 5 + 5 = 20.",
    ),
    p(
      "Un rectangle a pour longueur x + 4 et largeur x. Son périmètre est 40 cm. Trouver ses dimensions et son aire.",
      "A rectangle has length x + 4 and width x. Its perimeter is 40 cm. Find its dimensions and area.",
    ),
    p(
      "2(x + 4) + 2x = 40, donc x = 8 cm ; longueur 12 cm ; aire 96 cm². Vérifier 2(12 + 8) = 40.",
      "2(x + 4) + 2x = 40, so x = 8 cm; length 12 cm; area 96 cm². Check 2(12 + 8) = 40.",
    ),
    [
      q(
        "Résoudre 5x − 4 = 16.",
        "Solve 5x − 4 = 16.",
        ["2", "4", "6"],
        1,
        "5x = 20, donc x = 4.",
        "5x = 20, so x = 4.",
      ),
      q(
        "Développer 2(x + 3).",
        "Expand 2(x + 3).",
        ["2x + 3", "2x + 6", "x + 6"],
        1,
        "Multiplier chacun des deux termes par 2.",
        "Multiply both terms by 2.",
      ),
    ],
  ),
  lesson(
    "math-functions",
    "math",
    3,
    true,
    p("Fonctions et variations", "Functions and change"),
    p(
      "Relier expression, tableau et évolution d'une fonction.",
      "Connect a formula, a table and the behaviour of a function.",
    ),
    p(
      "Équations, puissances et repérage dans le plan.",
      "Equations, powers and coordinates.",
    ),
    p(
      "Une fonction associe une valeur f(x) à chaque x de son domaine. Son expression seule ne suffit pas : préciser les valeurs autorisées. Pour une fonction dérivable, le signe de la dérivée aide à étudier les variations sur un intervalle. Un point où la dérivée s'annule n'est pas automatiquement un maximum ou un minimum : examiner le signe autour de ce point.",
      "A function assigns a value f(x) to each x in its domain. State which inputs are allowed. For a differentiable function, the derivative's sign helps determine change on an interval. A zero derivative does not automatically mean a maximum or minimum: examine the sign on both sides.",
    ),
    p(
      "f(x) = x² − 4x + 3. f'(x) = 2x − 4 est négative avant 2 et positive après 2. Le minimum vaut f(2) = −1.",
      "f(x) = x² − 4x + 3. f′(x) = 2x − 4 is negative before 2 and positive after 2. The minimum is f(2) = −1.",
    ),
    p(
      "Pour g(x) = x³, étudier g'(0) puis les signes de g' de part et d'autre de 0. Y a-t-il un extremum en 0 ?",
      "For g(x) = x³, find g′(0), then examine g′ on either side of 0. Is 0 an extremum?",
    ),
    p(
      "g'(x) = 3x² ; g'(0) = 0 mais la dérivée reste positive ailleurs. g reste croissante : 0 n'est pas un extremum.",
      "g′(x) = 3x²; g′(0) = 0 but the derivative is positive elsewhere. g remains increasing: 0 is not an extremum.",
    ),
    [
      q(
        "Si f(x) = 2x² + 1, combien vaut f(3) ?",
        "If f(x) = 2x² + 1, what is f(3)?",
        ["13", "19", "37"],
        1,
        "2 × 9 + 1 = 19.",
        "2 × 9 + 1 = 19.",
      ),
      q(
        "Quelle est la dérivée de x² − 6x ?",
        "What is the derivative of x² − 6x?",
        ["2x − 6", "x − 6", "2x²"],
        0,
        "La dérivée de x² est 2x ; celle de −6x est −6.",
        "The derivative of x² is 2x; that of −6x is −6.",
      ),
    ],
  ),
  lesson(
    "math-probability",
    "math",
    4,
    true,
    p("Probabilités et esprit critique", "Probability and critical thinking"),
    p(
      "Distinguer indépendance, fréquence et probabilité.",
      "Distinguish independence, frequency and probability.",
    ),
    p(
      "Fractions, pourcentages et comptage.",
      "Fractions, percentages and counting.",
    ),
    p(
      "Dans une expérience à issues équiprobables, P(A) est le nombre d'issues favorables divisé par le nombre total. P(non A) = 1 − P(A). Pour deux événements indépendants, P(A et B) = P(A) × P(B). L'indépendance doit être justifiée, pas supposée : retirer un objet sans le remettre change généralement le tirage suivant.",
      "For equally likely outcomes, P(A) is favourable outcomes divided by total outcomes. P(not A) = 1 − P(A). For independent events, P(A and B) = P(A) × P(B). Independence must be justified: drawing without replacement generally changes the next draw.",
    ),
    p(
      "Un sac contient 3 boules rouges et 2 bleues. Deux tirages sans remise : P(deux rouges) = 3/5 × 2/4 = 3/10.",
      "A bag has 3 red and 2 blue balls. For two draws without replacement, P(two red) = 3/5 × 2/4 = 3/10.",
    ),
    p(
      "Reprendre le sac avec remise. Comparer les probabilités de deux rouges et expliquer la différence.",
      "Repeat the bag experiment with replacement. Compare the probability of two reds and explain the difference.",
    ),
    p(
      "Avec remise : 3/5 × 3/5 = 9/25 = 0,36 ; sans remise : 0,30. Remettre la première boule rétablit la composition initiale.",
      "With replacement: 3/5 × 3/5 = 9/25 = 0.36; without replacement: 0.30. Replacement restores the original composition.",
    ),
    [
      q(
        "Un dé équilibré : P(nombre pair) ?",
        "For a fair die, P(an even number)?",
        ["1/6", "1/2", "2/3"],
        1,
        "Trois issues sur six : 2, 4 et 6.",
        "Three out of six outcomes: 2, 4 and 6.",
      ),
      q(
        "Si P(A) = 0,2, alors P(non A) vaut…",
        "If P(A) = 0.2, P(not A) is…",
        ["0.2", "0.8", "1.2"],
        1,
        "1 − 0,2 = 0,8.",
        "1 − 0.2 = 0.8.",
      ),
    ],
  ),
  lesson(
    "pct-units",
    "pct",
    1,
    false,
    p("Mesurer et convertir", "Measurement and units"),
    p(
      "Présenter une mesure avec son unité et vérifier sa cohérence.",
      "Report a measurement with its unit and check consistency.",
    ),
    p(
      "Multiplication et division par 10, 100 et 1 000.",
      "Multiplying and dividing by 10, 100 and 1,000.",
    ),
    p(
      "Une mesure associe une valeur numérique à une unité et dépend de l'instrument. Convertir avant de combiner des grandeurs. La vitesse moyenne est distance totale / durée totale ; elle ne décrit pas chaque instant. Les aires et volumes demandent de convertir le facteur au carré ou au cube. Toujours estimer l'ordre de grandeur pour repérer une erreur.",
      "A measurement combines a number and a unit and depends on the instrument. Convert units before combining quantities. Average speed is total distance divided by total time; it does not describe every instant. Area and volume conversions require squaring or cubing the conversion factor. Estimate the size of the answer to catch errors.",
    ),
    p(
      "120 km en 2 h donnent 60 km/h. En m/s : 60 × 1 000 / 3 600 ≈ 16,7 m/s.",
      "120 km in 2 h gives 60 km/h. In m/s: 60 × 1,000 / 3,600 ≈ 16.7 m/s.",
    ),
    p(
      "Un carré mesure 20 cm de côté. Calculer son aire en cm² puis en m² sans confondre longueur et surface.",
      "A square has sides of 20 cm. Find its area in cm² and m², distinguishing length from area.",
    ),
    p(
      "A = 400 cm². Comme 20 cm = 0,2 m, A = 0,04 m². Il y a 10 000 cm² dans 1 m².",
      "A = 400 cm². Since 20 cm = 0.2 m, A = 0.04 m². There are 10,000 cm² in 1 m².",
    ),
    [
      q(
        "2,5 km valent combien de mètres ?",
        "How many metres are 2.5 km?",
        ["25", "250", "2500"],
        2,
        "Multiplier par 1 000.",
        "Multiply by 1,000.",
      ),
      q(
        "60 m en 12 s : vitesse moyenne en m/s ?",
        "60 m in 12 s: average speed in m/s?",
        ["5", "48", "720"],
        0,
        "v = 60/12 = 5 m/s.",
        "v = 60/12 = 5 m/s.",
      ),
    ],
  ),
  lesson(
    "pct-circuits",
    "pct",
    2,
    false,
    p("Circuits électriques simples", "Simple electric circuits"),
    p(
      "Relier tension, courant et résistance dans un modèle simple.",
      "Relate voltage, current and resistance in a simple model.",
    ),
    p(
      "Proportionnalité et unités ; utiliser une simulation ou une pile basse tension encadrée.",
      "Proportion and units; use a simulation or a supervised low-voltage battery.",
    ),
    p(
      "Un courant circule dans une boucle fermée. Pour un conducteur ohmique à température constante, U = R × I. U se mesure en volts, R en ohms et I en ampères. Un ampèremètre s'insère en série ; un voltmètre se branche en dérivation. Ne jamais relier directement les bornes d'une source ni manipuler une prise secteur.",
      "Current flows in a closed loop. For an ohmic conductor at constant temperature, U = R × I. U is measured in volts, R in ohms and I in amperes. An ammeter is placed in series; a voltmeter is connected in parallel. Never directly connect a source's terminals or experiment with a mains socket.",
    ),
    p(
      "Pour une résistance de 30 Ω sous 6 V, I = U/R = 6/30 = 0,2 A. Une source réelle impose aussi des limites de puissance.",
      "For a 30 Ω resistor across 6 V, I = U/R = 6/30 = 0.2 A. A real source also has power limits.",
    ),
    p(
      "Dans une simulation, doubler R en gardant U constant. Prédire le courant puis comparer à la mesure.",
      "In a simulation, double R while keeping U constant. Predict the current and compare it with the reading.",
    ),
    p(
      "I = U/R : doubler R divise I par deux dans le modèle ohmique. Expliquer toute différence liée au composant utilisé.",
      "I = U/R: doubling R halves I in the ohmic model. Explain any difference caused by the chosen component.",
    ),
    [
      q(
        "U = 12 V et R = 6 Ω. I vaut…",
        "U = 12 V and R = 6 Ω. I is…",
        ["0.5 A", "2 A", "72 A"],
        1,
        "I = 12/6 = 2 A.",
        "I = 12/6 = 2 A.",
      ),
      qb(
        "Le voltmètre se branche…",
        "A voltmeter is connected…",
        [
          ["En dérivation", "In parallel"],
          ["Toujours en série", "Always in series"],
          ["Sans circuit", "Without a circuit"],
        ],
        0,
        "Il mesure une différence de potentiel entre deux points.",
        "It measures a potential difference between two points.",
      ),
    ],
  ),
  lesson(
    "pct-energy",
    "pct",
    3,
    true,
    p("Énergie, puissance et rendement", "Energy, power and efficiency"),
    p(
      "Faire un bilan d'énergie en gardant les unités cohérentes.",
      "Build an energy balance using consistent units.",
    ),
    p(
      "Vitesse, forces, unités et calcul littéral.",
      "Speed, forces, units and algebra.",
    ),
    p(
      "L'énergie se transfère et se transforme. La puissance est un débit d'énergie : P = E/Δt. Le rendement est énergie utile / énergie reçue, avec des frontières de système clairement définies. Une machine ne crée pas d'énergie ; une partie peut se disperser sous forme thermique ou sonore. Ne pas confondre kW, unité de puissance, et kWh, unité d'énergie.",
      "Energy is transferred and transformed. Power is a rate of energy transfer: P = E/Δt. Efficiency is useful energy divided by input energy, with a clearly defined system boundary. A machine does not create energy; some may disperse as heat or sound. kW measures power, whereas kWh measures energy.",
    ),
    p(
      "Une lampe de 10 W fonctionne 3 h : E = 30 Wh = 0,03 kWh. En joules : 10 × 10 800 = 108 000 J.",
      "A 10 W lamp runs for 3 h: E = 30 Wh = 0.03 kWh. In joules: 10 × 10,800 = 108,000 J.",
    ),
    p(
      "Un moteur reçoit 500 J et fournit 350 J utiles. Calculer son rendement et représenter les transferts.",
      "A motor receives 500 J and delivers 350 useful J. Calculate efficiency and represent the transfers.",
    ),
    p(
      "η = 350/500 = 70 %. Le bilan compte 150 J non utiles pour la tâche choisie, sans disparition d'énergie.",
      "η = 350/500 = 70%. The balance includes 150 J not useful for the chosen task; energy has not disappeared.",
    ),
    [
      q(
        "200 J transférés en 10 s correspondent à…",
        "200 J transferred in 10 s corresponds to…",
        ["20 W", "2000 W", "0.05 W"],
        0,
        "P = E/t = 20 W.",
        "P = E/t = 20 W.",
      ),
      q(
        "1 kWh représente…",
        "1 kWh represents…",
        ["1000 J", "3600 J", "3600000 J"],
        2,
        "1 000 W × 3 600 s = 3 600 000 J.",
        "1,000 W × 3,600 s = 3,600,000 J.",
      ),
    ],
  ),
  lesson(
    "pct-reactions",
    "pct",
    4,
    true,
    p(
      "Conservation et équations chimiques",
      "Conservation and chemical equations",
    ),
    p(
      "Équilibrer une réaction en conservant les atomes.",
      "Balance a reaction by conserving atoms.",
    ),
    p(
      "Symboles chimiques, molécules et comptage.",
      "Chemical symbols, molecules and counting.",
    ),
    p(
      "Une réaction réarrange les atomes. Dans une équation équilibrée, chaque élément a le même nombre d'atomes avant et après. Modifier les coefficients devant les formules, jamais les indices d'une formule pour forcer l'équilibre. Les coefficients expriment des proportions en quantités de matière, pas directement des masses égales. Ne pas reproduire une réaction sans laboratoire et encadrement.",
      "A reaction rearranges atoms. In a balanced equation, each element has the same number of atoms on both sides. Change coefficients in front of formulas, never subscripts within a formula to force balance. Coefficients express mole ratios, not equal masses. Do not perform reactions without a laboratory and supervision.",
    ),
    p(
      "2H₂ + O₂ → 2H₂O : quatre atomes H et deux atomes O de chaque côté. Le rapport des quantités est 2:1:2.",
      "2H₂ + O₂ → 2H₂O has four H atoms and two O atoms on each side. The mole ratio is 2:1:2.",
    ),
    p(
      "Équilibrer CH₄ + O₂ → CO₂ + H₂O et justifier par un tableau de comptage.",
      "Balance CH₄ + O₂ → CO₂ + H₂O and justify using an atom-count table.",
    ),
    p(
      "CH₄ + 2O₂ → CO₂ + 2H₂O : C = 1, H = 4, O = 4 de chaque côté.",
      "CH₄ + 2O₂ → CO₂ + 2H₂O: C = 1, H = 4, O = 4 on each side.",
    ),
    [
      q(
        "Dans 3H₂O, combien d'atomes H compte-t-on ?",
        "How many H atoms are represented by 3H₂O?",
        ["2", "3", "6"],
        2,
        "3 × 2 = 6 atomes H.",
        "3 × 2 = 6 H atoms.",
      ),
      qb(
        "Pour équilibrer une équation, on change…",
        "To balance an equation, change…",
        [
          ["Les coefficients", "The coefficients"],
          ["L'identité des éléments", "The identity of elements"],
          ["Les indices des molécules", "Molecular subscripts"],
        ],
        0,
        "Les espèces chimiques restent les mêmes ; seules leurs proportions changent.",
        "Chemical species stay the same; their proportions change.",
      ),
    ],
  ),
];

chapters.push(
  lesson(
    "svt-cells",
    "svt",
    1,
    false,
    p("Cellules et niveaux d'organisation", "Cells and levels of organisation"),
    p(
      "Relier cellule, tissu, organe et organisme.",
      "Connect cells, tissues, organs and organisms.",
    ),
    p(
      "Observer un schéma et légender avec précision.",
      "Observe and label a diagram accurately.",
    ),
    p(
      "La cellule est une unité du vivant. Les cellules spécialisées coopèrent dans des tissus, puis des organes et des systèmes. Les cellules végétales et animales partagent notamment membrane et cytoplasme ; les schémas scolaires représentent souvent des cellules avec noyau. Certaines cellules spécialisées et certains organismes présentent des différences : un schéma n'est pas une photographie universelle.",
      "A cell is a unit of life. Specialised cells cooperate in tissues, organs and systems. Plant and animal cells share features such as a membrane and cytoplasm; school diagrams often depict cells with a nucleus. Specialised cells and different organisms can vary: a diagram is not a universal photograph.",
    ),
    p(
      "Des cellules musculaires forment du tissu musculaire ; plusieurs tissus participent à un organe comme le cœur. Chaque niveau a une fonction liée aux autres.",
      "Muscle cells form muscle tissue; several tissues contribute to an organ such as the heart. Each level has a function connected to the others.",
    ),
    p(
      "Dessiner une cellule végétale simplifiée et expliquer pourquoi un dessin doit porter un titre, des légendes et une échelle si elle est connue.",
      "Draw a simplified plant cell and explain why a diagram needs a title, labels and a scale when known.",
    ),
    p(
      "Un schéma peut montrer membrane, cytoplasme, noyau, paroi et vacuole. Le titre indique l'objet ; les légendes identifient les structures ; l'échelle évite de confondre taille réelle et dessin.",
      "A diagram may show the membrane, cytoplasm, nucleus, wall and vacuole. A title identifies the subject, labels identify structures and a scale distinguishes drawing size from actual size.",
    ),
    [
      qb(
        "Quel ordre va du plus simple au plus complexe ?",
        "Which order goes from simpler to more complex?",
        [
          ["Cellule → tissu → organe", "Cell → tissue → organ"],
          ["Organe → cellule → tissu", "Organ → cell → tissue"],
        ],
        0,
        "Des cellules organisées forment des tissus qui contribuent aux organes.",
        "Organised cells form tissues that contribute to organs.",
      ),
      qb(
        "Une légende sert à…",
        "A label is used to…",
        [
          ["Identifier une structure", "Identify a structure"],
          ["Décorer uniquement", "Decorate only"],
        ],
        0,
        "Le trait de légende doit désigner précisément la structure.",
        "The label line should point precisely to the structure.",
      ),
    ],
  ),
  lesson(
    "svt-ecosystems",
    "svt",
    2,
    false,
    p("Écosystèmes et chaînes alimentaires", "Ecosystems and food chains"),
    p(
      "Expliquer les liens entre organismes et milieu.",
      "Explain connections between organisms and their environment.",
    ),
    p(
      "Distinguer vivant et non-vivant.",
      "Distinguish living and non-living components.",
    ),
    p(
      "Un écosystème associe organismes et milieu physique. Les producteurs utilisent une source d'énergie pour fabriquer de la matière organique ; les consommateurs se nourrissent d'autres organismes. Les décomposeurs participent au recyclage de la matière. Dans une chaîne alimentaire, préciser le sens de la flèche : de la nourriture vers celui qui la consomme pour représenter un transfert.",
      "An ecosystem includes organisms and the physical environment. Producers use an energy source to make organic matter; consumers feed on other organisms. Decomposers help recycle matter. In a food chain, define the arrow as pointing from food to consumer to represent a transfer.",
    ),
    p(
      "Herbe → criquet → oiseau : la flèche indique ici un transfert de matière et d'énergie. Une vraie communauté forme souvent un réseau plus complexe.",
      "Grass → grasshopper → bird: arrows here represent transfer of matter and energy. Real communities usually form more complex networks.",
    ),
    p(
      "Prévoir deux conséquences possibles d'une forte diminution des insectes et expliquer pourquoi il faut observer avant de conclure.",
      "Predict two possible consequences of a large decline in insects and explain why observations are needed before concluding.",
    ),
    p(
      "Certains oiseaux peuvent manquer de nourriture ; certaines plantes peuvent être moins pollinisées. Les effets dépendent des espèces et des autres ressources disponibles.",
      "Some birds may lose food; some plants may be pollinated less. Effects depend on species and alternative resources.",
    ),
    [
      qb(
        "Les décomposeurs contribuent à…",
        "Decomposers contribute to…",
        [
          ["Recycler la matière", "Recycling matter"],
          ["Créer l'énergie", "Creating energy"],
        ],
        0,
        "La matière retourne dans des cycles ; l'énergie n'est pas créée.",
        "Matter returns to cycles; energy is not created.",
      ),
      qb(
        "Un écosystème comprend…",
        "An ecosystem includes…",
        [
          ["Seulement les animaux", "Only animals"],
          ["Organismes et milieu", "Organisms and environment"],
        ],
        1,
        "Les facteurs physiques interagissent avec le vivant.",
        "Physical factors interact with living things.",
      ),
    ],
  ),
  lesson(
    "svt-genetics",
    "svt",
    3,
    true,
    p(
      "Génétique : raisonner avec un modèle",
      "Genetics: reasoning with a model",
    ),
    p(
      "Distinguer génotype, phénotype et probabilité de transmission.",
      "Distinguish genotype, phenotype and inheritance probability.",
    ),
    p(
      "Cellules, chromosomes et fractions.",
      "Cells, chromosomes and fractions.",
    ),
    p(
      "Un gène est une portion d'ADN ; des variantes sont appelées allèles. Dans un modèle diploïde simple à deux allèles, un individu possède deux copies au locus étudié. Le génotype décrit ces allèles ; le phénotype dépend de leur expression et parfois de l'environnement. La dominance d'un allèle ne signifie ni supériorité ni plus grande fréquence dans la population.",
      "A gene is a portion of DNA; variants are called alleles. In a simple diploid, two-allele model, an individual carries two copies at the locus studied. Genotype describes the alleles; phenotype depends on expression and sometimes the environment. Dominance means neither superiority nor greater frequency in a population.",
    ),
    p(
      "Croisement théorique Aa × Aa : les combinaisons équiprobables sont AA, Aa, aA et aa. Le modèle prévoit 1/4 AA, 1/2 Aa et 1/4 aa.",
      "Theoretical cross Aa × Aa: equally likely combinations are AA, Aa, aA and aa. The model predicts 1/4 AA, 1/2 Aa and 1/4 aa.",
    ),
    p(
      "Dans ce modèle, expliquer pourquoi quatre descendants ne donnent pas obligatoirement un AA, deux Aa et un aa.",
      "In this model, explain why four offspring do not necessarily include one AA, two Aa and one aa.",
    ),
    p(
      "Les proportions sont des probabilités, pas une composition obligatoire d'un petit groupe. Chaque descendance constitue un nouveau tirage dans le modèle.",
      "The proportions are probabilities, not a guaranteed composition of a small group. Each offspring represents a new outcome in the model.",
    ),
    [
      q(
        "Aa × Aa : probabilité de aa ?",
        "Aa × Aa: probability of aa?",
        ["1/4", "1/2", "3/4"],
        0,
        "Une case sur quatre donne aa.",
        "One of four combinations is aa.",
      ),
      qb(
        "Un allèle dominant est-il forcément le plus fréquent ?",
        "Is a dominant allele necessarily the most common?",
        [
          ["Oui", "Yes"],
          ["Non", "No"],
        ],
        1,
        "Dominance et fréquence décrivent des propriétés différentes.",
        "Dominance and frequency describe different properties.",
      ),
    ],
  ),
  lesson(
    "svt-investigation",
    "svt",
    4,
    true,
    p("Construire une démarche expérimentale", "Designing an investigation"),
    p(
      "Tester une hypothèse en contrôlant les variables.",
      "Test a hypothesis while controlling variables.",
    ),
    p(
      "Mesures, tableaux et distinction entre corrélation et causalité.",
      "Measurements, tables and correlation versus causation.",
    ),
    p(
      "Formuler une question testable, une hypothèse et une prédiction. Modifier une variable à la fois, définir ce qui sera mesuré et conserver les autres conditions comparables. Prévoir des répétitions et un témoin adapté. Décrire les limites et les résultats contraires à l'hypothèse. Ne pas expérimenter sur des personnes ou animaux sans cadre compétent.",
      "Formulate a testable question, hypothesis and prediction. Change one variable at a time, define the outcome to measure and keep other conditions comparable. Use repeated observations and a suitable control. Describe limitations and contradictory findings. Do not experiment on people or animals without a competent framework.",
    ),
    p(
      "Pour étudier la lumière et la croissance de jeunes plantes : même espèce, quantité d'eau, sol et durée ; deux éclairages définis ; plusieurs plantes par groupe ; mesurer régulièrement.",
      "To study light and seedling growth: use the same species, water, soil and duration; define two light conditions; use several plants per group and measure regularly.",
    ),
    p(
      "Pourquoi comparer une plante arrosée à la lumière et une plante non arrosée dans l'obscurité ne permet-il pas d'isoler l'effet de la lumière ?",
      "Why can't comparing a watered plant in light with an unwatered plant in darkness isolate light's effect?",
    ),
    p(
      "Deux variables changent : eau et lumière. Une différence observée ne peut donc pas être attribuée à la seule lumière.",
      "Two variables change: water and light. An observed difference cannot be attributed to light alone.",
    ),
    [
      qb(
        "La variable mesurée est…",
        "The measured variable is…",
        [
          ["La variable dépendante", "The dependent variable"],
          ["Toujours le témoin", "Always the control"],
        ],
        0,
        "Elle correspond au résultat étudié.",
        "It is the outcome being studied.",
      ),
      qb(
        "Pourquoi répéter les observations ?",
        "Why repeat observations?",
        [
          ["Pour repérer la variabilité", "To observe variability"],
          ["Pour garantir l'hypothèse", "To guarantee the hypothesis"],
        ],
        0,
        "Les répétitions renseignent sur la variabilité, sans garantir une conclusion.",
        "Repetition reveals variability but does not guarantee a conclusion.",
      ),
    ],
  ),
  lesson(
    "it-safety",
    "computing",
    1,
    false,
    p("Identité numérique et sécurité", "Digital identity and safety"),
    p(
      "Reconnaître une demande suspecte et protéger un compte.",
      "Recognise suspicious requests and protect an account.",
    ),
    p(
      "Lire une adresse web et distinguer public et privé.",
      "Read a web address and distinguish public from private information.",
    ),
    p(
      "Un compte relie une identité à des données. Utiliser un mot de passe long et unique et, si disponible, une seconde étape d'authentification. Une urgence, une récompense ou un logo ne prouvent pas qu'un message est fiable. Ouvrir le service par son adresse connue et demander conseil à un adulte ou responsable en cas de doute. Ne jamais publier de codes d'accès.",
      "An account connects an identity to data. Use a long, unique password and a second authentication factor when available. Urgency, a reward or a logo does not prove a message is genuine. Open the service using its known address and ask a trusted adult or responsible person when unsure. Never publish access codes.",
    ),
    p(
      "Un message annonce « compte bloqué, envoyez votre code ». Ne pas répondre avec le code ; vérifier depuis l'application ou l'adresse connue du service.",
      "A message says 'account blocked, send your code'. Do not send the code; check using the service's known application or address.",
    ),
    p(
      "Rédiger une courte fiche : vérifier l'adresse, éviter les liens suspects, demander de l'aide, changer un secret compromis et signaler l'incident.",
      "Write a short checklist: verify the address, avoid suspicious links, ask for help, replace a compromised secret and report the incident.",
    ),
    p(
      "Une bonne fiche explique chaque action et n'inclut aucun véritable mot de passe. Le cadenas HTTPS indique une connexion chiffrée, pas la fiabilité de l'auteur.",
      "A good checklist explains each action and contains no real passwords. HTTPS indicates an encrypted connection, not a trustworthy author.",
    ),
    [
      qb(
        "Faut-il transmettre un code reçu par SMS à un inconnu ?",
        "Should you send a text-message access code to a stranger?",
        [
          ["Non", "No"],
          ["Oui si le message est urgent", "Yes if the message is urgent"],
        ],
        0,
        "Ce code peut permettre l'accès au compte.",
        "The code may allow access to the account.",
      ),
      qb(
        "HTTPS garantit-il que le contenu est vrai ?",
        "Does HTTPS guarantee truthful content?",
        [
          ["Oui", "Yes"],
          ["Non", "No"],
        ],
        1,
        "Le chiffrement du transport ne vérifie pas la vérité du contenu.",
        "Transport encryption does not verify the truth of content.",
      ),
    ],
  ),
  lesson(
    "it-algorithms",
    "computing",
    2,
    false,
    p(
      "Algorithmes : décrire une solution",
      "Algorithms: describing a solution",
    ),
    p(
      "Écrire et tester une suite d'instructions non ambiguës.",
      "Write and test an unambiguous sequence of instructions.",
    ),
    p(
      "Opérations simples et compréhension d'une condition.",
      "Simple arithmetic and understanding a condition.",
    ),
    p(
      "Un algorithme décrit des étapes finies pour résoudre un problème. Préciser les entrées, la sortie attendue et les cas particuliers. Une variable garde une valeur ; une condition choisit une branche ; une boucle répète. Tester un cas ordinaire, une limite et une entrée invalide. Un ordinateur suit les instructions, même si celles-ci ne correspondent pas à l'intention.",
      "An algorithm describes finite steps to solve a problem. Specify inputs, expected output and edge cases. A variable stores a value, a condition chooses a branch and a loop repeats. Test a normal case, a boundary and invalid input. A computer follows instructions even when they do not match the author's intention.",
    ),
    p(
      "Maximum de a et b : si a ≥ b, retourner a ; sinon retourner b. Tester (4, 7), (9, 2) et (5, 5).",
      "Maximum of a and b: if a ≥ b, return a; otherwise return b. Test (4, 7), (9, 2) and (5, 5).",
    ),
    p(
      "Écrire sur papier un algorithme qui calcule la moyenne de trois notes valides sur 20 et refuse une note négative ou supérieure à 20.",
      "Write a paper algorithm that averages three valid marks out of 20 and rejects a negative mark or one above 20.",
    ),
    p(
      "Lire a, b, c ; vérifier 0 ≤ chaque note ≤ 20 ; sinon signaler l'erreur ; retourner (a + b + c)/3. Tester 0, 20, des valeurs usuelles et 21.",
      "Read a, b, c; check each is between 0 and 20; otherwise report an error; return (a + b + c)/3. Test 0, 20, usual values and 21.",
    ),
    [
      q(
        "Après x ← 3 puis x ← x + 2, x vaut…",
        "After x ← 3 then x ← x + 2, x is…",
        ["2", "3", "5"],
        2,
        "La seconde affectation remplace 3 par 5.",
        "The second assignment replaces 3 with 5.",
      ),
      qb(
        "Quel test couvre une limite pour une note sur 20 ?",
        "Which test covers a boundary for a mark out of 20?",
        [
          ["20", "20"],
          ["10 seulement", "Only 10"],
        ],
        0,
        "20 est la limite supérieure autorisée.",
        "20 is the allowed upper boundary.",
      ),
    ],
  ),
  lesson(
    "it-data",
    "computing",
    3,
    true,
    p("Données, tableaux et qualité", "Data, tables and quality"),
    p(
      "Organiser des données et éviter une moyenne trompeuse.",
      "Organise data and avoid a misleading average.",
    ),
    p(
      "Tableaux, fractions et identifiants.",
      "Tables, fractions and identifiers.",
    ),
    p(
      "Une table utilise des lignes pour les éléments et des colonnes pour leurs propriétés. Choisir un identifiant stable, des unités explicites et des types cohérents. Une valeur manquante n'est pas nécessairement zéro. Vérifier doublons, valeurs impossibles et provenance avant de calculer. Pour protéger les personnes, ne collecter que les données nécessaires.",
      "A table uses rows for items and columns for their properties. Choose stable identifiers, explicit units and consistent types. A missing value is not necessarily zero. Check duplicates, impossible values and provenance before calculating. Protect people by collecting only necessary information.",
    ),
    p(
      "Notes 12/20, 15/20 et une note absente : moyenne des notes disponibles = 27/2 = 13,5/20, avec la mention « 2 notes sur 3 disponibles ». Ne pas afficher 9/20 en remplaçant silencieusement l'absence par zéro.",
      "Marks of 12/20, 15/20 and one missing mark: the available-mark average is 27/2 = 13.5/20, labelled '2 of 3 marks available'. Do not silently replace missing with zero and report 9/20.",
    ),
    p(
      "Concevoir les colonnes d'un tableau de livres prêtés en évitant de stocker des informations personnelles inutiles.",
      "Design columns for a book-loan table without collecting unnecessary personal information.",
    ),
    p(
      "Exemple : identifiant du prêt, identifiant du livre, identifiant de l'emprunteur, date d'emprunt et date de retour. Restreindre l'accès aux correspondances d'identité.",
      "Example: loan ID, book ID, borrower ID, loan date and return date. Restrict access to identity mappings.",
    ),
    [
      qb(
        "Une valeur absente doit toujours devenir zéro.",
        "A missing value should always become zero.",
        [
          ["Vrai", "True"],
          ["Faux", "False"],
        ],
        1,
        "Absence et zéro ont des significations différentes.",
        "Missing and zero have different meanings.",
      ),
      qb(
        "À quoi sert un identifiant stable ?",
        "What is a stable identifier for?",
        [
          ["Distinguer les éléments", "Distinguishing records"],
          ["Remplacer toutes les colonnes", "Replacing every column"],
        ],
        0,
        "Il évite de confondre des éléments ayant le même nom.",
        "It avoids confusing records with the same name.",
      ),
    ],
  ),
  lesson(
    "it-complexity",
    "computing",
    4,
    true,
    p(
      "Recherche et efficacité d'un algorithme",
      "Searching and algorithm efficiency",
    ),
    p(
      "Comparer recherche linéaire et recherche dichotomique.",
      "Compare linear and binary search.",
    ),
    p(
      "Listes, ordre, conditions et boucles.",
      "Lists, ordering, conditions and loops.",
    ),
    p(
      "La recherche linéaire examine les éléments un à un. La recherche dichotomique compare au milieu d'une liste triée puis conserve la moitié pertinente. Elle exige un ordre cohérent ; sans tri, sa conclusion peut être fausse. Comparer le nombre d'étapes pour différentes tailles et séparer le coût du tri de celui d'une recherche.",
      "Linear search examines items one by one. Binary search compares with the middle of a sorted list and keeps the relevant half. It requires a consistent order; without sorting, its answer may be wrong. Compare step counts at different sizes and separate sorting cost from the search itself.",
    ),
    p(
      "Chercher 13 dans [2, 5, 8, 13, 21, 34, 55] : comparer à 13 au milieu donne une réponse immédiate. Ce cas favorable ne décrit pas tous les cas.",
      "Search for 13 in [2, 5, 8, 13, 21, 34, 55]: the middle comparison finds 13 immediately. This favourable case does not describe every case.",
    ),
    p(
      "Simuler une recherche de 20 dans la liste. Montrer comment conclure « absent » sans boucle infinie.",
      "Simulate a search for 20 in the list. Show how to conclude 'absent' without an infinite loop.",
    ),
    p(
      "Après 13, garder [21, 34, 55], puis [21], puis un intervalle vide car 20 < 21. L'intervalle doit diminuer à chaque étape et la boucle s'arrêter lorsqu'il est vide.",
      "After 13, keep [21, 34, 55], then [21], then an empty interval because 20 < 21. The interval must shrink at each step and the loop must stop when it is empty.",
    ),
    [
      qb(
        "La dichotomie exige une liste…",
        "Binary search requires a list that is…",
        [
          ["Triée", "Sorted"],
          ["Aléatoire", "Random"],
          ["Toujours vide", "Always empty"],
        ],
        0,
        "L'ordre permet d'écarter une moitié en toute logique.",
        "Ordering justifies discarding half the list.",
      ),
      qb(
        "Une boucle de recherche correcte doit…",
        "A correct search loop should…",
        [
          [
            "Réduire le problème et s'arrêter",
            "Reduce the problem and terminate",
          ],
          [
            "Répéter toujours les mêmes bornes",
            "Always repeat the same bounds",
          ],
        ],
        0,
        "Une condition de fin et une progression évitent la boucle infinie.",
        "A termination condition and progress prevent an infinite loop.",
      ),
    ],
  ),
  lesson(
    "fr-agreement",
    "french",
    1,
    false,
    p(
      "Accords : repérer avant d'écrire",
      "French agreement: identify before writing",
    ),
    p(
      "Justifier l'accord du verbe et de l'adjectif.",
      "Explain verb and adjective agreement in French.",
    ),
    p(
      "Reconnaître nom, verbe et adjectif.",
      "Recognise nouns, verbs and adjectives.",
    ),
    p(
      "Le verbe s'accorde avec son sujet, même si d'autres mots les séparent. Pour trouver le sujet, demander « qui est-ce qui ? » ou « qu'est-ce qui ? » devant le verbe. L'adjectif s'accorde en genre et en nombre avec le nom qu'il qualifie. Relire en deux passages : d'abord les groupes nominaux, puis les relations sujet-verbe.",
      "A French verb agrees with its subject even when words separate them. Ask who or what performs the verb to identify the subject. Adjectives agree in gender and number with the noun they describe. Proofread in two passes: noun phrases first, then subject–verb relationships.",
    ),
    p(
      "« Les petites filles du voisin jouent. » Le sujet est « les petites filles » : jouent prend -ent. « Petites » est féminin pluriel.",
      "In « Les petites filles du voisin jouent », the subject is « les petites filles », so the verb ends in -ent. « Petites » is feminine plural.",
    ),
    p(
      "Corriger et justifier : « Les livre que mon frère apporte est intéressant. »",
      "Correct and explain: « Les livre que mon frère apporte est intéressant. »",
    ),
    p(
      "« Les livres que mon frère apporte sont intéressants. » Livres et intéressants sont pluriels ; sont s'accorde avec livres ; apporte avec frère.",
      "« Les livres que mon frère apporte sont intéressants. » Livres and intéressants are plural; sont agrees with livres and apporte with frère.",
    ),
    [
      q(
        "Compléter : « Les élèves … leur travail. »",
        "Complete: « Les élèves … leur travail. »",
        ["termine", "terminent", "terminons"],
        1,
        "Le sujet est à la troisième personne du pluriel.",
        "The subject is third-person plural.",
      ),
      q(
        "Choisir le groupe correct.",
        "Choose the correct phrase.",
        ["des fleurs rouge", "des fleur rouges", "des fleurs rouges"],
        2,
        "Nom et adjectif sont au pluriel.",
        "Both noun and adjective are plural.",
      ),
    ],
  ),
  lesson(
    "fr-reading",
    "french",
    2,
    false,
    p("Lire et prouver sa réponse", "Reading and supporting an answer"),
    p(
      "Distinguer information explicite et interprétation.",
      "Distinguish explicit information from interpretation.",
    ),
    p(
      "Lecture de phrases et repérage des pronoms.",
      "Sentence reading and identifying pronouns.",
    ),
    p(
      "Lire d'abord la question, puis le texte entier. Relever les personnages, le lieu, le moment et les changements. Une réponse explicite reprend une information écrite ; une inférence relie des indices. Pour chaque interprétation, citer un court indice et expliquer le lien. Ne pas transformer une supposition en certitude.",
      "Read the question, then the whole text. Identify people, place, time and changes. Explicit answers use stated information; inferences connect clues. Support an interpretation with a brief textual clue and explain the link. Do not turn an assumption into certainty.",
    ),
    p(
      "Texte original : « Awa serre son parapluie. Le ciel s'assombrit, mais elle poursuit sa marche. » Le ciel s'assombrit est explicite. La pluie est possible, mais le texte ne dit pas qu'elle tombe.",
      "Original text: « Awa serre son parapluie. Le ciel s'assombrit, mais elle poursuit sa marche. » The sky becoming darker is explicit. Rain is possible, but the text does not say it is falling.",
    ),
    p(
      "Écrire deux interprétations possibles du comportement d'Awa, avec un indice et une limite pour chacune.",
      "Write two possible interpretations of Awa's behaviour, with a clue and a limitation for each.",
    ),
    p(
      "Elle veut peut-être arriver à destination : « poursuit sa marche ». Elle se prépare peut-être à la pluie : « serre son parapluie ». Le texte ne donne ni son but ni ses sentiments avec certitude.",
      "She may want to reach a destination: « poursuit sa marche ». She may be preparing for rain: « serre son parapluie ». Neither her purpose nor feelings are stated with certainty.",
    ),
    [
      qb(
        "Quel fait est écrit dans le texte ?",
        "Which fact is stated in the text?",
        [
          ["Il pleut déjà", "It is already raining"],
          ["Le ciel s'assombrit", "The sky is darkening"],
          ["Awa est en retard", "Awa is late"],
        ],
        1,
        "C'est une information explicite.",
        "This is explicitly stated.",
      ),
      qb(
        "Une bonne interprétation doit…",
        "A sound interpretation should…",
        [
          ["S'appuyer sur des indices", "Use textual evidence"],
          ["Inventer la suite", "Invent what happens next"],
          ["Ignorer le contexte", "Ignore context"],
        ],
        0,
        "Les indices rendent le raisonnement vérifiable.",
        "Evidence makes the reasoning checkable.",
      ),
    ],
  ),
  lesson(
    "fr-argument",
    "french",
    3,
    true,
    p(
      "Construire un paragraphe argumenté",
      "Building an argumentative paragraph",
    ),
    p(
      "Défendre une idée avec raison, exemple et nuance.",
      "Support a claim with reasoning, an example and qualification.",
    ),
    p(
      "Phrases complètes, connecteurs et compréhension du sujet.",
      "Complete sentences, linking words and understanding the prompt.",
    ),
    p(
      "Commencer par une idée qui répond au sujet. Donner une raison, l'illustrer par un exemple précis, puis expliquer ce que l'exemple démontre. Examiner une objection réelle plutôt qu'une caricature. Les connecteurs montrent la relation logique : cause, conséquence, opposition ou concession. Un exemple isolé ne prouve pas une règle universelle.",
      "Start with a claim that answers the prompt. Give a reason, illustrate it with a specific example, then explain what it demonstrates. Address a genuine objection. Linking words show cause, consequence, contrast or concession. One example does not prove a universal rule.",
    ),
    p(
      "Sujet : travailler en groupe. Idée : l'échange peut aider à corriger une erreur. Exemple : deux élèves comparent leurs démarches. Limite : sans répartition des tâches, certains peuvent rester passifs.",
      "Topic: group work. Claim: discussion can help correct errors. Example: two learners compare their methods. Limitation: without shared responsibilities, some may remain passive.",
    ),
    p(
      "Rédiger 120 mots sur l'intérêt d'une bibliothèque scolaire. Inclure une objection et une réponse sans inventer de statistiques.",
      "Write 120 words in French about the value of a school library. Include an objection and response without inventing statistics.",
    ),
    p(
      "Grille d'autocorrection : thèse claire, raison expliquée, exemple concret, objection pertinente, réponse nuancée, conclusion liée au sujet. Plusieurs réponses sont possibles.",
      "Self-check: clear claim, explained reason, concrete example, relevant objection, qualified response and a conclusion tied to the prompt. Several answers are possible.",
    ),
    [
      qb(
        "Quel élément renforce un argument ?",
        "What strengthens an argument?",
        [
          ["Une insulte", "An insult"],
          ["Un exemple analysé", "An analysed example"],
          ["Une répétition seule", "Repetition alone"],
        ],
        1,
        "L'analyse montre pourquoi l'exemple soutient l'idée.",
        "Analysis explains why the example supports the claim.",
      ),
      q(
        "Quel connecteur marque une concession ?",
        "Which French connector introduces a concession?",
        ["Certes", "Donc", "Parce que"],
        0,
        "« Certes » reconnaît un point avant une nuance.",
        "« Certes » acknowledges a point before qualifying it.",
      ),
    ],
  ),
  lesson(
    "fr-summary",
    "french",
    4,
    true,
    p("Résumer sans déformer", "Summarising accurately"),
    p(
      "Conserver les idées essentielles dans un texte plus court.",
      "Preserve essential ideas in a shorter text.",
    ),
    p(
      "Compréhension, reformulation et repérage du raisonnement.",
      "Comprehension, paraphrasing and identifying reasoning.",
    ),
    p(
      "Identifier le thème, la thèse et les étapes du raisonnement. Réduire les exemples secondaires, regrouper les idées proches et reformuler sans ajouter son avis. Respecter les limites de longueur fixées par la consigne réelle. Garder les nuances : « peut » ne devient pas « doit », et « certains » ne devient pas « tous ».",
      "Identify the topic, main claim and reasoning. Reduce secondary examples, group related ideas and paraphrase without adding opinions. Follow the actual task's word limit. Preserve qualifications: 'may' must not become 'must', and 'some' must not become 'all'.",
    ),
    p(
      "Texte original : « Le numérique facilite parfois l'accès à des ressources. Pourtant, sans connexion ni accompagnement, certains élèves en profitent peu. » Résumé : « L'accès numérique peut aider, mais dépend aussi de la connexion et de l'accompagnement. »",
      "Original French text: « Le numérique facilite parfois l'accès à des ressources. Pourtant, sans connexion ni accompagnement, certains élèves en profitent peu. » Summary: « L'accès numérique peut aider, mais dépend aussi de la connexion et de l'accompagnement. »",
    ),
    p(
      "Rédiger un autre résumé en conservant à la fois l'avantage et les conditions, puis comparer les deux versions.",
      "Write another French summary preserving both the benefit and its conditions, then compare the versions.",
    ),
    p(
      "Vérifier : présence du bénéfice, des conditions, de la nuance et absence d'idée ajoutée. Une formulation différente peut être tout aussi correcte.",
      "Check for the benefit, conditions, qualification and absence of added claims. Different wording can be equally valid.",
    ),
    [
      qb(
        "Que doit éviter un résumé ?",
        "What should a summary avoid?",
        [
          ["Reformuler", "Paraphrasing"],
          ["Ajouter son opinion", "Adding personal opinions"],
          ["Garder la thèse", "Keeping the main claim"],
        ],
        1,
        "Un résumé restitue le texte, sans commentaire personnel.",
        "A summary represents the source without personal commentary.",
      ),
      qb(
        "« Certains élèves » peut-il devenir « tous les élèves » ?",
        "Can 'some learners' become 'all learners'?",
        [
          ["Oui", "Yes"],
          ["Non", "No"],
        ],
        1,
        "Cela change la portée de l'affirmation.",
        "That changes the scope of the claim.",
      ),
    ],
  ),
  lesson(
    "en-tenses",
    "english",
    1,
    false,
    p(
      "Anglais : habitudes et actions en cours",
      "English: habits and actions in progress",
    ),
    p(
      "Choisir entre présent simple et présent continu.",
      "Choose between present simple and present continuous.",
    ),
    p(
      "Pronoms sujets, verbe be et verbes courants.",
      "Subject pronouns, the verb be and common verbs.",
    ),
    p(
      "Le présent simple décrit notamment les habitudes : « I study every evening. » À la troisième personne du singulier, on ajoute souvent -s : « She studies. » Le présent continu se construit avec be + verbe en -ing : « She is studying now. » Le contexte guide le choix ; certains verbes d'état s'emploient généralement au simple.",
      "The present simple describes habits: 'I study every evening.' Third-person singular verbs usually take -s: 'She studies.' The present continuous uses be + an -ing form: 'She is studying now.' Context guides the choice; state verbs are generally used in the simple form.",
    ),
    p(
      "« We walk to school on Mondays. Today, we are taking the bus. » La première phrase décrit une habitude ; la seconde une situation en cours ou temporaire.",
      "'We walk to school on Mondays. Today, we are taking the bus.' The first sentence describes a habit; the second describes a current or temporary situation.",
    ),
    p(
      "Écrire trois habitudes et trois actions que vous faites maintenant, puis vérifier sujet, auxiliaire et forme verbale.",
      "Write three habits and three things you are doing now. Check subject, auxiliary and verb form.",
    ),
    p(
      "Exemples : « I read after dinner. » / « I am writing a sentence now. » Le présent continu exige une forme de be ; les habitudes n'exigent pas cet auxiliaire.",
      "Examples: 'I read after dinner.' / 'I am writing a sentence now.' Present continuous requires a form of be; ordinary affirmative habits do not.",
    ),
    [
      q(
        "Compléter : She … English every day.",
        "Complete: She … English every day.",
        ["study", "studies", "studying"],
        1,
        "She est à la troisième personne du singulier : studies.",
        "She is third-person singular: studies.",
      ),
      q(
        "Compléter : They … football now.",
        "Complete: They … football now.",
        ["are playing", "plays", "is playing"],
        0,
        "They s'accorde avec are ; l'action est en cours.",
        "They takes are; the action is in progress.",
      ),
    ],
  ),
  lesson(
    "en-reading",
    "english",
    2,
    false,
    p(
      "Anglais : comprendre sans tout traduire",
      "English: reading without translating every word",
    ),
    p(
      "Trouver l'idée générale et vérifier les détails.",
      "Identify the main idea and check details.",
    ),
    p(
      "Vocabulaire courant et phrases simples.",
      "Everyday vocabulary and simple sentences.",
    ),
    p(
      "Parcourir le texte pour le sujet général, puis chercher les informations demandées. Utiliser le contexte avant de consulter un dictionnaire. Distinguer ce que le texte dit, contredit et ne précise pas. Justifier les réponses avec des mots du passage, sans recopier tout le texte.",
      "Skim for the main topic, then scan for requested details. Use context before consulting a dictionary. Distinguish what the text states, contradicts and leaves unknown. Support answers with brief textual evidence rather than copying everything.",
    ),
    p(
      "Texte original : « On Saturday, Lina borrowed two books from the library. She returned home before noon. » On connaît le jour, le nombre de livres et le moment du retour ; on ne connaît pas leurs titres.",
      "Original text: 'On Saturday, Lina borrowed two books from the library. She returned home before noon.' We know the day, number of books and return time, but not the titles.",
    ),
    p(
      "Écrire deux questions dont la réponse est dans le texte et une question impossible à trancher avec ce seul passage.",
      "Write two questions answered by the text and one that cannot be answered from this passage alone.",
    ),
    p(
      "Exemples : How many books? Two. When did she return? Before noon. Which titles? Not stated.",
      "Examples: How many books? Two. When did she return? Before noon. Which titles? Not stated.",
    ),
    [
      q(
        "How many books did Lina borrow?",
        "How many books did Lina borrow?",
        ["One", "Two", "Three"],
        1,
        "Le texte dit « two books ».",
        "The passage states 'two books'.",
      ),
      q(
        "The books were about science. Is this stated?",
        "The books were about science. Is this stated?",
        ["Yes", "No; the topic is not given"],
        1,
        "Aucun thème n'est précisé.",
        "The topic of the books is not specified.",
      ),
    ],
  ),
  lesson(
    "en-essay",
    "english",
    3,
    true,
    p("Anglais : organiser une rédaction", "English: organising an essay"),
    p(
      "Produire un texte structuré répondant à la consigne.",
      "Write a structured response to the prompt.",
    ),
    p(
      "Paragraphes, temps verbaux et connecteurs.",
      "Paragraphs, verb tenses and linking words.",
    ),
    p(
      "Analyser la consigne, le destinataire et le but avant d'écrire. Préparer une idée par paragraphe, avec explication et exemple. L'introduction présente la question ; la conclusion répond à celle-ci sans ouvrir un autre sujet. Relire d'abord les idées, puis la grammaire. Une rédaction claire vaut mieux qu'une accumulation de mots difficiles mal utilisés.",
      "Analyse the prompt, audience and purpose before writing. Plan one main idea per paragraph, supported by explanation and an example. The introduction frames the question; the conclusion responds without introducing a new topic. Review ideas first, grammar second. Clear writing is better than misused complicated vocabulary.",
    ),
    p(
      "Sujet : Should schools encourage reading clubs? Plan possible : accès à des lectures variées ; discussion et entraide ; limites de temps et solutions réalistes.",
      "Prompt: Should schools encourage reading clubs? Possible plan: access to varied reading; discussion and peer support; time constraints and realistic solutions.",
    ),
    p(
      "Rédiger un paragraphe de 80 à 100 mots en anglais avec une phrase directrice, un exemple et une limite.",
      "Write an 80–100-word paragraph in English with a topic sentence, an example and a limitation.",
    ),
    p(
      "Autocorrection : réponse au sujet, ordre logique, exemple expliqué, nuance, cohérence des temps et ponctuation. Demander un retour humain pour le style.",
      "Self-check: relevance, logical order, explained example, qualification, consistent tenses and punctuation. Ask a person for feedback on style.",
    ),
    [
      qb(
        "Que contient un paragraphe solide ?",
        "What does a strong paragraph contain?",
        [
          ["Une idée développée", "One developed main idea"],
          ["Des idées sans lien", "Unrelated ideas"],
          ["Une conclusion sans raison", "A conclusion without reasons"],
        ],
        0,
        "Une idée expliquée facilite le suivi du raisonnement.",
        "An explained main idea makes reasoning easier to follow.",
      ),
      q(
        "Which phrase introduces a contrast?",
        "Which phrase introduces a contrast?",
        ["In addition", "However", "For example"],
        1,
        "However marque une opposition ou une nuance.",
        "However introduces contrast or qualification.",
      ),
    ],
  ),
  lesson(
    "en-evidence",
    "english",
    4,
    true,
    p("Anglais : évaluer une affirmation", "English: evaluating a claim"),
    p(
      "Reconnaître preuve, opinion et généralisation.",
      "Recognise evidence, opinion and overgeneralisation.",
    ),
    p(
      "Compréhension de textes argumentatifs.",
      "Understanding argumentative texts.",
    ),
    p(
      "Repérer l'auteur, la date, la proposition défendue et ses preuves. Demander si les exemples représentent réellement le groupe décrit. Les mots always, never et everyone exigent une justification très forte. Comparer des sources indépendantes et reconnaître ce qui reste incertain.",
      "Identify the author, date, claim and supporting evidence. Ask whether examples represent the group being discussed. Words such as always, never and everyone require strong justification. Compare independent sources and acknowledge uncertainty.",
    ),
    p(
      "« Three classmates prefer videos, so all students learn best through videos. » La conclusion généralise trois témoignages à tous les élèves et confond préférence et efficacité.",
      "'Three classmates prefer videos, so all students learn best through videos.' This generalises three accounts to all learners and confuses preference with effectiveness.",
    ),
    p(
      "Réécrire l'affirmation de façon prudente et proposer une manière de vérifier l'efficacité d'une méthode d'étude.",
      "Rewrite the claim cautiously and suggest a way to investigate how effective a study method is.",
    ),
    p(
      "« Three classmates said they preferred videos. » Comparer ensuite des résultats sur une même compétence, avec des conditions comparables et davantage de participants.",
      "'Three classmates said they preferred videos.' Then compare outcomes on the same skill under comparable conditions with more participants.",
    ),
    [
      qb(
        "Quelle est la limite de l'exemple ?",
        "What is a limitation of the example?",
        [
          ["Échantillon trop limité", "A very limited sample"],
          ["Trop de preuves", "Too much evidence"],
          ["Aucune conclusion", "No conclusion"],
        ],
        0,
        "Trois camarades ne représentent pas tous les élèves.",
        "Three classmates do not represent all learners.",
      ),
      qb(
        "Une source plus fiable permet de vérifier…",
        "A more reliable source lets you check…",
        [
          ["Auteur, date et preuves", "Author, date and evidence"],
          ["Seulement la couleur du site", "Only the website's colour"],
        ],
        0,
        "La présentation visuelle seule ne garantit pas la fiabilité.",
        "Visual presentation alone does not establish reliability.",
      ),
    ],
  ),
);
