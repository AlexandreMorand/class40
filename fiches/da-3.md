# Session 3. Transformations de variables et interactions entre variables explicatives

À la fin de cette session, vous devez être capable de : repérer les deux façons dont le modèle linéaire de base peut être faux (effet non linéaire, effet non additif) ; corriger la non-linéarité avec une transformation de variable et lire correctement son effet ; corriger la non-additivité avec un terme d'interaction (interaction term), pour n'importe quelle combinaison de variables quantitatives/muettes/multi-catégorielles ; et choisir le bon test de significativité pour un terme transformé ou une interaction.

<div class="plan"><b>Plan</b><br/>1. Les deux hypothèses cachées du modèle de base, et comment elles peuvent être fausses<br/>2. Corriger la non-linéarité : transformer une variable explicative<br/>3. Lire l'effet d'une variable transformée<br/>4. La transformation logarithmique : lire l'effet en pourcentage<br/>5. Corriger la non-additivité : qu'est-ce qu'un terme d'interaction<br/>6. Interaction entre une variable quantitative et une variable muette<br/>7. Interaction avec une variable à plusieurs catégories, ou entre deux variables quantitatives/deux variables muettes<br/>8. Tester si une transformation ou une interaction compte vraiment<br/>9. Erreurs fréquentes et pièges d'examen<br/>10. À connaître absolument</div>

## 1. Les deux hypothèses cachées du modèle de base, et comment elles peuvent être fausses

L'équation de régression multiple ordinaire Y = β0 + β1x1 + ... + βpxp + ε contient silencieusement deux hypothèses sur la façon dont le monde fonctionne. Cette session sert entièrement à assouplir ces deux hypothèses.

- **Hypothèse 1 — l'effet de chaque xj est linéaire (linearity).** Cela signifie, par construction : une augmentation d'une unité de xj a exactement le même effet sur E(Y), quelle que soit la valeur de départ de xj ; et une augmentation de taille c de xj a un effet exactement c fois plus grand que celui d'une augmentation d'une unité.
- **Hypothèse 2 — l'effet de chaque variable est additif (additivity).** Cela signifie que l'effet d'une variable sur E(Y) reste le même quels que soient les niveaux fixés des autres variables explicatives.

Les deux hypothèses peuvent être irréalistes. Exemple fil rouge de toute la session : Y = le chiffre d'affaires d'un produit, x1 = l'investissement publicitaire, x2 = 1 si le produit vient d'être lancé sur le marché, 0 sinon.

- Il est tout à fait plausible qu'une augmentation de la publicité de 100 à 101 ait un effet plus petit qu'une augmentation de 1 à 2 — cela violerait l'Hypothèse 1 (non-linéarité, non-linearity).
- Il est tout à fait plausible que l'effet de la publicité soit différent pour un produit tout juste lancé que pour un produit déjà installé — cela violerait l'Hypothèse 2 (non-additivité, non-additivity).

<div class="example"><b>Petit exemple chiffré pour bien fixer les idées :</b> imaginez que chaque euro dépensé en publicité rapporte de moins en moins de chiffre d'affaires supplémentaire à mesure que le budget grandit (10 000€ de plus quand on part de 1 000€ ne rapporte pas autant que 10 000€ de plus quand on part de 10€) — c'est de la non-linéarité. Si, en plus, ce même euro dépensé rapporte plus pour un produit nouveau que pour un produit ancien — c'est de la non-additivité. Les deux peuvent arriver en même temps, mais ce sont deux problèmes différents.</div>

Deux outils séparés corrigent ces deux problèmes séparés, et il est important de ne pas les confondre :

- Non-linéarité → corrigée avec une transformation de variable (variable transformation).
- Non-additivité → corrigée avec une interaction (interaction) entre variables.

## 2. Corriger la non-linéarité : transformer une variable explicative

<div class="def"><b>Transformation de variable (variable transformation) :</b> pour une variable explicative quantitative x, on introduit dans le modèle — à la place de x, ou en plus de x — une fonction de x telle que log(x), x², x³, etc. L'effet de x sur E(Y) n'est alors plus obligatoirement linéaire.</div>

Avec log(x) par exemple : l'effet d'une augmentation d'une unité de x sur E(Y) devient de plus en plus petit à mesure que x grandit, et l'effet d'une augmentation de c unités de x n'est plus simplement c fois l'effet d'une augmentation d'une unité à partir du même point de départ.

