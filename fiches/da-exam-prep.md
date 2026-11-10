# Révision des bases — Premier In-Class Test (basé sur le mock quiz de 22 questions, dataset SUPERMARKET)

À la fin de cette fiche, vous devez être capable de : écrire l'équation d'un modèle de régression multiple avec des variables muettes, interpréter correctement chaque type de coefficient, tester la significativité d'une variable seule (test t) ou d'un groupe de variables (test F partiel), construire et lire un intervalle de confiance, juger si une prédiction est raisonnable, comparer deux modèles emboîtés ou non emboîtés, et faire le pont vers les données de panel (effets fixes, test de Hausman) vu en fin de quiz.

<div class="plan"><b>Plan</b><br/>1. Le modèle de régression multiple avec variables muettes<br/>2. Interpréter un coefficient : variable quantitative vs variable muette<br/>3. Tester la significativité d'une seule variable : le test t<br/>4. Intervalles de confiance pour les coefficients et pour une prédiction<br/>5. Prédiction et son caractère "raisonnable"<br/>6. Comparer deux modèles emboîtés : le test F partiel<br/>7. Comparer deux modèles non emboîtés : R² ajusté<br/>8. Significativité globale du modèle : test F global, R² et R² ajusté<br/>9. Passage aux données de panel : effets fixes et test de Hausman<br/>10. Fonctions R à connaître par cœur<br/>11. Erreurs fréquentes et pièges d'examen<br/>12. À connaître absolument</div>

## 1. Le modèle de régression multiple avec variables muettes

<div class="example"><b>Exemple fil rouge (dataset SUPERMARKET, dataframe SUP, 150 supermarchés) :</b> CN (nombre de clients quotidien) expliqué par S (surface en m², quantitative), HD (livraison à domicile, "yes"/"no") et AE (facilité d'accès, "low"/"average"/"high").</div>

- **Règle des k−1 muettes.** Pour intégrer une variable qualitative à k catégories dans un modèle, il faut introduire k−1 variables muettes, qui identifient k−1 des k catégories. La catégorie manquante devient la catégorie de référence (reference category), automatiquement absorbée dans l'intercept.
- HD a 2 catégories → 1 seule muette : HDyes (référence : "no").
- AE a 3 catégories → 2 muettes : AEaverage, AEhigh (référence : "low").

<div class="def"><b>CN = β0 + βS·S + βHDyes·HDyes + βAEaverage·AEaverage + βAEhigh·AEhigh + ε</b><br/>où β0 est la valeur moyenne de CN pour la catégorie de référence (HD = "no", AE = "low") quand S = 0 ; βS est l'effet marginal de S, toutes les autres variables étant fixées ; βHDyes, βAEaverage, βAEhigh sont des écarts par rapport à la catégorie de référence, pas des niveaux absolus.</div>

Ce que ça calcule concrètement, étape par étape :

- On commence toujours par repérer la catégorie de référence (celle qui n'a pas de muette dans l'équation) — c'est elle qui sert de point de comparaison à toutes les autres.
- Chaque coefficient de muette (βHDyes, βAEaverage, βAEhigh) se lit comme "la différence moyenne de CN par rapport à la référence, à S et aux autres variables fixés".
- En R, avec les contrastes de traitement usuels, la référence est le premier niveau du facteur. Vérifier `levels(SUP$HD)` et `levels(SUP$AE)`, puis utiliser `relevel()` pour changer la référence si nécessaire. Ici, la sortie affiche HDyes, AEaverage et AEhigh, donc les références sont "no" et "low". Ce choix observé ne vient pas d'un ordre alphabétique qui placerait "low" avant "average" ou "high".

<div class="watch"><b>Watch out :</b> une équation qui garde toutes les catégories d'une variable qualitative en même temps (par exemple HDyes ET HDno, ou les 3 niveaux de AE) est fausse — c'est de la colinéarité parfaite avec l'intercept, la règle k−1 doit toujours être respectée.</div>

## 2. Interpréter un coefficient : variable quantitative vs variable muette

Sortie R de référence (`mod1 <- lm(CN ~ S + HD + AE, data = SUP)`) : Intercept 78.5686 • S 1.3578 (se 0.1414) • HDyes 64.1552 (se 67.0423) • AEaverage 3.3731 (se 77.5183) • AEhigh 22.8031 (se 86.0397)

### 2.1 Variable quantitative (S)

- Une augmentation d'une unité de S est associée à une augmentation moyenne de 1.3578 clients, toutes les autres variables étant fixées (à n'importe quel niveau — HD et AE peuvent être fixés à n'importe quelle combinaison, l'effet ne change pas).
- Une augmentation de c unités de S est associée à un changement moyen de c × 1.3578 (le modèle est linéaire dans S).
- Le coefficient 1.3578 est l'estimation, 0.1414 est son erreur standard (standard error) — ne jamais confondre les deux : l'erreur standard sert à construire le test/l'intervalle de confiance, pas à mesurer l'effet lui-même.

