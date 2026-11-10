# Session 1. Introduction aux modèles de régression

À la fin de cette session, tu sais écrire le modèle de régression linéaire et ses cinq hypothèses (assumptions), l'estimer par la méthode des moindres carrés (least squares), lire un coefficient comme un effet marginal (marginal effect) tout en repérant un effet fallacieux (spurious effect), construire un intervalle de confiance (confidence interval) et un test sur un coefficient, faire une prédiction correctement, et juger la qualité d'ajustement du modèle avec R² et le R² ajusté (adjusted R²).

<div class="plan"><b>Plan</b><br/>1. Pourquoi on a besoin de modèles de régression<br/>2. Construire le modèle linéaire : l'équation et ses cinq hypothèses<br/>3. Estimer les coefficients par les moindres carrés<br/>4. Lire les coefficients : effet marginal et le piège de l'effet fallacieux<br/>5. Intervalles de confiance et tests d'hypothèse sur un coefficient<br/>6. Faire une prédiction avec le modèle<br/>7. Juger la qualité du modèle : déviance, R², R² ajusté<br/>8. Erreurs fréquentes et pièges d'examen<br/>9. À connaître absolument</div>

## 1. Pourquoi on a besoin de modèles de régression

Partons d'un constat évident : presque tout varie.

- Le chiffre d'affaires diffère d'une entreprise à l'autre, et d'une période à l'autre pour une même entreprise.
- Les préférences des consommateurs diffèrent d'une marque à l'autre.
- Le fait qu'un bien immobilier se vende ou non dans un délai donné varie d'un bien à l'autre.

Cette variabilité crée trois besoins, dans cet ordre :

- **expliquer** pourquoi la variable qui nous intéresse (appelons-la Y) varie
- **identifier** quels facteurs génèrent cette variabilité
- **étudier comment** Y dépend de ces facteurs

<div class="def"><b>Modèle de régression (au sens large) — regression model :</b> un modèle qui exprime un aspect ou un résumé d'une variable dépendante (dependent variable) Y en fonction de variables explicatives (explanatory variables) x1, x2, ..., xp, utilisé pour expliquer et prédire la variabilité de Y.</div>

un aspect ou résumé de Y = fonction de (x1, x2, ..., xp)

où :

- **Y** est la variable dépendante (aussi appelée variable à expliquer ou response variable) — la chose qui t'intéresse vraiment (chiffre d'affaires, préférence, résultat d'une vente, prix, ...)
- **x1, ..., xp** sont les variables explicatives (aussi appelées variables indépendantes ou covariables — independent variables / covariates) — les facteurs candidats pour expliquer la variabilité de Y

Ce que ça veut dire concrètement :

- tu choisis une variable Y que tu veux comprendre ou prédire
- tu choisis une ou plusieurs variables x1, ..., xp que tu soupçonnes de bouger avec Y
- le modèle relie "un résumé de Y" (en général sa moyenne) à ces x par une fonction — tout le reste du cours consiste à choisir cette fonction et à l'ajuster (fit) sur des données réelles

<div class="example"><b>Exemple d'intuition :</b> imagine que tu veuilles comprendre pourquoi le loyer (Y) d'un appartement varie d'un quartier à l'autre. Tu observes que la surface (x1) et la distance au centre-ville (x2) semblent jouer un rôle. Le modèle de régression est simplement l'outil qui te permet de dire, précisément et avec des chiffres, "à combien s'élève l'effet de la surface sur le loyer, une fois la distance prise en compte ?".</div>

Les modèles de régression se déclinent en familles, selon le type de Y :

- Y quantitative → modèle de régression linéaire (linear regression model) — le sujet principal de ce cours
- Y dichotomique, deux catégories → modèle de régression logistique binaire (binary logistic regression model / binary logit)
- Y qualitative à plus de deux catégories → modèle de régression logistique multinomiale (multinomial logistic regression model / multinomial logit)

Une analyse de régression sert toujours à un (ou plusieurs) de ces trois objectifs :

- **connaître** (knowing) — est-ce que x1, ..., xp ont un effet sur Y, et si oui, à quoi ressemble cet effet ?
- **expliquer** (explaining) — la variabilité de Y peut-elle être (au moins en partie) expliquée par x1, ..., xp ?
- **prévoir** (forecasting) — comment prédire/estimer Y pour des unités de la population où x1, ..., xp prennent des valeurs précises ?

