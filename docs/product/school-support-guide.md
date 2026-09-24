# Espace scolaire Cameroun — utilisation et limites

Source métier : [soutien scolaire](../programs/school-support.md). Architecture : [ADR-003](../decisions/ADR-003-local-campus-demo.md). Recherche : [plan et sources](../plans/active/cameroon-school-support.md).

## Ouvrir l'espace

1. Exécuter `npm run dev` dans le dépôt.
2. Ouvrir `http://localhost:5173/#/school` pour le catalogue public, également accessible depuis **Programmes**.
3. Ouvrir `http://localhost:5173/campus.html#school` pour le suivi et la gestion locale. **Soutien scolaire** est disponible dans les outils, la navigation et les raccourcis personnalisables du campus.
4. Choisir français ou anglais dans l'en-tête. Choisir ensuite le sous-système et la classe : ces filtres ne changent jamais la langue de l'interface.

Le campus utilise les profils fictifs existants. La vue formateur simule ici l'administration du propriétaire. Elle n'attribue pas de droits d'administrateur à tous les futurs enseignants. Une ouverture avec de vrais comptes reste soumise à SECURITY-001 ; les données actuelles restent sur le serveur local.

## Pour apprendre

- **Apprendre** : objectif, prérequis, schéma léger, explication, exemple résolu, défi, correction repliée et quiz corrigé. Le catalogue initial contient 24 chapitres originaux et 48 questions, dans les six matières de l'offre, avec des niveaux de révision indicatifs.
- **M'exercer** : mêmes quiz liés aux chapitres et problèmes renouvelables sur équations, pourcentages, aires et probabilités. Les variantes numériques ne sont pas comptabilisées comme des milliers de chapitres ni comme des notes officielles.
- **Documents** : recherche et filtres sur programmes, listes de manuels, livres autorisés, annales, examens blancs, exercices, vidéos, audio, documents, simulations et orientation. Le catalogue initial comporte 20 points d'entrée externes. Les téléchargements et vidéos externes ne démarrent pas automatiquement.
- **Horaires** : créneaux hebdomadaires en heure du Cameroun ; sélection rapide des classes d'examen ; impression ; liens vers les calendriers nationaux. Aucun cours matière par matière n'a été inventé. Les brouillons sont signalés dans le campus et exclus de l'instantané public.
- **Progrès** : jusqu'à 200 tentatives récentes pour le profil, dernier résultat par chapitre et prochaine action. Les résultats sont calculés par le serveur, sans accepter un score fourni par le navigateur. Le parent consulte le profil enfant associé ; il ne peut pas changer ses notes ni enregistrer un quiz à sa place. La vue formateur consulte les 20 dernières tentatives par profil élève.
- **Orientation** : intérêts modifiables, notes déclarées avec leur barème, puis six domaines à explorer. Les intérêts sont prioritaires, suivis des moyennes disponibles normalisées. Une note manquante n'est pas zéro. Toutes les pistes restent visibles, avec les données qui expliquent la suggestion et un lien MINESUP. Ce dispositif ne décide jamais d'une admission et n'est pas un test psychométrique validé.

Le répertoire initial comprend 26 classes générales : SIL–CM2, Class 1–6, 6e–terminale et Form 1–Upper Sixth ; 24 matières sont répertoriées avec description simple et prérequis. Cela ne signifie pas que chaque matière est obligatoire dans chaque classe, ni que toutes les séries et spécialités techniques sont déjà renseignées. Le gestionnaire peut ajouter classes, séries et spécialités dans le cycle approprié.

Les exercices ouverts ne sont pas automatiquement notés : leur correction donne une démarche et les réponses rédactionnelles nécessitent un retour humain. Les quiz sont des entraînements dont les solutions sont publiques, pas un système anti-triche d'examen.

## Modifier depuis le site

Dans le campus local, sélectionner **Formateur → Soutien scolaire → Gérer**.

1. **Tarifs et ouverture** : inscription, période de facturation, matières de l'offre et créneaux. Les frais initiaux sont ceux fournis par le propriétaire ; la période reste « À préciser ».
2. **Classes et séries** : nom FR/EN, sous-système, cycle, examen préparé, frais, offre de répétition et visibilité. Un tarif vide signifie inconnu, jamais gratuit. Archiver en retirant la visibilité, plutôt que supprimer les références historiques.
3. **Matières** : nom, description pour débutant, prérequis et visibilité.
4. **Chapitres et quiz** : classes concernées, matière, ordre, titre, objectif, prérequis, cours, exemple, défi, correction ; questions à 2–6 choix avec bonne réponse et explication FR/EN. Vérifier pédagogiquement puis cocher la publication.
5. **Documents et médias** : classe(s), matière, type, année, langue, organisme source, état de vérification, droits et lien HTTPS ou fichier. Une liste de classes vide signifie « toutes les classes ». Les nouvelles ressources sont à vérifier et non publiées par défaut.
6. **Emplois du temps** : classe, matière, jour, début, fin, lieu/modalité, lien participant HTTPS facultatif, brouillon, confirmé ou annulé/masqué. Annuler masque la séance sans détruire sa configuration. Le serveur refuse les plages actives hors ouverture et les chevauchements de séances confirmées d'une même classe. La disponibilité des enseignants n'est pas encore modélisée.
7. Cliquer **Enregistrer les changements**. Le catalogue du site relié à ce serveur utilise les nouvelles données. Si quelqu'un a enregistré entre-temps, le brouillon est conservé et le serveur refuse l'écrasement : exporter ce brouillon, recharger et fusionner les modifications.

