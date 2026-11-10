# Mathématiques, Slide Set 0 : opérations financières, taux d'intérêt et annuités

Ce Slide Set 0 ouvre la partie mathématique du cours : c'est le rappel de calcul financier (financial calculus) sur lequel tout le reste s'appuiera. Il part de l'opération la plus simple, déplacer une somme dans le temps, et construit tout l'édifice : les deux lois financières (financial laws) simple et composée, les taux équivalents (equivalent interest rates), le taux continu (continuous interest rate), la propriété de décomposabilité (decomposability property), puis les annuités (annuities) et perpétuités (perpetuities) avec leurs formules de valeur actuelle et de valeur finale. Si tu sais passer d'un capital à sa valeur future, d'une valeur future à sa valeur d'aujourd'hui, convertir un taux d'une périodicité à une autre, et calculer la valeur d'une suite de versements à n'importe quelle date, tu maîtrises ce document.

<div class="plan"><b>Plan</b><br/>1. Opérations financières élémentaires : capitaliser et actualiser<br/>2. Lois financières et l'identité fondamentale<br/>3. La loi d'intérêt simple<br/>4. La loi d'intérêt composé<br/>5. Taux équivalents et taux nominal annuel<br/>6. L'intérêt continu<br/>7. La propriété de décomposabilité<br/>8. Annuités et perpétuités<br/>9. Annuités ordinaires : valeur actuelle, valeur finale, valeur à une date quelconque<br/>10. Annuités différées et annuités à terme d'avance<br/>11. À connaître absolument</div>

## 1. Opérations financières élémentaires : capitaliser et actualiser

Une opération financière (financial operation) est un échange d'une ou plusieurs sommes entre différentes dates. Elle est dite élémentaire quand on échange une seule somme entre deux dates. Le temps t est mesuré en années, les montants en euros. Il y en a deux familles :

- **Opération de capitalisation (accumulation financial operation) :** transformer un capital C disponible aujourd'hui (t = 0) en un montant final M (final value) à une date future t. On suppose M ≥ C ≥ 0.
- **Opération d'actualisation (discount financial operation) :** transformer une valeur nominale S (nominal value) disponible à une date future t en une valeur actuelle A (present value) disponible aujourd'hui. On suppose 0 ≤ A ≤ S.

<div class="def"><b>Intérêt (interest) :</b> I = M − C, la différence positive entre le montant final et le capital investi.<br/><b>Escompte (discount) :</b> D = S − A, la différence positive entre la valeur nominale future et la valeur actuelle.</div>

<div class="def"><b>M = C · f(t)</b> et <b>A = S · φ(t)</b><br/>où f(t) est le facteur de capitalisation (accumulation factor) : la valeur à la date t de 1 euro investi aujourd'hui (on suppose f(0) = 1 et f croissante en t) ; φ(t) est le facteur d'actualisation (discount factor) : la valeur aujourd'hui de 1 euro disponible à la date t (on suppose φ(0) = 1) ; i est le taux d'intérêt annuel (annual interest rate), toujours strictement positif : l'intérêt généré par 1 euro investi un an, c'est-à-dire i = f(1) − 1.</div>

Concrètement : pour projeter une somme vers le futur, on multiplie par f(t) ; pour ramener une somme future à aujourd'hui, on multiplie par φ(t).

<div class="example"><b>Exemple :</b> si f(2) = 1,2 et C = 1000, alors M = 1000 · 1,2 = 1200 et I = 200.</div>

## 2. Lois financières et l'identité fondamentale

<div class="def"><b>Loi financière (financial law) :</b> la relation fonctionnelle entre les éléments d'une opération élémentaire, c'est-à-dire les formules M = C · f(t) et A = S · φ(t). Il existe deux lois financières, sans intersection : la loi d'intérêt simple (simple interest) et la loi d'intérêt composé (compound interest).</div>

En supposant que les opérations de capitalisation et d'actualisation sont symétriques, on obtient l'identité fondamentale entre facteurs financiers (fundamental identity, aussi appelée propriété des facteurs conjugués, conjugated financial factor property) :

