# Arkham Bilingual V4

Version corrigée : les cartes sont filtrées par `encounter_name` (nom réel du set) et non par `encounter_code`.

Pour chaque scénario, la colonne de gauche affiche les encounter sets utilisés, et les cartes sont affichées anglais/français côte à côte.

Le premier scénario, **The Gathering**, est configuré avec ses 6 sets : The Gathering, Rats, Ghouls, Striking Fear, Ancient Evils et Chilling Cold. Cette logique évite le problème « aucune carte trouvée » causé par l'utilisation d'identifiants qui ne correspondent pas aux noms des sets.

Déploiement : déposer le contenu de `arkham-v2/` dans un dépôt GitHub puis activer GitHub Pages.
