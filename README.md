# LESSGOOO Campus — version locale

Reconstruction du site privé LessGooo Campus dans le dépôt React/TypeScript existant. Le site public bilingue est conservé. Le campus utilise les profils fictifs du site source ; le sélecteur de vue n'est pas une authentification.

## Démarrage

Node.js 22.23 ou supérieur (SQLite intégré), npm.

```sh
npm ci
npm run dev
```

Campus : http://127.0.0.1:5173/campus.html — site public : http://127.0.0.1:5173/.

Pour utiliser la compilation locale :

```sh
npm run build
npm start
```

Ouvrir http://127.0.0.1:4173/ (campus) ou http://127.0.0.1:4173/index.html (site public).

## Fonctions reprises

- Vues formateur, élève DevOps, parent et élève Kids ; données explicitement fictives.
- 58 leçons au démarrage : 39 DevOps et 19 Kids, du matériel informatique à AWS, avec exercices et critères de validation.
- 15 projets guidés, dépôts GitHub de référence, 5 vidéos sélectionnées et 12 questions d’entretien commentées.
- Travaux, corrections, carte des devoirs validés/à corriger/à reprendre/non remis.
- Bibliothèque tous formats et pièces jointes jusqu’à 200 Mo par fichier, transferts par blocs de 4 Mo et téléchargements non exécutables.
- Carnet par blocs : texte, titres, code, citations, tâches, export Markdown et mode présentation.
- Préinscriptions au service carrière et suivi manuel des candidatures.
- Séances Zoom et présences manuelles, replay et export calendrier ICS.
- Dossiers élèves, crédits de coaching, réservation et annulation atomiques.
- Suivi de stages et journal, questions/réponses, registre de paiements manuels, exports CSV/JSON.
- Logo original cliquable, aides « ! », favicon et palette complète du logo sur les deux interfaces ; catalogue consultable sur le site public.

Les vues restent des profils de démonstration, sans connexion individuelle. Aucune réunion, notification, candidature à un employeur ou affectation réelle n'est créée automatiquement. Les règles reprises du prototype ne sont pas des politiques commerciales approuvées. Ne pas saisir de vraies données élèves avant la mise en place de l'authentification de production.

## Google Drive et Notch Pay

Ouvrir **Drive & paiements en ligne**, en vue Formateur. Le compte de référence est `lessgooo.ai26@gmail.com`.

- **Drive** : activer Drive API dans Google Cloud et créer un client OAuth Web. Enregistrer l'identifiant et son secret dans le formulaire local puis se connecter avec le compte de référence. Seul ce compte vérifié est accepté. L'URI de retour est `http://127.0.0.1:4173/api/integrations/google/callback`, ou le port 4174 en développement. La portée est `drive.file` et l'identité email. Les devoirs nouvellement remis/corrigés et leurs pièces jointes sont copiés dans un dossier privé ; les erreurs restent visibles et peuvent être relancées.
- **Notch Pay** : après inscription et vérification du marchand, renseigner la clé publique API et le mode correspondant (test/live) dans le formulaire local. Créer un lien pour un montant convenu ne prélève pas d'argent. Le client termine sur le checkout du prestataire ; **Vérifier le règlement** interroge ensuite son API et contrôle référence, identifiant, montant et devise. Pas de webhook public dans cette version locale.
- Les clés saisies et le refresh token Google sont chiffrés dans SQLite (AES-256-GCM). La clé locale de chiffrement reste dans `.local-data/integration-key`. Ils ne sont jamais retournés au navigateur. Un mot de passe de compte n'est jamais demandé par le campus.
- Alternative DevOps : copier `.env.example` vers `.env.local`, renseigner les variables puis redémarrer. Les variables d'environnement priment sur les formulaires. Compose accepte ce fichier facultatif et le build Docker l'exclut.
- Sans autorisation Google ou clé Notch Pay, les statuts restent « connexion nécessaire » et « compte marchand à activer ». Aucun succès externe n'est simulé.

Comparatif sourcé et limites : [périmètre approuvé](docs/product/campus-expansion.md). Les tarifs et contrats du service carrière restent à convenir.

## Données et sauvegarde

SQLite : `.local-data/campus.sqlite`. Les pièces jointes et l'état sont dans la même base. Le stockage est ignoré par Git et Docker. Seul le fuseau horaire est une préférence du navigateur.

```sh
npm run backup
```

Cette commande crée une sauvegarde cohérente des données ET des fichiers dans `backups/`, y compris notes et inscriptions. Si une clé de chiffrement existe, elle est copiée à côté avec le suffixe `.key` : conserver ces deux fichiers privés. Pour restaurer : arrêter le serveur, conserver le dossier courant, placer la sauvegarde sous le nom `campus.sqlite` dans un nouveau dossier vide et sa clé sous le nom `integration-key`, puis démarrer avec `CAMPUS_DATA_DIR` pointant sur ce dossier. Les éventuelles variables de `.env.local` doivent être restaurées séparément. Ne pas copier seulement le fichier principal d'une base ouverte en mode WAL.

## Conteneur local

```sh
docker compose up --build -d
docker compose logs -f campus
```

http://127.0.0.1:4173 — volume persistant `campus-data`, processus sans privilèges, contrôle de santé, publication réseau limitée à la boucle locale. `docker compose down` conserve le volume.

## Validation

```sh
npm run lint
npm run typecheck
npm test
npm run build
```

GitHub Actions exécute ces contrôles sur les branches codex et les demandes de fusion. La publication Pages reste réservée à main et au frontend statique. L'API SQLite ne tourne pas sur GitHub Pages. Le build Pages définit `PAGES_BUILD=1` pour son sous-chemin ; son campus indique qu'un serveur local est nécessaire.

## Architecture et provenance

`src/campus/` : UI du prototype adaptée ; `src/campus/lib/` : modèle, règles et exemples ; `server/` : API Node, SQLite et contrôles réseau ; `scripts/` : démarrage et sauvegarde ; `tests/` : règles et intégrité.

Le serveur écoute 127.0.0.1 et refuse les Host/Origin externes. Les vues sont filtrées côté serveur mais tous les utilisateurs de cet ordinateur peuvent changer de persona : ce n'est pas un système multiutilisateur. Un backend et une authentification de production exigent une décision distincte.

Source reprise : https://lessgooo-campus.amlate.chatgpt.site/ (16 septembre 2026). Aucune donnée de sa base hébergée n'a été importée. Le logo provient de ses fichiers sources. L'hébergement Sites original n'a pas été modifié.

Consulter `docs/engineering/local-campus.md`, `docs/design/brand.md`, `docs/decisions/ADR-003-local-campus-demo.md` et `docs/UNKNOWN.md`.