<div class="def"><b>f(t) · φ(t) = 1</b> pour tout t ≥ 0</div>

Ce que ça fait : connaissant l'un des deux facteurs, on obtient l'autre par simple inversion, f(t) = 1/φ(t) et φ(t) = 1/f(t).

<div class="example"><b>Exemple :</b> si f(t) = 1 + it, alors le facteur conjugué est φ(t) = 1/(1 + it).</div>

## 3. La loi d'intérêt simple

Le point de départ est une hypothèse de calcul : l'intérêt simple I est proportionnel, selon le taux i, au capital C et à la durée t.

<div class="def"><b>M = C · (1 + it)</b><br/>où 1 + it est le facteur de capitalisation simple (simple accumulation factor), f(t) = 1 + it.</div>

Ce que fait la formule : chaque année rapporte le même intérêt C·i, calculé toujours sur le capital initial ; au bout de t années on a donc C plus t fois C·i.

<div class="example"><b>Exemple (base 360) :</b> C = 1500, i = 0,03, t = 1/2, donc M = 1500 · (1 + 0,03 · 0,5) = 1500 · 1,015 = 1522,5 et I = 22,5.</div>

Formules inverses, chaque élément isolé en fonction des autres :

- C = M / (1 + it)
- i = (M/C − 1) / t
- t = (M/C − 1) / i

<div class="example"><b>Exemple :</b> M = 2500, t = 1, i = 0,0325, donc C = 2500 / 1,0325 = 2421,31.</div>

Pour l'actualisation, on utilise la conjugaison : le facteur d'actualisation simple (simple discount factor) est φ(t) = (1 + it)^−1, donc :

<div class="def"><b>A = S / (1 + it) = S · (1 + it)^−1</b></div>

<div class="example"><b>Exemple (base 360) :</b> S = 1500, i = 0,03, t = 9/12, donc A = 1500 / 1,0225 = 1466,99 et D = 33,01.</div>

## 4. La loi d'intérêt composé

L'hypothèse de départ est la capitalisation annuelle des intérêts (annual interest capitalization) : chaque année, les intérêts s'ajoutent au capital et deviennent à leur tour productifs.

<div class="def"><b>M = C · (1 + i)^t</b><br/>où (1 + i)^t est le facteur de capitalisation composée (compound accumulation factor), une fonction exponentielle. I = M − C = C · [(1 + i)^t − 1] est l'intérêt composé.</div>

<div class="example"><b>Exemple :</b> C = 1500, i = 0,03, t = 2, donc M = 1500 · 1,03² = 1591,35 et I = 91,35 (contre 1590 en intérêt simple : la capitalisation des intérêts ajoute 1,35).</div>

Si t n'est pas entier, on écrit t = n + f avec n la partie entière et 0 ≤ f &lt; 1, et deux conventions existent : M = C(1 + i)^n(1 + i)^f (exponentielle partout) ou M = C(1 + i)^n(1 + if), cette dernière étant l'intérêt composé avec convention linéaire (linear convention).

Formules inverses :

- C = M / (1 + i)^t = M(1 + i)^−t
- i = (M/C)^(1/t) − 1
- t = (ln M − ln C) / ln(1 + i)

<div class="example"><b>Exemples :</b> C = 1200, M = 1500, t = 3 donnent i = (1500/1200)^(1/3) − 1 = 7,72 % ; C = 1200, M = 1500, i = 0,05 donnent t = (ln 1500 − ln 1200)/ln 1,05 = 4,5735 ans.</div>

Deux repères d'usage : au même taux i, la capitalisation simple domine la composée pour 0 ≤ t ≤ 1, et la composée domine pour t ≥ 1 ; en pratique, la loi simple s'utilise pour les durées d'un an ou moins, la loi composée pour un an ou plus. Pour l'actualisation composée, la conjugaison donne le facteur d'actualisation composé (compound discount factor) φ(t) = (1 + i)^−t, donc A = S · (1 + i)^−t.

