# Session 5. Les modèles de régression pour données de panel

À la fin de cette session, vous devez être capable de : reconnaître des données de panel (panel data, aussi appelées longitudinal data) et expliquer pourquoi une régression classique ne convient généralement pas pour ce type de données ; écrire l'équation du modèle à effets fixes (Fixed Effects Model, FEM) et du modèle à effets aléatoires (Random Effects Model, REM) ; expliquer ce que représentent l'erreur individuelle (individual-specific error) et l'erreur idiosyncratique (idiosyncratic error) ; et utiliser le test de Hausman (Hausman test) pour choisir entre FEM et REM.

<div class="plan"><b>Plan</b><br/>1. Qu'est-ce qu'une donnée de panel<br/>2. Pourquoi une régression classique ne fonctionne pas sur des données de panel<br/>3. La solution simple mais fausse : le Pooling Model<br/>4. Solution 1 : le modèle à effets fixes (FEM)<br/>5. Solution 2 : le modèle à effets aléatoires (REM)<br/>6. Comprendre les deux morceaux de l'erreur (individuel vs. idiosyncratique)<br/>7. Choisir entre FEM et REM : le test de Hausman<br/>8. Ajouter plusieurs variables explicatives<br/>9. Erreurs fréquentes et pièges d'examen<br/>10. À connaître absolument</div>

## 1. Qu'est-ce qu'une donnée de panel

- Jusqu'ici dans ce cours, la plupart des données utilisées étaient des données en coupe transversale (cross-sectional) : plusieurs unités différentes (personnes, entreprises, pays), chacune observée une seule fois.
- Une donnée de panel (panel data), aussi appelée donnée longitudinale (longitudinal data), est différente : elle a à la fois une dimension transversale et une dimension temporelle, en même temps. On a n unités statistiques (par exemple des pays, des entreprises, des individus), chaque unité est observée plusieurs fois, à T instants différents dans le temps, et on obtient donc n · T observations au total, pour chaque variable.

<div class="example"><b>Exemple (tiré des slides) :</b> 5 pays (n = 5), chacun observé sur le PIB et le taux de chômage, chaque année de 1991 à 2020 (T = 30 ans). Pour chaque variable, cela fait n·T = 5·30 = 150 valeurs.</div>

<div class="example"><b>Exemple supplémentaire (analogie) :</b> imaginez que vous suiviez les notes de 30 étudiants (n = 30) à chaque semestre, pendant 3 ans (T = 6 semestres). Vous avez alors n·T = 180 observations de la variable "note". Chaque étudiant a sa propre trajectoire dans le temps, mais on observe aussi des différences entre étudiants à un même semestre : c'est exactement la double dimension (transversale + temporelle) qui caractérise une donnée de panel.</div>

- Ce cours ne couvre que les panels équilibrés (balanced panels) : "équilibré" signifie que chaque unité est observée à chacun des T instants, sans aucune valeur manquante. Un panel équilibré avec n unités et T instants a donc toujours exactement n × T observations par variable.
- Les panels peuvent avoir des formes très différentes, mais les mêmes outils s'appliquent toujours : beaucoup d'unités, peu d'instants (ex : 100 000 ménages suivis pendant 5 ans), ou peu d'unités, beaucoup d'instants (ex : 5 pays suivis chaque mois pendant 20 ans).

## 2. Pourquoi une régression classique ne fonctionne pas sur des données de panel

- Comme la même unité est observée plusieurs fois, ses observations successives ne sont généralement pas indépendantes les unes des autres dans le temps.
- Cela viole une des hypothèses de base de la régression linéaire vue en Session 1 : les erreurs doivent être non corrélées entre elles.
- Conclusion : le modèle de régression linéaire classique que vous connaissez déjà ne convient généralement pas aux données de panel, précisément à cause de cette structure d'observations répétées par unité.
- Bonne nouvelle malgré tout : la structure de panel offre aussi un moyen de mieux traiter un problème classique de la régression, les corrélations fallacieuses (spurious correlations), qu'une simple coupe transversale ne permet pas de résoudre.

<div class="def"><b>Corrélation fallacieuse (spurious correlation) — rappel :</b> un effet apparent de X sur Y qui est en réalité causé par une variable de contrôle absente du modèle, mais corrélée à la fois avec X et avec Y.</div>