Trois règles pratiques pour bien construire ce type de modèle, directement issues des slides :

- **Le logarithme exige des valeurs strictement positives.** La transformation logarithmique ne peut être appliquée qu'à une variable qui ne prend que des valeurs strictement positives (jamais zéro ni négative).
- **On garde toujours les puissances inférieures.** Si on introduit un terme de puissance comme x², la convention habituelle est de garder aussi le terme d'ordre inférieur x dans le modèle (donc x et x² ensemble, jamais x² seul).
- **Ce qui décide s'il faut transformer ou non :** le contexte concret (est-ce que ça a du sens que l'effet accélère ou ralentisse ?), et les données de l'échantillon elles-mêmes, vérifiées formellement avec des tests de significativité sur les termes transformés, et avec le R² ajusté quand on compare des spécifications de modèle qui ne sont pas emboîtées (nested).

## 3. Lire l'effet d'une variable transformée

Une fois que x est transformée, son effet sur Y n'est plus un simple coefficient fixe — il faut le réexprimer soit comme un taux de variation instantané (local) à un point précis, soit comme le changement réel (fini) entre deux valeurs précises de x. Ce sont deux nombres différents qui répondent à deux questions différentes.

Mise en situation : équation estimée ŷ = 2 + 6x1 − x1² + 4x2 (un terme quadratique sur x1).

### 3.1 Le taux de variation instantané (local) — la dérivée (derivative)

<div class="def"><b>d(ŷ)/dx1 = lim (Δŷ / Δx1) quand Δx1 → 0 = 6 − 2x1</b><br/>où 6 − 2x1 est la dérivée de ŷ par rapport à x1, x2 étant maintenu fixe ; elle n'est pas constante : elle dépend de la valeur de x1 à laquelle on l'évalue.</div>

Ce que ça calcule concrètement, étape par étape :

- Ça donne l'effet marginal estimé de x1 à un point de départ précis de x1 — pas pour un déplacement complet d'une unité.
- Comme la pente 6 − 2x1 diminue quand x1 augmente, elle peut même changer de signe : positive pour un petit x1, négative pour un grand x1.
- Il ne faut jamais la lire comme "le changement de ŷ pour une unité de x1 en plus" — c'est une quantité différente, finie, qu'on voit juste après.

### 3.2 Le changement réel sur un déplacement concret — la différence finie (finite difference)

Pour obtenir le vrai changement de ŷ entre deux valeurs réelles de x1 (par exemple de 1 à 2, x2 fixé), on ne peut pas simplement utiliser la dérivée — il faut calculer la différence finie entre les deux valeurs ajustées (ce qui revient à intégrer la dérivée sur cet intervalle). D'après les slides, pour cet exemple :

- x1 passe de 1 à 2 → la moyenne estimée de Y augmente de 3.
- x1 passe de 2 à 3 → la moyenne estimée de Y augmente de 1.
- x1 passe de 4 à 5 → la moyenne estimée de Y diminue de 3.

Remarquez que le même "+1" sur x1 produit un effet différent selon d'où l'on part : c'est exactement ce que "non linéaire" veut dire.

<div class="watch"><b>Watch out :</b> "entraîne une augmentation/diminution" est une affirmation statistique (associative) issue du modèle ajusté, jamais une affirmation causale.</div>

## 4. La transformation logarithmique : lire l'effet en pourcentage

Pour un x transformé en logarithme, il existe un raccourci pratique : lire l'effet comme un changement en pourcentage approximatif, valable uniquement pour de petits déplacements en pourcentage de x.

<div class="def"><b>ŷincr − ŷsans incr = b1[log(x + 0.01x) − log(x)] = b1·log(1.01) ≈ 0.01·b1</b><br/>où le modèle est ŷ = b0 + b1log(x) ; l'augmentation considérée est une hausse de 1% de x ; b1 est le coefficient estimé sur log(x).</div>

Ce que ça calcule concrètement, étape par étape :

