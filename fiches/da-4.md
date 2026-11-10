# Session 4. Multicolinéarité, violations des hypothèses et observations influentes

À la fin de cette session, tu dois être capable de : expliquer ce qu'est la multicolinéarité (multicollinearity) et pourquoi une multicolinéarité élevée gonfle les erreurs types (standard errors) ; la détecter avec le VIF/GVIF et connaître les trois remèdes possibles ; lire un graphique des résidus et un graphique Q-Q pour vérifier les hypothèses sur les erreurs ; et distinguer une valeur aberrante (outlier), un point de levier (leverage point) et une observation influente (influential observation) à l'aide du dfbeta et de la distance de Cook (Cook's distance).

<div class="plan"><b>Plan</b><br/>1. La multicolinéarité : toujours un peu présente<br/>2. Ce qui se passe quand la multicolinéarité est élevée<br/>3. Pourquoi les erreurs types augmentent : deux faits à connaître<br/>4. Détecter la multicolinéarité : le VIF et le GVIF<br/>5. Que faire face à une multicolinéarité élevée<br/>6. Vérifier les hypothèses sur les erreurs avec des graphiques<br/>7. Corriger les violations avec des transformations logarithmiques<br/>8. Observations anormales : valeur aberrante vs point de levier<br/>9. Observations influentes : dfbeta et distance de Cook<br/>10. Erreurs fréquentes et pièges d'examen<br/>11. À connaître absolument</div>

Cette session regroupe deux blocs de cours enchaînés par le professeur : d'abord la multicolinéarité, puis les violations des hypothèses sur les erreurs et les observations anormales. C'est pour ça qu'elle est plus longue qu'une session classique.

## 1. La multicolinéarité : toujours un peu présente

- Une des hypothèses du modèle de régression linéaire multiple est : pas de relation linéaire parfaite entre les variables explicatives (pas de multicolinéarité parfaite).
- En réalité, les variables explicatives se recoupent toujours un peu dans ce qu'elles racontent sur Y : il y a toujours un peu de multicolinéarité.

<div class="def"><b>Multicolinéarité (multicollinearity) :</b> la présence d'une relation (linéaire) entre les variables explicatives d'un modèle de régression, c'est-à-dire un recoupement entre le contenu informatif que différents x apportent sur Y.</div>

- Cas purement théorique : si les variables explicatives étaient totalement non corrélées (coefficient de corrélation = 0, pour p = 2), leurs contenus informatifs s'additionneraient sans aucun recoupement. Cela n'arrive jamais exactement en pratique.
- La vraie question qui compte pour l'examen n'est jamais « y a-t-il de la multicolinéarité ? » (il y en a toujours un peu) mais « le niveau de multicolinéarité est-il assez élevé pour poser problème ? ».
- Pour p = 2 variables : une multicolinéarité élevée correspond à un coefficient de corrélation élevé (en valeur absolue) entre les deux x.
- Pour p > 2 variables : la multicolinéarité peut être élevée même si chaque corrélation prise deux à deux semble faible, le recoupement peut être collectif entre plusieurs variables à la fois, pas seulement entre une paire.

Trois questions organisent la suite du sujet, dans cet ordre :

1. Quels sont les effets d'une multicolinéarité élevée ?
2. Comment la détecter ?
3. Que faire une fois qu'elle est détectée ?

## 2. Ce qui se passe quand la multicolinéarité est élevée

- L'effet principal : les erreurs types (standard errors) des coefficients estimés des variables impliquées augmentent.
- Or la statistique de test t pour tester un coefficient est t = estimation / erreur type, donc une erreur type plus grande produit mécaniquement : une statistique t plus petite en valeur absolue ; une p-value plus grande ; une plus grande chance de ne pas rejeter H0 : βj = 0, c'est-à-dire de conclure à tort que la variable n'est pas significative.

<div class="example"><b>Exemple :</b> deux variables explicatives x1 et x2 sont fortement (mais pas parfaitement) corrélées. Pour chacune d'elles, on peut observer : erreur type élevée → statistique t faible en valeur absolue → p-value élevée → on ne rejette pas H0 → la variable paraît non significative, alors qu'elle a peut-être un vrai effet.</div>

- Ce n'est pas une contradiction : c'est le résultat attendu d'informations qui se recoupent. Si x1 et x2 sont fortement corrélées, elles apportent « presque la même » information ; une fois que x2 est déjà dans le modèle, la contribution supplémentaire (marginale) de x1 devient faible ; donc x1 peut sembler non significative dans le modèle joint, alors qu'elle serait clairement significative dans un modèle où x2 serait absente. Le même raisonnement s'applique symétriquement à x2.
- Cas extrême : aucune des variables corrélées entre elles n'est individuellement significative, alors que le modèle dans son ensemble est globalement significatif (R² élevé, test F global significatif). L'information totale portée par le groupe de variables est bien réelle (d'où la significativité globale), mais comme les contributions se recoupent énormément, la contribution additionnelle d'aucune variable prise seule (étant donné les autres) n'est assez grande pour être significative.
- Diagnostic utile : retirer une des variables corrélées entre elles peut rendre significatives d'autres variables qui ne l'étaient pas avant, parce que leur contribution marginale n'est plus masquée par le recoupement.

## 3. Pourquoi les erreurs types augmentent : deux faits à connaître

**Premier fait :** l'estimation du coefficient d'une variable explicative x est en général d'autant plus précise (erreur type plus faible) que la variabilité de x dans l'échantillon est grande, toutes choses égales par ailleurs.

<div class="def"><b>erreur type de b = c / sqrt[Σ(xi − mean(x))²]</b><br/>où le dénominateur, Σ(xi − mean(x))², mesure à quel point les valeurs de x dans l'échantillon sont dispersées, et c est une constante qui ne dépend pas de la dispersion de x.</div>

Ce que ça calcule concrètement :

- plus x est dispersé → plus le dénominateur est grand → plus l'erreur type est petite → estimation plus précise
- intuition : l'échantillon en apprend plus sur l'effet de x quand x varie vraiment ; si x est presque constant, il y a très peu d'information disponible pour estimer son effet
- cette relation est visible directement en régression simple ; en régression multiple, le même fait reste vrai, juste moins visible dans la formule

**Second fait :** dans une régression multiple, évaluer l'effet de x2 revient à maintenir x1 fixe. Si x1 et x2 sont fortement corrélées, alors une fois x1 fixée, x2 est « presque fixée » elle aussi : sa variabilité restante (conditionnelle) est faible.

En combinant les deux faits, étape par étape :

- x1 et x2 sont fortement corrélées (le scénario de cette session)
- donc dès qu'on maintient x1 fixe (ce qu'exige la lecture de b2 en régression multiple), x2 ne bouge presque plus
- d'après le Premier fait, une faible variabilité restante de x2 → une erreur type élevée pour b2
- c'est la cause mécanique de tout ce qui a été vu dans la Section 2

## 4. Détecter la multicolinéarité : le VIF et le GVIF

<div class="def"><b>Facteur d'inflation de la variance (Variance Inflation Factor, VIF) :</b> pour une variable explicative quantitative xj, l'outil le plus adapté pour mesurer le niveau de multicolinéarité impliquant xj.</div>

<div class="def"><b>VIFj = 1 / (1 − Rj²)</b><br/>où Rj² est le R² d'une régression auxiliaire (auxiliary regression) dans laquelle xj devient la variable dépendante, et x1, ..., xj−1, xj+1, ..., xp (toutes les autres variables explicatives) sont les variables explicatives — attention, cette régression n'utilise pas du tout Y.</div>

Ce que ça calcule concrètement, étape par étape :

- pour calculer VIFj, on traite temporairement xj comme si c'était la variable réponse, et on la régresse sur toutes les autres variables explicatives du modèle
- le Rj² de cette régression auxiliaire indique à quel point les autres x, ensemble, expliquent xj
- on insère ensuite ce Rj² dans 1/(1−Rj²) : plus Rj² se rapproche de 1, plus le dénominateur se rapproche de 0, et plus VIFj explose
- un Rj² élevé (xj bien expliquée par les autres x) → un VIFj élevé → xj est fortement mêlée au reste du modèle

<div class="example"><b>Exemple :</b> si la régression auxiliaire de xj sur les autres x donne Rj² = 0,85, alors VIFj = 1/(1−0,85) = 1/0,15 ≈ 6,7 (en dessous du seuil de 10, donc pas alarmant). Si Rj² monte à 0,95, VIFj = 1/0,05 = 20 (au-dessus de 10 : multicolinéarité jugée élevée pour cette variable). Le passage de 0,85 à 0,95 sur Rj² peut sembler petit, mais il fait presque tripler le VIF, car le dénominateur (1−Rj²) s'écrase vers 0.</div>

- Repère usuel (rule of thumb) : la multicolinéarité est jugée élevée dès qu'au moins un VIF dépasse 10 (seuil conventionnel, un peu arbitraire).
- Pour les variables explicatives dichotomiques (dummy), la formule habituelle du VIF ne s'applique pas directement : on calcule à la place un VIF généralisé (Generalized VIF, GVIF), dont la définition technique diffère mais dont le sens et l'interprétation restent les mêmes.

## 5. Que faire face à une multicolinéarité élevée

Trois options, chacune avec un compromis :

- **Retirer une ou plusieurs des variables responsables du recoupement.** Risque : on peut perdre une information réellement utile (non négligeable) si la variable retirée n'était pas totalement redondante.
- **Augmenter la taille d'échantillon n**, si c'est possible de collecter plus de données. Un n plus grand réduit les erreurs types en général, ce qui compense l'inflation causée par la multicolinéarité.
- **Utiliser d'autres techniques statistiques** comme l'analyse factorielle (Factor Analysis) ou l'analyse en composantes principales (Principal Component Analysis, PCA) pour combiner les variables qui se recoupent en un nombre réduit de composantes.

## 6. Vérifier les hypothèses sur les erreurs avec des graphiques

- Le modèle de régression linéaire repose sur des hypothèses concernant les erreurs εi. Si elles sont sérieusement violées, les conclusions tirées de l'analyse du modèle peuvent ne plus être valables.
- εi lui-même n'est pas observable (εi = Yi − E(Yi)), donc les vérifications utilisent le résidu (residual) ei = yi − ŷi comme substitut.
- Les diagnostics graphiques utilisent en général des résidus standardisés ou studentisés (deux standardisations différentes de ei) plutôt que les résidus bruts, car ils sont plus faciles à comparer entre observations et par rapport à des seuils fixes.

Deux graphiques résidus vs valeurs prédites vérifient les hypothèses de « moyenne nulle » et de « variance constante » (homoscédasticité, homoskedasticity). Pour chaque observation i :

- axe des x : la valeur prédite ŷi
- axe des y (graphique 1) : le résidu brut ei
- axe des y (graphique 2) : un résidu transformé de façon appropriée, mieux adapté pour vérifier spécifiquement l'homoscédasticité

Comment les lire :

- hypothèses respectées → les points se dispersent au hasard autour de l'axe horizontal, sans motif systématique, sans changement de dispersion quand ŷi augmente
- une courbe systématique (souvent en forme de parabole) → déviation par rapport à la linéarité
- une forme « d'entonnoir » (la dispersion s'élargit ou se resserre visiblement quand ŷi augmente) → hétéroscédasticité (heteroskedasticity)