### 2.2 Variable muette (HDyes, AEaverage, AEhigh)

- HDyes = 64.1552 : les supermarchés avec livraison à domicile ont, en moyenne, 64.1552 clients de plus que ceux sans livraison, à S et AE fixés.
- AEaverage = 3.3731 et AEhigh = 22.8031 : écarts par rapport à AE = "low" (la référence), à S et HD fixés.
- Le raisonnement "l'effet d'une variable est le même quels que soient les niveaux fixés des autres" (additivité) s'applique aussi aux muettes tant qu'il n'y a pas de terme d'interaction dans le modèle.

<div class="key"><b>Must know :</b><br/>&bull; Coefficient d'une quantitative → effet marginal par unité, valable à n'importe quel niveau des autres variables<br/>&bull; Coefficient d'une muette → écart moyen par rapport à la catégorie de référence, autres variables fixées<br/>&bull; Ne jamais lire l'erreur standard (std. error) comme si c'était le coefficient</div>

## 3. Tester la significativité d'une seule variable : le test t

<div class="def"><b>Test t (t-test) sur un coefficient :</b> teste si une variable explicative a un effet réel sur Y, une fois les autres variables du modèle prises en compte.<br/><b>H0 : βj = 0</b> contre <b>H1 : βj ≠ 0</b><br/>où βj est le coefficient (population) de la variable testée ; la statistique de test est le t value donné par R (colonne "t value" de summary()), calculé comme estimate / std. error.</div>

Ce que ça calcule concrètement, étape par étape :

- On lit directement la ligne de la variable dans `summary(mod1)` : par exemple pour S, t value = 9.601 (= 1.3578 / 0.1414).
- On compare la p-value (colonne "Pr(&gt;|t|)") au seuil choisi (souvent 0.05) : p-value &lt; seuil → on rejette H0, la variable est significative.
- Dans mod1 : seule S est significative au seuil 0.05 (p-value &lt; 2e-16). HDyes (p = 0.340), AEaverage (p = 0.965) et AEhigh (p = 0.791) ne le sont pas individuellement.

<div class="watch"><b>Watch out :</b> un test t sur une seule muette d'une variable à plusieurs catégories (ex. AEaverage seule) ne dit rien sur la pertinence globale de la variable AE — il faut un test F partiel sur le groupe complet de muettes (Section 6).</div>

## 4. Intervalles de confiance pour les coefficients et pour une prédiction

`confint(mod1, level = 0.99)`

Ce que ça calcule concrètement, étape par étape :

- Donne, pour chaque coefficient, une fourchette de valeurs plausibles pour βj au niveau de confiance choisi (ici 99%).
- Exemple pour HDyes : [−110.84 ; 239.15] au niveau 99% → l'écart moyen de clientèle entre "avec" et "sans" livraison, toutes autres variables fixées, se situe avec 99% de confiance dans cette fourchette (qui contient 0, cohérent avec un test t non significatif).
- Règle générale à retenir : plus le niveau de confiance demandé est élevé (99% &gt; 95% &gt; 90%), plus l'intervalle est long, toutes choses égales par ailleurs.
- Intervalle pour une moyenne (expected value) vs intervalle pour une observation individuelle (prediction interval) : au même niveau de confiance, l'intervalle pour la valeur moyenne prédite (mean/expected value) est toujours plus court que l'intervalle pour la valeur d'une observation individuelle, parce que ce dernier ajoute la variance de l'erreur individuelle à l'incertitude sur la moyenne.

<div class="key"><b>Must know :</b><br/>&bull; Confiance ↑ → intervalle plus long (à variables/données fixées)<br/>&bull; Intervalle pour la moyenne toujours &lt; intervalle pour une observation individuelle, au même niveau de confiance</div>

## 5. Prédiction et son caractère "raisonnable"

`predict(mod1, data.frame(S = 500, HD = "yes", AE = "low"))`

