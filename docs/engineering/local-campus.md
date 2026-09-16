# Exploitation du campus local

Voir README.md pour les commandes. Node 22.23 minimum ; SQLite natif. L'API n'utilise aucune clé externe. Les installations sont verrouillées par package-lock.json. Réutilisation des primitives Radix du prototype et de ses dépendances de style ; ajout de Zod pour valider les mutations, tsx pour développer le serveur et esbuild pour produire son bundle. Aucun SDK cloud ni dépendance Sites dans le runtime local.

La requête GET /api/health contrôle la lecture de la base. L'API refuse les origines et hôtes non locaux, les méthodes inattendues, les versions périmées, les fichiers hors formats autorisés et les formulaires trop volumineux. Les fichiers sont téléchargés en pièces jointes non exécutables avec nosniff. Les vues de démo sont filtrées côté serveur. Aucune authentification multiutilisateur n'est simulée comme une sécurité réelle.

La commande backup utilise l'API SQLite, compatible WAL, et inclut toutes les pièces jointes. Le test de restauration ouvre la copie dans une base distincte et vérifie les octets d'une pièce jointe. Les tests ne touchent jamais la base utilisateur : ils utilisent des dossiers temporaires isolés ou :memory:.

Le Dockerfile comprend les validations avant compilation et un runtime non-root. Compose limite le port hôte à 127.0.0.1 et conserve un volume. Ne pas configurer CAMPUS_CONTAINER=1 en dehors du conteneur. Le volume et la base ne doivent pas être publiés.

Les workflows existants conservent leurs validations. CI est étendue aux branches codex. Pages utilise son sous-chemin historique, avec PAGES_BUILD=1, et ne publie que dist/. Le serveur compilé est dans dist-server/ et n'est jamais envoyé à Pages.