<div class="example"><b>Exemple des maisons côtières :</b> n maisons en bord de mer, X = distance à la côte, Y = prix au mètre carré. Une régression simple de Y sur X seul donne une pente positive et significative, ce qui suggère "plus loin de la côte = plus cher" — ce qui semble illogique. En ajoutant Z = âge de la maison, le coefficient de X devient négatif et significatif. Pourquoi ? Les maisons récentes se trouvent justement plus loin de la côte (restrictions de construction sur le littoral), et les maisons récentes sont aussi plus chères. Une fois l'âge maintenu constant, s'éloigner de la côte est réellement associé à un prix plus bas. Les modèles pour données de panel attaquent ce même problème de variable omise de façon structurée, en utilisant les observations répétées de chaque unité pour neutraliser les caractéristiques inobservées et constantes dans le temps de cette unité — même celles qu'on ne peut jamais mesurer directement (comme "à quel point cette maison précise est désirable").</div>

## 3. La solution simple mais fausse : le Pooling Model

Notation pour le cas simple (une seule variable X, une seule variable Y) : xit, yit, pour l'unité i = 1, ..., n et l'instant t = 1, ..., T. L'équation générale de régression pour données de panel ressemble presque exactement à une équation de régression ordinaire :

<div class="def"><b>Yit = α + β·xit + uit</b><br/>où Yit est la variable dépendante (aléatoire) pour l'unité i à l'instant t ; xit est la valeur observée de la variable explicative pour l'unité i à l'instant t ; uit est le terme d'erreur aléatoire pour l'unité i à l'instant t ; α, β sont des paramètres inconnus, supposés constants entre les unités et dans le temps (β décrit toujours la relation entre x et Y, exactement comme avant).</div>

Ce que cette équation dit, étape par étape :

- Chaque couple unité-instant (i, t) a son propre point de données xit, Yit.
- Les mêmes α et β s'appliquent à toutes les unités et à tous les instants — rien n'est encore spécifique à une unité en particulier.
- Tout ce qui rend l'unité i différente de l'unité j est simplement versé, sans distinction, dans le terme d'erreur uit.

<div class="def"><b>Pooling Model :</b> l'approche la plus simple (et généralement inadéquate) — traiter les n·T observations du panel comme si c'étaient n·T unités complètement différentes et sans lien entre elles. Elle ignore entièrement la structure temporelle et estime α et β par les moindres carrés ordinaires (ordinary least squares, OLS), exactement comme une régression classique en coupe transversale.</div>

- Pourquoi c'est généralement faux : en ignorant quelles observations appartiennent à la même unité, le Pooling Model ne respecte pas les hypothèses de la régression (en particulier celle des erreurs non corrélées), et il réintroduit le même risque de variable omise que dans l'exemple des maisons côtières.
- Deux modèles dédiés corrigent ce problème en séparant le terme d'erreur uit en deux morceaux, pour traiter explicitement les différences entre unités au lieu de les mélanger dans une seule erreur : le modèle à effets fixes (Fixed Effects Model, FEM) et le modèle à effets aléatoires (Random Effects Model, REM). Ils ne diffèrent que par ce qu'ils supposent sur cette séparation.

## 4. Solution 1 : le modèle à effets fixes (Fixed Effects Model, FEM)

<div class="def"><b>Fixed Effects Model (FEM) :</b> sépare l'erreur en uit = μi + εit, où μi est un effet fixe de l'unité i — constant dans le temps et déterministe (pas aléatoire) — et εit est un terme d'erreur aléatoire avec les propriétés habituelles de la régression.</div>

- μi se comporte comme un paramètre inconnu (un par unité) et capture l'hétérogénéité inobservable (unobservable heterogeneity) entre les unités — voyez-le comme "tout ce qui caractérise l'unité i, qui ne change jamais dans le temps, et que l'on n'a pas mesuré."
- εit se comporte exactement comme le terme d'erreur d'une régression ordinaire (moyenne nulle, variance constante, non corrélé).

<div class="def"><b>Yit = α + β·xit + μi + εit</b> (de façon équivalente : Yit = αi + β·xit + εit, avec αi := α + μi)</div>

