# Session 2. Variables explicatives catégorielles et tests F

À la fin de cette session, vous savez intégrer une variable qualitative (catégorielle) dans un modèle de régression grâce aux variables muettes (dummy variables), lire ce que signifie le coefficient de chaque variable muette, et tester si un groupe entier de variables (pas une seule) compte grâce au test F partiel (partial F-test) et au test F global (global F-test).

<div class="plan"><b>Plan</b><br/>1. Variables à deux catégories : le codage en variable muette<br/>2. Lire le coefficient d'une variable muette dans l'équation<br/>3. Tester le coefficient d'une variable muette<br/>4. Plus de deux catégories : la règle des k−1 variables muettes<br/>5. Lire et tester l'effet de chaque catégorie<br/>6. Comparer deux modèles : le test F partiel<br/>7. Tester le modèle entier : le test F global<br/>8. Erreurs fréquentes et pièges d'examen<br/>9. À connaître absolument</div>

## 1. Variables à deux catégories : le codage en variable muette

- Une variable dichotomique (dichotomous variable) n'a que deux catégories possibles.
- En régression, on l'intègre comme une variable muette (dummy variable) : codée numériquement 0 ou 1.
- Convention : 1 = la caractéristique est présente, 0 = elle est absente.

Exemples immobiliers utilisés tout au long du cours :

- "Libre" (1) vs "Non libre" (0) — le bien est-il vacant au moment de la vente ?
- "Équipé d'un box" (1) vs "Non équipé" (0) — le bien a-t-il un garage privé ?

Autrement dit : dès qu'une question se répond par oui/non, vous pouvez la transformer en variable muette et l'utiliser dans une régression exactement comme une variable numérique.

<div class="def"><b>Variable muette (dummy variable) :</b> une variable explicative dichotomique, intégrée au modèle exactement comme si c'était une variable quantitative à valeurs 0 et 1. Son effet sur la moyenne de Y est l'effet du passage du groupe codé 0 au groupe codé 1.</div>

- Une variable muette découpe simplement la population en deux groupes : le groupe où elle vaut 0, et le groupe où elle vaut 1.
- Son effet = la différence de moyenne de Y entre ces deux groupes, toutes les autres variables explicatives étant maintenues constantes ("holding constant" / "controlling for").

## 2. Lire le coefficient d'une variable muette dans l'équation

<div class="example"><b>Exemple travaillé :</b> Y = prix au mètre carré, x1 = âge du bien, xBOX = 1 si le bien a un box, 0 sinon.</div>

<div class="def"><b>Y = β0 + β1x1 + βBOXxBOX + ε</b><br/><b>ŷ = b0 + b1x1 + bBOXxBOX</b><br/>où xBOX = 1 si le bien a un box, 0 sinon ; tout le reste est identique à la Session 1 (b0 l'ordonnée à l'origine/"intercept", b1 l'effet de l'âge).</div>

Ce que ça calcule concrètement, étape par étape :

