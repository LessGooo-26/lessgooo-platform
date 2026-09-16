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
- Leçons et recherche, travaux, pièces jointes (5 Mo maximum), corrections et progression.
- Séances Zoom et présences manuelles, replay et export calendrier ICS.
- Dossiers élèves, crédits de coaching, réservation et annulation atomiques.
- Suivi de stages et journal, questions/réponses, registre de paiements manuels, exports CSV/JSON.
- Logo original, favicon et palette issue du logo sur les deux interfaces.

Aucune réunion, facturation, notification ou affectation réelle n'est créée. Les règles reprises du prototype sont des règles de démonstration, pas des politiques commerciales approuvées. Ne pas saisir de vraies données élèves.

## Données et sauvegarde

SQLite : `.local-data/campus.sqlite`. Les pièces jointes et l'état sont dans la même base. Le stockage est ignoré par Git et Docker. Seul le fuseau horaire est une préférence du navigateur.

```sh
npm run backup
```

Cette commande crée une sauvegarde cohérente des données ET des fichiers dans `backups/`. Pour restaurer : arrêter le serveur, conserver le dossier courant, placer la sauvegarde sous le nom `campus.sqlite` dans un nouveau dossier vide puis démarrer avec `CAMPUS_DATA_DIR` pointant sur ce dossier. Ne pas copier seulement le fichier principal d'une base ouverte en mode WAL.

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