Ce que cette équation dit, étape par étape :

- On part de l'équation du Pooling Model, puis on ajoute un terme supplémentaire, μi, qui ne dépend que de l'unité observée.
- De façon équivalente, on peut fusionner α et μi en une seule ordonnée à l'origine propre à chaque unité (unit-specific intercept) αi — chaque unité a donc, en pratique, sa propre "ligne de départ", tout en partageant la même pente β.
- Les paramètres à estimer sont α, β, μ1, ..., μn (ou, de façon équivalente, α1, ..., αn, β) — estimés par les moindres carrés (OLS) appliqués à des transformations appropriées des données.
- Estimer μ1, ..., μn est généralement instrumental : ce n'est pas le vrai objectif. Leur rôle est d'absorber l'effet individuel inobservé de chaque unité, pour que β — l'effet de x sur Y qui nous intéresse réellement — soit purgé de l'hétérogénéité due aux variables non incluses dans le modèle.

<div class="example"><b>Analogie utile :</b> imaginez n entreprises représentées par n droites parallèles sur un même graphique (Y en fonction de x). Toutes les droites ont la même pente β, mais chacune part d'une hauteur différente (son propre αi) — cette hauteur de départ, c'est μi.</div>

- En R : `plm(Y ~ X, data = ..., model = "within")` estime le FEM. Sa sortie "Coefficients" indique β, à lire exactement comme un coefficient de régression ordinaire (estimation, erreur standard, valeur du t, p-value). L'ordonnée à l'origine commune α n'est pas affichée directement ; les ordonnées individuelles αi peuvent être extraites séparément avec `fixef()`.

<div class="example"><b>Exemple travaillé (données Grunfeld) :</b> n = 10 entreprises, T = 20 ans, Y = inv (investissement), x = value (valeur de l'entreprise). <code>plm(inv ~ value, data = GR, model = "within")</code> donne un β estimé ≈ 0.19, très significatif (p &lt; 2.2·10−16). Lecture : une hausse d'une unité de la valeur d'une entreprise est associée, en moyenne, à une hausse estimée de 0.19 unité de son investissement, une fois les caractéristiques propres et constantes dans le temps de chaque entreprise neutralisées.</div>

## 5. Solution 2 : le modèle à effets aléatoires (Random Effects Model, REM)

<div class="def"><b>Random Effects Model (REM) :</b> utilise la même séparation de l'erreur uit = μi + εit, mais μi est maintenant un effet individuel de l'unité i, constant dans le temps et aléatoire (et non plus un paramètre fixe) ; μi et εit doivent tous les deux être non corrélés avec les variables explicatives.</div>

L'équation est identique à celle du FEM :

<div class="def"><b>Yit = α + β·xit + μi + εit</b></div>

Ce qui change par rapport au FEM, étape par étape :

- μi n'est plus "un nombre fixe à estimer par unité" — c'est maintenant considéré comme un morceau aléatoire et inobservé de l'erreur.
- Comme μi est une variable aléatoire partagée par toutes les observations d'une même unité i, les erreurs globales uit de cette unité ne sont plus non corrélées dans le temps (contrairement à εit, qui reste non corrélée comme d'habitude).
- Les seuls paramètres réellement estimés sont α et β — pas n valeurs séparées de μi. C'est tout l'intérêt du REM : moins de paramètres à estimer.
- L'estimation nécessite une version généralisée des moindres carrés (et non des OLS classiques) pour tenir compte de cette corrélation à l'intérieur de chaque unité. En R : `plm(Y ~ X, data = ..., model = "random")` (utilise la transformation de Swamy–Arora).

<div class="example"><b>Mêmes données Grunfeld, effets aléatoires :</b> <code>plm(inv ~ value, data = GR, model = "random")</code> donne un β estimé ≈ 0.166, également très significatif. La sortie décompose en plus la variance inexpliquée en : composante idiosyncratique ≈ 55.6% de la variance, composante individuelle ≈ 44.4%. La sortie du FEM n'a pas cette décomposition — c'est une information propre au REM.</div>

## 6. Comprendre les deux morceaux de l'erreur (individuel vs. idiosyncratique)