- On part de la valeur ajustée du modèle log, puis on augmente x d'exactement 1%.
- Le changement de ŷ vaut b1·log(1.01), ce qui est approximativement égal à 0.01·b1 (cette approximation n'est valable que pour un petit déplacement en pourcentage — elle devient fausse pour un gros déplacement).
- Lecture : une hausse de 1% de x est associée à un changement estimé de mean(Y) d'environ 0.01·b1.
- De façon équivalente : b1 lui-même est le changement estimé de mean(Y) pour une augmentation d'une unité de log(x) — une deuxième façon, exacte cette fois, de lire le même coefficient.

<div class="example"><b>Exemple chiffré (publicité/chiffre d'affaires) :</b> ŷ = 2.4 + 0.3·log(x1) − 0.9x2. x2 étant fixé :<br/>&bull; investissement 1 → 2 : 0.3·(log2 − log1) = 0.208<br/>&bull; investissement 10 → 11 : 0.3·(log11 − log10) = 0.029<br/>&bull; investissement 100 → 101 : 0.3·(log101 − log100) = 0.003<br/>Le même bond de +1 en valeur absolue de x1 rapporte de moins en moins de chiffre d'affaires à mesure que le niveau de départ augmente. Avec le raccourci du 1%, à n'importe quel niveau, une hausse de 1% de l'investissement augmente le chiffre d'affaires moyen d'environ b1·0.01 = 0.3·0.01 = 0.003.</div>

<div class="watch"><b>Watch out :</b> les lectures "b1·0.01 par 1%" et "effet de b1%" d'un x transformé en logarithme sont une approximation du premier ordre — valable seulement pour de petits changements en pourcentage de x, pas exacte pour un grand saut.</div>

Deux remarques finales sur les transformations, directement issues des slides :

- Transformer une variable explicative peut, dans certains cas, corriger aussi une violation des hypothèses du modèle (lien avec la Session 4).
- Les transformations ne se limitent pas aux variables explicatives — la variable dépendante Y peut elle aussi être transformée (log(Y) et modèles log-log/log-lin, vus en Session 4).

## 5. Corriger la non-additivité : qu'est-ce qu'un terme d'interaction

<div class="def"><b>Terme d'interaction (interaction term) :</b> le produit algébrique x1·x2 de deux variables explicatives, ajouté à un modèle qui contient déjà x1 et x2 comme effets principaux (main effects), pour que l'effet d'une variable puisse dépendre du niveau de l'autre.</div>

<div class="def"><b>Y = β0 + β1x1 + β2x2 + βint·x1x2 + ε</b><br/><b>ŷ = b0 + b1x1 + b2x2 + bint·x1x2</b><br/>où β1, β2 sont les deux coefficients des effets principaux (comme d'habitude), et βint est le coefficient du terme d'interaction (produit) x1x2.</div>

Ce que ça calcule concrètement, étape par étape :

- Sans le terme produit, l'effet de x1 sur E(Y) ne peut absolument pas changer, quelle que soit la valeur fixée de x2 (c'est exactement l'hypothèse d'additivité de la Section 1).
- Ajouter x1x2 casse cette contrainte : l'effet de x1 peut désormais varier d'une quantité liée au niveau de x2 (et symétriquement, l'effet de x2 varie avec le niveau de x1).
- βint mesure littéralement la taille de cette variation par unité de l'autre variable.

Une interaction peut être construite entre n'importe quelle combinaison de types de variables : deux variables quantitatives, une variable quantitative et une variable muette/qualitative, ou deux variables muettes/qualitatives. Le cas le plus courant en pratique — et celui à maîtriser en premier — est quantitative × muette, vu juste après.

## 6. Interaction entre une variable quantitative et une variable muette

Prenons le modèle estimé ŷ = b0 + b1x1 + b2x2 + bint·x1x2, avec x1 quantitative et x2 une variable muette (dummy variable) 0/1. En remplaçant chaque valeur de x2, cette unique équation se transforme en deux équations distinctes :

<div class="def"><b>x2 = 0 : ŷ = b0 + b1x1</b><br/><b>x2 = 1 : ŷ = b0 + b1x1 + b2 + bint·x1 = (b0 + b2) + (b1 + bint)x1</b><br/>où (b0 + b2) est l'ordonnée à l'origine (intercept) de la droite x2 = 1, et (b1 + bint) est la pente (slope) sur x1 pour la droite x2 = 1.</div>

Ce que ça calcule concrètement, étape par étape :

- On pose x2 = 0 dans l'équation complète : le terme d'interaction disparaît totalement (il est multiplié par 0), il ne reste qu'une droite simple en x1.
- On pose x2 = 1 dans l'équation complète : b2 s'ajoute à l'ordonnée à l'origine, et bint s'ajoute à la pente sur x1 — parce que bint·x1x2 devient bint·x1.
- Résultat : deux droites avec une ordonnée à l'origine ET une pente différentes — pas juste décalées vers le haut/le bas, mais inclinées différemment.
- C'est exactement à quoi ressemble sur un graphique "l'effet de x1 dépend du niveau de x2". Une simple variable muette sans interaction ne peut que décaler une droite vers le haut ou vers le bas (deux droites parallèles) ; c'est l'interaction qui permet à la pente elle-même de changer.

<div class="example"><b>Pour bien visualiser :</b> imaginez le prix d'un bien immobilier (Y) selon sa surface (x1) et selon qu'il soit neuf ou ancien (x2 = 1 si neuf). Sans interaction : le prix augmente avec la surface au même rythme, que le bien soit neuf ou ancien — seule la hauteur de départ change. Avec interaction : chaque mètre carré supplémentaire peut valoir plus cher dans le neuf que dans l'ancien — les deux droites ne sont plus parallèles, elles s'écartent (ou se rapprochent) à mesure que la surface augmente.</div>

<div class="watch"><b>Watch out :</b> si bint se révèle non significatif, le modèle revient en pratique à deux droites parallèles (même pente, ordonnées à l'origine différentes) — toujours vérifier la significativité du terme d'interaction lui-même avant de conclure que l'effet diffère vraiment selon les groupes.</div>

## 7. Interaction avec une variable à plusieurs catégories, ou entre deux variables quantitatives/deux variables muettes

### 7.1 Quantitative × variable à plusieurs catégories

Quand la deuxième variable x2 est qualitative avec k catégories, le modèle contient déjà k−1 variables muettes (disons xB et xC pour k = 3, par rapport à la catégorie de référence (reference category) A). L'interaction nécessite maintenant un terme produit par variable muette non-référence : x1xB et x1xC.

<div class="def"><b>ŷ = b0 + b1x1 + bBxB + bCxC + bintB·x1xB + bintC·x1xC</b></div>

Ce que ça calcule concrètement, étape par étape — ça produit trois droites distinctes, une par catégorie :

- catégorie A (référence) : ŷ = b0 + b1x1
- catégorie B : ŷ = (b0 + bB) + (b1 + bintB)x1
- catégorie C : ŷ = (b0 + bC) + (b1 + bintC)x1
- Chaque catégorie obtient à la fois sa propre ordonnée à l'origine et sa propre pente sur x1.

### 7.2 Deux variables quantitatives

Sans autre variable, l'équation est ŷ = b0 + b1x1 + b2x2 + bint·x1x2, qu'on peut réécrire ainsi :

<div class="def"><b>ŷ = b0 + x1(b1 + bint·x2) + b2x2</b></div>

Ce que ça calcule concrètement, étape par étape :

- La pente effective sur x1 est maintenant le terme entier (b1 + bint·x2), et non plus juste b1 seul.
- Cette pente change continûment selon la valeur à laquelle x2 est fixée — il n'y a plus une seule pente pour x1.
- Par symétrie, le même raisonnement s'applique à la pente effective sur x2, qui dépend de x1.

### 7.3 Deux variables muettes

L'algèbre a exactement la même forme que dans le cas de deux variables quantitatives :

- x2 = 1 : l'effet de x1 est b1 + bint.
- x2 = 0 : l'effet de x1 est simplement b1.

<div class="key"><b>Must know (les trois formes d'interaction) :</b><br/>&bull; Interaction quantitative × muette → pente différente sur x1 selon le groupe (droites non parallèles)<br/>&bull; Interaction quantitative × k catégories → k droites différentes, une pente et une ordonnée à l'origine par catégorie<br/>&bull; Interaction quantitative × quantitative → la pente effective sur chaque variable est elle-même une fonction linéaire de la valeur de l'autre variable</div>

## 8. Tester si une transformation ou une interaction compte vraiment

La question de savoir si une interaction est statistiquement significative — c'est-à-dire s'il existe une vraie preuve que l'effet d'une variable dépend du niveau d'une autre — se teste différemment selon le nombre de termes impliqués :

- **Un seul terme d'interaction** → un simple test t (t-test) sur bint (H0 : βint = 0).
- **Plusieurs termes d'interaction en même temps** (par exemple x1xB et x1xC ensemble, pour une interaction à 3 catégories) → un test F partiel (partial F-test) pour tester leur significativité conjointe — exactement la même logique de test F partiel que dans la Session 2, appliquée cette fois à un groupe de termes d'interaction plutôt qu'à un groupe de variables muettes d'effet principal.

Une situation liée : une variable peut apparaître dans le modèle sous plus d'une forme à la fois — par exemple comme effet principal, à l'intérieur d'une interaction, et sous une forme transformée (quadratique).

- Pour juger si cette variable compte globalement, tous ses termes doivent être testés conjointement, avec un seul test F partiel.
- Un test t non significatif sur un seul de ces termes (disons, l'effet principal tout seul) ne dit rien sur la pertinence globale de la variable une fois ses autres formes prises en compte ensemble.

Des interactions entre plus de deux variables sont aussi possibles, construites de la même façon, en ajoutant les termes produits d'ordre supérieur correspondants au modèle.

## 9. Erreurs fréquentes et pièges d'examen

- Lire le coefficient d'une variable transformée comme s'il s'agissait d'un effet marginal constant (comme pour un terme linéaire non transformé) — avec log(x) ou x², l'effet doit être évalué à une valeur précise de x, ou présenté comme une différence finie entre deux valeurs précises.
- Appliquer log(x) à une variable qui peut être nulle ou négative — le logarithme exige des valeurs strictement positives.
- Ajouter un terme au carré x² sans garder le terme linéaire x dans le modèle.
- Oublier que le raccourci de "l'effet en pourcentage" basé sur le log (0.01·b1 pour +1%) n'est qu'une approximation valable pour de petits changements en pourcentage.
- Interpréter un modèle variable muette + interaction comme s'il produisait toujours des droites parallèles entre les groupes — tout l'intérêt de l'interaction est justement que ce n'est plus nécessairement le cas.
- Tester plusieurs termes d'interaction/transformation appartenant à la même variable un par un avec des tests t séparés, au lieu de les tester conjointement avec un test F partiel.
- Confondre "l'effet de x dépend de x lui-même" (un problème de non-linéarité, corrigé en transformant x) avec "l'effet de x dépend d'une autre variable" (un problème de non-additivité, corrigé par une interaction) — ce sont deux problèmes différents, avec deux corrections différentes, qui ne s'échangent pas.

## 10. À connaître absolument

<div class="key"><b>Must know :</b><br/>&bull; Deux façons dont le modèle linéaire-additif de base peut échouer : la non-linéarité (corrigée en transformant x) et la non-additivité (corrigée en ajoutant une interaction)<br/>&bull; Après une transformation, présenter l'effet soit comme une dérivée locale en un point précis, soit comme une différence finie entre deux valeurs de x — jamais comme un seul coefficient fixe<br/>&bull; log(x) : une hausse d'environ 1% de x → mean(Y) change d'environ 0.01·b1 ; de façon équivalente, b1 est l'effet d'une augmentation d'une unité de log(x)<br/>&bull; Terme d'interaction = produit de deux variables ; son coefficient mesure comment l'effet d'une variable change avec le niveau de l'autre<br/>&bull; Interaction quantitative × muette → ordonnée à l'origine ET pente différentes par groupe<br/>&bull; Un seul terme d'interaction → test t ; plusieurs termes d'interaction ensemble, ou une variable apparaissant sous plusieurs formes → test F partiel</div>

## Points de vigilance

<div class="watch"><b>Watch out :</b> "entraîne une augmentation/diminution" en lisant une différence finie est une affirmation statistique (associative) issue du modèle ajusté, jamais une affirmation causale.</div>

<div class="watch"><b>Watch out :</b> les lectures "b1·0.01 par 1%" et "effet de b1%" d'un x transformé en logarithme sont une approximation du premier ordre — valable seulement pour de petits changements en pourcentage de x, pas exacte pour un grand saut.</div>

<div class="watch"><b>Watch out :</b> un modèle avec x1, x2 et leur interaction, mais un bint non significatif, se réduit en pratique à deux droites parallèles (même pente, ordonnées à l'origine différentes) — toujours vérifier la significativité du terme d'interaction avant de conclure que l'effet diffère vraiment selon les groupes.</div>