Ce que ça calcule concrètement, étape par étape :

- On remplace chaque variable explicative par la valeur demandée dans l'équation estimée : 78.5686 + 1.3578×500 + 64.1552×1 + 3.3731×0 + 22.8031×0 = 821.633 clients prédits en moyenne.
- Pour juger si cette prédiction est raisonnable, deux conditions à vérifier avec `summary(SUP)` : chaque variable quantitative utilisée pour la prédiction (ici S = 500) doit tomber dans la plage observée dans l'échantillon (ici S va de 341.8 à 1500 → 500 est dans la plage, donc OK) ; chaque catégorie utilisée pour une variable qualitative (ici HD = "yes", AE = "low") doit être présente dans l'échantillon.
- Une prédiction hors de la plage observée des quantitatives (extrapolation) n'est pas fiable, même si le calcul algébrique reste possible.

<div class="watch"><b>Watch out :</b> "raisonnable" ne veut jamais dire "positif" ou "de bon sens intuitif" — c'est uniquement une question de savoir si la combinaison de valeurs demandée a un équivalent dans les données observées.</div>

## 6. Comparer deux modèles emboîtés : le test F partiel

<div class="def"><b>Modèles emboîtés (nested models) :</b> le modèle réduit (mod3) ne contient qu'un sous-ensemble des variables du modèle complet (mod1) — ici mod3 = CN ~ S + HD est emboîté dans mod1 = CN ~ S + HD + AE.</div>

<div class="def"><b>H0 : βAEaverage = βAEhigh = 0</b><br/><code>mod3 &lt;- lm(CN ~ S + HD, data = SUP)</code><br/><code>anova(mod3, mod1)</code></div>

Ce que ça calcule concrètement, étape par étape :

- Le test F partiel demande : "est-ce que retirer AE (les 2 muettes ensemble) dégrade significativement l'ajustement du modèle ?"
- Les degrés de liberté du test sont (nombre de variables retirées, ddl résiduels du modèle complet) → ici (2, 145) : 2 muettes retirées, 145 = n − p − 1 pour mod1 (150 − 4 − 1).
- Résultat sur l'exemple : F = 0.0449, p-value = 0.9561 → on ne rejette pas H0, AE n'apporte rien de significatif une fois S et HD dans le modèle.
- Un seul terme retiré (une seule variable ou une seule muette) → le test t (Section 3) et le test F partiel donnent la même conclusion (ils sont mathématiquement équivalents dans ce cas précis). Plusieurs termes retirés en même temps (comme ici, les 2 muettes de AE) → seul le test F partiel donne la bonne réponse conjointe ; faire 2 tests t séparés sur AEaverage et AEhigh ne suffit pas.