Un graphique Q-Q (quantile-quantile plot) vérifie l'hypothèse de normalité :

- il compare les quantiles des résidus standardisés à ceux d'une loi normale théorique
- sous normalité parfaite, les points s'alignent sur une droite
- une courbure ou un écart systématique par rapport à la droite → une violation de la normalité (par exemple asymétrie, distribution qui ne suit pas la forme en cloche)

<div class="key"><b>Must know (lecture des graphiques) :</b><br/>&bull; Résidus vs valeurs prédites, pas de motif → hypothèse de moyenne nulle/linéarité plausible<br/>&bull; Résidus vs valeurs prédites, forme d'entonnoir → hétéroscédasticité (hypothèse de variance constante violée)<br/>&bull; Résidus vs valeurs prédites, courbe en parabole → non-linéarité<br/>&bull; Graphique Q-Q aligné sur une droite → normalité plausible ; courbure → erreurs non normales</div>

## 7. Corriger les violations avec des transformations logarithmiques

- Certaines transformations de variables peuvent réduire ou éliminer des violations des hypothèses sur les erreurs, pas seulement produire des effets non linéaires comme en Session 3.
- Corriger une violation de l'hypothèse de moyenne nulle/linéarité : transformer la ou les variables explicatives, comme déjà vu en Session 3.
- Corriger l'hétéroscédasticité : une transformation logarithmique de la variable dépendante est souvent utile.

