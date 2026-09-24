# Soutien scolaire au Cameroun — demande du 23 septembre 2026

## CONFIRMED — instructions directes du propriétaire

LESSGOOO propose des cours de répétition de la 4e à la terminale : mathématiques, PCT, français, anglais, SVT et informatique. Inscription : 2 000 F CFA. Frais annoncés : 5 000 F CFA pour 4e, 3e et 2nde ; 10 000 F CFA pour 1re et terminale. La période de facturation doit être confirmée (question posée au propriétaire) avant d'afficher « par mois », « par trimestre » ou « par an ».

Créneaux annoncés, heure du Cameroun (Africa/Douala) : lundi à vendredi, 16 h–18 h ; samedi, 8 h–12 h. La répartition par classe, matière, groupe et enseignant n'est pas fournie. Tout exemple d'emploi du temps est un brouillon, pas une réservation ou un horaire institutionnel confirmé. L'offre tarifée des autres classes n'est pas confirmée.

Le propriétaire demande un catalogue scolaire francophone/anglophone configurable depuis le site : classes, matières, chapitres, ressources, annales, cours enregistrés, quiz, exercices avancés, tarifs, horaires, suivi élève/parent et pistes d'orientation selon résultats et intérêts. Conserver une navigation compréhensible et les fonctionnalités existantes. Commit et push demandés dans la session.

## Décisions d'implémentation dans l'architecture acceptée

- Un espace « Soutien scolaire » public et dans le campus ; mêmes données de catalogue. Gestion via des formulaires dans la vue formateur de démonstration, avec validation serveur et version optimiste. Ceci ne confère pas de permissions de production à un véritable formateur.
- Catalogue et tentatives conservés dans de nouvelles tables SQLite, sans réinitialiser les données existantes. Site statique : catalogue initial et ressources lisibles ; l'édition durable exige le serveur local. Export/import JSON du catalogue validé pour portabilité et publication d'un instantané public sans données privées.
- Contenus originaux LESSGOOO distincts des programmes ministériels. Chaque ressource porte une source, une année si connue, un statut de vérification et sa nature. Aucun brevet d'approbation MINESEC, aucune exhaustivité nationale et aucun livre commercial intégral inventés.
- Annales/programmes/listes de manuels accessibles par liens vers les organismes/éditeurs. Ne pas recopier des ouvrages protégés ; ne pas contourner un compte, un prix ou des restrictions de téléchargement. Ressources internationales complémentaires distinctes du programme camerounais.
- Présence éphémère de sessions de démonstration, volontaire et limitée à cet espace. Une session active ne prouve pas la présence à un cours. Le formateur voit les sessions de test ; un élève ne reçoit pas la liste nominative des autres. Aucun historique de présence durable ou suivi caché.
- Orientation = propositions pédagogiques explicables, pas admission, exclusion, aptitude définitive ou décision à la place de l'élève. Résultats manquants restent manquants. Les intérêts de l'élève restent modifiables. Suggérer aussi des voies à explorer quand une compétence doit être travaillée.

## UNKNOWN / conditions d'une ouverture réelle

- Périodicité des tarifs, dates de démarrage, lieu/modalité, enseignants et emploi du temps matière par matière.
- Exhaustivité et édition en vigueur des programmes, listes de livres et annales pour chaque série/spécialité et chaque année ; validation pédagogique complète des chapitres.
- Droits de redistribution des ouvrages et enregistrements.
- SECURITY-001, comptes réels élève/parent, liens familiaux, hébergement privé, consentements et permissions de production : l'ADR local ne permet pas d'ouvrir la base actuelle au public.