<div class="watch"><b>Watch out :</b> le test F partiel ne s'applique qu'à des modèles emboîtés (un modèle est un sous-ensemble strict de l'autre) — jamais à deux modèles qui remplacent une variable par une autre (voir Section 7).</div>

## 7. Comparer deux modèles non emboîtés : R² ajusté

mod1 = CN ~ S + HD + AE (R² = 0.3996, R² ajusté = 0.383) vs mod2 = CN ~ S + HD + CA (R² = 0.416, R² ajusté = 0.404).

- mod1 et mod2 ne sont pas emboîtés : AE n'est pas un sous-ensemble de CA, ni l'inverse. Un test F partiel ou une comparaison brute du nombre de coefficients (5 vs 4) n'a donc pas de sens ici.
- La seule façon correcte de les comparer est descriptive, via le R² ajusté (qui pénalise le nombre de variables, contrairement au R² brut) : mod2 (0.404) &gt; mod1 (0.383) → mod2 explique mieux CN, à complexité comparable.
- Le R² brut de mod2 (0.416) &gt; celui de mod1 (0.3996) signifie que la déviance expliquée de mod2 est plus grande — mais la déviance totale (basée sur les mêmes CN observés) est identique dans les deux modèles.

<div class="watch"><b>Watch out :</b> un plus grand nombre de coefficients dans un modèle n'est jamais, en soi, une raison de le préférer — et n'est pas non plus une raison de le rejeter ; seul le R² ajusté (modèles non emboîtés) ou le test F partiel (modèles emboîtés) tranchent.</div>

## 8. Significativité globale du modèle : test F global, R² et R² ajusté

<div class="def"><b>H0 : β1 = β2 = ... = βp = 0</b> (toutes les pentes nulles à la fois)</div>

Ce que ça calcule concrètement, étape par étape :

- La statistique F du bas de `summary()` teste si le modèle, dans son ensemble, explique une part significative de la variabilité de Y — c'est le ratio (déviance expliquée / p) divisé par (déviance résiduelle / (n−p−1)).
- Pour mod1 : F = 24.12 sur (4, 145) degrés de liberté, p-value = 2.604e-15 → le modèle est globalement très significatif.
- R² = proportion de la variabilité de Y expliquée par les variables explicatives. Il ne peut jamais diminuer quand on ajoute une variable, même inutile (0.3996 pour mod1, moins de variables aurait donné un R² encore plus bas ou égal).
- R² ajusté pénalise l'ajout de variables inutiles et peut diminuer si la variable ajoutée n'apporte pas assez d'information par rapport au coût en degrés de liberté qu'elle consomme.
- Si R² = 0.6, alors 60% de la variabilité de Y est expliquée par le modèle et 40% ne l'est pas — R² n'est jamais directement "le pourcentage expliqué par chaque variable individuellement", c'est un chiffre global pour tout le modèle.

<div class="key"><b>Must know :</b><br/>&bull; R² ne peut pas baisser en ajoutant une variable ; R² ajusté peut baisser<br/>&bull; Test F global → H0 : tous les coefficients de pente nuls en même temps<br/>&bull; Estimation de la variance des erreurs = (residual standard error)²</div>

## 9. Passage aux données de panel : effets fixes et test de Hausman

<div class="def"><b>Test de Hausman (Hausman test) :</b> permet de choisir entre un modèle à effets aléatoires (random effects) et un modèle à effets fixes (fixed effects) sur données de panel.<br/><b>H0 : le modèle à effets aléatoires est cohérent (consistent)</b><br/><code>phtest(modEF, modEA)</code></div>

Ce que ça calcule concrètement, étape par étape :

- Sous H0, le modèle à effets aléatoires est cohérent et plus efficace → on le préfère par défaut si on ne rejette pas H0.
- On compare la p-value au seuil choisi comme pour n'importe quel test : p-value entre 0.05 et 0.1 (ex. 0.0774) → on rejette H0 au seuil 0.1 (effets fixes choisis) mais pas au seuil 0.05 (effets aléatoires choisis). La conclusion dépend donc du seuil retenu, il faut toujours donner les deux si l'énoncé ne précise pas de seuil unique.

<div class="def"><b>Modèle à effets fixes (fixed effects, estimé "within") :</b> chaque individu du panel (ici chaque entreprise) a sa propre ordonnée à l'origine, estimée séparément via <code>fixef()</code>, mais partage la même pente pour les variables explicatives.<br/><code>mod &lt;- plm(sales ~ adv, model = "within", data = S)</code><br/><code>fixef(mod)</code></div>

Ce que ça calcule concrètement, étape par étape :

- `fixef(mod)` renvoie un intercept spécifique par individu (ex. 144.048 pour l'entreprise 1, −55.524 pour l'entreprise 2, etc.).
- Le coefficient de la variable explicative (ici adv = 25.0203) est le même pour tous les individus — seule l'ordonnée à l'origine change d'un individu à l'autre.
- Équation valide pour l'entreprise 1 : sales-hat = 144.048 + 25.0203·adv (on prend l'intercept propre à l'entreprise 1, pas l'intercept "moyen" du modèle sans effets fixes).

<div class="watch"><b>Watch out :</b> ne jamais utiliser un intercept générique ou une moyenne des <code>fixef()</code> pour prédire un individu précis du panel — toujours prendre l'intercept spécifique à cet individu.</div>

## 10. Fonctions R à connaître par cœur

Liste officielle du cours (20987 A.F.M. 2026-2027) pour le premier in-class test. Utile comme check-list avant l'examen : si une fonction de cette liste apparaît dans une question, il faut savoir dire en une phrase ce qu'elle fait.