Les deux modèles découpent uit en les deux mêmes ingrédients conceptuels. Savoir lire correctement leur taille relative est une question d'examen classique, en particulier sur la sortie du REM (car seul le REM affiche les variances explicitement).

<div class="def"><b>Erreur individuelle (individual-specific error, μi) :</b> caractéristiques constantes dans le temps et propres à chaque unité ; capture les différences persistantes entre individus. Non observées directement ni incluses dans le modèle, mais elles influencent quand même Y.</div>

- Exemples tirés des slides : la compétence innée d'un travailleur, la culture d'entreprise d'une firme, la qualité institutionnelle d'un pays.
- Comment lire sa variabilité : grande → de grandes différences persistantes entre individus jouent un rôle important ; petite → les individus sont relativement similaires une fois les variables observées prises en compte.

<div class="def"><b>Erreur idiosyncratique (idiosyncratic error, εit) :</b> fluctuations aléatoires qui varient à la fois selon les individus et dans le temps ; capture des chocs temporaires ou des erreurs de mesure. Reflète la variabilité d'un même individu au fil du temps.</div>

- Exemples tirés des slides : des changements de productivité à court terme, des chocs de marché temporaires, du bruit de mesure dans les données.
- Comment lire sa variabilité : grande → forte imprévisibilité au niveau de chaque observation individuelle ; petite → les résultats sont relativement stables dans le temps pour chaque individu.

En comparant les deux variances :

- **La variance individuelle domine** → la majeure partie de la variabilité vient des différences entre individus. Cela peut indiquer une variable importante, inobservée et constante dans le temps, absente du modèle — mais ce n'est pas automatiquement un problème : les coefficients restent fiables. Trouver et ajouter cette variable manquante, si c'est possible, rendrait probablement le modèle plus informatif, c'est tout.
- **La variance idiosyncratique domine** → la majeure partie de la variabilité vient des fluctuations internes à chaque individu au fil du temps.

## 7. Choisir entre FEM et REM : le test de Hausman (Hausman test)

