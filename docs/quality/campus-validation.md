# Validation du campus local — 2026-09-16

- `npm run lint` : aucune erreur, trois avertissements Fast Refresh dans les primitives UI reprises du prototype.
- `npm run typecheck` : réussi.
- `npm test` : 47 tests réussis (17 du site public, 12 règles de démonstration, 3 tests SQLite/HTTP historiques et 15 tests d'extension). Couverture : confidentialité des notes, conflits de révision, inscriptions avec consentement, refus des rôles enfants, candidatures, fichiers arbitraires par blocs, limites et isolation, correction pendant upload, sauvegarde/restauration avec fichiers et notes, migration additive, couverture du catalogue, OAuth/CSRF/compte erroné, synchronisation Drive idempotente, chiffrement des configurations, rapprochement du montant/référence/identifiant de paiement et refus des redirections externes.
- `npm run build` : client statique et serveur Node compilés.
- `npm run backup` : sauvegarde créée dans le dossier local ignoré par Git.
- Audit npm après correction ciblée de Vitest : aucune vulnérabilité signalée.
- Navigateur initial : remise d'un travail en vue élève, rechargement, correction en vue formateur. Avec l'extension du catalogue, le pourcentage est recalculé sur l'ensemble des leçons du parcours ; les anciennes validations restent conservées.
- Extension : création, enregistrement et réouverture d'un carnet avec code, affichage en diapositives, inscription carrière fictive puis clôture de la demande, navigation mobile et libellés accessibles vérifiés. Les confirmations de paiement et transferts Drive sont testés avec des services simulés ; aucune transaction financière ni synchronisation réelle n'a été effectuée sans compte configuré.
- Écrans ordinateur, mobile 390 px et tablette 820 px : aucun débordement horizontal observé, logos chargés ; aucune erreur/alerte console relevée.
- Docker absent sur l'ordinateur ; compilation et démarrage du conteneur intégrés à CI pour validation sur GitHub.

Documents consultés : index, organisation/lessgooo-overview, organisation/mission-vision-values, organisation/partners, product/product-vision, product/app-scope, product/features, product/workflows, product/non-goals, design/brand, engineering/deployment, engineering/git-workflow, engineering/testing, engineering/coding-standards, ARCHITECTURE, ADR-001, ADR-002 et UNKNOWN.

Pour l'extension : product/campus-expansion, business/services, business/pricing, programs/devops-cloud-ai, programs/kids, users/roles, users/permissions et ADR-003. Compétences appliquées : lessgooo-product, lessgooo-ui, lessgooo-testing, lessgooo-deployment et google-drive.

Fichiers principaux : `curriculum.ts` et `resources.ts` (contenus originaux/liens), `WorkspacePanel.tsx` et `workspace.css` (espaces de travail), `workspace-store.ts` (données et fichiers), `integrations.ts` (Drive/Notch Pay), `LearningPreview.tsx` (catalogue public), `.env.example`, README et sauvegarde. L'email d'intégration est fourni par le propriétaire ; aucun mot de passe de compte n'est stocké ou commité.

Hypothèse de périmètre : reproduire localement le campus de démonstration fourni, sans le convertir implicitement en application multiutilisateur de production. Le logo du site est repris sans redessin ; les couleurs d'interface sont dérivées de cet asset. Les tarifs, identités et dates du prototype restent fictifs. Les permissions réelles, conditions commerciales, modalités de stage et la charte officielle restent UNKNOWN.
