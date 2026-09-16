# Validation du campus local — 2026-09-16

- `npm run lint` : aucune erreur, trois avertissements Fast Refresh dans les primitives UI reprises du prototype.
- `npm run typecheck` : réussi.
- `npm test` : 32 tests réussis (17 du site public, 12 règles de démonstration, 3 tests d'intégration SQLite/HTTP). Les intégrations couvrent aussi upload/téléchargement multipart, conflits de version, filtrage des fichiers, Host/Origin et restauration d'une sauvegarde incluant les octets.
- `npm run build` : client statique et serveur Node compilés.
- `npm run backup` : sauvegarde créée dans le dossier local ignoré par Git.
- Audit npm après correction ciblée de Vitest : aucune vulnérabilité signalée.
- Navigateur : remise d'un travail en vue élève, rechargement, correction en vue formateur, progression d'Alex de 20 % à 40 %. Recherche de leçon et navigation mobile vérifiées.
- Écrans ordinateur, mobile 390 px et tablette 820 px : aucun débordement horizontal observé, logos chargés ; aucune erreur/alerte console relevée.
- Docker absent sur l'ordinateur ; compilation et démarrage du conteneur intégrés à CI pour validation sur GitHub.

Documents consultés : index, organisation/lessgooo-overview, organisation/mission-vision-values, organisation/partners, product/product-vision, product/app-scope, product/features, product/workflows, product/non-goals, design/brand, engineering/deployment, engineering/git-workflow, engineering/testing, engineering/coding-standards, ARCHITECTURE, ADR-001, ADR-002 et UNKNOWN.

Hypothèse de périmètre : reproduire localement le campus de démonstration fourni, sans le convertir implicitement en application multiutilisateur de production. Le logo du site est repris sans redessin ; les couleurs d'interface sont dérivées de cet asset. Les tarifs, identités et dates du prototype restent fictifs. Les permissions réelles, conditions commerciales, modalités de stage et la charte officielle restent UNKNOWN.
