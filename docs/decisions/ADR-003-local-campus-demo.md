# ADR-003 — Reconstruction locale du campus de démonstration

Statut : ACCEPTED pour le périmètre local demandé par le propriétaire le 2026-09-16.

## Contexte et décision

Le propriétaire demande de recoder son site Campus localement et de pousser le code sur GitHub. Le prototype fourni est un essai privé à personnages fictifs, avec D1/R2 et une identité ChatGPT propriétaire. Le dépôt existant est React/Vite et publie le site public statique sur Pages (ADR-001).

Conserver le site public et ajouter une entrée indépendante campus.html. Reprendre les interactions et les tests du prototype. Remplacer uniquement les adaptateurs hébergés par une API Node locale, une base SQLite et un stockage transactionnel des pièces jointes dans cette base. Aucune donnée de production ni identité ChatGPT n'est copiée.

## Limites

Cette décision approuve un environnement de démonstration local, pas un backend permanent pour une école. L'accès réseau est limité à la boucle locale, avec contrôle Host/Origin et refus cross-site. Le sélecteur de persona simule les vues ; il ne confère aucun droit réel. Les règles de crédits, paiement et stage ne deviennent pas des règles institutionnelles.

Le frontend public reste statique ; Pages n'héberge pas l'API. Une ouverture multiutilisateur, un hébergement public du serveur ou de vraies données privées exigent la résolution de SECURITY-001. Aucun déploiement du site Sites existant n'est effectué.

## Intégrité

Version optimiste sur chaque mutation ; transactions SQLite pour les pièces jointes et l'état, crédits et réservations ; sauvegarde SQLite cohérente comprenant les fichiers. Base et sauvegardes exclues de Git. Docker propose le même runtime sans privilèges et un volume local persistant.
