# Mathématiques, Slide Set 1 : annuités croissantes, perpétuités et structure des taux

A la fin de cette fiche, vous devrez être capable de calculer la valeur actuelle et la valeur finale d'une annuité dont les versements croissent en progression géométrique (ordinary et due), de valoriser les perpétuités (ordinary, due, différée, croissante), de passer d'une structure de taux spot aux taux forward implicites par la condition d'absence d'arbitrage, et de valoriser une annuité quelconque avec une structure de taux non plate.

<div class="plan"><b>Plan</b><br/>1. Annuités à flux croissants en progression géométrique<br/>2. Perpétuités ordinaires, différées et à terme d'avance<br/>3. Perpétuités à flux croissants en progression géométrique<br/>4. Structure des taux : spot, forward, absence d'arbitrage<br/>5. Annuités et structure des taux<br/>6. Erreurs Fréquentes et Pièges à l'Examen<br/>7. A Retenir Absolument</div>

## 1. Annuités à flux croissants en progression géométrique

On considère des annuités ordinaires (versements en fin de période) dont les flux annuels croissent selon une progression géométrique de premier terme R₁ = R &gt; 0 et de raison annuelle constante g ≥ 0. Le flux de l'année k est :

<div class="def"><b>Flux croissant en progression géométrique :</b> R<sub>k</sub> = R · (1 + g)<sup>k−1</sup>, et g = (R<sub>k</sub>/R)<sup>1/(k−1)</sup> − 1. Quand g = 0, on retrouve l'annuité ordinaire à flux constant R. On suppose toujours 0 ≤ g &lt; i.</div>

Le rapport entre deux flux consécutifs vaut toujours le facteur de croissance : R<sub>k</sub> = R<sub>k−1</sub> · (1 + g).

<div class="example"><b>Exemple :</b> annuité ordinaire annuelle de premier flux R = 100 et g = 0,03. Les flux aux dates 2, 3, 4 sont R₂ = 100 · 1,03 = 103, R₃ = 100 · 1,03² = 106,09, R₄ = 100 · 1,03³ = 115,93.</div>

<div class="key"><b>Proposition 1.1 (annuité ordinaire croissante) :</b> pour A = {(k, R(1+g)<sup>k−1</sup>)}<sub>k=1..n</sub>, R &gt; 0 et i &gt; g ≥ 0 :<br/>V₀ = [R / (i − g)] · [1 − ((1+g)/(1+i))<sup>n</sup>]<br/>V<sub>n</sub> = [R / (i − g)] · [(1+i)<sup>n</sup> − (1+g)<sup>n</sup>]</div>

La valeur finale s'obtient par décomposabilité : V<sub>n</sub> = V₀ · (1+i)<sup>n</sup>.

<div class="example"><b>Exemple :</b> annuité ordinaire de 12 flux annuels croissants, R = 1500, g = 0,02, i = 0,035. V₀ = (1500 / 0,015) · [1 − (1,02/1,035)¹²] = 16 069,88 et V₁₂ = (1500 / 0,015) · [1,035¹² − 1,02¹²] = 24 282,69.</div>