Les formulaires empêchent de quitter la gestion avec un brouillon non enregistré. **Abandonner le brouillon** revient à la version chargée ; **Exporter** permet d'en garder une copie. Le changement de langue ne traduit pas automatiquement un texte nouvellement saisi : remplir les deux versions avant publication.

## Vidéos, audio et fichiers

Le stockage existant accepte les formats de fichiers dans la limite de **200 Mo par fichier**, par morceaux de 4 Mo. Utiliser des fichiers dont le partage est autorisé. Un téléversement effectué ici est partagé avec les profils du campus local ; l'identifier ensuite dans le catalogue puis enregistrer.

- Vidéos MP4/WebM/Ogg reconnues et images sûres : lecteur/aperçu natif selon les codecs du navigateur.
- Audio WAV, MP3 avec en-tête ID3 reconnu et FLAC : lecteur natif selon le navigateur. Les autres conteneurs peuvent rester téléchargeables.
- PDF, bureautique, archives et autres formats : téléchargement pour une application compatible ; ne pas prétendre pouvoir lire tous les formats dans le navigateur.
- Une ressource peut pointer vers un enregistrement déjà réalisé et autorisé. Le module scolaire n'enregistre pas automatiquement caméra, microphone ou réunion.
- Les signatures de fichier déterminent l'aperçu ; HTML/SVG/documents actifs ne sont pas rendus comme pages dans le site.
- Les médias locaux, les liens de réunion, les brouillons et les données de suivi ne sont pas publiés dans l'instantané statique.

## Présence en ligne

Dans **Horaires**, **Signaler ma présence** active un signal pour cette vue uniquement. Il est renouvelé toutes les 25 secondes quand l'onglet est visible, retiré à la fermeture/sortie lorsque possible, et expire au plus tard 90 secondes après le dernier signal reçu. Plusieurs onglets du même profil comptent pour un profil. Le serveur conserve cet état uniquement en mémoire ; un redémarrage l'efface.

Le formateur voit le nom des profils de démonstration actifs et inactifs. L'élève voit le nombre de profils et son propre statut ; il ne reçoit pas les noms des autres. Le parent peut voir si le profil enfant associé est actif. Ce signal n'est ni une feuille de présence officielle, ni la preuve d'une participation à une visioconférence. Une session restée sur un autre écran du campus n'est pas surveillée.

## Export, import et GitHub Pages

L'export ne contient ni les profils, ni les notes, ni les tentatives. Les fichiers binaires nécessitent la sauvegarde SQLite existante (`npm run backup`). Un import JSON validé remplace le brouillon, jamais la base avant **Enregistrer**. Les identifiants de médias d'un autre serveur nécessitent un rattachement à des fichiers locaux autorisés.

GitHub Pages est statique : les changements dans SQLite ne peuvent pas y être enregistrés directement. Après l'édition sur le site local :

```powershell
# 1. Dans Gérer > Tarifs et ouverture > Sauvegarde, exporter le catalogue.
# 2. Préparer un instantané public depuis ce fichier :
node --import tsx scripts/publish-school-catalog.mjs "C:\chemin\lessgooo-school-export.json"
# 3. Examiner la modification, puis valider :
git diff -- src/school/published-catalog.json
npm run lint
npm run typecheck
npm test
npm run build
# 4. Commit/push de la modification validée selon le processus du dépôt.
```

Le script valide le catalogue, retire les médias locaux et liens de réunion, conserve seulement les classes/matières actives, chapitres/ressources publiés et séances confirmées, puis écrit `src/school/published-catalog.json`. Il ne pousse ni ne déploie de lui-même. Le fichier initial vaut `null` : le catalogue de référence est alors utilisé. Un instantané statique ne remplace pas automatiquement une base locale existante ; utiliser l'import pour cette base.

## Sources, accessibilité et contenu restant

L'organisation s'inspire de la recherche par classe/thème, de la pratique avec correction et nouvelle tentative, des problèmes de raisonnement NRICH et des simulations PhET. Les contenus et interfaces ont été rédigés pour LESSGOOO ; aucun catalogue concurrent n'a été aspiré.

MINESEC, MINEDUB, OBC, GCE Board, le portail d'enseignement à distance, MINESUP, NRICH, PhET, British Council, TV5MONDE, France-IOI et IMO sont référencés dans les données et le plan. Les ressources externes peuvent évoluer ou demander un compte. Les examens blancs restent distincts des annales ; la liste MINESEC affichant 2023–2024 est marquée ancienne. Aucune liste complète de manuels 2026–2027 n'est revendiquée.

Navigation au clavier, champs nommés, gros contrôles, mises en page téléphone/tablette/ordinateur, mode mouvement réduit et schémas SVG sans téléchargement d'images. Aucune vidéo n'est chargée tant que l'utilisateur ne l'ouvre pas.

Travail restant avant d'annoncer une plateforme nationale complète : validation pédagogique chapitre par chapitre ; couverture de chaque classe/série/spécialité ; listes annuelles et œuvres prescrites confirmées ; droits sur livres/annales/enregistrements ; davantage de questions variées et corrigées ; comptes sécurisés et liens familiaux ; publication privée adaptée. Ne pas confondre le répertoire et les liens de ressources avec cette couverture complète.
