# Architecture

Ce projet est un monorepo contenant l'ensemble des packages npm de l'écosystème JavaScript ZetaPush

# Packages

## @zetapush/cometd

Implémentation du protocol CometD. Initialement le code était dans un [repository séparé](https://github.com/zetapush/cometd).
Le code de @zetapush/cometd est un fork du projet CometD, la lib officiel ne supportant pas correctement le pattern CommonJS et n'étant pas complètement compatible avec NodeJS.

Dépendences:
- N/A

## @zetapush/platform

Contient l'ensemble des class de mapping des services platforme ZetaPush. Le code contenu dans ce package à vocation à être auto généré.

Dépendences:
- N/A

## @zetapush/client

Surcouche au protocole CometD. Ce package contient les différents client de connection au backend. Il implémente la gestion des pseudos requète/response sur le pattern publish/subscribe 

Dépendences:
- [@zetapush/cometd](https://github.com/zetapush/zetapush/tree/master/packages/cometd)
- [@zetapush/platform](https://github.com/zetapush/zetapush/tree/master/packages/platform)

## @zetapush/worker

C'est le SDK utilisé en interne au sein d'un **worker** NodeJS connecté à la plateforme ZetaPush. Il assure la communication en ZetaPush et le code écrit par le developpeur.

Dépendences:
- [@zetapush/client](https://github.com/zetapush/zetapush/tree/master/packages/core)
- [@zetapush/platform](https://github.com/zetapush/zetapush/tree/master/packages/platform)

## @zetapush/cli

Outil en ligne de commande permettant de publier son code JavaScript (ses cloud functions) sur la plteforme ZetaPush. Il permet aussi de demarrer en local (sur son poste de dev) un **worker**.

Dépendences:
- [@zetapush/cometd](https://github.com/zetapush/zetapush/tree/master/packages/cometd)
- [@zetapush/client](https://github.com/zetapush/zetapush/tree/master/packages/core)
- [@zetapush/platform](https://github.com/zetapush/zetapush/tree/master/packages/platform)
- [@zetapush/worker](https://github.com/zetapush/zetapush/tree/master/packages/worker)

## @zetapush/create

Ce package permet la creation de nouveau projet zetapush

Dépendences:
- [@zetapush/cli](https://github.com/zetapush/zetapush/tree/master/packages/cli)
