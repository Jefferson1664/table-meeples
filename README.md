# Arkham Bilingual — Version 1.0

Site statique pour consulter les cartes de scénario d'Arkham Horror: The Card Game en anglais et en français.

- Campagne → scénario → encounter sets
- Toutes les cartes des encounter sets utilisés par le scénario
- Anglais à gauche, français à droite
- Recherche et affichage EN / FR / bilingue
- Données de cartes chargées depuis le dépôt public `Kamalisk/arkhamdb-json-data`
- Compatible GitHub Pages

La version 0.8 ne dépend plus de l'endpoint global `/cards/?encounter=1` d'ArkhamDB pour le chargement initial. Elle lit directement les fichiers `*_encounter.json` du dépôt de données, avec un fallback naturel au seul set du scénario si la cartographie externe est indisponible.