- En pratique, les estimations du FEM et du REM sont souvent proches (0.19 contre 0.166 dans l'exemple Grunfeld ci-dessus).
- Le REM est préférable quand il est valide, car il estime beaucoup moins de paramètres (seulement α, β, contre α, β plus n valeurs séparées de μi pour le FEM) — le FEM perd des degrés de liberté (degrees of freedom) à cause de tous ces paramètres d'effets individuels supplémentaires.
- Mais la validité du REM repose sur une vraie hypothèse : μi doit être non corrélé avec les variables explicatives.
- Si cette hypothèse est fausse : les estimations du REM deviennent non convergentes (inconsistent), donc peu fiables — et une procédure non convergente est écartée.
- Si cette hypothèse est vraie : les estimations du REM sont convergentes et plus efficaces (efficient) que celles du FEM.

<div class="def"><b>Test de Hausman (Hausman test) :</b> le test utilisé pour choisir entre FEM et REM.<br/><b>H0 :</b> les hypothèses du REM sont vérifiées → ses estimations sont convergentes et plus efficaces que celles du FEM.<br/><b>H1 :</b> les hypothèses du REM ne sont pas vérifiées → ses estimations sont non convergentes.</div>

La règle de décision, étape par étape (même logique de p-value que pour tous les autres tests du cours) :

- Choisir un seuil de signification α (par exemple 0.05).
- Calculer le test et sa p-value (en R : `phtest(mod_fem, mod_rem)` du package plm — l'ordre des deux modèles n'a pas d'importance).
- Rejeter H0 (p-value ≤ α) → choisir le FEM.
- Ne pas rejeter H0 (p-value > α) → choisir le REM.

<div class="example"><b>Exemple Grunfeld, deux variables explicatives (value et capital) :</b> <code>phtest(mod3, mod4)</code> renvoie chi-carré = 2.3304, ddl = 2, p-value = 0.3119. Au seuil habituel de 5%, H0 n'est pas rejetée → on utilise ici le REM (plus efficace).</div>

## 8. Ajouter plusieurs variables explicatives

Le FEM comme le REM s'étendent à plusieurs variables explicatives (quantitatives et/ou catégorielles) exactement comme la régression ordinaire passe du cas simple au cas multiple — il suffit d'ajouter des termes x supplémentaires :

<div class="def"><b>Yit = α + β1·x1it + β2·x2it + ... + βp·xpit + μi + εit</b><br/>où pour le FEM → μi est déterministe, εit est aléatoire ; pour le REM → μi et εit sont tous les deux aléatoires.</div>

Ce que cette équation dit, étape par étape :

- C'est exactement la même logique que passer d'une régression simple à une régression multiple en Session 1 : on ajoute simplement des variables x1it, x2it, ..., xpit, chacune avec son propre coefficient β1, ..., βp.
- μi et εit jouent exactement le même rôle que dans le cas à une seule variable explicative — seule leur nature (fixe ou aléatoire) dépend du choix FEM/REM.
- Concrètement (exemple Grunfeld ci-dessus) : on pourrait avoir Y = investissement, x1 = value (valeur de l'entreprise) et x2 = capital (stock de capital), et interpréter chaque βj comme l'effet marginal de xj sur l'investissement, toutes choses égales par ailleurs — exactement comme en régression multiple classique.
- Rien d'autre ne change : on ajuste toujours le modèle avec `plm()` (model = "within" ou model = "random"), la sortie se lit de la même façon, et le test de Hausman continue de comparer les deux ajustements.
- Les transformations (logarithmes, puissances) et les interactions entre variables (vues en Session 3) peuvent être introduites exactement comme en régression multiple ordinaire.

## 9. Erreurs fréquentes et pièges d'examen

- Faire une régression poolée classique sur des données de panel sans vérifier si l'hétérogénéité entre unités ne fausse pas l'effet estimé — le Pooling Model est mathématiquement une simple régression ordinaire, et hérite donc du même risque de variable omise que l'exemple des maisons côtières.
- Croire que le FEM et le REM estiment toujours le même ensemble de paramètres : le FEM estime n valeurs de μi comme des paramètres fixes (en plus de α, β) ; le REM traite μi comme un terme aléatoire inobservé et n'estime directement que α et β.
- Oublier que la convergence (consistency) du REM exige que μi soit non corrélé avec les variables explicatives — c'est une vraie hypothèse testable (via Hausman), pas quelque chose que le REM obtient gratuitement.
- Mal lire la règle de décision du test de Hausman : rejeter H0 → les hypothèses du REM échouent → passer au FEM. (Facile à inverser par erreur — rejeter H0 ne signifie PAS "garder le REM".)
- Considérer qu'une part élevée de la variance de l'erreur individuelle est le signe d'un mauvais modèle : cela signifie simplement que des différences persistantes entre unités expliquent l'essentiel de la variabilité inexpliquée ; cela peut, ou non, justifier l'ajout d'une autre variable.
- Utiliser une régression classique en coupe transversale sur des données chronologiques ou de panel sans vérifier au préalable la corrélation entre observations d'une même unité.

## 10. À connaître absolument

<div class="key"><b>Must know :</b><br/>&bull; Donnée de panel = dimension transversale + dimension temporelle ; n unités × T instants ; panel équilibré → exactement n·T observations par variable<br/>&bull; Pooling Model = régression OLS ordinaire sur les n·T observations, en ignorant la structure de panel → même risque de variable omise qu'une simple coupe transversale<br/>&bull; FEM : uit = μi + εit, μi fixe/déterministe, une ordonnée à l'origine par unité estimée (model = "within")<br/>&bull; REM : même séparation, μi aléatoire et non corrélé avec les x, seuls α et β sont estimés (model = "random") → moins de paramètres, plus efficace si valide<br/>&bull; Erreur individuelle μi = différences persistantes et constantes dans le temps entre unités ; erreur idiosyncratique εit = fluctuation propre à chaque unité, variable dans le temps<br/>&bull; Test de Hausman : H0 = REM valide. Rejeter H0 → utiliser le FEM. Ne pas rejeter H0 → utiliser le REM</div>

## Points de vigilance

<div class="watch"><b>Watch out :</b> le cours ne détaille pas les calculs mathématiques du test de Hausman lui-même ("we won't go into the mathematical details"). Il faut connaître son objectif, ses deux hypothèses, et savoir lire la décision à partir de la p-value — vous ne serez pas amené à le calculer à la main.</div>
