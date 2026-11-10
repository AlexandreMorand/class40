# Session 6. Le modèle de régression logistique pour variable binaire (Logit Model)

À la fin de cette session, vous devez être capable de : définir la probabilité et la cote (odds) d'un événement et passer de l'une à l'autre ; écrire l'équation du modèle logit (logit model) pour une variable dépendante binaire Y ; interpréter le coefficient estimé bj selon que xj est quantitative ou dichotomique, via le rapport de cotes (odds ratio) ; et tester la significativité d'un coefficient individuel.

<div class="plan"><b>Plan</b><br/>1. Rappel, probabilité et cote (odds)<br/>2. Le modèle de régression logistique, variable dépendante binaire<br/>3. Équation théorique du modèle<br/>4. Estimation des paramètres<br/>5. Interpréter bj, cas d'une variable quantitative<br/>6. Interpréter bj, cas d'une variable dichotomique<br/>7. Exemple travaillé<br/>8. Test sur un coefficient individuel<br/>9. Erreurs fréquentes et pièges d'examen<br/>10. À connaître absolument</div>

## 1. Rappel, probabilité et cote (odds)

Soit E un événement, de probabilité P(E) = p. La cote (odds) de E se définit ainsi :

<div class="def"><b>ODDS = p / (1 − p)</b><br/>où p est la probabilité que l'événement E se produise, et 1 − p est la probabilité qu'il ne se produise pas.</div>

Ce que cette formule dit, étape par étape :

- La cote est le ratio entre la probabilité que l'événement se produise et la probabilité qu'il ne se produise pas.
- Elle est très utilisée dans les paris sportifs (sports betting).
- Il existe une correspondance biunivoque et croissante entre probabilité et cote :

<div class="def"><b>ODDS = p / (1 − p)  ↔  p = ODDS / (1 + ODDS)</b><br/>p varie entre 0 et 1, tandis que ODDS varie entre 0 et +∞.</div>

<div class="example"><b>Exemples numériques (slides) :</b> p = 0.5 ↔ ODDS = 1 &bull; p = 0.2 ↔ ODDS = 0.25 &bull; p = 0.75 ↔ ODDS = 3.</div>

<div class="key"><b>Must know (règle générale) :</b><br/>&bull; ODDS &gt; 1 ↔ p &gt; 0.5<br/>&bull; ODDS &lt; 1 ↔ p &lt; 0.5<br/>&bull; ODDS = 1 ↔ p = 0.5</div>

- Le modèle logit utilise en réalité le logarithme de la cote (log-odds), log(ODDS) : une fonction strictement croissante de p.
- Quand p → 0, log(ODDS) → −∞. Quand p → 1, log(ODDS) → +∞.

## 2. Le modèle de régression logistique, variable dépendante binaire