<div class="def"><b>log(Y) = β0 + β1x1 + ε</b><br/>On appelle ça un modèle semi-logarithmique (log-lin) : seule la réponse Y est passée au log, x1 reste inchangée. L'interprétation des effets doit être adaptée en conséquence (voir plus bas).</div>

On utilise souvent à la place un modèle entièrement logarithmique (log-log) :

<div class="def"><b>log(Y) = β0 + β1log(x1) + ε</b><br/>Y et x1 sont toutes les deux passées au log.</div>

Ce que ça change concrètement, et pourquoi le log-log en particulier :

- si la relation d'origine entre Y et x1 était linéaire, passer seulement Y au log casse cette linéarité ; passer les deux au log la restaure
- cette transformation rend aussi b1 facile à interpréter de deux façons équivalentes : un changement d'une unité de log(x1) correspond à un changement moyen estimé de b1 dans log(Y) ; un petit changement en pourcentage de x1 (par exemple +1 %) correspond à un changement moyen estimé de Y d'environ b1 %
- dès que Y elle-même est passée au log (log-lin ou log-log), le sens de chaque coefficient bascule vers cette lecture « en pourcentage » : ce n'est plus « un changement de b1 unités de Y »

<div class="example"><b>Exemple :</b> dans un modèle log-log sur le prix de l'immobilier, si b1 = −0,3 pour x1 = distance au centre-ville, alors une augmentation de 1 % de la distance est associée à une baisse moyenne d'environ 0,3 % du prix, toutes choses égales par ailleurs. On ne peut plus dire « chaque kilomètre en plus fait baisser le prix de tant d'euros » comme dans les Sessions 1 à 3 : l'effet est désormais proportionnel, pas en unités fixes.</div>

