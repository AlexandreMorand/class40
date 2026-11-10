# Session 7. Modèle logit, significativité, prédiction et qualité du modèle

À la fin de cette session, vous devez être capable de : tester la significativité conjointe d'un groupe de variables et du modèle entier avec le test du chi-carré (chi-square test / LRT) ; calculer une prédiction (log-odds, cote, probabilité, valeur de Y) à partir d'un modèle logit estimé ; et évaluer la qualité d'un modèle logit avec le taux de bonnes prédictions et l'AIC.

<div class="plan"><b>Plan</b><br/>1. Pourquoi un nouveau test, au-delà du test individuel<br/>2. Deux questions, test partiel et test global<br/>3. La déviance résiduelle (residual deviance)<br/>4. La statistique du chi-carré et la règle de décision<br/>5. Prédiction à partir d'un modèle logit<br/>6. Évaluer la qualité d'un modèle, taux de bonnes prédictions et AIC<br/>7. Exemple travaillé complet en R<br/>8. Erreurs fréquentes et pièges d'examen<br/>9. À connaître absolument</div>

## 1. Pourquoi un nouveau test, au-delà du test individuel

- Le test vu en Session 6 (statistique Z) ne teste qu'un seul coefficient à la fois.
- Comme en régression linéaire multiple, on a aussi besoin de savoir si plusieurs coefficients sont significatifs ensemble, ou si le modèle dans son entier apporte quelque chose par rapport à l'absence de modèle.
- Ces questions se répondent avec des tests basés sur des statistiques qui suivent (approximativement) une loi du chi-carré (chi-square distribution).

## 2. Deux questions, test partiel et test global

- **Question 1 (test sur un groupe de variables) :** dans un modèle avec x1, …, xq, xq+1, …, xp, les variables xq+1, …, xp sont-elles conjointement significatives ? Autrement dit, entre les deux modèles emboîtés (nested models) Mréd (seulement x1, …, xq) et Mcompl (toutes les variables x1, …, xp), lequel choisir, sachant que le second est plus complexe ?
- **Question 2 (test global) :** le modèle avec x1, …, xp est-il globalement significatif ? Autrement dit, doit-on préférer ce modèle au modèle nul (null model), celui sans aucune variable explicative ?
- La question 2 est un cas particulier de la question 1, avec q = 0 (Mréd = modèle nul).

<div class="def"><b>Test partiel (sur un groupe de variables) :</b> H0 : βq+1 = βq+2 = … = βp = 0 contre H1 : au moins un de ces coefficients est différent de 0.<br/><b>Test global (du modèle entier) :</b> H0 : β1 = β2 = … = βp = 0 contre H1 : au moins un des coefficients est différent de 0.<br/>On les appelle respectivement le test du chi-carré partiel et le test du chi-carré global.</div>

## 3. La déviance résiduelle (residual deviance)

La statistique de test se construit à partir de deux quantités associées à un modèle logit estimé M :

<div class="def"><b>Déviance résiduelle (residual deviance) :</b> RES.DEV = −2·log L(M), où L(M) est le maximum de vraisemblance (maximum likelihood) associé au modèle M.<br/><b>Degrés de liberté résiduels (residual degrees of freedom) :</b> n − p − 1, où n est la taille de l'échantillon et p le nombre de variables explicatives du modèle.</div>

- Plus la déviance résiduelle est faible, mieux le modèle s'ajuste aux données (dans la même logique que la somme des carrés résiduels en régression linéaire).

## 4. La statistique du chi-carré et la règle de décision

Test sur un groupe de variables :

<div class="def"><b>χ² = RES.DEV.(Mréd) − RES.DEV.(Mcompl)</b><br/>Sous H0, cette statistique suit approximativement une loi du chi-carré à p − q degrés de liberté (la différence entre les degrés de liberté résiduels des deux modèles).</div>

Test global :

<div class="def"><b>χ² = RES.DEV.(Mnull) − RES.DEV.(Mcompl)</b><br/>Sous H0, cette statistique suit approximativement une loi du chi-carré à p degrés de liberté (puisque q = 0 dans le modèle nul).</div>

Ce que ces formules disent, étape par étape :

