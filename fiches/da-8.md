# Session 8. Le modèle logit multinomial pour variable qualitative à plus de 2 catégories

À la fin de cette session, vous devez être capable de : reconnaître quand utiliser un modèle logit multinomial (multinomial logit model) plutôt qu'un modèle logit binaire ; écrire les k−1 équations du modèle par rapport à une catégorie de référence ; interpréter un coefficient estimé bji pour une variable quantitative ou dichotomique ; tester la significativité d'un coefficient individuel ; et calculer une prédiction de probabilités pour chaque catégorie.

<div class="plan"><b>Plan</b><br/>1. Quand utiliser le modèle multinomial<br/>2. Équations théoriques du modèle<br/>3. Estimation des paramètres<br/>4. Interpréter un coefficient, cas d'une variable quantitative<br/>5. Interpréter un coefficient, cas d'une variable dichotomique<br/>6. Test sur un coefficient individuel<br/>7. Prédiction des probabilités<br/>8. Exemple travaillé complet en R<br/>9. Erreurs fréquentes et pièges d'examen<br/>10. À connaître absolument</div>

## 1. Quand utiliser le modèle multinomial

<div class="def"><b>Modèle logit multinomial (multinomial logit model) :</b> modèle logistique pour une variable dépendante qualitative à k &gt; 2 catégories. Si k = 2, on retrouve exactement le modèle logit binaire de la Session 6.</div>

- On note A1, A2, …, Ak les k catégories de la variable dépendante, et p1, p2, …, pk les probabilités correspondantes (avec ∑pi = 1).
- Le modèle se formule avec k−1 équations, qui expriment la cote conditionnelle (conditional odds) de k−1 des k catégories en fonction des variables explicatives.

## 2. Équations théoriques du modèle

On choisit l'une des k catégories comme catégorie de référence (reference category), par exemple A1. Les équations expriment le log-odds (conditionnel) de A2, A3, …, Ak par rapport à A1 :

<div class="def"><b>log(p2/p1) = β02 + β12x1 + … + βp2xp</b><br/><b>…</b><br/><b>log(pk/p1) = β0k + β1kx1 + … + βpkxp</b></div>

Ce que cette structure dit, étape par étape :

- Il y a une équation séparée pour chaque catégorie non-référence (A2 à Ak), chacune avec son propre jeu de coefficients β.
- Les coefficients d'une même variable sont en général différents d'une équation à l'autre (β12 ≠ β13 en général).
- Ces log-odds sont dits conditionnels car ils ne portent que sur deux événements à la fois, Ai et la catégorie de référence A1 — dans cette vision "conditionnelle", Ai et A1 sont traités comme complémentaires, et le ratio pi/p1 représente une cote (odds) ordinaire.
- Comme en régression linéaire et en logit binaire, le membre de droite de chaque équation peut inclure des variables quantitatives, des variables dichotomiques, des interactions et des transformations.

## 3. Estimation des paramètres

Les estimations des paramètres β0i, β1i, …, βpi, pour i = 2, 3, …, k, sont obtenues par maximum de vraisemblance (maximum likelihood), fournies par R. On les note b0i, b1i, …, bpi. Les équations estimées du modèle sont donc :

<div class="def"><b>log(p̂2/p̂1) = b02 + b12x1 + … + bp2xp</b><br/><b>…</b><br/><b>log(p̂k/p̂1) = b0k + b1kx1 + … + bpkxp</b></div>

## 4. Interpréter un coefficient, cas d'une variable quantitative

Soit x1 une variable quantitative ; concentrons-nous sur la première équation (A2 vs A1).

- L'estimation b12, effet de x1 sur la cote de A2 vs A1, indique comment le log-odds estimé de A2 par rapport à A1 change quand x1 augmente d'une unité, les autres variables maintenues constantes.
- Autrement dit, toutes choses égales par ailleurs, une hausse d'une unité de x1 est associée à un changement en pourcentage de la cote de A2 vs A1 égal à : **(e^b12 − 1) × 100%**
- Si b12 &gt; 0, la cote estimée augmente. Si b12 &lt; 0, la cote estimée diminue.
- Exactement la même logique s'applique à n'importe quelle autre équation (par exemple b13 pour A3 vs A1).

## 5. Interpréter un coefficient, cas d'une variable dichotomique

Soit x2 une variable dichotomique (dummy) ; toujours sur la première équation (A2 vs A1).

