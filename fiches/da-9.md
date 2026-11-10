# Session 9. Les séries temporelles : caractéristiques générales, transformations et décomposition

À la fin de cette session, vous devez être capable de : définir une série temporelle univariée (univariate time series) et la représenter graphiquement ; citer les objectifs de l'analyse d'une série temporelle et distinguer analyse classique et analyse moderne ; appliquer les transformations usuelles (logarithme, Box-Cox, opérateur backshift B, opérateur différence D) ; calculer une moyenne mobile centrée (centered moving average) d'ordre pair ou impair ; et décomposer une série en tendance (trend), saisonnalité (seasonality) et composante irrégulière (irregular component) selon le modèle multiplicatif ou additif, y compris avec R.

<div class="plan"><b>Plan</b><br/>1. Qu'est-ce qu'une série temporelle<br/>2. Objectifs de l'analyse et deux grandes approches<br/>3. Transformations standard : logarithme et Box-Cox<br/>4. L'opérateur backshift B et l'opérateur différence D<br/>5. Les moyennes mobiles : ordre impair et ordre pair<br/>6. Les trois composantes d'une série temporelle<br/>7. Modèle multiplicatif ou additif<br/>8. La procédure de décomposition en 4 étapes<br/>9. Exemple travaillé complet : les bénéfices trimestriels de Johnson & Johnson<br/>10. Les fonctions R de la session<br/>11. Erreurs fréquentes et pièges d'examen<br/>12. À connaître absolument</div>

## 1. Qu'est-ce qu'une série temporelle

<div class="def"><b>Série temporelle univariée (univariate time series) :</b> ensemble de données numériques ordonnées, correspondant à une variable relevée à des instants successifs (en général régulièrement espacés).</div>

- On note la série yt0, yt0+1, …, yT, où t0 et T sont les instants de début et de fin (souvent on prend t0 = 0 ou t0 = 1), et yt est la valeur de la variable au temps t.
- Exemples typiques donnés en cours : en macroéconomie, le PIB d'un pays mesuré annuellement ; en démographie, la population d'un pays mesurée annuellement ; en finance, le rendement d'un fonds relevé mensuellement, le cours de clôture d'une action, un taux de change ou un indice boursier relevés quotidiennement.
- L'exemple fil rouge du début de la session : les cours de clôture quotidiens de l'action Apple Inc, du 3 janvier 2007 au 14 juin 2024 (source Yahoo Finance).

Pour représenter graphiquement une série temporelle : en abscisse, les instants auxquels la variable est mesurée ; en ordonnée, les valeurs de la variable. On relie les points par des segments : la forme de la courbe fait apparaître visuellement la tendance, les oscillations et les ruptures.

## 2. Objectifs de l'analyse et deux grandes approches

Les objectifs principaux de l'analyse d'une série temporelle :

- Étudier l'évolution du phénomène dans le temps, en particulier la tendance de long terme (long-term trend) et les éventuelles fluctuations saisonnières (seasonal fluctuations).
- Étudier la persistance : combien de temps les effets d'un choc se font sentir.
- Prédire les valeurs futures de la série.

Il existe deux grandes familles de méthodes :

<div class="def"><b>Analyse classique :</b> procédures essentiellement descriptives qui cherchent à identifier les caractéristiques principales de la série (tendance, saisonnalité, irrégularité).<br/><b>Analyse moderne :</b> modèles probabilistes (processus stochastiques, stochastic processes) qui gouvernent l'évolution du phénomène ; les modèles sont ajustés aux données par des procédures statistiques appropriées.</div>

- Cette session (et la procédure de décomposition) relève de l'analyse classique. Les transformations de la section suivante sont nécessaires pour les deux approches.

## 3. Transformations standard : logarithme et Box-Cox