- `lm` — estime les modèles linéaires.
- `summary` — résume un objet (coefficients/tests pour un lm, distribution pour une variable).
- `confint` — construit les intervalles de confiance des coefficients.
- `predict` — fournit les prédictions et intervalles associés.
- `anova` — donne la décomposition de la déviance et effectue le test F (partiel ou global selon l'appel).
- `data.frame` — définit un jeu de données.
- `str` — montre la structure d'un objet.
- `table` — crée un tableau de fréquences.
- `mean`, `median`, `var`, `cor` — statistiques descriptives (moyenne, médiane, variance, corrélation).
- `plot`, `abline` — graphique, et ajout de droites sur le graphique courant.
- `ls` — liste les objets existants dans l'environnement.
- `library` — charge un package déjà installé.
- `influence.measures`, `rstudent`, `hatvalues` — mesures d'influence, résidus studentisés, leviers (hors périmètre du mock quiz mais dans la liste officielle du 1er test).
- `vif` (package car) — facteur d'inflation de la variance (multicolinéarité).
- `plm` (package plm) — estime les modèles linéaires sur données de panel.
- `phtest` (package plm) — test de Hausman.
- `fixef` (package plm) — estime les effets fixes individuels.

## 11. Erreurs fréquentes et pièges d'examen

- Introduire k muettes au lieu de k−1 pour une variable qualitative à k catégories (colinéarité parfaite avec l'intercept).
- Confondre le coefficient estimé et son erreur standard (std. error) en lisant summary().
- Conclure sur la pertinence globale d'une variable qualitative à partir du test t d'une seule de ses muettes, au lieu d'un test F partiel sur le groupe complet.
- Utiliser un test F partiel sur deux modèles non emboîtés (variables différentes) — dans ce cas, seul le R² ajusté permet une comparaison.
- Juger une prédiction "raisonnable" ou non sur une intuition de bon sens plutôt que sur la plage réellement observée des variables quantitatives et la présence des catégories dans l'échantillon.
- Oublier qu'un intervalle de confiance à 99% est plus long qu'à 90% (et qu'un intervalle pour une observation individuelle est plus long qu'un intervalle pour la moyenne, au même niveau).
- Penser que le R² peut baisser en ajoutant une variable — c'est le R² ajusté qui peut baisser, jamais le R² brut.
- Sur données de panel, prédire avec un intercept unique/moyen au lieu de l'intercept individuel donné par fixef().
- Oublier que la conclusion du test de Hausman peut changer selon le seuil de significativité retenu (0.05 vs 0.1) quand la p-value tombe entre les deux.

## 12. À connaître absolument

<div class="key"><b>Must know :</b><br/>&bull; k catégories → k−1 muettes ; la référence est absorbée dans l'intercept<br/>&bull; Quantitative → effet marginal par unité, constant quels que soient les niveaux fixés des autres variables (additivité, sans interaction). Muette → écart moyen vs la référence<br/>&bull; Test t → H0 : βj = 0, une seule variable/muette. Test F partiel → H0 : plusieurs β = 0 en même temps (modèles emboîtés uniquement)<br/>&bull; Modèles non emboîtés → comparaison uniquement via R² ajusté<br/>&bull; Confiance ↑ → intervalle plus long ; intervalle pour une moyenne &lt; intervalle pour une observation individuelle<br/>&bull; Prédiction raisonnable → valeurs quantitatives dans la plage observée + catégories présentes dans l'échantillon<br/>&bull; R² ne peut pas baisser en ajoutant une variable ; R² ajusté peut baisser<br/>&bull; Panel : test de Hausman → H0 = effets aléatoires cohérents ; fixef() donne un intercept par individu, la pente reste commune</div>

## Points de vigilance

<div class="watch"><b>Watch out :</b> une équation qui garde toutes les catégories d'une variable qualitative en même temps (colinéarité parfaite avec l'intercept) est fausse — respecter la règle k−1.</div>

<div class="watch"><b>Watch out :</b> un test t sur une seule muette d'une variable à plusieurs catégories ne dit rien sur la pertinence globale de cette variable — il faut un test F partiel sur le groupe complet de muettes.</div>

<div class="watch"><b>Watch out :</b> le test F partiel ne s'applique qu'à des modèles emboîtés — jamais à deux modèles qui remplacent une variable par une autre.</div>

<div class="watch"><b>Watch out :</b> "raisonnable" pour une prédiction ne veut jamais dire "de bon sens intuitif" — c'est une question de plage observée (quantitatives) et de catégories présentes (qualitatives).</div>

<div class="watch"><b>Watch out :</b> ne jamais utiliser un intercept générique pour prédire un individu précis d'un panel à effets fixes — toujours l'intercept spécifique donné par <code>fixef()</code>.</div>

<div class="watch"><b>Watch out :</b> la conclusion du test de Hausman peut changer selon le seuil retenu (0.05 vs 0.1) quand la p-value tombe entre les deux — toujours préciser à quel seuil on conclut.</div>