<div class="example"><b>Exemple :</b> S = 1200, i = 0,12, t = 2, donc A = 1200 · 1,12^−2 = 956,63 et D = 243,37.</div>

## 5. Taux équivalents et taux nominal annuel

Deux opérations sont financièrement équivalentes (financially equivalent) à la date t si elles ont la même valeur à cette date. Quand la capitalisation se fait m fois par an (m = 2 pour des semestres, m = 12 pour des mois), on note im le taux périodique (periodic interest rate).

<div class="def"><b>(1 + i)^t = (1 + im)^(tm)</b> pour tout t ≥ 0</div>

Ce que ça fait : cette égalité garantit que les deux rythmes de capitalisation produisent exactement le même montant final à n'importe quelle date. On en tire les conversions :

- i = (1 + im)^m − 1
- im = (1 + i)^(1/m) − 1

<div class="example"><b>Exemple :</b> avec i = 0,07, on obtient i12 = 1,07^(1/12) − 1 = 0,57 % et i2 = 1,07^(1/2) − 1 = 3,44 %.</div>

<div class="watch"><b>Watch out :</b> le lien entre i et im n'est pas linéaire (contrairement à l'intérêt simple où ils sont proportionnels). À paramètre identique, le montant final augmente avec la fréquence de capitalisation.</div>

<div class="def"><b>Taux nominal annuel (annual nominal interest rate) :</b> jm = m · im, convertible m fois par an. Deux propriétés : la relation avec im est linéaire, et jm ≤ i pour tout m. Le taux nominal ne s'utilise pas directement dans les formules : il faut d'abord le diviser par m pour retrouver im. Formules : (1 + jm/m)^m = 1 + i et jm = m[(1 + i)^(1/m) − 1].</div>

## 6. L'intérêt continu

Quand la fréquence de capitalisation tend vers l'infini, le taux nominal tend vers une limite : lim jm = ln(1 + i) quand m → +∞.

<div class="def"><b>Taux d'intérêt continu (continuous interest rate) :</b> δ = ln(1 + i) &gt; 0. Comme e^δ = 1 + i, on a e^(δt) = (1 + i)^t pour tout t : la capitalisation continue est la limite de la capitalisation composée.</div>

<div class="def"><b>M = C · e^(δt)</b> et <b>A = S · e^(−δt)</b><br/>où e^(δt) est le facteur de capitalisation continue (continuous accumulation factor), et e^(−δt) est le facteur d'actualisation continue (continuous discount factor), toujours par conjugaison.</div>

<div class="example"><b>Exemple :</b> C = 1500, δ = 0,03, t = 2, donc M = 1500 · e^0,06 = 1592,76 et I = 92,76.</div>

## 7. La propriété de décomposabilité

<div class="def"><b>Facteur décomposable (decomposable financial factor) :</b> un facteur de capitalisation f tel que f(s) · f(t − s) = f(t) pour tous t, s ≥ 0 avec s ≤ t.</div>

Lecture financière : capitaliser un euro jusqu'à la date intermédiaire s, puis replacer le résultat de s à t dans les mêmes conditions, donne exactement le même résultat que capitaliser de 0 à t d'un coup.

Le point clé du document :

- **La décomposabilité caractérise l'intérêt composé :** f est décomposable si, et seulement si, f(t) = (1 + i)^t. Preuve immédiate : (1 + i)^s(1 + i)^(t−s) = (1 + i)^t.
- **Le facteur simple n'est pas décomposable :** f(s)·f(t − s) − f(t) ≥ 0. Replacer en cours de route avec les conditions initiales surestime le montant final, parce que les intérêts du premier tronçon ne produisent pas d'intérêts dans le second.

## 8. Annuités et perpétuités