<div class="def"><b>Modèle de régression logistique (logistic regression model) :</b> modèle dans lequel la variable dépendante Y est une variable dichotomique (dichotomous), aussi appelée variable de Bernoulli ou variable dummy. Y prend la valeur 1 avec probabilité p et la valeur 0 avec probabilité 1 − p ; p représente aussi la moyenne (l'espérance E(Y)) de la variable Y.</div>

- 1 et 0 ne sont que des codes numériques représentant un événement et sa négation, respectivement.

<div class="example"><b>Exemples (slides) :</b> Y = 1 peut indiquer la faillite d'une entreprise, l'achat d'un certain produit par un consommateur, le défaut d'un débiteur, etc.</div>

## 3. Équation théorique du modèle

<div class="def"><b>p = e^(β0+β1x1+…+βpxp) / (1 + e^(β0+β1x1+…+βpxp))</b></div>

ou, de façon équivalente (c'est cette seconde formulation qui est utilisée en pratique) :

<div class="def"><b>log( p / (1 − p) ) = β0 + β1x1 + … + βpxp</b></div>

Ce que cette équation dit, étape par étape :

- Le modèle exprime la moyenne de la variable dépendante, p = E(Y), comme une fonction (non linéaire) des variables explicatives x1, …, xp.
- La seconde formulation exprime le log-odds (le logarithme de la cote) de l'événement Y = 1 comme une fonction linéaire des variables explicatives — c'est ce qui permet d'utiliser des coefficients β comme en régression linéaire.

## 4. Estimation des paramètres

- Les estimations des paramètres inconnus β0, β1, …, βp sont obtenues par la méthode du maximum de vraisemblance (Maximum Likelihood Estimation), dans laquelle nous n'entrerons pas — le logiciel R les fournit directement. On note les estimations b0, b1, …, bp.
- L'équation estimée du modèle est donc :

<div class="def"><b>log( p̂ / (1 − p̂) ) = b0 + b1x1 + … + bpxp</b><br/>où p̂ (p-hat) est la probabilité estimée de l'événement Y = 1.</div>

## 5. Interpréter bj, cas d'une variable quantitative

- On compare l'équation estimée avec xj augmentée d'une unité à l'équation estimée avec xj inchangée (les autres variables maintenues constantes).
- En soustrayant les deux équations, tous les termes s'annulent sauf bj :

<div class="def"><b>log( p̂incr / (1 − p̂incr) ) − log( p̂ / (1 − p̂) ) = bj</b></div>

- En prenant l'exponentielle des deux côtés, la différence de logarithmes devient un ratio :

<div class="def"><b>( p̂incr / (1 − p̂incr) ) ÷ ( p̂ / (1 − p̂) ) = e^bj</b></div>

<div class="def"><b>Rapport de cotes estimé (odds ratio), e^bj :</b> le ratio entre la cote de l'événement Y = 1 correspondant à xj augmentée d'une unité, et la cote du même événement correspondant à xj non augmentée, toutes les autres variables maintenues constantes.</div>

Ce que cela signifie concrètement, étape par étape :

- On estime que la cote de l'événement (Y = 1) correspondant à une augmentation d'une unité de xj est e^bj fois la cote correspondant à xj non augmentée, les autres variables étant maintenues constantes.
- Si bj > 0 (donc e^bj > 1) : la cote estimée augmente, donc la probabilité estimée de l'événement augmente aussi.
- Si bj < 0 (donc e^bj < 1) : la cote estimée diminue, donc la probabilité estimée diminue.

<div class="watch"><b>Watch out :</b> e^bj donne un facteur multiplicatif sur la cote, pas directement le changement de la probabilité. On sait dans quel sens la probabilité bouge (même sens que la cote), mais en général on ne peut pas dire précisément de combien elle augmente ou diminue à partir de bj seul.</div>

## 6. Interpréter bj, cas d'une variable dichotomique

- Même raisonnement, mais on compare xj = 1 à xj = 0 (au lieu de "+1 unité"), les autres variables étant maintenues constantes.
- On obtient exactement la même relation :

<div class="def"><b>( p̂xj=1 / (1 − p̂xj=1) ) ÷ ( p̂xj=0 / (1 − p̂xj=0) ) = e^bj</b></div>

<div class="def"><b>Rapport de cotes (odds ratio), cas dichotomique :</b> e^bj est le ratio entre la cote de l'événement Y = 1 quand xj = 1, et la cote du même événement quand xj = 0, les autres variables étant maintenues constantes.</div>

- Si bj > 0 (e^bj > 1) : la cote estimée est plus élevée (et donc la probabilité estimée de l'événement est plus grande) pour les unités où xj = 1, par rapport à celles où xj = 0.
- Si bj < 0 (e^bj < 1) : la cote estimée est plus faible quand xj = 1.

## 7. Exemple travaillé

<div class="example"><b>Exemple (slides) :</b> Y = 1 si le consommateur connaît un certain produit, Y = 0 sinon. x1 = âge du consommateur (quantitative). x2 = 1 si le consommateur est une femme, x2 = 0 si c'est un homme (dichotomique).<br/><b>Équation estimée : log(p̂/(1−p̂)) = 1.5 + 0.2x1 − 0.8x2</b></div>

Interprétation de l'effet de x1 (âge) : b1 = 0.2, donc e^0.2 = 1.2214.

- x2 étant fixé, la cote estimée de l'événement "le consommateur connaît le produit" augmente de 22.14% pour chaque année d'âge supplémentaire (elle est multipliée par 1.2214).
- La probabilité de l'événement augmente donc aussi avec l'âge (x2 fixé), mais on ne peut pas dire précisément de combien.

Interprétation de l'effet de x2 (femme/homme) : b2 = −0.8, donc e^−0.8 = 0.4493.

- x1 étant fixé, la cote estimée de l'événement pour les femmes vaut 44.93% de la cote estimée pour les hommes.
- La probabilité de l'événement est donc plus faible pour les femmes que pour les hommes (âge fixé), mais là encore on ne peut pas dire précisément de combien elle diminue.

## 8. Test sur un coefficient individuel

Une estimation bj différente de 0 ne garantit pas que la variable xj a un effet réel dans la population : il faut un test d'hypothèse sur βj.

<div class="def"><b>Test sur un coefficient individuel :</b> H0 : βj = 0 contre H1 : βj ≠ 0. Rejeter H0 signifie conclure (avec une marge d'erreur donnée par le niveau de signification du test) que xj a un effet dans la population, c'est-à-dire que la variable xj est significative.</div>

Le test repose sur une statistique Z, ratio entre le coefficient estimé et son erreur standard (standard error) :

<div class="def"><b>zoss = bj / SE(bj)</b></div>

Ce que cette formule dit, étape par étape :

- Sous H0, cette statistique suit approximativement une loi normale standard.
- On rejette H0 au niveau de signification α (c'est-à-dire que xj est considérée significative à ce niveau) si |zoss| > zα/2.
- De façon équivalente, on rejette H0 si p-value = 2·P(Z > |zoss|) &lt; α.
- C'est exactement la même logique de décision par p-value que dans tous les tests déjà vus en régression linéaire (Sessions 1 à 5).

## 9. Erreurs fréquentes et pièges d'examen

- Confondre probabilité et cote (odds) — elles ne varient pas sur la même échelle (p entre 0 et 1, ODDS entre 0 et +∞), et une variation de la cote n'est pas une variation identique de la probabilité.
- Interpréter e^bj comme un changement direct de probabilité au lieu d'un rapport de cotes (odds ratio) — on ne peut affirmer que le sens du changement de probabilité, pas son ampleur exacte, à partir de bj seul.
- Oublier de préciser "toutes les autres variables maintenues constantes" en interprétant bj — l'interprétation n'est valable que toutes choses égales par ailleurs.
- Pour une variable dichotomique, comparer xj = 1 à xj = 0 en pensant qu'il s'agit d'un "+1 unité" comme pour une variable quantitative continue — la logique de la dérivation est identique, mais l'interprétation porte sur deux catégories, pas sur une unité de mesure.
- Croire qu'un bj non nul suffit à conclure que xj a un effet dans la population — il faut toujours passer par le test sur le coefficient individuel (Section 8).

## 10. À connaître absolument

<div class="key"><b>Must know :</b><br/>&bull; ODDS = p/(1−p) ; correspondance croissante avec p ; le modèle logit modélise le log de la cote comme fonction linéaire des x<br/>&bull; log(p̂/(1−p̂)) = b0 + b1x1 + … + bpxp, estimé par maximum de vraisemblance<br/>&bull; e^bj = rapport de cotes (odds ratio), toutes les autres variables maintenues constantes ; variable quantitative → effet d'une hausse d'une unité ; variable dichotomique → effet de xj=1 vs xj=0<br/>&bull; bj &gt; 0 → cote (et probabilité) plus élevée ; bj &lt; 0 → cote (et probabilité) plus faible<br/>&bull; Test individuel : zoss = bj/SE(bj), comparé à zα/2, ou p-value &lt; α → même logique que pour la régression linéaire</div>

## Points de vigilance

<div class="watch"><b>Watch out :</b> les slides ne détaillent pas le calcul du maximum de vraisemblance (Maximum Likelihood Estimation) lui-même — il faut savoir que c'est la méthode utilisée et que R la met en œuvre, sans avoir à la calculer à la main.</div>