## 8. Observations anormales : valeur aberrante vs point de levier

- Dans une distribution univariée classique, une observation anormale est une observation qui diffère beaucoup de la plupart des autres.
- Dans un modèle de régression, comme plusieurs variables interviennent en même temps, « anormal » peut vouloir dire deux choses structurellement différentes :

<div class="def"><b>Valeur aberrante (outlier, ou regression outlier) :</b> une observation dont le résidu est élevé en valeur absolue — sa valeur prédite ŷi est significativement différente de sa valeur observée yi, c'est-à-dire qu'elle se situe loin de la droite ou de l'hyperplan de régression ajusté.<br/>Repère usuel : une observation est une valeur aberrante si son résidu (correctement standardisé) dépasse 3 en valeur absolue (parfois 2 est utilisé à la place).</div>

<div class="def"><b>Point de levier (leverage point, ou high-leverage point) :</b> une observation avec des valeurs inhabituelles sur les variables explicatives, pas sur Y.<br/>Régression simple : x est significativement éloignée de la moyenne mean(x) de l'échantillon. Régression multiple : la distance doit être évaluée conjointement sur toutes les variables explicatives. Une grandeur dédiée, le levier (leverage), mesure cette distance pour chaque observation.<br/>Repère usuel : une observation est un point de levier si son levier dépasse 2(p+1)/n ou 3(p+1)/n, où p = nombre de variables explicatives, n = taille de l'échantillon.</div>

<div class="example"><b>Exemple :</b> reprenons l'exemple immobilier des Sessions 1 à 3 (x1 = âge, x2 = distance au centre, Y = prix au m²). Une propriété dont le prix observé est très éloigné du prix prédit par le modèle (par exemple un prix bien plus bas que prévu malgré un âge et une distance ordinaires) est une valeur aberrante : le problème est sur Y. À l'inverse, une propriété vieille de 150 ans alors que le reste de l'échantillon a entre 0 et 40 ans est un point de levier, même si son prix colle parfaitement à ce que prédirait le modèle : le problème est sur les x, pas sur Y. Ces deux propriétés sont anormales pour des raisons complètement différentes.</div>

## 9. Observations influentes : dfbeta et distance de Cook

<div class="def"><b>Observation influente (influential observation) :</b> une observation qui a un impact substantiel sur les résultats de la régression — si on la retirait de l'échantillon, les résultats (typiquement les coefficients estimés) changeraient de façon significative.</div>

- Les observations influentes sont en général des valeurs aberrantes, des points de levier, ou (très souvent) les deux à la fois.
- Un point de levier élevé qui est aussi une valeur aberrante en régression est le cas d'école d'une forte influence : il combine un x inhabituel et un mauvais ajustement.
- Le critère intuitif pour « cette observation est-elle influente ? » : la retirer de l'échantillon — si les résultats de la régression changent de façon significative, elle est influente.

Deux mesures numériques formalisent ce critère :

<div class="def"><b>dfbeta :</b> une valeur par coefficient et par observation. Mesure de combien l'estimation de ce coefficient change quand on retire l'observation de l'échantillon.<br/>Repère usuel : un point est généralement considéré comme influent (pour ce coefficient) si son dfbeta ≥ 2/sqrt(n) en valeur absolue.</div>