Pour une <b>due annuity</b> (termes d'avance), les dates sont t<sub>k−1</sub> = k − 1 : A = {(k − 1, R(1+g)<sup>k−1</sup>)}<sub>k=1..n</sub>.

<div class="example"><b>Exemple :</b> due annuity avec R = 1500, g = 0,02, échéance t = 5 : R₂ = 1530, R₃ = 1560,60, R₄ = 1591,81, donc A = {(0, 1500), (1, 1530), (2, 1560), (3, 1591,81)}.</div>

<div class="key"><b>Proposition 1.2 (due annuity croissante) :</b> pour A = {(k−1, R(1+g)<sup>k−1</sup>)}, R &gt; 0 et i &gt; g ≥ 0 :<br/>V₀ = [R(1+i) / (i − g)] · [1 − ((1+g)/(1+i))<sup>n</sup>]<br/>V<sub>n</sub> = [R(1+i) / (i − g)] · [(1+i)<sup>n</sup> − (1+g)<sup>n</sup>]</div>

<div class="example"><b>Exemple :</b> même due annuity, i = 0,04 : V₀ = (1500 · 1,04 / 0,02) · [1 − (1,02/1,04)⁵] = 7 217,03 et V₅ = (1500 · 1,04 / 0,02) · [1,04⁵ − 1,02⁵] = 8 780,63.</div>

<div class="watch"><b>Watch out :</b> le taux de croissance g, comme le taux d'intérêt, peut être annuel ou périodique. Si g<sub>m</sub> est le taux de croissance périodique (m périodes par an), la relation est (1 + g)<sup>t</sup> = (1 + g<sub>m</sub>)<sup>tm</sup>, soit g<sub>m</sub> = (1+g)<sup>1/m</sup> − 1 et g = (1+g<sub>m</sub>)<sup>m</sup> − 1. Ne jamais mélanger g annuel et flux mensuels dans la même formule.</div>

## 2. Perpétuités ordinaires, différées et à terme d'avance

<div class="def"><b>Perpétuité ordinaire (ordinary perpetuity) :</b> opération A = {(k, R)}<sub>k≥1</sub> avec des flux constants R de même signe, en nombre infini : pas de date d'échéance, la valeur finale n'existe pas.</div>

<div class="def"><b>Valeur actuelle d'une perpétuité ordinaire (i &gt; 0) :</b> V₀ = Σ<sub>s=1..∞</sub> R/(1+i)<sup>s</sup> = <b>R / i</b>. C'est une série géométrique de premier terme R(1+i)⁻¹ et de raison (1+i)⁻¹, convergente car 0 &lt; (1+i)⁻¹ &lt; 1.</div>

<div class="def"><b>Perpétuité ordinaire différée (deferred ordinary perpetuity) :</b> A = {(k, R)}<sub>k≥j</sub> avec j ≥ 0 entier : le premier flux intervient à la date j + 1. L'entier j est le décalage (deferral).</div>

<div class="key"><b>Proposition 1.7 (perpétuité différée) :</b> pour une perpétuité ordinaire différée de j périodes, R ≥ 0, j ≥ 1 :<br/>V₀ = (R / i) · (1+i)<sup>−j</sup><br/>Si j = 0, on retrouve V₀ = R/i.</div>

<div class="example"><b>Exemple :</b> perpétuité ordinaire annuelle R = 1200, i = 0,12. Premier flux en 1 (j = 0) : V₀ = 1200 / 0,12 = 10 000. Premier flux en 3 (j = 2) : V₀ = (1200 / 0,12) · 1,12⁻² = 7 971,94.</div>

<div class="def"><b>Perpétuité à terme d'avance (due perpetuity) :</b> A = {(k, R)}<sub>k≥0</sub> : elle comporte un flux en t = 0. Sa valeur actuelle s'obtient en ajoutant ce flux initial à celle de la perpétuité ordinaire.</div>

<div class="key"><b>Proposition 1.9 (due perpetuity) :</b> V₀ = R/i + R = (R/i)(1 + i).</div>

## 3. Perpétuités à flux croissants en progression géométrique

On note {(k, R(1+g)<sup>k−1</sup>)}<sub>k=1..∞</sub> la perpétuité ordinaire croissante et {(k−1, R(1+g)<sup>k−1</sup>)}<sub>k=1..∞</sub> la due perpetuity croissante.

<div class="key"><b>Proposition 1.10 (perpétuité ordinaire croissante) :</b> pour R ≥ 0, g ≥ 0, i &gt; 0 avec i &gt; g :<br/><b>V₀ = R / (i − g)</b></div>

<div class="example"><b>Exemple :</b> R = 1000, g = 0,01, i = 0,035 : V₀ = 1000 / (0,035 − 0,01) = 1000 / 0,025 = 40 000.</div>

Formules inverses utiles : R = V₀ · (i − g), i = g + R/V₀, g = i − R/V₀. Si g = 0, on retrouve R/i.

<div class="def"><b>Analyse de sensibilité de V₀ = R/(i − g) :</b> ∂V₀/∂R = 1/(i−g) &gt; 0 ; ∂V₀/∂i = −R/(i−g)² &lt; 0 ; ∂V₀/∂g = R/(i−g)² &gt; 0. La valeur actuelle croît avec R et g, décroît avec i.</div>

<div class="key"><b>Proposition 1.11 (due perpetuity croissante) :</b> V₀ = [R / (i − g)] · (1 + i).</div>

<div class="example"><b>Exemple :</b> R = 1000, g = 0,01, i = 0,035 : V₀ = (1000 / 0,025) · 1,035 = 41 400.</div>

## 4. Structure des taux : spot, forward, absence d'arbitrage

Le taux d'intérêt peut être constant (le même pour toute échéance) ou variable (il dépend de l'échéance).

<div class="def"><b>Taux spot annuel r(0, k) :</b> taux annuel disponible aujourd'hui sur le marché pour une opération de 0 à k (k entier ≥ 1). La suite {r(0, k)}<sub>k=1..n</sub> = {r(0,1), r(0,2), ..., r(0,n)} est la structure des taux spot (spot term structure), avec r(0,0) = 0.</div>

<div class="example"><b>Exemple :</b> {r(0,k)} = {0,02 ; 0,025 ; 0,03} pour 1, 2, 3 ans : r(0,1) = 2 % est le rendement à échéance d'un euro placé un an.</div>

Une structure est <b>plate</b> (flat) si r(0, k) = i pour tout k ; <b>non plate</b> dès qu'au moins deux taux spot diffèrent.

<div class="def"><b>Taux forward r(s, k) :</b> taux annuel entre deux dates s et k (s ≤ k, entiers strictement positifs), implicite dans la structure spot sous l'hypothèse d'absence d'arbitrage (pas de profit sans risque ni coût).</div>

