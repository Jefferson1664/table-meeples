# Arkham Horror LCG — cartes bilingues

Site statique pour GitHub Pages.

- Arborescence campagne → scénario.
- Cartes English / Français côte à côte.
- Les cartes sont chargées depuis l'API publique ArkhamDB avec `encounter=1`.
- La correspondance scénario → encounter sets utilise `Scenario Mapping.xlsx` lorsqu'elle est disponible, avec un fallback sur le set propre au scénario.
- Les traductions françaises sont récupérées depuis le dépôt communautaire `Kamalisk/arkhamdb-json-data`.

## Installation

Déposer le contenu du dossier sur un repository GitHub puis activer GitHub Pages sur la branche principale, dossier `/`.

Le site nécessite une connexion Internet pour récupérer les données.


## Version 0.7

Cette version ajoute une présentation plus explicite du fonctionnement du site, l’affichage du numéro de version et une mention claire de la logique de classement par campagne, scénario et encounter sets.