<div class="def"><b>Distance de Cook (Cook's distance) :</b> une valeur par observation. Évalue en une seule mesure globale l'effet du retrait de cette observation, en combinant à la fois son résidu (son côté valeur aberrante) et son levier.<br/>Repère usuel : un point est généralement considéré comme influent si sa distance de Cook ≥ 1 (parfois ≥ 0,5 comme seuil plus strict).</div>

## 10. Erreurs fréquentes et pièges d'examen

- Conclure qu'une variable corrélée aux autres « n'a aucun effet sur Y » à partir d'un simple test t non significatif, au lieu d'envisager que la multicolinéarité masque peut-être sa significativité individuelle.
- Oublier que la multicolinéarité peut être élevée avec p > 2 variables même si chaque corrélation prise deux à deux semble faible.
- Confondre le VIF (issu d'une régression auxiliaire de xj sur les autres x) avec le R² du modèle principal (Y sur les x) : ce sont les R² de deux régressions complètement différentes.
- Lire un graphique résidus-vs-prédictions en forme d'entonnoir comme un problème de linéarité au lieu d'un problème d'homoscédasticité : les deux violations ont des allures visuelles différentes (courbe vs élargissement de la dispersion) et demandent des corrections différentes.
- Confondre une valeur aberrante (jugée sur le résidu, côté y) avec un point de levier (jugé sur le levier, côté x).
- Supposer que tout point de levier ou toute valeur aberrante est automatiquement influent : l'influence doit être vérifiée directement avec le dfbeta ou la distance de Cook.
- Oublier que dès que Y est transformée en log, l'interprétation de chaque coefficient devient un effet (approximatif) en pourcentage sur Y, plus un effet en unités brutes.

## 11. À connaître absolument

<div class="key"><b>Must know :</b><br/>&bull; Multicolinéarité élevée → erreurs types gonflées → |t| plus faible, p-values plus grandes, non-significativité individuelle possible malgré un vrai pouvoir explicatif conjoint<br/>&bull; VIFj = 1/(1−Rj²) issu de la régression de xj sur les autres x (pas sur Y) ; VIF > 10 est le seuil conventionnel de multicolinéarité « élevée » ; GVIF pour les variables dummy<br/>&bull; Trois remèdes face à une multicolinéarité élevée : retirer une variable, augmenter n, ou utiliser l'analyse factorielle/l'ACP (PCA)<br/>&bull; Le graphique résidus-vs-prédictions vérifie la moyenne nulle/linéarité et l'homoscédasticité ; le graphique Q-Q vérifie la normalité<br/>&bull; Les modèles log-lin (log Y seul) ou log-log (log Y et log x) peuvent corriger l'hétéroscédasticité et restaurer la linéarité ; dès que Y est en log, les coefficients se lisent comme des effets en pourcentage<br/>&bull; Valeur aberrante = inhabituelle sur y (résidu élevé) ; point de levier = inhabituel sur x ; influente = son retrait change les résultats, mesuré par le dfbeta (par coefficient) ou la distance de Cook (globale)</div>

## Points de vigilance

<div class="watch"><b>Watch out :</b> un test t non significatif sur une variable corrélée aux autres ne veut pas dire qu'elle n'a aucun effet réel sur Y — cela peut juste signifier que sa contribution individuelle ne peut pas être isolée des variables avec lesquelles elle se recoupe. Ne pas la retirer automatiquement sans avoir d'abord envisagé la multicolinéarité comme explication.</div>

<div class="watch"><b>Watch out :</b> une valeur aberrante et un point de levier sont jugés sur des axes complètement différents — une valeur aberrante se définit uniquement côté y (via le résidu), un point de levier uniquement côté x (via le levier). Une observation peut être l'un sans être l'autre.</div>

<div class="watch"><b>Watch out :</b> les seuils numériques donnés tout au long de cette session (résidu > 3 pour les valeurs aberrantes, 2(p+1)/n ou 3(p+1)/n pour le levier, 2/sqrt(n) pour le dfbeta, 1 ou 0,5 pour la distance de Cook) sont explicitement décrits dans la source comme des conventions quelque peu arbitraires, en particulier celui du dfbeta — il faut connaître ce que chaque mesure capture conceptuellement, pas seulement le chiffre du seuil.</div>