- On fixe l'âge x1 à une valeur donnée, et on regarde ce qui change quand xBOX bascule entre 0 et 1.
- Avec un box (xBOX = 1) : ŷbox = b0 + b1x1 + bBOX, qu'on peut réécrire (b0+bBOX) + b1x1.
- Sans box (xBOX = 0) : ŷnobox = b0 + b1x1.
- En soustrayant les deux : ŷbox − ŷnobox = bBOX.
- On obtient donc deux droites parallèles (même pente b1 sur l'âge) séparées d'une distance constante bBOX.

<div class="def"><b>Coefficient d'une variable muette :</b> bBOX estime la différence entre le prix moyen des biens avec box et celui des biens sans box, à âge égal. Plus généralement : une variable muette génère deux équations parallèles, une par catégorie, qui ne diffèrent que par son propre coefficient.</div>

<div class="example"><b>Exemple numérique :</b> supposons b0 = 6.2, b1 = −0.09, bBOX = 0.8 (prix en milliers d'euros/m²). Pour un bien de 10 ans sans box : ŷ = 6.2 − 0.9 = 5.3. Pour un bien de 10 ans avec box : ŷ = 6.2 − 0.9 + 0.8 = 6.1. La différence est exactement bBOX = 0.8, soit 800€ de plus par m² pour un bien équipé d'un box, à âge identique.</div>

## 3. Tester le coefficient d'une variable muette

- Rien de nouveau ici : une variable muette est traitée exactement comme n'importe quelle autre variable explicative.
- Intervalle de confiance ("confidence interval"), même formule qu'en Session 1 :

<div class="def"><b>(bj − t(α/2, n−p−1)·sbj , bj + t(α/2, n−p−1)·sbj)</b></div>

- Test de significativité, mêmes hypothèses et même règle :

<div class="def"><b>H0: βj = 0 ; H1: βj ≠ 0</b><br/>rejeter H0 au niveau α si p-value = 2P(T ≥ |tobs| | H0) &lt; α</div>

Ce que ça calcule concrètement :

- Rejeter H0 = trouver une preuve statistique que les deux groupes (codés 0 vs 1) ont réellement des moyennes de Y différentes, les autres variables étant maintenues constantes.

<div class="example"><b>Exemple :</b> rejeter H0: βBOX = 0 signifie que les biens avec et sans box ont, en moyenne, des valorisations différentes, une fois l'âge contrôlé ("controlling for age").</div>

## 4. Plus de deux catégories : la règle des k−1 variables muettes

- Si une variable catégorielle a k &gt; 2 catégories, on ne peut pas simplement la coder 0, 1, 2, ... et la traiter comme quantitative.
- Pourquoi pas : cela imposerait un ordre et un écartement numériques artificiels entre les catégories, qui n'ont aucun sens réel (ex : "zone B moins zone A" n'a pas plus de valeur que "zone C moins zone B").
- La solution : construire k−1 variables muettes, une par catégorie sauf une.
- La catégorie laissée de côté est la catégorie de référence (reference category) : le coefficient de chaque variable muette est une comparaison ("contrast") par rapport à elle.

<div class="key"><b>Must know (règle des k−1 variables muettes) :</b> une variable qualitative à k &gt; 2 catégories nécessite k − 1 variables muettes, chacune signalant une catégorie ; la catégorie exclue devient la référence, et tous les effets sont mesurés par rapport à elle.</div>

<div class="example"><b>Exemple travaillé :</b> la zone de la ville, avec k = 3 catégories (A, B, C), en plus de l'âge (quantitatif). On choisit les zones B et C pour créer les variables muettes : xB = 1 si le bien est en zone B, 0 sinon ; xC = 1 si le bien est en zone C, 0 sinon. La zone A n'a pas sa propre variable muette : c'est la catégorie de référence.</div>

<div class="def"><b>Y = β0 + βage·age + βBxB + βCxC + ε</b><br/><b>ŷ = b0 + bage·age + bBxB + bCxC</b></div>

Ce que ça calcule concrètement, en insérant les valeurs de chaque zone, âge fixé :

- Zone A (xB=0, xC=0) : ŷA = b0 + bage·age
- Zone B (xB=1, xC=0) : ŷB = (b0+bB) + bage·age
- Zone C (xB=0, xC=1) : ŷC = (b0+bC) + bage·age
- En soustrayant : ŷB − ŷA = bB, et ŷC − ŷA = bC.
- Donc : bB = écart de prix estimé entre la zone B et la zone A, à âge égal. bC = même idée, zone C contre zone A.
- Une variable à trois catégories découpe donc la population en 3 sous-populations, chacune avec sa propre équation (parallèle aux autres) ; k−1 = 2 variables muettes identifient 2 des 3 zones, la 3e (A) restant la référence silencieuse.
- On peut quand même obtenir l'écart zone C vs zone B : il suffit de calculer ŷC − ŷB — même si aucun coefficient ne le donne directement.

<div class="example"><b>Exemple numérique :</b> avec b0 = 5, bage = −0.1, bB = 0.6, bC = −0.3 (milliers d'euros/m²), pour un bien de 20 ans : zone A → 5 − 2 = 3 ; zone B → 5 − 2 + 0.6 = 3.6 ; zone C → 5 − 2 − 0.3 = 2.7. La zone B vaut 0.6 de plus que la zone A (référence), la zone C vaut 0.3 de moins que la zone A ; l'écart zone B vs zone C = 3.6 − 2.7 = 0.9, un chiffre qu'aucun des deux coefficients ne donne isolément.</div>

## 5. Lire et tester l'effet de chaque catégorie

- H0: βB = 0 pose la question : "existe-t-il une vraie différence entre la zone B et la zone A, à âge égal ?"
- H0: βC = 0 pose la même question pour la zone C contre la zone A.
- Les deux utilisent le t-test ordinaire de la Session 1 — rien de nouveau sur le plan technique.

<div class="watch"><b>Watch out :</b> avec la zone A comme référence, vous NE POUVEZ PAS lire la significativité de "zone C vs zone B" à partir d'un seul t-test — ni bB ni bC ne testent isolément cette comparaison.</div>

- Pour tester si la variable "zone" dans son ensemble (les deux variables muettes ensemble) compte, des t-tests individuels ne suffisent pas — il faut un test qui vérifie plusieurs coefficients à la fois. C'est le test F partiel, vu au point suivant.

## 6. Comparer deux modèles : le test F partiel

- Objectif : tester la significativité conjointe d'un groupe de variables — le plus souvent, toutes les variables muettes d'une même variable catégorielle en même temps.
- Il faut deux modèles emboîtés (nested models) pour le même Y :

<div class="def"><b>Modèles emboîtés (nested models) :</b> le modèle réduit (RED.M, "reduced model") comporte q variables x1,...,xq ; le modèle complet (COMP.M, "complete model") comporte p &gt; q variables — les mêmes q, plus p−q variables supplémentaires.</div>

<div class="def"><b>RED.M: Y = β0 + β1x1 + ... + βqxq + ε</b><br/><b>COMP.M: Y = β0 + β1x1 + ... + βqxq + βq+1xq+1 + ... + βpxp + ε</b></div>

- "Complet" et "réduit" ne sont que des étiquettes pour cette comparaison précise — il n'existe pas de "modèle complet" absolu dans l'absolu.

<div class="def"><b>H0: βq+1 = βq+2 = ... = βp = 0</b><br/><b>H1: au moins un des βq+1, ..., βp est différent de 0</b></div>

- Rejeter H0 = les p−q variables supplémentaires aident réellement à expliquer Y au-delà de ce qu'apportent déjà x1,...,xq → on choisit le modèle complet.
- La statistique de test compare la déviance résiduelle (residual deviance, vue en Session 1) des deux modèles, mise à l'échelle par leurs degrés de liberté ("degrees of freedom", n−p−1 pour un modèle à p variables et un échantillon de taille n) :

<div class="key"><b>Must know (statistique du test F partiel) :</b><br/><b>F = [(RES.DEV.RED.M − RES.DEV.COMP.M)/(p−q)] / [RES.DEV.COMP.M/(n−p−1)]</b></div>

Ce que ça calcule concrètement, morceau par morceau :

- Numérateur : de combien la déviance résiduelle diminue quand on ajoute les p−q variables supplémentaires, divisé par le nombre de variables ajoutées.
- Dénominateur : ce qui reste inexpliqué (déviance résiduelle) dans le modèle complet, divisé par ses degrés de liberté — une sorte de "niveau de bruit typique" auquel comparer la baisse observée.

Un F élevé → la baisse de déviance est grande par rapport au bruit → les variables ajoutées valent la peine d'être gardées.

Sous H0, F suit la loi de Fisher-Snedecor (F-distribution) à (p−q) et (n−p−1) degrés de liberté — d'abord le degré de liberté du numérateur, puis celui du dénominateur.

- Degré de liberté du numérateur = p−q = le nombre de variables ajoutées.
- Degré de liberté du dénominateur = n−p−1 = les degrés de liberté résiduels du modèle complet.

<div class="def"><b>rejeter H0 au niveau α si Fobs ≥ F(p−q, n−p−1, α)</b><br/>de façon équivalente, rejeter si p-value = P(F ≥ Fobs | H0) &lt; α<br/>où F(p−q, n−p−1, α) = le quantile d'ordre 1−α de cette loi de Fisher-Snedecor, et Fobs = la valeur de F réellement calculée sur l'échantillon.</div>

On l'appelle test F partiel (partial F-test) car il teste un sous-groupe ("partiel") de variables, via une statistique qui suit la loi F.

- Cas particulier que vous utiliserez tout le temps : tester si une variable catégorielle entière à k catégories (ses k−1 variables muettes ensemble) est significative — exactement le trou laissé ouvert à la section 5.
- Test F partiel vs R² ajusté : pour des modèles emboîtés, le test F partiel est la bonne comparaison inférentielle ; le R² ajusté ne donne qu'une comparaison descriptive. Pour des modèles non emboîtés, le test F partiel est inutilisable — le R² ajusté reste la seule comparaison possible.

<div class="example"><b>Exemple :</b> reprenons zone A/B/C (modèle complet, p = 3 : âge + xB + xC) contre un modèle réduit ne contenant que l'âge (q = 1). Si RES.DEV.RED.M = 500, RES.DEV.COMP.M = 420, n = 100 : F = [(500−420)/(3−1)] / [420/(100−3−1)] = (80/2)/(420/96) = 40/4.375 ≈ 9.14. Si ce Fobs dépasse le seuil F(2,96,0.05) (autour de 3.09), on rejette H0 : la variable "zone" prise dans son ensemble est significative.</div>

## 7. Tester le modèle entier : le test F global

- Question : l'ensemble complet des variables explicatives a-t-il un effet quelconque sur Y ?

<div class="def"><b>H0: β1 = β2 = ... = βp = 0</b><br/><b>H1: au moins un des β1, ..., βp est différent de 0</b></div>

- C'est simplement le test F partiel déguisé :
  - modèle complet = le modèle étudié (p variables)
  - modèle réduit = le modèle nul (null model) (q = 0, seulement la constante) : Y = β0 + ε

<div class="def"><b>MODÈLE NUL (n−1 degrés de liberté) : Y = β0 + ε</b><br/><b>MODÈLE EXAMINÉ (n−p−1 degrés de liberté) : Y = β0 + β1x1 + ... + βpxp + ε</b></div>

- Raccourci important : le modèle nul n'a aucune variable explicative, donc sa déviance expliquée est nulle → sa déviance résiduelle = la déviance totale.
- La déviance totale ne dépend que des valeurs observées yi, jamais des variables incluses dans le modèle — c'est donc le même chiffre pour le modèle nul, le modèle complet, ou tout autre modèle sur cet échantillon.

<div class="key"><b>Must know (statistique du test F global) :</b><br/><b>F = [(TOT.DEV. − RES.DEV.)/p] / [RES.DEV./(n−p−1)] = [EXP.DEV./p] / [RES.DEV./(n−p−1)]</b></div>

Ce que ça calcule concrètement :

- Même logique que le test F partiel, en prenant simplement le "modèle nul" comme modèle réduit : (déviance totale moins déviance résiduelle) est exactement la déviance expliquée, divisée par p (le nombre de variables), sur le bruit résiduel par degré de liberté.

<div class="def"><b>région de rejet : F ≥ F(p, n−p−1, α)</b><br/>si Fobs ≥ F(p, n−p−1, α) : on rejette H0 → le modèle est globalement significatif<br/>si Fobs &lt; F(p, n−p−1, α) : on ne rejette pas H0 → pas assez de preuve d'une significativité globale<br/>de façon équivalente : p-value = P(F ≥ Fobs | H0) ; rejeter si p-value &lt; α</div>

- Rejeter H0 ici = les variables du modèle, prises ensemble, sont conjointement significatives.

<div class="example"><b>Exemple :</b> avec p = 3 variables, n = 100, TOT.DEV. = 600, RES.DEV. = 420 : EXP.DEV. = 180, donc F = (180/3)/(420/96) = 60/4.375 ≈ 13.7. Comparé à F(3,96,0.05) (environ 2.7), on rejette H0 largement : le modèle dans son ensemble est globalement significatif.</div>

## 8. Erreurs fréquentes et pièges d'examen

- Coder une variable à k &gt; 2 catégories comme une seule variable quantitative (0, 1, 2, ...) au lieu de k−1 variables muettes — cela impose un ordre artificiel.
- Utiliser k variables muettes au lieu de k−1 pour une variable à k catégories — une catégorie doit toujours rester en dehors, comme référence.
- Lire le coefficient d'une catégorie non-référence comme un niveau absolu plutôt que comme une comparaison par rapport à la référence ; la catégorie de référence elle-même est un choix arbitraire, pas une "vraie base".
- Essayer de lire l'écart zone C vs zone B directement sur bB ou bC — il faut calculer ŷC − ŷB, et sa significativité nécessite son propre test, pas un simple t-test.
- Considérer des t-tests séparés sur chaque variable muette comme équivalents à tester la significativité conjointe de toute la variable catégorielle — cela nécessite le test F partiel sur toutes ses variables muettes ensemble.
- Utiliser le test F partiel sur deux modèles non emboîtés — il ne fonctionne que pour des modèles emboîtés ; utiliser le R² ajusté à la place pour des comparaisons non emboîtées.
- Considérer "complet" et "réduit" comme des étiquettes permanentes de modèles spécifiques plutôt que comme des rôles relatifs à une comparaison précise.
- Lire "on ne rejette pas H0" dans le test F global comme "le modèle n'a aucun effet", ou comme une preuve que H0 est vraie — cela signifie seulement une preuve insuffisante à ce niveau α.
- Oublier que la déviance totale ne change jamais entre les modèles sur le même échantillon/Y — seules la déviance résiduelle et la déviance expliquée bougent.

## 9. À connaître absolument

<div class="key"><b>Must know :</b><br/>&bull; Une variable muette est une variable 0/1 ; son coefficient = différence de moyenne entre le groupe 1 et le groupe 0, les autres variables étant maintenues constantes<br/>&bull; k &gt; 2 catégories nécessitent k−1 variables muettes ; la catégorie exclue est la référence ; chaque coefficient n'est une comparaison que par rapport à elle<br/>&bull; Intervalles de confiance et t-tests sur les coefficients de variables muettes utilisent exactement les mêmes formules que pour les variables quantitatives<br/>&bull; Le test F partiel compare des modèles emboîtés : F = [(RES.DEV.red − RES.DEV.comp)/(p−q)] / [RES.DEV.comp/(n−p−1)] ~ F(p−q, n−p−1) sous H0<br/>&bull; Utiliser le test F partiel (pas des t-tests séparés) pour tester la significativité conjointe d'un groupe de variables, par exemple toutes les variables muettes d'une même variable catégorielle<br/>&bull; Test F global = test F partiel avec le modèle nul (q=0) comme modèle réduit : F = [(TOT.DEV. − RES.DEV.)/p] / [RES.DEV./(n−p−1)]<br/>&bull; On rejette H0 dans les deux tests F quand Fobs atteint ou dépasse le quantile F, ou quand p-value &lt; α<br/>&bull; La déviance totale est fixe pour un échantillon/Y donné, quel que soit le modèle ; seules la déviance résiduelle et la déviance expliquée changent<br/>&bull; Modèles emboîtés → test F partiel (inférentiel) ; modèles non emboîtés → R² ajusté seulement (descriptif)</div>

## Points de vigilance

<div class="watch"><b>Watch out :</b> avec la zone A comme catégorie de référence, l'écart zone C vs zone B ne peut pas être lu à partir du t-test d'un seul coefficient — calculez ŷC − ŷB et testez-le séparément (ou via le test F partiel) si nécessaire.</div>

<div class="watch"><b>Watch out :</b> les diapositives décrivent la forme de la densité de la loi de Fisher-Snedecor, mais la courbe tracée et les valeurs des axes n'ont pas survécu à l'extraction du PDF — seule la description qualitative (deux paramètres de degrés de liberté) est disponible.</div>

<div class="watch"><b>Watch out :</b> aucun exemple numérique entièrement calculé (avec de vraies valeurs de RES.DEV., degrés de liberté, F) n'est donné dans la source pour l'un ou l'autre test F — seulement les formules générales et les règles de décision ; les exemples numériques de cette fiche sont donc des illustrations construites pour la compréhension, pas des chiffres tirés du cours.</div>