- Dans les deux cas, on calcule la différence de déviance résiduelle entre le modèle réduit et le modèle complet.
- Si le modèle complet apporte vraiment quelque chose, sa déviance résiduelle est nettement plus faible que celle du modèle réduit, donc χ² est grand.
- On rejette H0 au niveau α si χ²oss > χ²α (le quantile de la loi du chi-carré appropriée), ou de façon équivalente si p-value = P(χ² > χ²oss) &lt; α.

<div class="def"><b>LRT (Likelihood Ratio Test) :</b> autre nom pour ces tests du chi-carré, car ils reposent sur la fonction de vraisemblance (likelihood function).</div>

- Comme en régression linéaire, le modèle logit peut aussi inclure des transformations de variables explicatives et des interactions entre variables explicatives — les objectifs et procédures sont les mêmes que pour la régression linéaire (Sessions 1 à 3).

## 5. Prédiction à partir d'un modèle logit

À partir de l'équation estimée, on peut prédire, pour des valeurs fixées des variables explicatives : le log-odds de l'événement Y = 1 (ou de sa négation), la cote (odds) de l'événement Y = 1 (ou de sa négation), la probabilité de l'événement Y = 1 (ou de sa négation), la valeur de Y elle-même (0 ou 1).

<div class="def"><b>log( p̂0 / (1 − p̂0) ) = b0 + b1x10 + … + bpxp0</b></div>

Ce que cette formule dit, étape par étape :

- On fixe les valeurs des variables explicatives pour lesquelles on veut prédire, x1 = x10, …, xp = xp0.
- La prédiction du log-odds s'obtient par simple substitution dans l'équation estimée.
- La prédiction de la cote s'obtient en prenant l'exponentielle du log-odds prédit.
- La prédiction de la probabilité s'obtient ensuite via la relation entre cote et probabilité (Section 1 de la Session 6).
- En pratique, R fournit directement la prédiction avec la fonction `predict`.
- Pour prédire la valeur de Y (0 ou 1), on utilise généralement (mais pas obligatoirement) un seuil de 0.5 : ŷ0 = 1 si p̂0 ≥ 0.5 ; ŷ0 = 0 si p̂0 &lt; 0.5.

## 6. Évaluer la qualité d'un modèle, taux de bonnes prédictions et AIC

- Pour évaluer la capacité prédictive d'un modèle logit, on compare les valeurs prédites de Y (0/1) pour les unités de l'échantillon avec les valeurs réellement observées.
- La proportion (ou le pourcentage) de "bonnes" prédictions (valeur prédite et valeur observée toutes deux égales à 1, ou toutes deux égales à 0) donne une indication de la qualité prédictive du modèle.

<div class="def"><b>AIC (Akaike Information Criterion) :</b> indicateur descriptif de la qualité globale d'un modèle logit, défini par AIC = −2·log L(M) + 2(p+1), où −2·log L(M) est la déviance résiduelle du modèle et p le nombre de variables explicatives.</div>

- L'AIC tient compte à la fois de la capacité explicative du modèle (via la déviance résiduelle) et de sa complexité (via p).
- Un modèle est considéré meilleur, selon ce critère, si son AIC est plus faible.

<div class="watch"><b>Watch out :</b> pour comparer des modèles emboîtés (nested models), l'outil le plus approprié reste le test du chi-carré partiel (Section 4), pas l'AIC seul — l'AIC est surtout utile pour comparer des modèles qui ne sont pas nécessairement emboîtés.</div>

## 7. Exemple travaillé complet en R

<div class="example"><b>Contexte (slides, exemple assurance) :</b> échantillon de 200 sinistres. HC = 1 si l'indemnisation est considérée élevée ("high compensation"), 0 sinon. AGE = âge du conducteur responsable. VC = catégorie du véhicule (A, B ou C). Modèle logit avec HC comme variable dépendante, AGE et VC comme variables explicatives.</div>

Sortie R (`glm(HC~AGE+VC, data=CL, binomial(logit))`) :

