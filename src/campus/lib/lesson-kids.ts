import { c, step, type Copy, type LessonGuide } from "./lesson-guide-model";
import { lesson } from "./lesson-recipes";
export function activity(title: Copy, instruction: Copy, expected: Copy) {
  return step(title, instruction, undefined, expected);
}
export function young(
  topic: string,
  story: Copy,
  en: string,
  fr: string,
  activities: LessonGuide["steps"],
  question: Copy,
  answer: Copy,
  misconception: Copy,
) {
  return lesson(
    topic,
    "kids",
    c(
      "Explore one idea, make something small, then explain it in your own words. An adult helps with equipment and any external website. Your project can stay on this computer.",
      "Explore une idée, crée quelque chose de simple puis explique-le avec tes mots. Un adulte accompagne le matériel et les sites externes. Ton projet peut rester sur cet ordinateur.",
    ),
    story,
    en,
    fr,
    activities,
    question,
    answer,
    misconception,
  );
}
export const kidsGuides: Record<string, LessonGuide> = {
  "kids-hardware": young(
    "Computer · components",
    c(
      "A computer is like a small workshop: parts have different jobs and need to work together. Explore a picture of a computer rather than opening a powered device.",
      "Un ordinateur ressemble à un petit atelier : chaque pièce a son rôle. Explore une image plutôt que d’ouvrir un appareil branché.",
    ),
    "Input|Processor|Memory|Output",
    "Entrée|Processeur|Mémoire|Sortie",
    [
      activity(
        c("Observe", "Observer"),
        c(
          "Draw or label a picture with processor, RAM, storage and cooling. Ask an adult to explain anything you cannot identify.",
          "Dessine ou annote processeur, RAM, stockage et refroidissement. Demande à un adulte pour les éléments inconnus.",
        ),
        c("Four parts are labelled.", "Quatre composants sont nommés."),
      ),
      activity(
        c("Tell the story of a saved drawing", "Raconter un dessin sauvegardé"),
        c(
          "Explain which part keeps the drawing after the computer switches off and which part helps work on it now.",
          "Explique ce qui garde le dessin après l’arrêt et ce qui aide à le modifier maintenant.",
        ),
        c(
          "RAM and persistent storage have different roles.",
          "RAM et stockage permanent ont des rôles distincts.",
        ),
      ),
      activity(
        c("Build your illustrated card", "Créer ta fiche illustrée"),
        c(
          "Make a card for each part: name, drawing and one useful job. Present the cards without touching electrical parts.",
          "Crée une fiche par pièce : nom, dessin et rôle. Présente sans toucher aux parties électriques.",
        ),
        c(
          "Explain four components using your own illustrations.",
          "Explique quatre composants avec tes propres illustrations.",
        ),
      ),
    ],
    c(
      "Where should a drawing be saved to remain after shutdown?",
      "Où sauvegarder un dessin pour le retrouver après l’arrêt ?",
    ),
    c(
      "On persistent storage such as a drive; RAM is temporary working memory.",
      "Sur un stockage permanent comme un disque ; la RAM sert de mémoire temporaire.",
    ),
    c(
      "Only in RAM, because it always keeps data without power.",
      "Uniquement en RAM car elle garde toujours les données sans courant.",
    ),
  ),
  "kids-peripherals": young(
    "Computer · inputs and outputs",
    c(
      "You are building a music game. Decide how the player gives instructions and how the game replies.",
      "Tu construis un jeu musical. Choisis comment le joueur donne ses instructions et comment le jeu répond.",
    ),
    "Player|Input device|Computer|Output device",
    "Joueur|Périphérique entrée|Ordinateur|Périphérique sortie",
    [
      activity(
        c("Collect examples", "Rassembler des exemples"),
        c(
          "Draw a keyboard, mouse, microphone, screen, speaker and touchscreen.",
          "Dessine clavier, souris, micro, écran, haut-parleur et écran tactile.",
        ),
        c("Six devices are represented.", "Six appareils sont représentés."),
      ),
      activity(
        c("Sort by direction", "Classer par direction"),
        c(
          "Use arrows to show whether information goes into or out of the computer. A touchscreen can do both.",
          "Dessine les flèches d’information vers ou depuis l’ordinateur. L’écran tactile fait les deux.",
        ),
        c(
          "Your sorting includes a device that has two roles.",
          "Ton classement inclut un appareil à deux rôles.",
        ),
      ),
      activity(
        c("Design a game controller", "Concevoir une commande de jeu"),
        c(
          "Choose two input actions and two outputs for your music game. Explain how a player knows their action worked.",
          "Choisis deux entrées et deux sorties pour ton jeu musical. Explique comment le joueur sait que son action a fonctionné.",
        ),
        c(
          "Present an input/output diagram for your game.",
          "Présente le schéma des entrées et sorties de ton jeu.",
        ),
      ),
    ],
    c(
      "Is a touchscreen only an output device?",
      "Un écran tactile est-il uniquement une sortie ?",
    ),
    c(
      "No. It displays information and receives touch input.",
      "Non. Il affiche des informations et reçoit les gestes.",
    ),
    c(
      "Yes. Touching it does not send information to the computer.",
      "Oui. Le toucher n’envoie aucune information à l’ordinateur.",
    ),
  ),
  "kids-os-files": young(
    "Files · organise and recover",
    c(
      "Your project has pictures and notes. A clear folder structure helps another person find your work without asking you where everything is.",
      "Ton projet contient images et notes. Des dossiers clairs aident quelqu’un à retrouver ton travail sans te demander où tout est.",
    ),
    "Project folder|Images and notes|Saved file|Backup copy",
    "Dossier projet|Images et notes|Fichier enregistré|Copie sauvegardée",
    [
      activity(
        c("Make a project home", "Créer le dossier du projet"),
        c(
          "Create a new folder called My project, with Images and Notes inside it.",
          "Crée un dossier Mon projet, avec Images et Notes à l’intérieur.",
        ),
        c("Two subfolders are visible.", "Deux sous-dossiers sont visibles."),
      ),
      activity(
        c("Save and find a note", "Enregistrer et retrouver une note"),
        c(
          "Write a fictional project description, save it in Notes and close the editor. Reopen it from the folder.",
          "Écris une présentation fictive, enregistre-la dans Notes et ferme l’éditeur. Retrouve-la depuis le dossier.",
        ),
        c(
          "You reopen the same saved content.",
          "Tu retrouves le contenu enregistré.",
        ),
      ),
      activity(
        c("Test a backup", "Tester une sauvegarde"),
        c(
          "With an adult, copy the project to an approved second location. Open the copied note and explain how you know it is a different copy.",
          "Avec un adulte, copie le projet à un autre emplacement autorisé. Ouvre la note copiée et explique comment tu reconnais cette copie.",
        ),
        c(
          "Show both the original project and a readable backup.",
          "Montre le projet original et une sauvegarde lisible.",
        ),
      ),
    ],
    c(
      "Is renaming a shortcut the same as making a backup of a file?",
      "Renommer un raccourci revient-il à sauvegarder un fichier ?",
    ),
    c(
      "No. A shortcut points to the original. A backup needs a separate copy whose contents you can open.",
      "Non. Un raccourci pointe vers l’original. Une sauvegarde exige une copie séparée que tu peux ouvrir.",
    ),
    c(
      "Yes. Any second icon is a complete backup.",
      "Oui. Une deuxième icône est toujours une sauvegarde complète.",
    ),
  ),
  "kids-binary": young(
    "Binary · pixel pictures",
    c(
      "Send a tiny picture to a friend using only zeros and ones. Agree on the meaning of each symbol before sending it.",
      "Envoie un petit dessin avec seulement des zéros et des uns. Définissez le sens des symboles avant de commencer.",
    ),
    "Picture|Pixel grid|Binary rows|Rebuilt picture",
    "Dessin|Grille pixels|Lignes binaires|Dessin reconstruit",
    [
      activity(
        c("Draw the grid", "Dessiner la grille"),
        c(
          "Make an 8 by 8 grid and colour some cells black. Decide that 1 means black and 0 means white.",
          "Trace une grille 8 par 8, colorie des cases et décide que 1 signifie noir et 0 blanc.",
        ),
        c("The picture uses 64 cells.", "Le dessin utilise 64 cases."),
      ),
      activity(
        c("Encode it", "Encoder le dessin"),
        c(
          "Write eight rows of eight bits. Keep the row order visible.",
          "Écris huit lignes de huit bits en conservant leur ordre.",
        ),
        c(
          "Your code has 64 bits and an agreed colour rule.",
          "Ton code comporte 64 bits et une règle de couleur.",
        ),
      ),
      activity(
        c("Test with a friend", "Tester avec un camarade"),
        c(
          "Ask someone to rebuild the image without seeing the original. Compare and fix one mistaken bit.",
          "Demande de reconstruire sans voir l’original. Compare et corrige un bit erroné.",
        ),
        c(
          "Explain how a change in one bit changes one pixel in this encoding.",
          "Explique comment changer un bit modifie un pixel dans cet encodage.",
        ),
      ),
    ],
    c(
      "Can the same bits mean different things if we change the encoding rule?",
      "Les mêmes bits peuvent-ils avoir un autre sens si la règle change ?",
    ),
    c(
      "Yes. The agreed encoding tells us how to interpret the bits.",
      "Oui. La règle d’encodage explique comment interpréter les bits.",
    ),
    c(
      "No. Bits explain their meaning without any agreed rule.",
      "Non. Les bits expliquent leur sens sans règle.",
    ),
  ),
  "kids-web-safety": young(
    "Web · safe curiosity",
    c(
      "A message offers a free game and asks for a password. Practise pausing and asking an adult instead of trying an unknown link.",
      "Un message promet un jeu gratuit et demande un mot de passe. Entraîne-toi à faire une pause et demander à un adulte.",
    ),
    "See a link|Check context|Ask an adult|Choose safely",
    "Voir un lien|Vérifier contexte|Demander à un adulte|Choisir prudemment",
    [
      activity(
        c("Compare fictional addresses", "Comparer des adresses fictives"),
        c(
          "Use example.com and example.invalid on paper. Circle the actual domain, not a familiar word elsewhere in the address.",
          "Sur papier, utilise example.com et example.invalid. Entoure le vrai domaine, pas un mot familier ailleurs.",
        ),
        c(
          "You can point to the domain name.",
          "Tu sais montrer le nom de domaine.",
        ),
      ),
      activity(
        c("Make three safety cards", "Créer trois cartes de prudence"),
        c(
          "Write: pause before downloading; keep passwords private; ask an adult when unsure. Add your own pictures.",
          "Écris : faire une pause avant téléchargement ; garder les mots de passe privés ; demander à un adulte. Ajoute tes dessins.",
        ),
        c("Each card explains an action.", "Chaque carte décrit une action."),
      ),
      activity(
        c("Role-play the message", "Jouer le scénario"),
        c(
          "Explain how you would respond without sending personal information or opening the unknown link.",
          "Explique ta réponse sans donner d’information personnelle ni ouvrir le lien inconnu.",
        ),
        c(
          "Demonstrate a safe response to an unexpected message.",
          "Démontre une réaction prudente face à un message inattendu.",
        ),
      ),
    ],
    c(
      "Does a padlock alone prove a website is trustworthy?",
      "Un cadenas suffit-il à prouver qu’un site est fiable ?",
    ),
    c(
      "No. It indicates protected transport, not that the people running the website are honest.",
      "Non. Il indique un transport protégé, pas l’honnêteté du site.",
    ),
    c(
      "Yes. Any website with a padlock can safely receive your password.",
      "Oui. Tout site avec cadenas peut recevoir ton mot de passe.",
    ),
  ),
  "kids-scratch-game": young(
    "Scratch · build and test",
    c(
      "Make a character collect a star. Use one event to start, movement to explore and a score to show progress.",
      "Fais attraper une étoile à un personnage. Utilise un événement de départ, du mouvement et un score.",
    ),
    "Green flag|Movement|Touch a star|Score and restart",
    "Drapeau vert|Mouvement|Toucher étoile|Score et reprise",
    [
      activity(
        c("Create the scene", "Créer la scène"),
        c(
          "Open Scratch with an adult. Choose a sprite and backdrop; use the green-flag event to reset position and score to zero.",
          "Ouvre Scratch avec un adulte. Choisis personnage et décor ; au drapeau vert, réinitialise position et score.",
        ),
        c(
          "Restart always begins from the same state.",
          "Chaque redémarrage repart du même état.",
        ),
      ),
      activity(
        c("Add a repeated behaviour", "Ajouter une répétition"),
        c(
          "Use key events or a loop to move. When touching a target, change the score and move the target so one touch is not counted repeatedly.",
          "Utilise touches ou boucle pour bouger. Au contact, change le score puis déplace la cible pour ne pas compter le même contact plusieurs fois.",
        ),
        c(
          "A single target contact gives the intended score.",
          "Un contact donne le score prévu.",
        ),
      ),
      activity(
        c("Test and save", "Tester et sauvegarder"),
        c(
          "Test normal play, repeated contact and a restart. Save the SB3 file locally and describe one bug you fixed.",
          "Teste jeu normal, contact répété et redémarrage. Sauvegarde le SB3 localement et explique un bug corrigé.",
        ),
        c(
          "Show a playable project with a reliable restart and a recorded test.",
          "Montre un projet jouable avec redémarrage fiable et un test décrit.",
        ),
      ),
    ],
    c(
      "Why reset the score when the green flag starts a new game?",
      "Pourquoi remettre le score à zéro au début d’une partie ?",
    ),
    c(
      "Each new game should start from a known state instead of keeping results from the previous game.",
      "Chaque partie doit partir d’un état connu au lieu de garder le score précédent.",
    ),
    c(
      "Because a loop automatically deletes every variable after each frame.",
      "Parce qu’une boucle efface automatiquement les variables à chaque image.",
    ),
  ),
  "kids-python": young(
    "Python · a small quiz",
    c(
      "Build a three-question quiz using fictional facts. Make the score reflect answers, including an empty answer.",
      "Crée un quiz de trois questions fictives. Le score doit refléter les réponses, y compris une réponse vide.",
    ),
    "Question|Input|Comparison|Score",
    "Question|Réponse|Comparaison|Score",
    [
      activity(
        c("Plan the rules", "Prévoir les règles"),
        c(
          "Write three questions, expected answers and the point awarded for each correct answer.",
          "Écris trois questions, les réponses attendues et le point donné par bonne réponse.",
        ),
        c(
          "The expected scoring is clear before coding.",
          "Le score attendu est clair avant de coder.",
        ),
      ),
      step(
        c("Try one question", "Essayer une question"),
        c(
          "Save as quiz.py and run with Python 3. strip removes surrounding spaces and lower makes this comparison case-insensitive.",
          "Enregistre quiz.py et lance avec Python 3. strip retire les espaces autour et lower ignore ici la différence majuscule/minuscule.",
        ),
        'score = 0\nanswer = input("2 + 2 = ").strip().lower()\nif answer == "4":\n    score += 1\nprint("Score:", score)',
        c(
          "A correct answer gives one point; another answer gives zero.",
          "Une bonne réponse donne un point, une autre zéro.",
        ),
      ),
      activity(
        c("Extend and test", "Étendre et tester"),
        c(
          "Add two questions, then test all-correct, all-wrong and empty inputs. Describe the score you expected before each run.",
          "Ajoute deux questions puis teste bonnes, mauvaises et réponses vides. Note le score attendu avant chaque essai.",
        ),
        c(
          "Submit the quiz and three input/expected/actual test cases.",
          "Rends le quiz et trois cas entrée/résultat attendu/résultat obtenu.",
        ),
      ),
    ],
    c(
      "Why compare the actual score with a score predicted before testing?",
      "Pourquoi comparer le score obtenu à celui prévu avant le test ?",
    ),
    c(
      "A prediction gives us a rule to check instead of accepting any number the program prints.",
      "La prévision donne une règle à vérifier au lieu d’accepter n’importe quel nombre affiché.",
    ),
    c(
      "Because any program that runs without crashing must calculate correctly.",
      "Parce qu’un programme sans crash calcule forcément juste.",
    ),
  ),
  "kids-web": young(
    "Web · a first page",
    c(
      "Create a page about an imaginary animal. A visitor should understand it on a small screen and without seeing its pictures.",
      "Crée une page sur un animal imaginaire, compréhensible sur petit écran et sans voir les images.",
    ),
    "HTML structure|CSS appearance|Browser|Reader feedback",
    "Structure HTML|Apparence CSS|Navigateur|Retour lecteur",
    [
      step(
        c("Create index.html", "Créer index.html"),
        c(
          "Save this locally. Use your own drawing if you later add a picture.",
          "Enregistre localement. Utilise ton propre dessin si tu ajoutes une image.",
        ),
        '<!doctype html>\n<html lang="en">\n<meta charset="utf-8">\n<meta name="viewport" content="width=device-width, initial-scale=1">\n<title>My imaginary animal</title>\n<h1>The cloud fox</h1>\n<p>It collects stories from the wind.</p>\n</html>',
        c(
          "The browser shows a title and a paragraph.",
          "Le navigateur affiche un titre et un paragraphe.",
        ),
      ),
      activity(
        c("Make it readable", "Rendre la page lisible"),
        c(
          "Add two paragraphs and clear contrast. If you add an image, write alt text that describes what matters.",
          "Ajoute deux paragraphes et un contraste clair. Pour une image, écris un texte alternatif utile.",
        ),
        c(
          "The page remains understandable without the image.",
          "La page reste compréhensible sans l’image.",
        ),
      ),
      activity(
        c("Test the visitor’s experience", "Tester le parcours du visiteur"),
        c(
          "Resize the browser to a phone width and navigate links with Tab. Keep your page local; publishing needs an adult’s review.",
          "Réduis la largeur et parcours les liens avec Tab. Garde la page locale ; publier nécessite une revue adulte.",
        ),
        c(
          "Show a readable page at desktop and phone widths with a keyboard-accessible link.",
          "Montre une page lisible sur ordinateur et téléphone avec un lien accessible au clavier.",
        ),
      ),
    ],
    c(
      "What is the purpose of useful image alternative text?",
      "À quoi sert un texte alternatif utile ?",
    ),
    c(
      "It communicates important image information to someone who cannot see or load the image.",
      "Il transmet l’information importante à quelqu’un qui ne voit pas ou ne charge pas l’image.",
    ),
    c(
      "It only repeats the image filename for decoration.",
      "Il répète seulement le nom du fichier pour décorer.",
    ),
  ),
};