**Transformation logarithmique :** yt → f(yt) = log(yt). Utile (quand elle est applicable, c'est-à-dire pour des valeurs strictement positives) pour : homogénéiser la variabilité (stabiliser la variance) ; normaliser la variable ; rapprocher une série de la stationnarité (stationarity).

<div class="def"><b>Transformation de Box-Cox :</b> généralisation de la transformation logarithmique, avec un paramètre λ : fλ(yt) = log(yt) si λ = 0, et fλ(yt) = (yt^λ − 1) / λ si λ ≠ 0.</div>

- Le cas λ = 0 redonne exactement le logarithme (continuité de la formule quand λ → 0).
- Le choix de λ pilote la force de la transformation : λ = 1 ne change rien (à une constante près), λ = 0,5 ressemble à une racine carrée.

## 4. L'opérateur backshift B et l'opérateur différence D

<div class="def"><b>Opérateur backshift (backshift operator) B :</b> décale la série d'un pas vers le passé : B yt = yt−1.</div>

- On peut l'appliquer plusieurs fois : B²yt = B(B yt) = B(yt−1) = yt−2.
- Par convention B0 = 1 : il transforme chaque valeur en elle-même, B0(yt) = yt.

<div class="watch"><b>Watch out :</b> dans R (package de base), l'opérateur lag décale la série vers l'avant : lag(yt) = lag(yt, 1) = yt+1 et lag(yt, k) = yt+k. Pour obtenir l'équivalent du backshift il faut lag(yt, −1) = yt−1 = B yt. Le sens est contre-intuitif : retenez que lag avec un argument négatif correspond à B.</div>

<div class="def"><b>Opérateur différence (difference operator) D :</b> D yt = yt − yt−1 = yt − B yt = (1 − B)yt.</div>

- Dans R (package de base), la fonction diff calcule la différence entre la valeur courante et une valeur passée : diff(yt) = diff(yt, 1) = yt − yt−1, et diff(yt, k) = yt − yt−k.
- Différencier une série supprime une tendance linéaire : c'est l'outil de base pour rendre une série stationnaire.

## 5. Les moyennes mobiles : ordre impair et ordre pair

<div class="def"><b>Moyenne mobile centrée d'ordre impair k (centered moving average of odd order) :</b> à chaque temps t, on calcule la moyenne des k valeurs autour de t : (k−1)/2 avant t, la valeur en t, et (k−1)/2 après t. Le résultat est positionné en t.</div>

<div class="example"><b>Exemple (k = 3) :</b> série 2, 6, 4, 5, 9, 7, 11. La moyenne mobile donne : (2+6+4)/3 = 4, puis (6+4+5)/3 = 5, puis 6, 7, 9. La nouvelle série perd la première et la dernière valeur : avec k impair, on perd (k−1)/2 valeurs au début et autant à la fin.</div>

<div class="def"><b>Moyenne mobile centrée d'ordre pair k :</b> à chaque temps t, on calcule une moyenne pondérée des k+1 valeurs autour de t : k/2 avant, la valeur en t, k/2 après. La première et la dernière valeur ont un poids 1/(2k), les autres un poids 1/k. On perd k/2 valeurs au début et k/2 à la fin.</div>

<div class="example"><b>Exemple (k = 4) :</b> série 2, 6, 4, 5, 9, 7, 11. Première valeur : (2 + 2·6 + 2·4 + 2·5 + 9)/8 = 5,125 ; puis (6 + 2·4 + 2·5 + 2·9 + 7)/8 = 6,125 ; puis (4 + 2·5 + 2·9 + 2·7 + 11)/8 = 7,125. On perd les deux premières et les deux dernières valeurs.</div>

Ce qu'il faut comprendre sur le calcul, étape par étape (cas k pair) :

- On prend k+1 valeurs centrées en t (et non k) : c'est ce qui permet de recentrer exactement sur t malgré l'ordre pair.
- Les deux valeurs extrêmes reçoivent un poids moitié (1/(2k)) : au total, les poids somment à 1, comme pour une moyenne ordinaire.
- En R : la fonction `ma` (package forecast) calcule la moyenne mobile de n'importe quel ordre : `m4 <- ma(y, 4)`.

Effet d'une moyenne mobile sur la série :

- **Effet lissant (smoothing effect) :** elle réduit les fluctuations, puisqu'elle repose sur des moyennes. Plus l'ordre k est grand, plus le lissage est prononcé.
- **Une moyenne mobile d'ordre k réduit ou élimine les oscillations périodiques régulières de période k.** Par exemple, avec des données trimestrielles (périodicité 4), une moyenne mobile d'ordre 4 élimine les oscillations saisonnières, car chaque valeur est une moyenne sur les 4 trimestres avec le même poids pour chaque trimestre.
- C'est exactement cette propriété qui est exploitée à l'étape 1 de la décomposition.

## 6. Les trois composantes d'une série temporelle

L'objectif de la décomposition (decomposition) est d'identifier les composantes typiques d'une série (même si elles ne sont pas toujours toutes présentes) :

<div class="def"><b>Tendance ou trend-cycle (trend) :</b> le comportement de moyen-long terme de la série (par exemple croissant ou décroissant).<br/><b>Saisonnalité (seasonality) :</b> variations de périodicité constante, en général dues à des facteurs saisonniers (mensuels, trimestriels…).<br/><b>Erreur ou composante irrégulière (error / irregular component) :</b> tout ce qui influence la série sans entrer dans les deux composantes précédentes : fluctuations aléatoires sans périodicité régulière ni tendance définie.</div>

- Parfois on distingue la vraie tendance (long terme) de la composante cyclique (cycle) : variations de périodicité irrégulière, en général de moyen terme, souvent liées aux cycles économiques (récessions, reprises). En pratique on les regroupe en une seule composante trend-cycle, comme dans cette session.
- La saisonnalité est typique des séries de ventes ou de fourniture de biens et services (ventes de boissons ou de glaces, fourniture de gaz ou d'électricité, services touristiques). Avec des données annuelles, la composante saisonnière est en général absente.

## 7. Modèle multiplicatif ou additif

Deux hypothèses possibles sur la manière dont les composantes T, S et E se combinent :

<div class="def"><b>Modèle multiplicatif : yt = Tt · St · Et</b><br/><b>Modèle additif : yt = Tt + St + Et</b></div>

Ce choix change tout, en pratique :

- Dans le modèle multiplicatif, les fluctuations saisonnières ont une amplitude qui dépend du niveau de la série : si la tendance est croissante, les oscillations grandissent avec le temps. Les indices saisonniers fluctuent autour de 1.
- Dans le modèle additif, l'amplitude des fluctuations est constante quel que soit le niveau. Les indices saisonniers fluctuent autour de 0.
- On passe de l'un à l'autre par une transformation logarithmique (quand elle est applicable) : log(yt) = log(Tt) + log(St) + log(Et).
- Sans composante saisonnière, les modèles se réduisent à une combinaison de tendance et de composante irrégulière.

## 8. La procédure de décomposition en 4 étapes

Procédure classique (fondée sur les moyennes mobiles), présentée pour le modèle multiplicatif :

- **Étape 1.** Calculer la moyenne mobile d'ordre égal à la période saisonnière k, notée Mtk. But : supprimer la saisonnalité tout en réduisant la composante irrégulière (effet lissant). Il reste la tendance : Mtk ≅ Tt.
- **Étape 2.** Diviser la série originale par la moyenne mobile : yt / Mtk ≅ (Tt·St·Et) / Tt = St·Et. Ce ratio estime le produit saisonnalité × irrégulier.
- **Étape 3.** Pour chaque période (mois, trimestre…), calculer la moyenne arithmétique simple des valeurs yt/Mtk, puis renormaliser ces moyennes pour que leur moyenne vaille 1. Cela élimine la composante erratique du produit St·Et et isole la saisonnalité. Les valeurs obtenues, identiques pour chaque période (St+k = St), sont les indices saisonniers (seasonal indices), qui fluctuent autour de 1.
- **Étape 4.** Diviser le ratio yt/Mtk ≅ St·Et par St : il reste la composante irrégulière Et, qui doit avoir un comportement aléatoire, sans tendance, avec des fluctuations de périodicité non constante autour de 1.

<div class="watch"><b>Watch out :</b> pour le modèle additif, les étapes sont les mêmes mais les divisions deviennent des soustractions. Les indices saisonniers fluctuent autour de 0 (et non 1), et la composante irrégulière finale doit être aléatoire autour de 0 (et non 1). À l'examen, vérifiez toujours quel modèle est demandé avant de diviser ou soustraire.</div>

## 9. Exemple travaillé complet : les bénéfices trimestriels de Johnson & Johnson

<div class="example"><b>Données :</b> EPS (earnings per share, bénéfice par action, en dollars) de Johnson & Johnson, relevés trimestriellement sur 20 ans. Le graphe montre une tendance clairement croissante, des oscillations régulières (baisses marquées au 4e trimestre de chaque année) et des variations irrégulières.</div>

**Étape 1.** Moyenne mobile d'ordre 4 (données trimestrielles). Premières valeurs : 1960 Qtr1 = 0,71 ; Qtr2 = 0,63 ; Qtr3 = 0,85 ; Qtr4 = 0,44 ; 1961 Qtr1 = 0,61. Première valeur de la moyenne mobile : (1/8)·0,71 + (1/4)·0,63 + (1/4)·0,85 + (1/4)·0,44 + (1/8)·0,61 = 0,645, positionnée au 3e trimestre 1960 (les deux premières valeurs sont NA). En R : `M4 <- ma(JJ, 4)`.

**Étape 2.** `SE <- JJ/M4`. Premières valeurs de SE : 1960 Qtr3 = 1,3178 ; Qtr4 = 0,6875 ; 1961 Qtr1 = 0,9295 ; etc. Cette série estime St·Et.

**Étape 3.** Moyennes de SE par trimestre : 0,9926 (Qtr1) ; 1,0326 (Qtr2) ; 1,1136 (Qtr3) ; 0,8596 (Qtr4). Leur moyenne vaut 0,9996 ; on renormalise en divisant chacune par 0,9996. Indices saisonniers finaux : Qtr1 = 0,993 ; Qtr2 = 1,033 ; Qtr3 = 1,114 ; Qtr4 = 0,860.

Lecture des indices saisonniers :

- Leur moyenne vaut 1 par construction. Une valeur &gt; 1 indique un effet positif pour la période, &lt; 1 un effet négatif.
- Ici : hausse maximale au 3e trimestre (environ +11 % par rapport à la moyenne annuelle), baisse maximale au 4e trimestre (environ −14 %).

**Étape 4.** On divise chaque valeur de SE par l'indice saisonnier de son trimestre : il reste la composante irrégulière. Son graphe montre un comportement adapté : pas de tendance particulière, fluctuations pas trop régulières autour de 1 → la décomposition est cohérente.

## 10. Les fonctions R de la session

- `ma(y, k)` (package forecast) : moyenne mobile d'ordre k (pair ou impair). Ex. : `m4 <- ma(JJ, 4)`.
- `decompose(y, type = "mult")` (package de base) : réalise toute la décomposition selon la procédure décrite ; l'option type choisit le modèle ("mult" pour multiplicatif ; le défaut est l'additif).
- L'objet retourné contient les composantes, accessibles directement : `dec_m$trend` (la série de tendance) ; `dec_m$figure` (les indices saisonniers, pour J&J : 0,9930 ; 1,0330 ; 1,1141 ; 0,8600) ; `dec_m$random` (la composante irrégulière).
- `plot(dec_m)` trace les graphes des différentes composantes.
- Rappels utiles : `lag(y, k)` décale vers l'avant (attention au sens, voir section 4) ; `diff(y, k)` calcule yt − yt−k.

## 11. Erreurs fréquentes et pièges d'examen

- Confondre le sens de lag en R : `lag(y)` avance la série (yt+1) alors que B recule (yt−1) ; il faut `lag(y, −1)` pour obtenir B y.
- Oublier les valeurs perdues aux extrémités : (k−1)/2 de chaque côté pour k impair, k/2 de chaque côté pour k pair.
- Pour un k pair, oublier la pondération : les deux valeurs extrêmes pèsent 1/(2k), les autres 1/k, et on moyenne k+1 valeurs (pas k).
- Oublier la renormalisation de l'étape 3 : les moyennes par période doivent être divisées par leur propre moyenne pour que les indices saisonniers aient une moyenne de 1.
- Appliquer les divisions du modèle multiplicatif quand l'énoncé demande l'additif : dans l'additif on soustrait, les indices tournent autour de 0 et l'irrégulier autour de 0.
- Interpréter un indice saisonnier de 1,114 comme « +114 % » : c'est +11,4 % par rapport à la moyenne.
- Conclure que la décomposition a échoué si l'irrégulier n'est pas parfaitement aléatoire : on cherche seulement l'absence de tendance et de périodicité régulière.
- Chercher une saisonnalité dans des données annuelles : elle est en général absente par construction.

## 12. À connaître absolument

<div class="key"><b>Must know :</b><br/>&bull; Série temporelle univariée = données ordonnées dans le temps ; graphe = temps en abscisse, valeurs en ordonnée<br/>&bull; Objectifs : tendance long terme, saisonnalité, persistance, prédiction. Analyse classique = descriptive ; analyse moderne = processus stochastiques<br/>&bull; B yt = yt−1 ; D yt = (1−B)yt = yt − yt−1 ; Box-Cox généralise le log (cas λ = 0)<br/>&bull; Moyenne mobile d'ordre k : lissage + suppression des oscillations de période k ; k pair → poids 1/(2k) aux extrêmes, k+1 valeurs<br/>&bull; Composantes : tendance (trend-cycle), saisonnalité (périodicité constante), irrégulier (le reste)<br/>&bull; Multiplicatif : y = T·S·E, indices autour de 1, divisions ; additif : y = T+S+E, indices autour de 0, soustractions<br/>&bull; Décomposition en 4 étapes : Mk → y/Mk → moyennes par période renormalisées (= indices saisonniers) → division par les indices (= irrégulier)<br/>&bull; En R : ma(y, k) puis decompose(y, type = "mult") ; dec_m$trend, dec_m$figure, dec_m$random</div>

## Points de vigilance

<div class="watch"><b>Watch out :</b> le sens de lag dans R est l'inverse du backshift B : lag(y, 1) = yt+1, il faut lag(y, −1) pour obtenir B y = yt−1.</div>

<div class="watch"><b>Watch out :</b> en modèle additif, remplacer toutes les divisions par des soustractions ; indices saisonniers et composante irrégulière centrés sur 0, pas sur 1.</div>

<div class="watch"><b>Watch out :</b> les graphes des slides (série Apple, série Johnson & Johnson et ses composantes) ne sont pas reproduits ici : reprenez le PDF du cours pour l'allure visuelle des séries et des décompositions.</div>