- L'estimation b22, effet de x2 sur la cote de A2 vs A1, indique comment le log-odds estimé de A2 par rapport à A1 change quand x2 passe de la catégorie codée 0 à la catégorie codée 1, les autres variables maintenues constantes.
- Le changement en pourcentage de la cote de A2 vs A1, quand x2 = 1 comparé à x2 = 0, toutes les autres variables étant fixées, est donné par : **(e^b22 − 1) × 100%**
- Si b22 &gt; 0, la cote estimée est plus élevée quand x2 = 1. Si b22 &lt; 0, la cote estimée est plus faible quand x2 = 1.

## 6. Test sur un coefficient individuel

<div class="def"><b>Test sur un coefficient individuel (modèle multinomial) :</b> H0 : βji = 0 contre H1 : βji ≠ 0. Rejeter H0 signifie conclure (avec une marge d'erreur donnée par le niveau de signification du test) que xj a un effet sur la cote conditionnelle de Ai par rapport à A1 dans la population.</div>

Comme en Session 6, le test repose sur une statistique donnée par le ratio entre le coefficient estimé et son erreur standard, qui suit approximativement une loi normale standard sous H0 :

<div class="def"><b>zoss = bji / SE(bji)</b></div>

On rejette H0 au niveau α (et on conclut à un effet) si |zoss| &gt; zα/2, ou de façon équivalente si p-value = 2·P(Z &gt; |zoss|) &lt; α.

<div class="watch"><b>Watch out :</b> il est aussi possible de tester des groupes de coefficients ou l'ensemble des coefficients du modèle multinomial, avec des statistiques suivant une loi du chi-carré (comme en Session 7) — mais les slides précisent explicitement que ces tests ne sont pas couverts dans ce cours ("we will not cover them here"). Ne pas chercher à les calculer pour l'examen.</div>

## 7. Prédiction des probabilités

Comme toujours, les prédictions s'obtiennent en substituant les valeurs des variables explicatives dans les équations estimées, pour les conditions sous lesquelles on veut prédire. Cette substitution donne k−1 équations dans les k inconnues p̂i, qui, combinées à la contrainte ∑p̂i = 1, permettent d'obtenir les estimations des probabilités souhaitées.

Ce que cela signifie, étape par étape (méthode générale) :

- Substituer les valeurs fixées des x dans chacune des k−1 équations de log-odds → obtenir k−1 valeurs numériques.
- Prendre l'exponentielle de chaque équation → obtenir k−1 ratios p̂i/p̂1.
- Résoudre le système linéaire formé par ces k−1 ratios et par la contrainte p̂1 + p̂2 + … + p̂k = 1, pour obtenir chaque p̂i individuellement.
- En pratique, R effectue directement ce calcul (fonction `predict` avec type="probs").

## 8. Exemple travaillé complet en R

<div class="example"><b>Contexte, exemple marques (slides) :</b> A1, A2, A3 sont trois marques d'un même type de produit. Y = marque préférée par un consommateur donné. x1 = âge du consommateur. x2 = 1 si le consommateur est un homme, 0 si c'est une femme. A1 est prise comme catégorie de référence.<br/><b>Équations estimées :</b><br/>log(p̂2/p̂1) = 1.2 + 0.03x1 − 0.6x2<br/>log(p̂3/p̂1) = 1.1 + 0.01x1 + 0.4x2</div>

Effet de x1 (âge), x2 fixé : b12 = 0.03 (e^0.03 = 1.0305) et b13 = 0.01 (e^0.01 = 1.0101).

- Une année d'âge supplémentaire est associée à une hausse estimée de 3.05% de la cote de préférer la marque A2 plutôt que A1.
- Une année d'âge supplémentaire est associée à une hausse estimée de 1.01% de la cote de préférer la marque A3 plutôt que A1.

Effet de x2 (homme/femme), x1 fixé : b22 = −0.6 (e^−0.6 = 0.5488) et b23 = 0.4 (e^0.4 = 1.4918).

- Pour un homme, la cote de préférer A2 plutôt que A1 est estimée 45.12% plus basse que pour une femme (puisque (0.5488−1)×100% ≈ −45.12%).
- Pour un homme, la cote de préférer A3 plutôt que A1 est estimée 49.18% plus haute que pour une femme (puisque (1.4918−1)×100% ≈ 49.18%).

Prédiction pour une consommatrice de 30 ans (x1 = 30, x2 = 0) :

- log(p̂2/p̂1) = 1.2 + 0.03×30 − 0.6×0 = 2.1 → p̂2/p̂1 = e^2.1 = 8.1662
- log(p̂3/p̂1) = 1.1 + 0.01×30 + 0.4×0 = 1.4 → p̂3/p̂1 = e^1.4 = 4.0552
- En résolvant p̂2 = 8.1662·p̂1, p̂3 = 4.0552·p̂1, p̂1+p̂2+p̂3 = 1 → p̂1 = 0.0757, p̂2 = 0.6175, p̂3 = 0.3068.

<div class="example"><b>Deuxième contexte, exemple étudiants (slides, <code>multinom()</code> du package <code>nnet</code> en R) :</b> 200 étudiants avant leur entrée au lycée, choix entre 3 filières (program) : general (catégorie de référence choisie par R), academic, vocation. Variables explicatives : score (niveau de préparation) et ses (statut socio-économique, low/middle/high, low = référence).<br/><b>Coefficients estimés (<code>summary(mod1)</code>) :</b> équation academic vs general → score = 0.0579, sesmiddle = 0.5333, seshigh = 1.1628 ; équation vocation vs general → score = −0.0557, sesmiddle = 0.8246, seshigh = 0.1802.</div>

- Interprétation de score (academic vs general) : e^0.0579 = 1.0596 → toutes choses égales, une hausse d'un point de score est associée à une hausse estimée de 5.96% de la cote de choisir academic plutôt que general.
- Interprétation de seshigh (vocation vs general) : e^0.1802 = 1.1975 → à score égal, la cote de choisir vocation plutôt que general est estimée 19.75% plus élevée pour un statut socio-économique élevé (high) que pour un statut bas (low, référence).
- Tests individuels (z-value = estimation/erreur standard, p-values via pnorm) : score est significatif au seuil 0.05 dans les deux équations ; au seuil 0.05, seul seshigh est significatif dans l'équation academic vs general.
- Prédiction pour un étudiant avec score = 50 et ses = middle (`predict(mod1, ..., type="probs")`) : probabilité general ≈ 0.2334, academic ≈ 0.4159, vocation ≈ 0.3507.

## 9. Erreurs fréquentes et pièges d'examen

- Oublier qu'un modèle multinomial à k catégories nécessite k−1 équations, jamais k — la catégorie de référence n'a pas sa propre équation, elle sert de point de comparaison pour toutes les autres.
- Interpréter un coefficient bji comme un effet sur la probabilité brute pi, alors qu'il s'agit toujours d'un effet sur la cote conditionnelle de Ai par rapport à la catégorie de référence A1 uniquement.
- Comparer directement deux coefficients de deux équations différentes (par exemple b12 et b13) comme s'ils décrivaient le même contraste — chaque équation compare une catégorie différente à la même référence, ce ne sont pas des effets directement comparables entre eux sans précaution.
- Oublier de préciser par rapport à quelle catégorie de référence un coefficient est interprété — l'interprétation n'a de sens que "vs la catégorie de référence".
- Essayer de calculer à la main un test de groupe de coefficients ou du modèle entier pour le modèle multinomial — explicitement hors programme (voir Section 6).

## 10. À connaître absolument

<div class="key"><b>Must know :</b><br/>&bull; Modèle multinomial = k−1 équations de log-odds conditionnels, chaque catégorie non-référence comparée à la catégorie de référence A1<br/>&bull; log(pi/p1) = β0i + β1ix1 + … + βpixp, coefficients différents pour chaque i, estimés par maximum de vraisemblance<br/>&bull; Interprétation d'un coefficient bji : (e^bji−1)×100% = changement en % de la cote de Ai vs A1, toutes les autres variables fixées<br/>&bull; Test individuel zoss = bji/SE(bji), même logique que le modèle binaire ; tests de groupe/global explicitement hors programme<br/>&bull; Prédiction : substituer les x dans les k−1 équations → exponentielle → résoudre le système avec ∑p̂i=1 (R le fait directement avec type="probs")</div>

## Points de vigilance

<div class="watch"><b>Watch out :</b> dans l'exemple étudiants, R choisit automatiquement "general" comme référence pour program et "low" comme référence pour ses (l'ordre alphabétique/naturel des catégories) — toujours vérifier explicitement quelle catégorie R a prise comme référence avant d'interpréter les coefficients, plutôt que de le supposer.</div>
