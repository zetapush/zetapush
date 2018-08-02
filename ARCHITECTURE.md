# Architecture

Ce projet est un monorepo contenant l'ensemble des packages npm de l'écosystème JavaScript ZetaPush

# Packages

## @zetapush/cometd

[![install size](https://packagephobia.now.sh/badge?p=@zetapush/cometd)](https://packagephobia.now.sh/result?p=@zetapush/cometd)

Implémentation du protocol CometD. Initialement le code était dans un [repository séparé](https://github.com/zetapush/cometd).
Le code de @zetapush/cometd est un fork du projet CometD, la lib officiel ne supportant pas correctement le pattern CommonJS et n'étant pas complètement compatible avec NodeJS.

Dépendences:
- N/A

## @zetapush/core

[![install size](https://packagephobia.now.sh/badge?p=@zetapush/core)](https://packagephobia.now.sh/result?p=@zetapush/core)

Fournit l'ensemble des classes et interfaces relatives à l'injection de dépendances.

Dépendences:
- N/A

## @zetapush/platform-legacy

[![install size](https://packagephobia.now.sh/badge?p=@zetapush/platform-legacy)](https://packagephobia.now.sh/result?p=@zetapush/platform-legacy)

Contient l'ensemble des classes de mapping des services platform-legacy ZetaPush. Le code contenu dans ce package à vocation à être auto généré.

Dépendences:
- N/A


## @zetapush/common

[![install size](https://packagephobia.now.sh/badge?p=@zetapush/common)](https://packagephobia.now.sh/result?p=@zetapush/common)

Contient l'ensemble des fonctionnalités communes aux paquets internes.

Dépendences:
- [@zetapush/core](https://github.com/zetapush/zetapush/tree/master/packages/core)

## @zetapush/user-management

[![install size](https://packagephobia.now.sh/badge?p=@zetapush/user-management)](https://packagephobia.now.sh/result?p=@zetapush/user-management)

Contient l'ensemble de l'API de gestion des utilisateurs.

Dépendences:
- [@zetapush/common](https://github.com/zetapush/zetapush/tree/master/packages/common)

## @zetapush/client

[![install size](https://packagephobia.now.sh/badge?p=@zetapush/client)](https://packagephobia.now.sh/result?p=@zetapush/client)

Surcouche au protocole CometD. Ce package contient les différents client de connection au backend. Il implémente la gestion des pseudos requète/response sur le pattern publish/subscribe 

Dépendences:
- [@zetapush/cometd](https://github.com/zetapush/zetapush/tree/master/packages/cometd)
- [@zetapush/platform-legacy](https://github.com/zetapush/zetapush/tree/master/packages/platform-legacy)

## @zetapush/worker

[![install size](https://packagephobia.now.sh/badge?p=@zetapush/worker)](https://packagephobia.now.sh/result?p=@zetapush/worker)

C'est le SDK utilisé en interne au sein d'un **worker** NodeJS connecté à la plateforme ZetaPush. Il assure la communication en ZetaPush et le code écrit par le developpeur.

Dépendences:
- [@zetapush/common](https://github.com/zetapush/zetapush/tree/master/packages/common)
- [@zetapush/core](https://github.com/zetapush/zetapush/tree/master/packages/core)
- [@zetapush/client](https://github.com/zetapush/zetapush/tree/master/packages/client)
- [@zetapush/platform-legacy](https://github.com/zetapush/zetapush/tree/master/packages/platform-legacy)

## @zetapush/troubleshooting

[![install size](https://packagephobia.now.sh/badge?p=@zetapush/troubleshooting)](https://packagephobia.now.sh/result?p=@zetapush/troubleshooting)

Contient l'ensemble de l'API de gestion des erreurs.

Dépendences:
- [@zetapush/common](https://github.com/zetapush/zetapush/tree/master/packages/common)

## @zetapush/cli

[![install size](https://packagephobia.now.sh/badge?p=@zetapush/cli)](https://packagephobia.now.sh/result?p=@zetapush/cli)

Outil en ligne de commande permettant de publier son code JavaScript (ses cloud functions) sur la plteforme ZetaPush. Il permet aussi de demarrer en local (sur son poste de dev) un **worker**.

Dépendences:
- [@zetapush/cometd](https://github.com/zetapush/zetapush/tree/master/packages/cometd)
- [@zetapush/common](https://github.com/zetapush/zetapush/tree/master/packages/common)
- [@zetapush/platform-legacy](https://github.com/zetapush/zetapush/tree/master/packages/platform-legacy)
- [@zetapush/troubleshooting](https://github.com/zetapush/zetapush/tree/master/packages/troubleshooting)
- [@zetapush/worker](https://github.com/zetapush/zetapush/tree/master/packages/worker)

## @zetapush/create

[![install size](https://packagephobia.now.sh/badge?p=@zetapush/create)](https://packagephobia.now.sh/result?p=@zetapush/create)

Ce package permet la creation de nouveau projet zetapush

Dépendences:
- [@zetapush/cli](https://github.com/zetapush/zetapush/tree/master/packages/cli)
