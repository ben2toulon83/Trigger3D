# Trigger3D

Prototype PWA 3D gratuit d'exploration des points gâchettes musculaires.

## Fonctionnalités actuelles

- corps humain 3D manipulable ;
- rotation 360°, zoom, vues face/dos/profils ;
- points gâchettes cliquables ;
- fiches explicatives ;
- affichage d'une zone de douleur projetée ;
- recherche inversée « J'ai mal ici » ;
- bibliothèque des muscles ;
- installation PWA sur smartphone ;
- fonctionnement hors ligne partiel.

## Important

Cette version est un prototype pédagogique. Elle ne pose pas de diagnostic médical et ne remplace pas un professionnel de santé.

## Architecture

Application statique sans backend payant :

- HTML / CSS / JavaScript ;
- Three.js pour la 3D ;
- Service Worker pour la PWA ;
- données des points dans `data.js`.

## Hébergement gratuit conseillé

Le projet peut être publié gratuitement avec **GitHub Pages**.

### Activation

1. Ouvrir le dépôt Trigger3D sur GitHub.
2. Aller dans **Settings**.
3. Cliquer sur **Pages**.
4. Dans **Build and deployment**, choisir **Deploy from a branch**.
5. Sélectionner :
   - Branch : `main`
   - Folder : `/ (root)`
6. Cliquer sur **Save**.

GitHub affichera ensuite l'URL publique de l'application.

## Installation sur iPhone

Une fois le site publié :

1. ouvrir l'URL dans Safari ;
2. toucher **Partager** ;
3. choisir **Sur l'écran d'accueil** ;
4. confirmer.

L'application se lancera alors comme une application classique.

## Prochaines étapes

- remplacer le mannequin procédural par un modèle anatomique musculaire détaillé ;
- cartographier davantage de muscles ;
- ajouter les zones de douleur projetée anatomiquement précises ;
- permettre la sélection directe d'une zone du corps ;
- enrichir les fiches avec sources et précautions ;
- ajouter un mode praticien local.

## Licence

Le code du prototype est destiné au projet Trigger3D. Les modèles anatomiques externes éventuellement intégrés devront conserver leurs licences et attributions propres.