Une opération non élémentaire se représente comme une suite de couples (sequence of pairs) {(tk, Rk)} : des dates strictement croissantes tk (t0 = 0 aujourd'hui) et des montants Rk, positifs pour une entrée d'argent (inflow), négatifs pour une sortie (outflow).

<div class="example"><b>Exemple :</b> investir 1000 aujourd'hui et 1000 dans six mois s'écrit {(0, −1000), (1/2, −1000)}.</div>

<div class="def"><b>Annuité (annuity) :</b> suite finie de versements de même signe à dates régulières (tk+1 − tk = 1).<br/><b>Perpétuité (perpetuity) :</b> même structure avec une suite infinie. Une annuité est ordinaire (ordinary annuity) si chaque versement Rk tombe en fin de période (date k), et à terme d'avance (due annuity) s'il tombe en début de période (date k − 1). Elle est constante si Rk = R pour tout k, sinon variable.</div>

Trois hypothèses de travail : toute opération non élémentaire est une somme d'opérations élémentaires ; on travaille en intérêt composé avec facteurs conjugués ; à structure de dates identique, on peut combiner linéairement deux annuités (αRk + βTk).

## 9. Annuités ordinaires : valeur actuelle, valeur finale, valeur à une date quelconque

Pour une annuité ordinaire A = {(k, Rk)} de maturité n, au taux i :

<div class="def"><b>V0 = Σ Rs(1 + i)^−s</b> et <b>Vn = Σ Rs(1 + i)^(n−s)</b> (sommes de s = 1 à n)</div>

Ce que ça fait : la valeur actuelle V0 (present value) actualise chaque versement jusqu'à aujourd'hui puis les additionne ; la valeur finale Vn (final value) capitalise chaque versement jusqu'à la maturité. Grâce à la décomposabilité, toutes les valeurs d'une même annuité se déduisent les unes des autres : Vn = V0 · f(tn), V0 = Vn · φ(tn), et Vk = V0 · f(tk).

<div class="example"><b>Exemple.</b> A = {(1, 200), (2, 200), (3, 100), (4, 150)} avec i = 0,1 : V0 = 200·1,1^−1 + 200·1,1^−2 + 100·1,1^−3 + 150·1,1^−4 = 524,69 ; V2 = 524,69 · 1,1² = 634,88 ; V4 = 524,69 · 1,1^4 = 768,20.</div>

Cas constant : si Rk = R pour tout k, les sommes deviennent des formules fermées :

<div class="def"><b>V0 = R · [1 − (1 + i)^−n] / i</b> et <b>Vn = R · [(1 + i)^n − 1] / i</b></div>

<div class="example"><b>Exemple.</b> 15 versements annuels de R = 150 à i = 0,075 : V0 = 150 · (1 − 1,075^−15)/0,075 = 1324,07 et V15 = 150 · (1,075^15 − 1)/0,075 = 3917,76, et on vérifie V15 = V0 · 1,075^15.</div>

<div class="watch"><b>Watch out :</b> le taux doit toujours être cohérent avec la périodicité des versements : des versements mensuels exigent le taux mensuel i12, des versements semestriels le taux i2. Avec une période régulière γ (γ = 1 an, 1/2 semestre, 1/12 mois), on utilise le taux périodique correspondant.</div>

Les symboles financiers an|i (« a ordinary n angle i ») et sn|i (« s ordinary n angle i ») abrègent les deux facteurs :

<div class="def"><b>an|i = [1 − (1 + i)^−n] / i</b> et <b>sn|i = [(1 + i)^n − 1] / i</b><br/>Ce sont la valeur actuelle et la valeur finale d'une annuité ordinaire de n versements constants de 1 euro.</div>

Donc V0 = R · an|i et Vn = R · sn|i, et la valeur à une date intermédiaire k se lit comme la somme des versements déjà tombés capitalisés plus ceux à venir actualisés : Vk = R · (sk|i + an−k|i). Si la date tombe entre deux versements (tk = k + f avec 0 ≤ f &lt; 1), alors Vtk = Vk · (1 + i)^f.

<div class="example"><b>Exemple.</b> 30 versements mensuels de R = 150, maturité 2 ans et demi, i12 = 0,01 : la valeur après 10 mois est V10 = 150 · s10|0,01 + 150 · a20|0,01 = 150 · (1,01^10 − 1)/0,01 + 150 · (1 − 1,01^−20)/0,01 = 4276,17.</div>

## 10. Annuités différées et annuités à terme d'avance

Une annuité différée (deferred annuity) {(k + j, Rk)} commence j périodes plus tard : c'est une annuité ordinaire dont toutes les dates sont décalées de j. Le facteur de correction (1 + i)^−j ramène la valeur à aujourd'hui ou à la maturité :

<div class="def"><b>V0 = (1 + i)^−j · Σ Rs(1 + i)^−s</b> et <b>Vn = (1 + i)^−j · Σ Rs(1 + i)^(n−s)</b></div>

<div class="example"><b>Exemple.</b> 12 versements mensuels de R = 150, premier versement dans 3 mois (j = 2), taux annuel i = 0,0875 soit i12 = 0,007 : V0 = 150 · a12|0,007 · 1,007^−2 = 150 · (1 − 1,007^−12)/0,007 · 1,007^−2 = 1696,87, et V14 = V0 · 1,007^14 = 1870,94.</div>

Une annuité à terme d'avance (due annuity) {(k − 1, Rk)} verse en début de période : chaque versement arrive une période plus tôt que dans l'annuité ordinaire, donc chaque valeur est multipliée par (1 + i) :

<div class="def"><b>V0 = R · an|i · (1 + i)</b> et <b>Vn = R · sn|i · (1 + i)</b><br/>Deux formes équivalentes utiles : V0 = R · (1 + an−1|i) et Vn = R · (sn+1|i − 1).</div>

<div class="example"><b>Exemple.</b> A = {(0, 100), (1, 150), (2, 200)} avec i = 0,04 : V0 = 100 + 150·1,04^−1 + 200·1,04^−2 = 429,14 et V3 = V0 · 1,04³ = 482,73. Cas constant : 15 versements semestriels de R = 250 à i2 = 0,044 donnent V0 = 250 · a15|0,044 · 1,044 = 2822,39 et V15 = V0 · 1,044^15 = 5384,44 ; 24 versements mensuels de R = 150 à i12 = 0,0098 donnent V0 = 150 · (1 + a23|0,0098) = 3225,41 et V24 = V0 · 1,0098^24 = 4076.</div>

## 11. À connaître absolument

<div class="key"><b>Must know :</b><br/>&bull; Capitaliser : M = C · f(t) ; actualiser : A = S · φ(t) ; I = M − C ; D = S − A ; i = f(1) − 1<br/>&bull; Identité fondamentale : f(t) · φ(t) = 1, chaque facteur est l'inverse de l'autre<br/>&bull; Intérêt simple : M = C(1 + it) ; intérêt calculé toujours sur le capital initial ; usage : durées ≤ 1 an<br/>&bull; Intérêt composé : M = C(1 + i)^t ; intérêts capitalisés chaque année ; usage : durées ≥ 1 an ; inverse : i = (M/C)^(1/t) − 1, t = (ln M − ln C)/ln(1 + i)<br/>&bull; Taux équivalents : (1 + i)^t = (1 + im)^(tm), donc im = (1 + i)^(1/m) − 1 ; taux nominal jm = m·im ≤ i, jamais utilisé directement<br/>&bull; Continu : δ = ln(1 + i), M = Ce^(δt), A = Se^(−δt)<br/>&bull; Décomposabilité : f(s)·f(t − s) = f(t) si, et seulement si, f est composée ; la loi simple ne l'est pas<br/>&bull; Annuité ordinaire : V0 = R·an|i avec an|i = [1 − (1+i)^−n]/i ; Vn = R·sn|i avec sn|i = [(1+i)^n − 1]/i ; Vk = V0(1+i)^k<br/>&bull; Différée de j : multiplier par (1 + i)^−j ; terme d'avance : multiplier par (1 + i), ou V0 = R(1 + an−1|i) et Vn = R(sn+1|i − 1)<br/>&bull; Le taux doit toujours matcher la périodicité des versements (mensuel avec i12, semestriel avec i2)</div>
