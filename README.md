# Arkham LCG — cartes bilingues

Version corrigée : les cartes anglaises sont chargées depuis l'API publique ArkhamDB (`/cards/?encounter=1`). Les traductions françaises sont chargées, lorsque disponibles, depuis le dépôt de données ArkhamDB sur GitHub. La sélection d'un scénario filtre par les vrais `encounter_code`.

## GitHub Pages
Déposez le contenu de ce dossier dans un dépôt GitHub puis activez Settings → Pages → Deploy from branch → main / root.

## Correction importante
La version précédente appelait un endpoint français qui pouvait échouer et annulait tout le `Promise.all`, ce qui laissait la liste des cartes vide. Cette version ne dépend plus de cet endpoint pour démarrer.