<div class="key"><b>Proposition 1.14 (condition d'absence d'arbitrage) :</b> il n'y a pas d'arbitrage si et seulement si, pour tout s ≤ k :<br/>(1 + r(0,s))<sup>s</sup> · (1 + r(s,k))<sup>k−s</sup> = (1 + r(0,k))<sup>k</sup><br/>d'où le taux forward implicite :<br/>r(s, k) = [(1 + r(0,k))<sup>k</sup> / (1 + r(0,s))<sup>s</sup>]<sup>1/(k−s)</sup> − 1</div>

<div class="example"><b>Exemple :</b> structure spot {0,025 ; 0,03 ; 0,032}. Les forwards implicites sont r(1,2) = 1,03²/1,025 − 1 = 0,035 ; r(2,3) = 1,032³/1,03² − 1 = 0,036 ; r(1,3) = (1,032³/1,025)<sup>1/2</sup> − 1 = 0,0355.</div>

Si la structure est plate (r(0,k) = i pour tout k), alors tous les taux forward valent i.

## 5. Annuités et structure des taux

Avec une structure de taux non plate, la démarche est la même qu'avec un taux constant : on déplace chaque flux dans le temps, mais avec les taux de la structure. On suppose que les dates de l'annuité coïncident avec celles de la structure.

<div class="key"><b>Définition 1.15 :</b> pour A = {(k, R<sub>k</sub>)}<sub>k=1..n</sub> et la structure {r(0, k)} :<br/>V₀ = Σ<sub>k=1..n</sub> R<sub>k</sub> / [1 + r(0,k)]<sup>k</sup><br/>V<sub>n</sub> = Σ<sub>k=1..n</sub> R<sub>k</sub> · [1 + r(k,n)]<sup>n−k</sup></div>

<div class="example"><b>Exemple :</b> A = {(1, 250), (2, 350), (3, 400)} avec la structure spot {0,025 ; 0,028 ; 0,032}. V₀ = 250/1,025 + 350/1,028² + 400/1,032³ = 939,03. Les forwards : r(1,3) = (1,032³/1,025)<sup>1/2</sup> − 1 = 0,0355 et r(2,3) = 1,032³/1,028² − 1 = 0,04. Valeur finale : V₃ = 250 · 1,0355² + 350 · 1,04 + 400 = 1 032,09.</div>

<div class="watch"><b>Watch out :</b> même avec une structure non plate, V<sub>n</sub> = V₀ · [1 + r(0,n)]<sup>n</sup> : la valeur finale reste la valeur actuelle accumulée au taux spot de l'échéance n. Vérifier ce raccourci plutôt que de recalculer tous les forwards quand seule V<sub>n</sub> est demandée.</div>

## 6. Erreurs Fréquentes et Pièges à l'Examen

- Confondre ordinary et due : la version « due » multiplie la valeur actuelle par (1 + i), que les flux soient constants ou croissants. Oublier ce facteur (ou l'appliquer deux fois) fausse tout le calcul.
- Utiliser R/(i − g) pour une perpétuité croissante quand i ≤ g : la formule exige i &gt; g, sinon la série diverge et la valeur actuelle n'existe pas.
- Mal compter le décalage j d'une perpétuité différée : premier flux en j + 1 correspond à un facteur (1+i)<sup>−j</sup>. Un premier flux en 3, c'est j = 2, pas j = 3.
- Appliquer la formule de la valeur finale V<sub>n</sub> à une perpétuité : une perpétuité n'a pas d'échéance, sa valeur finale n'existe pas.
- Composer les taux forward en oubliant les exposants : la condition est (1+r(0,s))<sup>s</sup>(1+r(s,k))<sup>k−s</sup> = (1+r(0,k))<sup>k</sup>, pas une simple moyenne des taux spot.
- Actualiser avec r(0,n) unique quand la structure n'est pas plate : chaque flux R<sub>k</sub> s'actualise avec son propre taux spot [1 + r(0,k)]<sup>k</sup>.
- Mélanger taux de croissance annuel g et périodique g<sub>m</sub> : convertir d'abord avec g = (1+g<sub>m</sub>)<sup>m</sup> − 1.

## 7. A Retenir Absolument

<div class="key"><b>A retenir :</b><br/>&bull; Annuité ordinaire croissante : V₀ = [R/(i−g)] · [1 − ((1+g)/(1+i))<sup>n</sup>] ; due : multiplier par (1+i)<br/>&bull; Perpétuité ordinaire : V₀ = R/i ; différée de j : V₀ = (R/i)(1+i)<sup>−j</sup> ; due : (R/i)(1+i)<br/>&bull; Perpétuité croissante : V₀ = R/(i−g) si i &gt; g ; due croissante : [R/(i−g)](1+i)<br/>&bull; Sensibilité : V₀ croît avec R et g, décroît avec i<br/>&bull; Absence d'arbitrage : (1+r(0,s))<sup>s</sup>(1+r(s,k))<sup>k−s</sup> = (1+r(0,k))<sup>k</sup> ; structure plate implique forwards = i<br/>&bull; Structure non plate : V₀ = Σ R<sub>k</sub>/[1+r(0,k)]<sup>k</sup> et V<sub>n</sub> = V₀ · [1+r(0,n)]<sup>n</sup></div>