- Coefficient AGE = −0.0389, significatif au seuil 0.05 (mais pas au seuil 0.01). Comme e^−0.0389 = 0.9618, une année supplémentaire d'âge est associée à une baisse estimée d'environ 3.82% de la cote d'avoir un sinistre élevé, catégorie de véhicule maintenue constante.
- Coefficient VCB (catégorie B vs A) = 1.1268, significatif au seuil 0.05. Comme e^1.1268 = 3.0858, la cote estimée d'un sinistre élevé pour un véhicule de catégorie B est environ 3 fois celle d'un véhicule de catégorie A, âge maintenu constant.
- Coefficient VCC (catégorie C vs A) : interprétation analogue, significatif à tout seuil raisonnable.
- Déviance résiduelle = 159.84 ; AIC = 167.84 = 159.84 + 2×(p+1) avec p = 3.
- Test global (comparaison avec le modèle nul, `anova(model0, model1, test="Chisq")`) : χ² = 77.344, 3 degrés de liberté, p-value &lt; 2.2·10−16 → le modèle est globalement significatif, H0 rejetée.
- Test partiel sur VC (comparaison entre le modèle avec AGE seul et le modèle avec AGE + VC, `anova(model2, model1, test="Chisq")`) : χ² = 69.202, 2 degrés de liberté (VC entre avec 2 dummies), p-value ≈ 0 → VC est globalement significative dans ce modèle, elle améliore nettement la capacité explicative par rapport au modèle avec AGE seul.

Prédiction pour un sinistre catégorie B, conducteur de 50 ans (50 est dans l'intervalle des âges observés, la prédiction est donc raisonnable) :

- `predict(model1, data.frame(AGE=50, VC="B"), type="response")` → probabilité prédite ≈ 0.1863.
- Sans l'option type="response", predict renvoie le log-odds prédit (≈ −1.4739) ; en prenant l'exponentielle on retrouve la cote prédite (≈ 0.2290), cohérente avec 0.1863/(1−0.1863) ≈ 0.2290.

Évaluation de la qualité prédictive (matrice de confusion, seuil 0.5 sur les 200 sinistres de l'échantillon) :

- 128 cas prédits "pas de sinistre élevé" et effectivement pas de sinistre élevé.
- 40 cas prédits "sinistre élevé" et effectivement un sinistre élevé.
- Au total 168 cas sur 200 correctement prédits, soit 84% de bonnes prédictions.

## 8. Erreurs fréquentes et pièges d'examen

- Utiliser le test individuel (statistique Z, Session 6) pour tester la significativité d'un groupe de variables au lieu du test du chi-carré — le test individuel ne teste qu'un coefficient à la fois.
- Oublier que le test global n'est qu'un cas particulier du test partiel, avec le modèle nul comme modèle réduit (q = 0).
- Comparer directement deux déviances résiduelles sans tenir compte des degrés de liberté correspondants (p − q pour le test partiel, p pour le test global).
- Confondre AIC et test du chi-carré partiel : l'AIC compare des modèles (emboîtés ou non) par un seul chiffre à minimiser, le test du chi-carré partiel donne une p-value et une décision statistique formelle pour des modèles emboîtés.
- Oublier de vérifier que les valeurs des variables explicatives utilisées pour une prédiction sont raisonnables (dans l'intervalle des données observées), exactement comme en régression linéaire.
- Interpréter directement le log-odds prédit ou la cote prédite comme une probabilité — il faut repasser par la relation cote/probabilité (ou utiliser type="response" dans R) pour obtenir une probabilité.

## 9. À connaître absolument

<div class="key"><b>Must know :</b><br/>&bull; Test sur un groupe de variables (test partiel) et test du modèle entier (test global) sont deux tests du chi-carré (LRT), basés sur la différence de déviance résiduelle entre modèle réduit et modèle complet<br/>&bull; χ² = RES.DEV.(réduit) − RES.DEV.(complet), ddl = différence des ddl résiduels des deux modèles ; rejeter H0 si χ²oss &gt; χ²α ou p-value &lt; α<br/>&bull; AIC = −2logL(M) + 2(p+1) ; modèle meilleur si AIC plus faible ; utile surtout pour comparer des modèles non nécessairement emboîtés<br/>&bull; Prédiction : log-odds par substitution → cote par exponentielle → probabilité via la relation cote/probabilité ; valeur de Y prédite = 1 si p̂ ≥ 0.5 (seuil par défaut)<br/>&bull; Qualité prédictive évaluée par le taux de bonnes prédictions (matrice de confusion, valeurs prédites vs observées)</div>

## Points de vigilance

<div class="watch"><b>Watch out :</b> le seuil de 0.5 pour prédire ŷ à partir de p̂ est celui utilisé par défaut dans les slides, mais elles précisent explicitement qu'un seuil différent reste possible selon le contexte ("it is also possible to use a different threshold") — ne pas traiter 0.5 comme une règle absolue et fixe.</div>