## 2. Construire le modèle linéaire

### 2.1 L'exemple fil rouge et l'équation du modèle

Le cours utilise un seul exemple fil rouge pendant toute cette session — garde-le en tête, chaque formule ci-dessous lui sera réappliquée.

<div class="example"><b>Exemple (mise en place) :</b> dans la population de tous les biens immobiliers à vendre dans une ville, on définit x1 = âge du bien (en années), x2 = distance au centre-ville (en centaines de mètres), et Y = prix au mètre carré (en milliers d'euros). Les prix varient, donc les questions deviennent : pourquoi les prix varient-ils, l'âge et la distance peuvent-ils expliquer cette variabilité, et peut-on prédire le prix d'un bien à partir de son âge et de sa distance ?</div>

- Y est appelée la variable dépendante ou variable à expliquer (response variable).
- x1, ..., xp sont appelées variables explicatives, variables indépendantes, ou covariables.
- C'est une étude inférentielle (inferential study) : l'objectif est de dire quelque chose sur la dépendance de Y aux x dans toute la population, pas seulement dans l'échantillon (sample) que tu as sous la main.

Le modèle de régression linéaire s'écrit comme l'équation théorique (theoretical equation) — "théorique" précisément pour la distinguer plus tard de l'équation estimée (estimated equation) qu'on obtient après avoir ajusté le modèle aux données :

<div class="def"><b>Y = β0 + β1x1 + ... + βpxp + ε</b><br/>où :<br/>&bull; Y est une variable aléatoire (random variable) — la variable dépendante<br/>&bull; x1, ..., xp sont les variables explicatives ; dans cette équation elles sont traitées comme fixes (non aléatoires), des valeurs connues<br/>&bull; β0, β1, ..., βp sont des paramètres inconnus (unknown parameters) : β0 est l'ordonnée à l'origine (intercept), βj est le coefficient attaché à xj<br/>&bull; ε est une variable aléatoire, l'erreur (error) — elle absorbe tout ce qui affecte Y en dehors de x1, ..., xp<br/>&bull; quand p = 1, on parle de modèle de régression linéaire simple (simple linear regression model, une seule variable explicative)</div>

Ce que ça veut dire concrètement :

- ça découpe Y en deux morceaux : une partie déterministe pilotée par les x (β0 + β1x1 + ... + βpxp), et un reste aléatoire (ε)
- sans ε, toute unité ayant les mêmes valeurs de x devrait avoir exactement le même Y — clairement irréaliste (deux biens de même âge et même distance peuvent quand même avoir des prix différents)
- ε est ce qui rend le modèle réaliste : il représente "tout le reste" qui affecte Y (qualité de la rénovation, exposition, quartier précis, chance à la négociation, ...)

<div class="example"><b>Exemple (équation) :</b> pour le cas immobilier, Y = β0 + β1x1 + β2x2 + ε. Le prix = une partie déterministe due à l'âge et à la distance, plus une partie aléatoire qui couvre tout ce qui peut faire bouger le prix en dehors de ces deux facteurs.</div>

### 2.2 Les cinq hypothèses (assumptions)

Pour estimer β0, ..., βp, il faut un échantillon : n vecteurs (xi1, ..., xip, Yi) pour i = 1, ..., n, un par unité de l'échantillon, chacun vérifiant Yi = β0 + β1xi1 + ... + βpxip + εi. Pour passer de l'échantillon aux estimations, cinq hypothèses sur le modèle sont nécessaires.

<div class="key"><b>Must know (les cinq hypothèses) :</b><br/>1. E(εi) = 0<br/>2. Var(εi) = σ2<br/>3. Cov(εk, εi) = 0, pour k ≠ i<br/>4. εi ~ N(0, σ2)<br/>5. absence de multicolinéarité parfaite (no perfect multicollinearity) : aucune relation Σjλjxj = λ0<br/>(les hypothèses 1-4 valent pour chaque i = 1, ..., n ; l'hypothèse 3 pour chaque paire k ≠ i)</div>

où :

- l'hypothèse 1, erreur de moyenne nulle (zero-mean error), revient à dire E(Yi) = β0 + β1xi1 + ... + βpxip — en moyenne, Y se trouve exactement sur l'hyperplan (une droite si p = 1) défini par les x
- l'hypothèse 2, homoscédasticité (homoskedasticity), signifie que la variance de l'erreur (et donc de Y) est la même σ2 pour toutes les unités, pas plus grande pour certaines que pour d'autres
- l'hypothèse 3 signifie que les erreurs ne sont pas corrélées entre elles (uncorrelated errors) — aucune association linéaire entre deux erreurs quelconques ; c'est plus faible que dire qu'elles sont indépendantes
- l'hypothèse 4 signifie que les erreurs suivent une loi normale (normal errors), donc chaque Yi est aussi normal
- l'hypothèse 5 exclut une relation linéaire exacte entre les x ; si elle était violée exactement, les coefficients ne pourraient plus du tout être estimés ; un peu de multicolinéarité (imparfaite) est toujours présente dans les vraies données et sera traitée dans une session ultérieure

Ce que ça veut dire concrètement :

- les hypothèses 1-2 disent que le "signal" (l'hyperplan) est juste en moyenne, et tout aussi bruité partout
- l'hypothèse 3 dit que le bruit d'une unité ne "fuit" pas vers une autre
- l'hypothèse 4 est ce qui permet de construire des intervalles de confiance et des tests exacts plus loin dans cette session
- l'hypothèse 5 garantit simplement que les mathématiques des moindres carrés (section 3) ont une solution unique

<div class="watch"><b>Watch out :</b> "linéaire" dans "modèle de régression linéaire" veut dire linéaire par rapport aux <b>paramètres</b> βj, pas nécessairement par rapport aux x — la même théorie s'applique aussi à des modèles où les x apparaissent sous forme de, par exemple, x² ou log(x).</div>

## 3. Estimer les coefficients par les moindres carrés

Une fois les hypothèses posées, la première vraie étape consiste à estimer β0, ..., βp à partir de l'échantillon. La méthode utilisée est celle des moindres carrés (least squares).

<div class="def"><b>minimiser Σi=1..n [yi − (β0 + β1xi1 + ... + βpxip)]²</b><br/>où :<br/>&bull; la minimisation se fait sur β0, ..., βp<br/>&bull; yi est la valeur de Y réellement observée pour l'unité i dans l'échantillon<br/>&bull; les valeurs qui minimisent, b0, ..., bp, sont appelées les estimations par les moindres carrés (least squares estimates) ; le logiciel (R, dans ce cours) les calcule</div>

Ce que ça veut dire concrètement, étape par étape :

- pour n'importe quel jeu de β candidats, calcule l'écart entre chaque yi observé et ce que le modèle prédirait pour cette unité
- mets chaque écart au carré (pour que les écarts positifs et négatifs ne s'annulent pas), puis additionne-les tous
- cherche, parmi tous les β0, ..., βp possibles, la combinaison qui rend ce total le plus petit possible
- vu géométriquement : parmi tous les hyperplans possibles dans l'espace à (p+1) dimensions (une droite, si p = 1), les moindres carrés choisissent celui qui est globalement le plus proche des points observés

<div class="example"><b>Exemple minimal pour comprendre l'intuition (3 points) :</b> imagine 3 propriétés avec un seul x (l'âge) et Y (le prix) : (x=1, Y=6), (x=2, Y=5), (x=3, Y=3.5). On cherche la droite ŷ = b0 + b1x qui passe "au plus près" des 3 points en même temps.<br/>&bull; Une droite candidate donnerait, par exemple, des écarts de +0.2, -0.1, -0.3 par rapport aux 3 points.<br/>&bull; On met ces écarts au carré (0.04, 0.01, 0.09) et on les additionne (0.14) : c'est la "somme des carrés des résidus" pour cette droite précise.<br/>&bull; Une autre droite candidate donnerait une autre somme. Les moindres carrés testent (conceptuellement) toutes les droites possibles et gardent celle dont la somme est la plus petite.<br/>&bull; En pratique le logiciel ne teste pas toutes les droites une par une : il résout directement le problème mathématiquement, mais l'idée à retenir est exactement celle-ci.</div>

Une fois b0, ..., bp trouvés, l'équation estimée (estimated equation) est :

<div class="def"><b>ŷ = b0 + b1x1 + ... + bpxp</b><br/>où :<br/>&bull; ŷ ("y chapeau", y-hat) est la valeur ajustée ou prédite (fitted/predicted value) produite par l'équation estimée<br/>&bull; puisque E(Y) = β0 + β1x1 + ... + βpxp est une autre façon d'écrire le modèle (hypothèse 1), ŷ est en réalité une estimation de la moyenne de Y aux valeurs de x données, pas d'un Y individuel</div>

<div class="def"><b>Estimation par les moindres carrés — least squares estimation :</b> estimer β0, ..., βp par les valeurs b0, ..., bp qui minimisent la somme des écarts au carré entre les yi observés et les valeurs ajustées par le modèle.</div>

## 4. Lire les coefficients : effet marginal et le piège de l'effet fallacieux

### 4.1 L'effet marginal (marginal effect) de xj

Pour interpréter bj, compare la valeur ajustée quand xj augmente d'exactement une unité (tous les autres x étant fixés) à la valeur ajustée avant cette augmentation.

<div class="def"><b>ŷincr − ŷ = [b0 + ... + bj(xj+1) + ... + bpxp] − [b0 + ... + bjxj + ... + bpxp] = bj</b><br/>où ŷincr est la valeur ajustée une fois que xj a été augmenté de 1, tous les autres x restant fixes.</div>

Ce que ça veut dire concrètement :

- tous les termes sauf celui qui contient xj restent identiques, donc ils s'annulent dans la soustraction
- ce qu'il reste est exactement bj — une augmentation d'une unité de xj change la valeur ajustée (moyenne) de Y d'exactement bj, toutes choses égales par ailleurs (all else equal)
- de façon équivalente, bj est la pente (constante) de ŷ par rapport à xj

<div class="def"><b>Effet marginal — marginal effect :</b> bj, le changement moyen estimé de Y quand xj augmente d'une unité, toutes les autres variables explicatives restant constantes. C'est pour cela que bj est appelé l'effet marginal (estimé) de xj.</div>

<div class="example"><b>Exemple :</b> équation estimée pour l'immobilier, ŷ = 6.2 − 0.09x1 − 0.02x2. b1 = −0.09 : une année d'âge supplémentaire est associée à une baisse moyenne de 90€/m², à distance égale. Même logique pour b2 et la distance : chaque centaine de mètres supplémentaire coûte en moyenne 20€/m² de moins, à âge égal.</div>

- b0 est moins important en lui-même : c'est la moyenne estimée de Y quand tous les x valent zéro, une situation qui peut être réaliste ou non selon le contexte.
- dans l'exemple, b0 = 6.2 peut se lire comme le prix moyen estimé au m² d'un bien neuf (âge 0) situé en plein centre-ville (distance 0).

### 4.2 Contrôler les autres variables — et le piège de l'effet fallacieux

- dans une régression multiple, le sens de bj inclut toujours "toutes les autres x étant constantes" — on appelle ça contrôler pour les autres variables (controlling for the other variables).
- cette expression ne veut rien dire dans une régression simple avec un seul x, donc les résultats à une seule variable méritent une prudence supplémentaire.

<div class="def"><b>Effet fallacieux — spurious effect :</b> un effet apparent de xj sur Y qui est en réalité causé par une ou plusieurs variables omises (omitted variables) corrélées à la fois avec xj et Y — ce sont ces variables cachées qui pilotent réellement la relation que tu observes entre xj et Y.</div>

<div class="example"><b>Exemple (prix des biens près de la côte) :</b> un échantillon de biens dans une zone touristique est étudié avec x = distance à la côte, Y = prix/m².<br/>&bull; Étape 1 — régression simple de Y sur x seul : la pente sur x ressort positive (plus loin de la côte → prix plus élevé). Pris au premier degré, ça suggérerait (à tort) que s'éloigner de la côte fait monter les prix.<br/>&bull; Étape 2 — on ajoute la variable omise z = âge du bien et on refait une régression multiple sur x et z ensemble : le coefficient sur x devient alors négatif.<br/>&bull; Étape 3 — lecture correcte : à âge égal, le prix au mètre carré diminue en réalité quand la distance à la côte augmente.<br/>&bull; Pourquoi ce retournement : dans cet échantillon, les biens les plus récents ont tendance à être plus éloignés de la côte (probablement parce que les restrictions de construction près de la côte se sont renforcées avec le temps). L'âge pilotait discrètement à la fois x et Y, créant une fausse relation positive jusqu'à ce qu'on le contrôle.</div>

<div class="watch"><b>Watch out :</b> la source illustre cet exemple avec un nuage de points (scatterplot) de x contre Y, chaque point étant étiqueté par z (l'âge du bien) ; l'image du graphique elle-même a été perdue à l'extraction, seule la description des axes/étiquettes a survécu.</div>

## 5. Intervalles de confiance et tests d'hypothèse sur un coefficient

### 5.1 Intervalle de confiance (confidence interval) pour βj

Au-delà de l'estimation ponctuelle bj, on peut construire une plage de valeurs qui, avec un niveau de confiance choisi 1 − α (typiquement 0.90, 0.95, ou 0.99), a de bonnes chances de contenir la vraie valeur (dans la population) de βj.

<div class="def"><b>(bj − t(α/2, n−p−1)·sbj , bj + t(α/2, n−p−1)·sbj)</b><br/>où :<br/>&bull; bj est l'estimation de βj, et sbj est son erreur type (standard error)<br/>&bull; t(α/2, n−p−1) est le quantile pertinent de la loi de Student (Student's t distribution) à n − p − 1 degrés de liberté (degrees of freedom)</div>

Ce que ça veut dire concrètement :

- on part de l'estimation ponctuelle bj
- on calcule une marge d'erreur (margin of error) ME = quantile × erreur type
- l'intervalle est simplement (estimation − ME, estimation + ME)
- augmenter le niveau de confiance 1 − α rend le quantile plus grand, ce qui rend ME plus grand, ce qui rend l'intervalle plus large (toutes choses égales par ailleurs)

<div class="example"><b>Exemple numérique :</b> si b1 = −0.09 avec une erreur type sb1 = 0.02, et que le quantile de Student pour 1 − α = 0.95 vaut environ 2, alors ME ≈ 2 × 0.02 = 0.04, et l'intervalle de confiance à 95% pour β1 est environ (−0.13, −0.05). Interprétation directe : avec 95% de confiance, chaque année d'âge supplémentaire fait baisser le prix moyen au m² de 50€ à 130€, distance égale.</div>

Interprétation : avec une confiance 1 − α, le vrai changement de la moyenne de Y provoqué par une augmentation d'une unité de xj (les autres x étant constantes) se trouve à l'intérieur de cet intervalle.

### 5.2 Test d'hypothèse (hypothesis test) sur βj

βj = 0 signifierait que xj n'a aucun effet sur E(Y) dans ce modèle. Le test :

<div class="def"><b>H0: βj = 0 ; H1: βj ≠ 0</b><br/><b>tobs = bj / sbj</b><br/>rejeter H0 au niveau α si |tobs| ≥ t(α/2, n−p−1)<br/>p-value = 2P(T ≥ |tobs| | H0) ; rejeter si p-value &lt; α</div>

Ce que ça veut dire concrètement, étape par étape :

- on divise l'estimation bj par sa propre erreur type sbj pour obtenir un seul chiffre, tobs — il mesure à combien d'erreurs types bj se trouve de zéro
- on compare |tobs| au quantile critique de la loi de Student : s'il est au moins aussi grand, les données observées seraient improbables sous "βj = 0", donc on rejette H0
- de façon équivalente, on calcule la p-value (la probabilité, si H0 était vraie, d'observer une statistique t au moins aussi extrême que celle obtenue) et on rejette H0 quand cette probabilité est plus petite que α
- rejeter H0 = preuve que xj a réellement un effet sur la moyenne de Y, les autres variables étant constantes ; xj est alors dit significatif (significant)

où :

- α (choisi proche de 0 — typiquement 0.10, 0.05, ou 0.01) est la probabilité de rejeter H0 à tort, c'est-à-dire de conclure que xj compte alors qu'en réalité ce n'est pas le cas

<div class="example"><b>Exemple numérique (suite du 5.1) :</b> b1 = −0.09, sb1 = 0.02, donc tobs = −0.09 / 0.02 = −4.5. Comme |−4.5| est bien supérieur au quantile critique (environ 2 pour un grand échantillon et α = 0.05), on rejette H0 : l'âge a un effet significatif sur le prix, distance égale.</div>

<div class="watch"><b>Watch out :</b> la source illustre la p-value avec une densité de Student (20 degrés de liberté), en grisant la zone bilatérale au-delà de |tobs| = 2 ; la courbe tracée et la zone grisée elles-mêmes ont été perdues à l'extraction, seules les étiquettes des axes ont survécu.</div>

## 6. Faire une prédiction avec le modèle

Il existe deux questions de prédiction différentes, et il est important de savoir à laquelle on répond :

- prédire Y pour une seule unité avec des valeurs de x précises (par exemple, un bien particulier de 10 ans situé à 800m du centre)
- prédire la moyenne de Y pour toutes les unités qui partagent ces mêmes valeurs de x

La première est plus incertaine que la seconde, car elle porte en plus l'incertitude de ε, alors que la seconde ne dépend que de la relation entre E(Y) et les x. Comme ε lui-même ne peut pas être prédit (sa meilleure estimation est toujours 0), la prédiction ponctuelle (point prediction) est la même formule pour les deux questions :

<div class="def"><b>ŷ0 = b0 + b1x10 + ... + bpxp0</b><br/>où :<br/>&bull; xj0 est la valeur fixée de xj pour laquelle on prédit<br/>&bull; ŷ0 est simultanément la prédiction pour une unité et pour la moyenne des unités à ces valeurs de x</div>

<div class="example"><b>Exemple :</b> x10 = 10, x20 = 8 → ŷ0 = 6.2 − 0.09·10 − 0.02·8 = 5.14 (milliers d'€/m²) — à la fois le prix prédit pour un bien précis de 10 ans à 800m, et le prix moyen prédit pour l'ensemble des biens de ce type.</div>

- les deux prédictions partagent la même valeur ponctuelle mais pas la même incertitude : leurs intervalles de prédiction (prediction intervals) diffèrent (le logiciel calcule les formules exactes ; seul le comportement qualitatif est couvert ici).
- les deux intervalles sont centrés sur ŷ0.
- l'intervalle pour la moyenne est toujours plus court que l'intervalle pour une unité seule.
- les deux intervalles s'élargissent quand le niveau de confiance 1 − α augmente.
- ne jamais prédire en dehors de la plage de x réellement observée dans l'échantillon (extrapolation) — cela suppose silencieusement, sans aucune preuve, que la relation continue de tenir là où on n'a aucune donnée, et peut produire des prédictions absurdes.

Une façon de vérifier la qualité des prédictions du modèle : comparer chaque yi observé à ce que le modèle aurait prédit pour cette même unité, ŷi = b0 + b1xi1 + ... + bpxip. En additionnant les écarts au carré, Σi(yi − ŷi)², on obtient la déviance résiduelle (residual deviance) — le pont vers la section suivante.

<div class="watch"><b>Watch out :</b> les formules algébriques exactes des deux intervalles de prédiction ne sont pas données dans la source — elle les qualifie explicitement de "complexes" et les laisse au logiciel (R) ; seul leur comportement qualitatif ci-dessus est exigible depuis cette source.</div>

## 7. Juger la qualité du modèle : déviance, R² et R² ajusté

### 7.1 Décomposer la déviance totale en deux parties

Deux objectifs sous-tendent cette section : (1) quelle part de la variabilité de Y le modèle explique-t-il, et (2) quelle est la qualité de ses prédictions — les deux sont liés, car plus de pouvoir explicatif veut dire une erreur de prédiction plus petite. Les deux partent d'une seule décomposition :

<div class="def"><b>Σi=1..n(yi − moyenne(y))² = Σi=1..n(yi − ŷi)² + Σi=1..n(ŷi − moyenne(y))²</b><br/>où yi = valeur de Y observée pour l'unité i ; moyenne(y) = moyenne de tous les yi observés ; ŷi = valeur ajustée pour l'unité i.</div>

Ce que chacun des trois morceaux signifie, de gauche à droite :

- **Déviance Totale** (Total Deviance, membre de gauche) — la dispersion globale de Y autour de sa propre moyenne ; elle ne dépend que des yi observés, jamais des x choisis ; c'est aussi l'erreur de prédiction du "modèle nul" (null model) qui n'a aucune variable explicative et ne peut jamais prédire que moyenne(y) pour tout le monde
- **Déviance Résiduelle / Non Expliquée** (Residual / Unexplained Deviance, premier terme à droite) — à quel point les valeurs ajustées du modèle sont encore loin des vrais yi ; c'est la part de la variabilité de Y que le modèle échoue à expliquer, liée au terme d'erreur ε ; c'est aussi l'erreur de prédiction du modèle qui inclut les x
- **Déviance Expliquée** (Explained Deviance, second terme à droite) — à quel point les valeurs ajustées s'éloignent de la base plate moyenne(y) ; c'est la part de la variabilité de Y que les x expliquent réellement ; Expliquée = Totale − Résiduelle, donc ça mesure aussi combien d'erreur de prédiction on a économisée en utilisant les x plutôt qu'en devinant moyenne(y) à chaque fois

### 7.2 Le coefficient de détermination (coefficient of determination) R²

<div class="def"><b>R² = Σi=1..n(ŷi − moyenne(y))² / Σi=1..n(yi − moyenne(y))² = DÉVIANCE EXPLIQUÉE / DÉVIANCE TOTALE</b></div>

Ce que ça veut dire concrètement :

- on divise la part expliquée de la variabilité par le total — le résultat est un seul chiffre entre 0 et 1
- R² = 1 seulement quand les x expliquent 100% de la variabilité de Y (chaque ŷi tombe exactement sur yi)
- R² = 0 seulement quand ŷi = moyenne(y) pour toutes les unités — les x n'apportent rien de plus que de deviner la moyenne à chaque fois
- entre les deux, lis R² directement comme "la fraction de la variabilité de Y expliquée par le modèle", ce qui revient à "la fraction d'erreur de prédiction économisée en utilisant les x"

<div class="example"><b>Exemple :</b> R² = 0.4 veut dire que les variables explicatives expliquent ensemble 40% de la variabilité totale de Y, et réduisent l'erreur de prédiction de 40% par rapport à un modèle sans aucune variable explicative.</div>

### 7.3 Pourquoi le R² ajusté existe

- problème : R² ne peut jamais diminuer quand on ajoute une variable explicative supplémentaire — même une variable totalement inutile fait monter R² (ou le laisse inchangé), jamais baisser.
- conséquence : R² seul ne peut pas servir à comparer deux modèles qui utilisent un nombre différent de variables explicatives — il semblera toujours favoriser le modèle le plus gros.
- solution : le R² ajusté (adjusted R²) pénalise la taille du modèle (le nombre de variables explicatives p) en plus de récompenser le pouvoir explicatif.

<div class="def"><b>R²ajusté = 1 − (1 − R²)·(n−1)/(n−p−1)</b><br/>où p = nombre de variables explicatives, n = taille de l'échantillon.</div>

Ce que ça veut dire concrètement :

- on part de (1 − R²), la fraction non expliquée, et on la gonfle légèrement par le facteur (n−1)/(n−p−1), qui grandit avec p
- on soustrait cette fraction non expliquée gonflée à 1
- plus on ajoute de variables explicatives pour le même gain explicatif, plus ce facteur pénalise le score — donc R²ajusté peut baisser même quand R² monte

<div class="example"><b>Exemple numérique :</b> avec n = 50 et R² = 0.50, passer de p = 2 à p = 5 variables explicatives (pour un gain de R² quasi nul) fait grimper le facteur de pénalité (n−1)/(n−p−1) de 49/47 ≈ 1.04 à 49/44 ≈ 1.11 — le R² ajusté baisse mécaniquement, même si le R² brut, lui, n'a pas bougé.</div>

- R²ajusté est toujours ≤ R².
- utilise-le (et pas le R² brut) pour comparer de façon descriptive deux modèles avec un nombre différent de variables explicatives — le R²ajusté le plus élevé est considéré comme le meilleur compromis.
- si les deux modèles sont emboîtés (nested — l'un contient toutes les variables de l'autre plus d'autres), la comparaison appropriée est plutôt le test F partiel (partial F-test) inférentiel, vu en Session 2 — pas le R² ajusté.

## 8. Erreurs fréquentes et pièges d'examen

- Lire un coefficient de régression simple comme causal sans vérifier l'existence d'un effet fallacieux — une pente positive peut s'inverser, ou disparaître, dès qu'un facteur de confusion corrélé à la fois avec x et Y est ajouté et contrôlé.
- Oublier que bj ne s'interprète que "toutes les autres variables étant constantes" — cette expression ne veut rien dire dans une régression simple avec un seul x.
- Considérer un R² plus élevé comme la preuve d'un meilleur modèle — R² ne diminue jamais quand on ajoute une variable, même inutile ; utilise le R² ajusté pour comparer des modèles de p différents, ou le test F partiel pour des modèles emboîtés.
- Prédire ŷ0 pour des valeurs de x en dehors de la plage observée dans l'échantillon (extrapolation) — cela suppose silencieusement, sans aucune preuve, que la relation continue de tenir là-bas.
- Confondre l'intervalle de prédiction pour une seule unité avec celui pour la moyenne de Y — l'intervalle pour une seule unité est toujours plus large (il porte en plus l'incertitude de ε) même si les deux partagent la même prédiction ponctuelle ŷ0.
- Donner un sens concret à b0 quand x = 0 pour toutes les variables n'est pas une situation réaliste ou observée.
- Confondre l'hypothèse 3 (erreurs non corrélées) avec l'indépendance — c'est plus faible (aucune association linéaire, pas une indépendance statistique complète).
- Oublier que l'hypothèse 5 concerne une relation linéaire exacte entre les x — une multicolinéarité proche (imparfaite) ne bloque pas l'estimation mais peut quand même poser problème (session ultérieure).

## 9. À connaître absolument

<div class="key"><b>Must know :</b><br/>&bull; Y = β0+β1x1+...+βpxp+ε ; de façon équivalente, E(Y) est linéaire par rapport aux x (hypothèse 1)<br/>&bull; Cinq hypothèses : erreurs de moyenne nulle, homoscédasticité (σ² constant), erreurs non corrélées, erreurs normales, absence de multicolinéarité parfaite<br/>&bull; Les moindres carrés choisissent b0, ..., bp pour minimiser Σ(yi − valeur ajustée)² ; ŷ estime E(Y)<br/>&bull; bj = effet marginal de xj : changement moyen de Y par unité supplémentaire de xj, les autres x étant constantes<br/>&bull; Effet fallacieux = une variable omise corrélée à la fois avec xj et Y pilote en réalité la relation observée entre xj et Y<br/>&bull; IC pour βj : bj ± quantile de Student (ddl = n−p−1) · sbj<br/>&bull; Test H0: βj=0 via tobs=bj/sbj, ou via la p-value comparée à α<br/>&bull; ŷ0 prédit à la fois le Y d'une unité et la moyenne de Y ; ne jamais extrapoler en dehors de la plage de x de l'échantillon<br/>&bull; Déviance totale = déviance résiduelle + déviance expliquée ; la déviance totale ne dépend que des yi, jamais du modèle<br/>&bull; R² = expliquée/totale, dans [0,1], ne diminue jamais quand on ajoute des variables ; R² ajusté ≤ R² pénalise la taille du modèle — utilise-le pour comparer des modèles de taille différente</div>

## Points de vigilance

<div class="watch"><b>Watch out :</b> le nuage de points illustrant l'effet fallacieux (prix vs. distance à la côte, points étiquetés par l'âge z) n'était décrit que dans le texte ; l'image du graphique elle-même a été perdue à l'extraction.</div>

<div class="watch"><b>Watch out :</b> le graphique de p-value sur la loi de Student (ddl = 20, |tobs| = 2) n'était décrit que par les étiquettes des axes ; la courbe tracée et la zone grisée ont été perdues à l'extraction.</div>

<div class="watch"><b>Watch out :</b> les formules algébriques exactes de l'intervalle de prédiction (unité seule) et de l'intervalle de confiance pour la moyenne de Y ne sont pas données dans la source, qui les qualifie explicitement de "complexes" et les laisse au logiciel ; seules leurs propriétés qualitatives sont couvertes ici.</div>
